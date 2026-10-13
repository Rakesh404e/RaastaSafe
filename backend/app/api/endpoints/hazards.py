import uuid
import hashlib
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import (
    HazardReport, ReportAuditHistory, Station, User, UserRole, VerificationStatus
)
from backend.app.schemas import (
    HazardReportOut, HazardReportCreate, StatusTransitionRequest, DuplicateConfirmRequest,
    LocationPriorityOut
)
from backend.app.security.auth import get_current_user_optional, require_role
from backend.app.services.duplicate_detector import DuplicateDetector
from backend.app.algorithms.priority_engine import PriorityEngine, settings

router = APIRouter(prefix="/hazards", tags=["Hazard Reports"])

def generate_report_id(db: Session) -> str:
    count = db.query(HazardReport).count() + 1
    return f"RST-2026-{count:03d}"

@router.get("", response_model=List[HazardReportOut])
def get_hazard_reports(
    station_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = None,
    report_type: Optional[str] = None,
    include_duplicates: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(HazardReport)
    if station_id:
        query = query.filter(HazardReport.station_id == station_id)
    if status_filter:
        query = query.filter(HazardReport.status == status_filter)
    elif not include_duplicates:
        # By default exclude duplicates to avoid clutter
        query = query.filter(HazardReport.status != "duplicate")
    if severity:
        query = query.filter(HazardReport.severity == severity.lower())
    if report_type:
        query = query.filter(HazardReport.report_type == report_type)

    return query.order_by(HazardReport.created_at.desc()).all()

@router.get("/{report_id}", response_model=HazardReportOut)
def get_hazard_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    return report

@router.get("/{report_id}/duplicates")
def get_report_duplicates(report_id: str, db: Session = Depends(get_db)):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    
    all_reports = db.query(HazardReport).filter(
        HazardReport.station_id == report.station_id
    ).all()

    candidates = DuplicateDetector.find_potential_duplicates(
        new_lat=report.latitude,
        new_lng=report.longitude,
        report_type=report.report_type,
        existing_reports=all_reports,
        exclude_id=report.id
    )
    return {"report_id": report.id, "duplicate_candidates": candidates}

@router.get("/{report_id}/priority", response_model=LocationPriorityOut)
def get_report_priority(report_id: str, db: Session = Depends(get_db)):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    station = db.query(Station).filter(Station.id == report.station_id).first()
    st_lat = station.latitude if station else settings.DEFAULT_STATION_LAT
    st_lng = station.longitude if station else settings.DEFAULT_STATION_LNG

    nearby_verified = db.query(HazardReport).filter(
        HazardReport.station_id == report.station_id,
        HazardReport.status == "verified",
        HazardReport.id != report.id
    ).count()

    eval_result = PriorityEngine.evaluate_hazard_report(report, st_lat, st_lng, nearby_verified)

    return LocationPriorityOut(
        item_id=report.id,
        item_type="hazard_report",
        title=report.title,
        latitude=report.latitude,
        longitude=report.longitude,
        priority_rank=1,
        total_priority_score=eval_result["total_priority_score"],
        priority_level=eval_result["priority_level"],
        completeness_factor=eval_result["completeness_factor"],
        is_data_sufficient=eval_result["is_data_sufficient"],
        components=eval_result["components"],
        explanation=eval_result["explanation"],
        irc_guidance_clause=eval_result["irc_guidance_clause"],
        provenance=report.provenance
    )

@router.post("", response_model=HazardReportOut, status_code=status.HTTP_201_CREATED)
def submit_hazard_report(
    report_in: HazardReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Hash contact email/phone for privacy preserving storage
    contact_hash = None
    if report_in.reporter_contact:
        contact_hash = hashlib.sha256(report_in.reporter_contact.strip().encode("utf-8")).hexdigest()

    new_id = generate_report_id(db)
    
    # Initial status
    initial_status = "submitted"
    reviewed_by = None
    reviewed_at = None
    if current_user and current_user.role in [UserRole.FIELD_REVIEWER.value, UserRole.ADMINISTRATOR.value]:
        initial_status = "verified"
        reviewed_by = current_user.username
        reviewed_at = datetime.utcnow()

    report = HazardReport(
        id=new_id,
        station_id=report_in.station_id,
        report_type=report_in.report_type,
        title=report_in.title,
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        severity=report_in.severity.lower(),
        image_url=report_in.image_url,
        status=initial_status,
        reporter_type=report_in.reporter_type,
        reporter_contact_hash=contact_hash,
        reviewed_by=reviewed_by,
        reviewed_at=reviewed_at
    )
    db.add(report)

    # Add audit log
    history = ReportAuditHistory(
        report_id=new_id,
        previous_status="none",
        new_status=initial_status,
        changed_by=current_user.username if current_user else "citizen_reporter",
        notes="Hazard report submitted"
    )
    db.add(history)

    db.commit()
    db.refresh(report)
    return report

@router.post("/{report_id}/transition", response_model=HazardReportOut)
def transition_report_status(
    report_id: str,
    req: StatusTransitionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    valid_statuses = [s.value for s in VerificationStatus]
    if req.new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status: {req.new_status}")

    prev_status = report.status
    report.status = req.new_status
    report.reviewed_by = current_user.username
    report.reviewed_at = datetime.utcnow()
    if req.reviewer_notes:
        report.reviewer_notes = req.reviewer_notes

    history = ReportAuditHistory(
        report_id=report.id,
        previous_status=prev_status,
        new_status=req.new_status,
        changed_by=current_user.username,
        notes=req.reviewer_notes or f"Status transitioned from {prev_status} to {req.new_status}"
    )
    db.add(history)
    db.commit()
    db.refresh(report)
    return report

@router.post("/{report_id}/duplicate", response_model=HazardReportOut)
def confirm_duplicate(
    report_id: str,
    req: DuplicateConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")
    
    master = db.query(HazardReport).filter(HazardReport.id == req.duplicate_of_id).first()
    if not master:
        raise HTTPException(status_code=404, detail="Target duplicate master report not found")

    prev_status = report.status
    report.status = "duplicate"
    report.duplicate_of_id = req.duplicate_of_id
    report.reviewed_by = current_user.username
    report.reviewed_at = datetime.utcnow()
    report.reviewer_notes = req.notes or f"Confirmed duplicate of report {req.duplicate_of_id}"

    history = ReportAuditHistory(
        report_id=report.id,
        previous_status=prev_status,
        new_status="duplicate",
        changed_by=current_user.username,
        notes=f"Linked as duplicate to report {req.duplicate_of_id}"
    )
    db.add(history)
    db.commit()
    db.refresh(report)
    return report
