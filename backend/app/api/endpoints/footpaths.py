from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import FootpathSegment, Station, User, UserRole, HazardReport
from backend.app.schemas import (
    FootpathSegmentOut, FootpathSegmentCreate, FootpathSegmentUpdate, LocationPriorityOut
)
from backend.app.security.auth import get_current_user_optional, require_role
from backend.app.algorithms.priority_engine import PriorityEngine, settings

router = APIRouter(prefix="/footpaths", tags=["Footpath Segments"])

def enrich_segment(seg: FootpathSegment) -> dict:
    d = {c.name: getattr(seg, c.name) for c in seg.__table__.columns}
    # IRC evaluation flags
    if seg.clear_walking_width_m is not None:
        target = settings.IRC_MIN_WALKING_ZONE_TRANSIT_M
        d["irc_clear_width_compliant"] = seg.clear_walking_width_m >= target
        d["irc_deficit_m"] = round(max(0.0, target - seg.clear_walking_width_m), 2)
    else:
        d["irc_clear_width_compliant"] = None
        d["irc_deficit_m"] = None
    return d

@router.get("", response_model=List[FootpathSegmentOut])
def get_footpath_segments(
    station_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    has_obstruction: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FootpathSegment)
    if station_id:
        query = query.filter(FootpathSegment.station_id == station_id)
    if status_filter:
        query = query.filter(FootpathSegment.verification_status == status_filter)
    
    segments = query.all()
    results = []
    for s in segments:
        if has_obstruction is not None:
            has_obs = len(s.obstruction_types or []) > 0
            if has_obs != has_obstruction:
                continue
        results.append(enrich_segment(s))
    return results

@router.get("/{segment_id}", response_model=FootpathSegmentOut)
def get_footpath_segment(segment_id: int, db: Session = Depends(get_db)):
    seg = db.query(FootpathSegment).filter(FootpathSegment.id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Footpath segment not found")
    return enrich_segment(seg)

@router.get("/{segment_id}/priority", response_model=LocationPriorityOut)
def get_segment_priority(segment_id: int, db: Session = Depends(get_db)):
    seg = db.query(FootpathSegment).filter(FootpathSegment.id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Footpath segment not found")
    station = db.query(Station).filter(Station.id == seg.station_id).first()
    st_lat = station.latitude if station else settings.DEFAULT_STATION_LAT
    st_lng = station.longitude if station else settings.DEFAULT_STATION_LNG

    # Count nearby verified reports
    nearby_reports = db.query(HazardReport).filter(
        HazardReport.station_id == seg.station_id,
        HazardReport.status == "verified"
    ).count()

    eval_result = PriorityEngine.evaluate_footpath_segment(seg, st_lat, st_lng, nearby_reports)

    coords = seg.geometry_geojson.get("coordinates", [])
    mid_lng, mid_lat = coords[len(coords) // 2] if coords else (st_lng, st_lat)

    return LocationPriorityOut(
        item_id=str(seg.id),
        item_type="footpath_segment",
        title=seg.name,
        latitude=mid_lat,
        longitude=mid_lng,
        priority_rank=1,
        total_priority_score=eval_result["total_priority_score"],
        priority_level=eval_result["priority_level"],
        completeness_factor=eval_result["completeness_factor"],
        is_data_sufficient=eval_result["is_data_sufficient"],
        components=eval_result["components"],
        explanation=eval_result["explanation"],
        irc_guidance_clause=eval_result["irc_guidance_clause"],
        provenance=seg.provenance
    )

@router.post("", response_model=FootpathSegmentOut, status_code=status.HTTP_201_CREATED)
def create_footpath_segment(
    seg_in: FootpathSegmentCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Public visitors can submit audits, but status defaults to 'submitted'
    # Field reviewers or admins can immediately mark verified
    status_val = "submitted"
    verified_by = None
    verified_at = None

    if current_user and current_user.role in [UserRole.FIELD_REVIEWER.value, UserRole.ADMINISTRATOR.value]:
        status_val = "verified"
        verified_by = current_user.username
        verified_at = datetime.utcnow()

    seg = FootpathSegment(
        **seg_in.dict(),
        verification_status=status_val,
        verified_by=verified_by,
        verified_at=verified_at
    )
    db.add(seg)
    db.commit()
    db.refresh(seg)
    return enrich_segment(seg)

@router.patch("/{segment_id}", response_model=FootpathSegmentOut)
def update_footpath_segment(
    segment_id: int,
    seg_update: FootpathSegmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    seg = db.query(FootpathSegment).filter(FootpathSegment.id == segment_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Footpath segment not found")

    update_data = seg_update.dict(exclude_unset=True)
    if "verification_status" in update_data:
        if update_data["verification_status"] == "verified":
            seg.verified_by = current_user.username
            seg.verified_at = datetime.utcnow()

    for field, val in update_data.items():
        setattr(seg, field, val)

    db.commit()
    db.refresh(seg)
    return enrich_segment(seg)
