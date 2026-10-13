from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import (
    MMIScenario, ProposedZone, Station, StationExit, FootpathSegment, JunctionCrossingAudit,
    User, UserRole
)
from backend.app.schemas import (
    MMIScenarioOut, MMIScenarioCreate, ProposedZoneOut, ProposedZoneCreate,
    MMIScenarioConflictCheckOut
)
from backend.app.security.auth import require_role
from backend.app.algorithms.mmi_planner import MMIPlannerEngine

router = APIRouter(prefix="/scenarios", tags=["MMI Scenario Planning"])

@router.get("", response_model=List[MMIScenarioOut])
def get_scenarios(station_id: int = 1, db: Session = Depends(get_db)):
    return db.query(MMIScenario).filter(MMIScenario.station_id == station_id).all()

@router.get("/{scenario_id}", response_model=MMIScenarioOut)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(MMIScenario).filter(MMIScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@router.post("", response_model=MMIScenarioOut, status_code=status.HTTP_201_CREATED)
def create_scenario(
    scenario_in: MMIScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    scenario = MMIScenario(
        station_id=scenario_in.station_id,
        name=scenario_in.name,
        description=scenario_in.description,
        author=current_user.username,
        status=scenario_in.status,
        notes=scenario_in.notes
    )
    db.add(scenario)
    db.flush()

    for z in scenario_in.zones:
        zone = ProposedZone(
            scenario_id=scenario.id,
            zone_type=z.zone_type,
            name=z.name,
            geometry_geojson=z.geometry_geojson,
            candidate_capacity=z.candidate_capacity,
            est_throughput_pax_hr=z.est_throughput_pax_hr,
            walking_distance_to_station_m=z.walking_distance_to_station_m,
            addressed_issues=z.addressed_issues,
            potential_new_conflicts=z.potential_new_conflicts,
            missing_measurements=z.missing_measurements,
            is_authority_approved=False
        )
        db.add(zone)

    db.commit()
    db.refresh(scenario)
    return scenario

@router.post("/{scenario_id}/zones", response_model=ProposedZoneOut, status_code=status.HTTP_201_CREATED)
def add_zone_to_scenario(
    scenario_id: int,
    zone_in: ProposedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    scenario = db.query(MMIScenario).filter(MMIScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    zone = ProposedZone(
        scenario_id=scenario_id,
        zone_type=zone_in.zone_type,
        name=zone_in.name,
        geometry_geojson=zone_in.geometry_geojson,
        candidate_capacity=zone_in.candidate_capacity,
        est_throughput_pax_hr=zone_in.est_throughput_pax_hr,
        walking_distance_to_station_m=zone_in.walking_distance_to_station_m,
        addressed_issues=zone_in.addressed_issues,
        potential_new_conflicts=zone_in.potential_new_conflicts,
        missing_measurements=zone_in.missing_measurements,
        is_authority_approved=False
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/{scenario_id}/zones/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_zone_from_scenario(
    scenario_id: int,
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.FIELD_REVIEWER, UserRole.ADMINISTRATOR]))
):
    zone = db.query(ProposedZone).filter(
        ProposedZone.id == zone_id,
        ProposedZone.scenario_id == scenario_id
    ).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return None

@router.get("/{scenario_id}/conflicts", response_model=MMIScenarioConflictCheckOut)
def check_scenario_conflicts(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(MMIScenario).filter(MMIScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    exits = db.query(StationExit).filter(StationExit.station_id == scenario.station_id).all()
    segments = db.query(FootpathSegment).filter(FootpathSegment.station_id == scenario.station_id).all()
    crossings = db.query(JunctionCrossingAudit).filter(JunctionCrossingAudit.station_id == scenario.station_id).all()

    return MMIPlannerEngine.check_scenario_conflicts(
        scenario=scenario,
        station_exits=exits,
        footpath_segments=segments,
        crossings=crossings
    )
