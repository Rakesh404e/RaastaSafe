from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "public_visitor"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# ----------------- Station Schemas -----------------
class StationExitBase(BaseModel):
    exit_number: str
    name: str
    latitude: float
    longitude: float
    has_step_free_ramp: bool = False
    has_tactile_paving: bool = False
    has_curb_ramp: bool = False
    details: Optional[str] = None

class StationExitCreate(StationExitBase):
    station_id: int

class StationExitOut(StationExitBase):
    id: int
    station_id: int

    class Config:
        from_attributes = True

class StationBase(BaseModel):
    name: str
    code: str
    line: str = "Red Line"
    latitude: float
    longitude: float
    boundary_radius_m: float = 500.0
    catchment_radius_m: float = 800.0
    description: Optional[str] = None

class StationCreate(StationBase):
    pass

class StationOut(StationBase):
    id: int
    exits: List[StationExitOut] = []

    class Config:
        from_attributes = True

# ----------------- Footpath Segment Schemas -----------------
class FootpathSegmentBase(BaseModel):
    station_id: int
    name: str
    street_name: str
    side_of_street: str = "north"
    geometry_geojson: Dict[str, Any]
    footpath_exists: Optional[bool] = None
    total_width_m: Optional[float] = None
    clear_walking_width_m: Optional[float] = None
    blocked_length_m: Optional[float] = None
    blocked_share_pct: Optional[float] = None
    surface_quality: str = "fair"
    discontinuities_detected: bool = False
    has_curb_ramps: Optional[bool] = None
    has_tactile_paving: Optional[bool] = None
    lighting_condition: str = "moderate"
    obstruction_types: List[str] = []
    estimated_pedestrian_volume: Optional[int] = None
    volume_method: Optional[str] = None
    observer_notes: Optional[str] = None
    observer_confidence: str = "high"
    provenance: str = "OBSERVED_FIELD_DATA"

class FootpathSegmentCreate(FootpathSegmentBase):
    pass

class FootpathSegmentUpdate(BaseModel):
    footpath_exists: Optional[bool] = None
    total_width_m: Optional[float] = None
    clear_walking_width_m: Optional[float] = None
    blocked_length_m: Optional[float] = None
    blocked_share_pct: Optional[float] = None
    surface_quality: Optional[str] = None
    discontinuities_detected: Optional[bool] = None
    has_curb_ramps: Optional[bool] = None
    has_tactile_paving: Optional[bool] = None
    lighting_condition: Optional[str] = None
    obstruction_types: Optional[List[str]] = None
    observer_notes: Optional[str] = None
    verification_status: Optional[str] = None

class FootpathSegmentOut(FootpathSegmentBase):
    id: int
    verification_status: str
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    # IRC Evaluation flags
    irc_clear_width_compliant: Optional[bool] = None
    irc_deficit_m: Optional[float] = None

    class Config:
        from_attributes = True

# ----------------- Queue Observation Schemas -----------------
class QueueObservationBase(BaseModel):
    station_id: int
    location_geojson: Dict[str, Any]
    start_time: str
    end_time: str
    time_window: str = "morning_peak"
    vehicle_count: int = 0
    queue_length_m: float = 0.0
    enters_walking_zone: bool = False
    enters_crossing: bool = False
    enters_cycle_lane: bool = False
    enters_carriageway: bool = False
    enters_metro_entrance: bool = False
    avg_wait_time_min: Optional[float] = None
    wait_time_method: Optional[str] = None
    nearby_marked_stand: str = "unknown"
    conflict_description: Optional[str] = None
    observer_confidence: str = "high"
    provenance: str = "OBSERVED_FIELD_DATA"

class QueueObservationCreate(QueueObservationBase):
    pass

class QueueObservationOut(QueueObservationBase):
    id: int
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Crossing Audit Schemas -----------------
class JunctionCrossingAuditBase(BaseModel):
    station_id: int
    location_geojson: Dict[str, Any]
    crossing_type: str = "informal"
    is_marked: bool = False
    measured_crossing_distance_m: Optional[float] = None
    traffic_speed_kmh: Optional[float] = None
    traffic_volume: Optional[int] = None
    sightline_blocked: bool = False
    has_curb_ramps: bool = False
    tactile_continuity: bool = False
    lighting_condition: str = "moderate"
    observed_conflict_level: str = "medium"
    provenance: str = "OBSERVED_FIELD_DATA"

class JunctionCrossingAuditCreate(JunctionCrossingAuditBase):
    pass

class JunctionCrossingAuditOut(JunctionCrossingAuditBase):
    id: int
    verification_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Hazard Report Schemas -----------------
class HazardReportBase(BaseModel):
    station_id: int
    report_type: str
    title: str
    description: str
    latitude: float
    longitude: float
    severity: str = "medium"
    image_url: Optional[str] = None
    reporter_type: str = "resident"
    reporter_contact: Optional[str] = None

class HazardReportCreate(HazardReportBase):
    pass

class StatusTransitionRequest(BaseModel):
    new_status: str
    reviewer_notes: Optional[str] = None

class DuplicateConfirmRequest(BaseModel):
    duplicate_of_id: str
    notes: Optional[str] = None

class ReportAuditHistoryOut(BaseModel):
    id: int
    report_id: str
    previous_status: str
    new_status: str
    changed_by: str
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class HazardReportOut(BaseModel):
    id: str
    station_id: int
    report_type: str
    title: str
    description: str
    latitude: float
    longitude: float
    severity: str
    image_url: Optional[str] = None
    status: str
    duplicate_of_id: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    reporter_type: str
    provenance: str
    created_at: datetime
    updated_at: datetime
    audit_history: List[ReportAuditHistoryOut] = []

    class Config:
        from_attributes = True

# ----------------- Commuter Survey Schemas -----------------
class AttributeRating(BaseModel):
    importance: int = Field(..., ge=1, le=6)
    satisfaction: int = Field(..., ge=1, le=6)

class CommuterSurveyCreate(BaseModel):
    station_id: int
    responses: Dict[str, AttributeRating]
    commuter_type: str = "daily_metro_rider"
    gender: Optional[str] = None
    notes: Optional[str] = None

class CommuterSurveyOut(BaseModel):
    id: int
    station_id: int
    responses_json: Dict[str, Any]
    commuter_type: str
    notes: Optional[str] = None
    provenance: str
    timestamp: datetime

    class Config:
        from_attributes = True

class IPACoordinate(BaseModel):
    attribute_key: str
    attribute_label: str
    mean_importance: float
    mean_satisfaction: float
    quadrant: str  # "Concentrate Here", "Keep Up Good Work", "Low Priority", "Possible Overkill"
    priority_level: str
    description: str

class IPAResultsOut(BaseModel):
    station_id: int
    sample_size: int
    confidence_warning: bool
    confidence_note: str
    importance_median: float
    satisfaction_median: float
    attributes: List[IPACoordinate]

# ----------------- Planning Schemas -----------------
class ProposedZoneBase(BaseModel):
    zone_type: str
    name: str
    geometry_geojson: Dict[str, Any]
    candidate_capacity: int = 10
    est_throughput_pax_hr: int = 150
    walking_distance_to_station_m: float = 45.0
    addressed_issues: List[str] = []
    potential_new_conflicts: List[str] = []
    missing_measurements: List[str] = []
    is_authority_approved: bool = False

class ProposedZoneCreate(ProposedZoneBase):
    pass

class ProposedZoneOut(ProposedZoneBase):
    id: int
    scenario_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class MMIScenarioBase(BaseModel):
    station_id: int
    name: str
    description: str
    author: str = "Civic Planner"
    status: str = "draft"
    notes: Optional[str] = None

class MMIScenarioCreate(MMIScenarioBase):
    zones: List[ProposedZoneCreate] = []

class MMIScenarioOut(MMIScenarioBase):
    id: int
    created_at: datetime
    updated_at: datetime
    zones: List[ProposedZoneOut] = []

    class Config:
        from_attributes = True

class ConflictCheckResult(BaseModel):
    zone_name: str
    zone_type: str
    overlap_with_pedestrian_path: bool
    overlap_with_crossing: bool
    distance_to_nearest_exit_m: float
    irc_ipt_proximity_compliant: bool
    irc_notes: List[str]
    potential_hazards_created: List[str]
    missing_field_checks: List[str]
    disclaimer: str

class MMIScenarioConflictCheckOut(BaseModel):
    scenario_id: int
    scenario_name: str
    overall_status: str
    conflicts: List[ConflictCheckResult]
    legal_disclaimer: str

# ----------------- Routing Schemas -----------------
class RouteRequest(BaseModel):
    station_id: int
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    prefer_step_free: bool = False
    min_clear_width_m: Optional[float] = None

class RouteStepOut(BaseModel):
    step_index: int
    instruction: str
    distance_m: float
    clear_walking_width_m: Optional[float]
    is_step_free: bool
    barrier_warning: Optional[str]

class RouteResultOut(BaseModel):
    found: bool
    total_distance_m: float
    step_free_certified: bool
    unknown_accessibility_edges_count: int
    steps: List[RouteStepOut]
    path_coordinates: List[List[float]]  # [[lng, lat], ...]
    warning_message: Optional[str] = None

# ----------------- Analytics & Priority Engine Schemas -----------------
class PriorityScoreComponent(BaseModel):
    name: str
    raw_value: Any
    weight: float
    weighted_score: float
    description: str

class LocationPriorityOut(BaseModel):
    item_id: str
    item_type: str  # "footpath_segment" or "hazard_report"
    title: str
    latitude: float
    longitude: float
    priority_rank: int
    total_priority_score: float  # 0 to 100
    priority_level: str  # "Critical", "High", "Medium", "Low"
    completeness_factor: float  # 0.0 to 1.0
    is_data_sufficient: bool
    components: List[PriorityScoreComponent]
    explanation: str
    irc_guidance_clause: str
    provenance: str

class HotspotContributingItem(BaseModel):
    id: str
    item_type: str
    title: str
    severity: str
    distance_to_center_m: float
    verification_status: str
    provenance: str

class HotspotClusterOut(BaseModel):
    cluster_id: str
    name: str
    center_lat: float
    center_lng: float
    radius_m: float
    total_observations_count: int
    verified_count: int
    highest_severity: str
    priority_score: float
    dominant_issue: str
    contributing_items: List[HotspotContributingItem]
    explanation: str

class DashboardSummaryOut(BaseModel):
    station_name: str
    total_footpaths_audited_count: int
    total_audited_length_m: float
    clear_width_deficit_count: int
    total_queue_observations_count: int
    active_hazard_reports_count: int
    verified_hazard_reports_count: int
    high_priority_hazards_count: int
    total_surveys_collected: int
    active_mmi_scenarios_count: int
    last_updated: datetime

# ----------------- Crash Context Schema -----------------
class CrashContextOut(BaseModel):
    id: int
    name: str
    zone_type: str
    latitude: float
    longitude: float
    buffer_radius_m: float
    fatal_crashes_count: int
    total_crashes_count: int
    reporting_period: str
    data_source: str
    source_url: str
    notes: Optional[str]
    provenance: str

    class Config:
        from_attributes = True
