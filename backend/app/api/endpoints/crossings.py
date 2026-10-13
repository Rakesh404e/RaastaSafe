from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import JunctionCrossingAudit, User, UserRole
from backend.app.schemas import JunctionCrossingAuditOut, JunctionCrossingAuditCreate
from backend.app.security.auth import get_current_user_optional, require_role

router = APIRouter(prefix="/crossings", tags=["Junction Crossings"])

@router.get("", response_model=List[JunctionCrossingAuditOut])
def get_crossings(
    station_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(JunctionCrossingAudit)
    if station_id:
        query = query.filter(JunctionCrossingAudit.station_id == station_id)
    if status_filter:
        query = query.filter(JunctionCrossingAudit.verification_status == status_filter)
    return query.all()

@router.post("", response_model=JunctionCrossingAuditOut, status_code=status.HTTP_201_CREATED)
def create_crossing_audit(
    crossing_in: JunctionCrossingAuditCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    status_val = "verified" if (current_user and current_user.role in [UserRole.FIELD_REVIEWER.value, UserRole.ADMINISTRATOR.value]) else "submitted"
    cr = JunctionCrossingAudit(
        **crossing_in.dict(),
        verification_status=status_val
    )
    db.add(cr)
    db.commit()
    db.refresh(cr)
    return cr

@router.patch("/{crossing_id}", response_model=JunctionCrossingAuditOut)
def verify_crossing_audit(
    crossing_id: int,
    status_val: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    cr = db.query(JunctionCrossingAudit).filter(JunctionCrossingAudit.id == crossing_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Crossing audit not found")
    cr.verification_status = status_val
    db.commit()
    db.refresh(cr)
    return cr
