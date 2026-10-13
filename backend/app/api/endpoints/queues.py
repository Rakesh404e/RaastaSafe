from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import QueueObservation, User, UserRole
from backend.app.schemas import QueueObservationOut, QueueObservationCreate
from backend.app.security.auth import get_current_user_optional, require_role

router = APIRouter(prefix="/queues", tags=["Queue Observations"])

@router.get("", response_model=List[QueueObservationOut])
def get_queue_observations(
    station_id: Optional[int] = None,
    time_window: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(QueueObservation)
    if station_id:
        query = query.filter(QueueObservation.station_id == station_id)
    if time_window:
        query = query.filter(QueueObservation.time_window == time_window)
    if status_filter:
        query = query.filter(QueueObservation.verification_status == status_filter)
    return query.all()

@router.post("", response_model=QueueObservationOut, status_code=status.HTTP_201_CREATED)
def create_queue_observation(
    obs_in: QueueObservationCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    status_val = "verified" if (current_user and current_user.role in [UserRole.FIELD_REVIEWER.value, UserRole.ADMINISTRATOR.value]) else "submitted"
    obs = QueueObservation(
        **obs_in.dict(),
        verification_status=status_val
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)
    return obs

@router.patch("/{obs_id}", response_model=QueueObservationOut)
def verify_queue_observation(
    obs_id: int,
    status_val: str = Query(..., alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    obs = db.query(QueueObservation).filter(QueueObservation.id == obs_id).first()
    if not obs:
        raise HTTPException(status_code=404, detail="Queue observation not found")
    obs.verification_status = status_val
    db.commit()
    db.refresh(obs)
    return obs
