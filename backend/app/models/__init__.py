import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class UserRole(str, enum.Enum):
    PUBLIC_VISITOR = "public_visitor"
    FIELD_REVIEWER = "field_reviewer"
    ADMINISTRATOR = "administrator"

class VerificationStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    ACTION_PROPOSED = "action_proposed"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"

class SeverityLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ProvenanceType(str, enum.Enum):
    OBSERVED_FIELD_DATA = "OBSERVED_FIELD_DATA"
    CITIZEN_HAZARD_REPORT = "CITIZEN_HAZARD_REPORT"
    OFFICIAL_PLANNING_REFERENCE = "OFFICIAL_PLANNING_REFERENCE"
    OFFICIAL_CRASH_CONTEXT = "OFFICIAL_CRASH_CONTEXT"
    DEMO_SYNTHETIC = "DEMO_SYNTHETIC"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(30), default=UserRole.PUBLIC_VISITOR.value, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    line = Column(String(50), default="Red Line")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    boundary_radius_m = Column(Float, default=500.0)
    catchment_radius_m = Column(Float, default=800.0)
    description = Column(Text, nullable=True)

    exits = relationship("StationExit", back_populates="station", cascade="all, delete-orphan")
    footpath_segments = relationship("FootpathSegment", back_populates="station", cascade="all, delete-orphan")
    queue_observations = relationship("QueueObservation", back_populates="station", cascade="all, delete-orphan")
    crossings = relationship("JunctionCrossingAudit", back_populates="station", cascade="all, delete-orphan")
    hazard_reports = relationship("HazardReport", back_populates="station", cascade="all, delete-orphan")
    scenarios = relationship("MMIScenario", back_populates="station", cascade="all, delete-orphan")
    surveys = relationship("CommuterSurvey", back_populates="station", cascade="all, delete-orphan")

class StationExit(Base):
    __tablename__ = "station_exits"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    exit_number = Column(String(20), nullable=False)
    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    has_step_free_ramp = Column(Boolean, default=False)
    has_tactile_paving = Column(Boolean, default=False)
    has_curb_ramp = Column(Boolean, default=False)
    details = Column(Text, nullable=True)

    station = relationship("Station", back_populates="exits")

class FootpathSegment(Base):
    __tablename__ = "footpath_segments"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    street_name = Column(String(100), nullable=False)
    side_of_street = Column(String(20), default="north")  # north, south, east, west
    geometry_geojson = Column(JSON, nullable=False)  # LineString GeoJSON {type: "LineString", coordinates: [[lng, lat], ...]}
    
    footpath_exists = Column(Boolean, nullable=True)  # True, False, or None (Unknown)
    total_width_m = Column(Float, nullable=True)  # Total measured width
    clear_walking_width_m = Column(Float, nullable=True)  # Remaining clear walking width
    blocked_length_m = Column(Float, nullable=True)
    blocked_share_pct = Column(Float, nullable=True)
    
    surface_quality = Column(String(30), default="fair")  # good, fair, poor, broken
    discontinuities_detected = Column(Boolean, default=False)
    has_curb_ramps = Column(Boolean, nullable=True)
    has_tactile_paving = Column(Boolean, nullable=True)
    lighting_condition = Column(String(30), default="moderate")  # good, moderate, poor, none
    
    obstruction_types = Column(JSON, default=list)  # list of strings e.g. ["e_rickshaw_queue", "vendor_spillover"]
    estimated_pedestrian_volume = Column(Integer, nullable=True)
    volume_method = Column(String(100), nullable=True)  # e.g., "15-min peak manual count", null if unknown
    
    observer_notes = Column(Text, nullable=True)
    observer_confidence = Column(String(20), default="high")  # low, medium, high
    verification_status = Column(String(30), default=VerificationStatus.SUBMITTED.value)
    verified_by = Column(String(50), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    provenance = Column(String(40), default=ProvenanceType.OBSERVED_FIELD_DATA.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="footpath_segments")

class QueueObservation(Base):
    __tablename__ = "queue_observations"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    location_geojson = Column(JSON, nullable=False)  # Point or LineString
    
    start_time = Column(String(30), nullable=False)  # e.g., "08:30"
    end_time = Column(String(30), nullable=False)    # e.g., "09:30"
    time_window = Column(String(30), default="morning_peak")  # morning_peak, evening_peak, off_peak
    
    vehicle_count = Column(Integer, default=0)
    queue_length_m = Column(Float, default=0.0)
    
    enters_walking_zone = Column(Boolean, default=False)
    enters_crossing = Column(Boolean, default=False)
    enters_cycle_lane = Column(Boolean, default=False)
    enters_carriageway = Column(Boolean, default=False)
    enters_metro_entrance = Column(Boolean, default=False)
    
    avg_wait_time_min = Column(Float, nullable=True)
    wait_time_method = Column(String(100), nullable=True)  # e.g. "Sample of 10 passenger boardings"
    nearby_marked_stand = Column(String(20), default="unknown")  # yes, no, unknown
    
    conflict_description = Column(Text, nullable=True)
    observer_confidence = Column(String(20), default="high")
    verification_status = Column(String(30), default=VerificationStatus.SUBMITTED.value)
    
    provenance = Column(String(40), default=ProvenanceType.OBSERVED_FIELD_DATA.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="queue_observations")

class JunctionCrossingAudit(Base):
    __tablename__ = "junction_crossing_audits"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    location_geojson = Column(JSON, nullable=False)
    
    crossing_type = Column(String(40), default="informal")  # zebra, signalized, grade_separated, informal
    is_marked = Column(Boolean, default=False)
    measured_crossing_distance_m = Column(Float, nullable=True)
    
    traffic_speed_kmh = Column(Float, nullable=True)  # strictly null if unmeasured
    traffic_volume = Column(Integer, nullable=True)    # strictly null if unmeasured
    
    sightline_blocked = Column(Boolean, default=False)
    has_curb_ramps = Column(Boolean, default=False)
    tactile_continuity = Column(Boolean, default=False)
    lighting_condition = Column(String(30), default="moderate")
    observed_conflict_level = Column(String(20), default="medium")  # low, medium, high
    
    verification_status = Column(String(30), default=VerificationStatus.SUBMITTED.value)
    provenance = Column(String(40), default=ProvenanceType.OBSERVED_FIELD_DATA.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="crossings")

class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(String(50), primary_key=True, index=True)  # e.g. "RST-2026-001"
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    
    report_type = Column(String(40), nullable=False)  # obstruction, missing_ramp, broken_footpath, queue_spillover, dark_spot, unsafe_crossing, other
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(20), default=SeverityLevel.MEDIUM.value)
    
    image_url = Column(String(255), nullable=True)
    status = Column(String(30), default=VerificationStatus.SUBMITTED.value)
    duplicate_of_id = Column(String(50), nullable=True)
    
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(50), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    reporter_type = Column(String(30), default="resident")  # anonymous, resident, commuter, student_auditor
    reporter_contact_hash = Column(String(64), nullable=True)
    
    provenance = Column(String(40), default=ProvenanceType.CITIZEN_HAZARD_REPORT.value)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    station = relationship("Station", back_populates="hazard_reports")
    audit_history = relationship("ReportAuditHistory", back_populates="report", cascade="all, delete-orphan")

class ReportAuditHistory(Base):
    __tablename__ = "report_audit_history"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(50), ForeignKey("hazard_reports.id"), nullable=False)
    previous_status = Column(String(30), nullable=False)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    report = relationship("HazardReport", back_populates="audit_history")

class CommuterSurvey(Base):
    __tablename__ = "commuter_surveys"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    
    # Store ratings on 1-6 Likert scale (1: Very Low, 6: Very High)
    # Stored as JSON dictionary with keys for the 9 core attributes:
    # {
    #   "universal_design": {"importance": 6, "satisfaction": 2},
    #   "illumination": {"importance": 5, "satisfaction": 3},
    #   "safety_security": {"importance": 6, "satisfaction": 3},
    #   "traffic_conflict": {"importance": 5, "satisfaction": 2},
    #   "footpath_continuity": {"importance": 5, "satisfaction": 2},
    #   "crossing_safety": {"importance": 6, "satisfaction": 3},
    #   "weather_comfort": {"importance": 4, "satisfaction": 2},
    #   "signage_wayfinding": {"importance": 4, "satisfaction": 4},
    #   "last_mile_access": {"importance": 6, "satisfaction": 2}
    # }
    responses_json = Column(JSON, nullable=False)
    commuter_type = Column(String(30), default="daily_metro_rider")
    gender = Column(String(20), nullable=True)  # optional anonymized demographic
    notes = Column(Text, nullable=True)
    provenance = Column(String(40), default=ProvenanceType.OBSERVED_FIELD_DATA.value)
    timestamp = Column(DateTime, default=datetime.utcnow)

    station = relationship("Station", back_populates="surveys")

class MMIScenario(Base):
    __tablename__ = "mmi_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    author = Column(String(100), default="Civic Planner")
    status = Column(String(30), default="draft")  # draft, under_review, active, archived
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    station = relationship("Station", back_populates="scenarios")
    zones = relationship("ProposedZone", back_populates="scenario", cascade="all, delete-orphan")

class ProposedZone(Base):
    __tablename__ = "proposed_zones"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("mmi_scenarios.id"), nullable=False)
    
    zone_type = Column(String(50), nullable=False)  # erickshaw_stand, pickup_dropoff, pedestrian_plaza, crossing_buffer, vendor_zone
    name = Column(String(100), nullable=False)
    geometry_geojson = Column(JSON, nullable=False)  # Polygon or MultiPolygon
    
    candidate_capacity = Column(Integer, default=10)  # vehicle or stall capacity
    est_throughput_pax_hr = Column(Integer, default=150)
    walking_distance_to_station_m = Column(Float, default=45.0)
    
    addressed_issues = Column(JSON, default=list)  # list of strings
    potential_new_conflicts = Column(JSON, default=list)  # list of strings
    missing_measurements = Column(JSON, default=list)  # list of strings
    is_authority_approved = Column(Boolean, default=False)  # ALWAYS disclaimed as False for planning drafts
    
    created_at = Column(DateTime, default=datetime.utcnow)

    scenario = relationship("MMIScenario", back_populates="zones")

class RouteNode(Base):
    __tablename__ = "route_nodes"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    node_type = Column(String(40), default="intersection")  # station_gate, intersection, crossing, destination
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_step_free = Column(Boolean, default=True)

class RouteEdge(Base):
    __tablename__ = "route_edges"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    from_node_id = Column(Integer, ForeignKey("route_nodes.id"), nullable=False)
    to_node_id = Column(Integer, ForeignKey("route_nodes.id"), nullable=False)
    
    length_m = Column(Float, nullable=False)
    clear_walking_width_m = Column(Float, nullable=True)  # None if unknown
    
    is_step_free = Column(Boolean, default=True)
    has_stairs = Column(Boolean, default=False)
    has_steep_slope = Column(Boolean, default=False)
    has_curb_ramp = Column(Boolean, default=True)
    surface_quality = Column(String(30), default="fair")
    is_synthetic = Column(Boolean, default=False)

class CrashContext(Base):
    __tablename__ = "crash_context"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    zone_type = Column(String(50), default="official_pedestrian_blackspot")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    buffer_radius_m = Column(Float, default=500.0)  # Delhi Traffic Police 500m diameter standard
    
    fatal_crashes_count = Column(Integer, default=0)
    total_crashes_count = Column(Integer, default=0)
    reporting_period = Column(String(50), default="2021-2023")
    data_source = Column(String(100), default="Delhi Traffic Police Annual Crash Report")
    source_url = Column(String(255), default="https://traffic.delhipolice.gov.in/delhi-crash-report-2023")
    notes = Column(Text, nullable=True)
    provenance = Column(String(40), default=ProvenanceType.OFFICIAL_CRASH_CONTEXT.value)
