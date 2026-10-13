from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import (
    FootpathSegment, QueueObservation, HazardReport, CommuterSurvey, MMIScenario, Station
)
from backend.app.schemas import (
    DashboardSummaryOut, HotspotClusterOut, LocationPriorityOut
)
from backend.app.algorithms.priority_engine import PriorityEngine, settings
from backend.app.algorithms.hotspot_clustering import HotspotClusterer

router = APIRouter(prefix="/analytics", tags=["Analytics & Hotspots"])

@router.get("/dashboard", response_model=DashboardSummaryOut)
def get_dashboard_summary(station_id: int = 1, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    station_name = station.name if station else "Rohini West Metro Station"

    segments = db.query(FootpathSegment).filter(FootpathSegment.station_id == station_id).all()
    queues = db.query(QueueObservation).filter(QueueObservation.station_id == station_id).all()
    hazards = db.query(HazardReport).filter(HazardReport.station_id == station_id).all()
    surveys = db.query(CommuterSurvey).filter(CommuterSurvey.station_id == station_id).all()
    scenarios = db.query(MMIScenario).filter(MMIScenario.station_id == station_id).all()

    total_audited_length = 0.0
    deficit_count = 0
    for s in segments:
        # Approximate length from coords or width
        coords = s.geometry_geojson.get("coordinates", [])
        if len(coords) >= 2:
            seg_len = sum(
                PriorityEngine.IRC_TRANSIT_WIDTH_TARGET for _ in range(len(coords) - 1)
            ) * 15.0  # approximate scaling
            total_audited_length += max(35.0, seg_len)
        else:
            total_audited_length += 40.0

        if s.clear_walking_width_m is not None and s.clear_walking_width_m < settings.IRC_MIN_WALKING_ZONE_TRANSIT_M:
            deficit_count += 1

    active_hazards = [h for h in hazards if h.status not in ["resolved", "rejected", "duplicate"]]
    verified_hazards = [h for h in hazards if h.status == "verified"]
    high_priority_hazards = [h for h in active_hazards if h.severity in ["high", "critical"]]

    return DashboardSummaryOut(
        station_name=station_name,
        total_footpaths_audited_count=len(segments),
        total_audited_length_m=round(total_audited_length, 1),
        clear_width_deficit_count=deficit_count,
        total_queue_observations_count=len(queues),
        active_hazard_reports_count=len(active_hazards),
        verified_hazard_reports_count=len(verified_hazards),
        high_priority_hazards_count=len(high_priority_hazards),
        total_surveys_collected=len(surveys),
        active_mmi_scenarios_count=len(scenarios),
        last_updated=datetime.utcnow()
    )

@router.get("/hotspots", response_model=List[HotspotClusterOut])
def get_hotspot_clusters(station_id: int = 1, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    st_lat = station.latitude if station else settings.DEFAULT_STATION_LAT
    st_lng = station.longitude if station else settings.DEFAULT_STATION_LNG

    hazards = db.query(HazardReport).filter(
        HazardReport.station_id == station_id,
        HazardReport.status != "duplicate"
    ).all()

    segments = db.query(FootpathSegment).filter(
        FootpathSegment.station_id == station_id
    ).all()

    observations = []
    # Add hazards
    for h in hazards:
        eval_h = PriorityEngine.evaluate_hazard_report(h, st_lat, st_lng, 0)
        observations.append({
            "id": h.id,
            "item_type": "hazard_report",
            "title": h.title,
            "report_type": h.report_type,
            "lat": h.latitude,
            "lng": h.longitude,
            "severity": h.severity,
            "status": h.status,
            "priority_score": eval_h["total_priority_score"],
            "provenance": h.provenance
        })

    # Add problematic segments
    for s in segments:
        if (s.clear_walking_width_m is not None and s.clear_walking_width_m < 2.5) or len(s.obstruction_types or []) > 0:
            coords = s.geometry_geojson.get("coordinates", [])
            if coords:
                mid_lng, mid_lat = coords[len(coords) // 2]
                eval_s = PriorityEngine.evaluate_footpath_segment(s, st_lat, st_lng, 0)
                observations.append({
                    "id": f"SEG-{s.id}",
                    "item_type": "footpath_segment",
                    "title": f"Footpath: {s.name}",
                    "report_type": "clear_width_deficit" if (s.clear_walking_width_m and s.clear_walking_width_m < 2.5) else "footpath_obstruction",
                    "lat": mid_lat,
                    "lng": mid_lng,
                    "severity": "high" if (s.clear_walking_width_m and s.clear_walking_width_m < 1.8) else "medium",
                    "status": s.verification_status,
                    "priority_score": eval_s["total_priority_score"],
                    "provenance": s.provenance
                })

    clusters = HotspotClusterer.cluster_observations(observations, radius_m=75.0)
    return clusters

@router.get("/priority-ranking", response_model=List[LocationPriorityOut])
def get_priority_ranking(station_id: int = 1, db: Session = Depends(get_db)):
    station = db.query(Station).filter(Station.id == station_id).first()
    st_lat = station.latitude if station else settings.DEFAULT_STATION_LAT
    st_lng = station.longitude if station else settings.DEFAULT_STATION_LNG

    hazards = db.query(HazardReport).filter(
        HazardReport.station_id == station_id,
        HazardReport.status != "duplicate"
    ).all()
    segments = db.query(FootpathSegment).filter(
        FootpathSegment.station_id == station_id
    ).all()

    evaluated_items = []

    # Evaluate segments
    for s in segments:
        coords = s.geometry_geojson.get("coordinates", [])
        mid_lng, mid_lat = coords[len(coords) // 2] if coords else (st_lng, st_lat)
        eval_s = PriorityEngine.evaluate_footpath_segment(s, st_lat, st_lng, 1)
        evaluated_items.append(LocationPriorityOut(
            item_id=f"SEG-{s.id}",
            item_type="footpath_segment",
            title=f"Footpath: {s.name}",
            latitude=mid_lat,
            longitude=mid_lng,
            priority_rank=0,
            total_priority_score=eval_s["total_priority_score"],
            priority_level=eval_s["priority_level"],
            completeness_factor=eval_s["completeness_factor"],
            is_data_sufficient=eval_s["is_data_sufficient"],
            components=eval_s["components"],
            explanation=eval_s["explanation"],
            irc_guidance_clause=eval_s["irc_guidance_clause"],
            provenance=s.provenance
        ))

    # Evaluate hazards
    for h in hazards:
        eval_h = PriorityEngine.evaluate_hazard_report(h, st_lat, st_lng, 1)
        evaluated_items.append(LocationPriorityOut(
            item_id=h.id,
            item_type="hazard_report",
            title=h.title,
            latitude=h.latitude,
            longitude=h.longitude,
            priority_rank=0,
            total_priority_score=eval_h["total_priority_score"],
            priority_level=eval_h["priority_level"],
            completeness_factor=eval_h["completeness_factor"],
            is_data_sufficient=eval_h["is_data_sufficient"],
            components=eval_h["components"],
            explanation=eval_h["explanation"],
            irc_guidance_clause=eval_h["irc_guidance_clause"],
            provenance=h.provenance
        ))

    # Sort descending by priority score and assign ranks
    evaluated_items.sort(key=lambda x: x.total_priority_score, reverse=True)
    for rank, item in enumerate(evaluated_items, 1):
        item.priority_rank = rank

    return evaluated_items
