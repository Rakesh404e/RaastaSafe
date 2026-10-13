from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import Station, StationExit, User, UserRole
from backend.app.schemas import (
    StationOut, StationCreate, StationExitOut, StationExitCreate
)
from backend.app.security.auth import require_role

router = APIRouter(prefix="/stations", tags=["Stations"])

@router.get("", response_model=List[StationOut])
def get_stations(db: Session = Depends(get_db)):
    return db.query(Station).all()

@router.get("/{station_id}", response_model=StationOut)
def get_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@router.post("", response_model=StationOut, status_code=status.HTTP_201_CREATED)
def create_station(
    station_in: StationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR]))
):
    existing = db.query(Station).filter(Station.code == station_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Station code already exists")
    station = Station(**station_in.dict())
    db.add(station)
    db.commit()
    db.refresh(station)
    return station

@router.post("/{station_id}/exits", response_model=StationExitOut, status_code=status.HTTP_201_CREATED)
def create_station_exit(
    station_id: int,
    exit_in: StationExitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMINISTRATOR, UserRole.FIELD_REVIEWER]))
):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    exit_obj = StationExit(
        station_id=station_id,
        exit_number=exit_in.exit_number,
        name=exit_in.name,
        latitude=exit_in.latitude,
        longitude=exit_in.longitude,
        has_step_free_ramp=exit_in.has_step_free_ramp,
        has_tactile_paving=exit_in.has_tactile_paving,
        has_curb_ramp=exit_in.has_curb_ramp,
        details=exit_in.details
    )
    db.add(exit_obj)
    db.commit()
    db.refresh(exit_obj)
    return exit_obj
