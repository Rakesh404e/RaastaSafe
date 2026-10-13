import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.models import User, UserRole, Station
from backend.app.security.auth import hash_password, create_access_token
from backend.app.algorithms.priority_engine import PriorityEngine
from backend.app.algorithms.hotspot_clustering import HotspotClusterer
from backend.app.algorithms.ipa_engine import IPAEngine
from backend.app.algorithms.accessibility_router import AccessibilityRouter

# In-memory test database with StaticPool so all connections share the same memory instance
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Bootstrap users
    admin = User(
        username="test_admin",
        email="admin@test.org",
        hashed_password=hash_password("adminpass"),
        role=UserRole.ADMINISTRATOR.value
    )
    reviewer = User(
        username="test_reviewer",
        email="reviewer@test.org",
        hashed_password=hash_password("reviewerpass"),
        role=UserRole.FIELD_REVIEWER.value
    )
    citizen = User(
        username="test_citizen",
        email="citizen@test.org",
        hashed_password=hash_password("citizenpass"),
        role=UserRole.PUBLIC_VISITOR.value
    )
    station = Station(
        id=1,
        name="Rohini West Metro Station",
        code="RWST",
        line="Red Line",
        latitude=28.71452,
        longitude=77.11475,
        boundary_radius_m=500.0,
        catchment_radius_m=800.0,
        description="Pilot test station"
    )
    db.add_all([admin, reviewer, citizen, station])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def admin_token():
    return create_access_token(data={"sub": "test_admin", "role": "administrator"})

@pytest.fixture
def reviewer_token():
    return create_access_token(data={"sub": "test_reviewer", "role": "field_reviewer"})

@pytest.fixture
def citizen_token():
    return create_access_token(data={"sub": "test_citizen", "role": "public_visitor"})

# ----------------- Tests -----------------

def test_auth_login_and_roles(client):
    # Test valid login
    resp = client.post("/api/v1/auth/login", json={"username": "test_admin", "password": "adminpass"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "administrator"

    # Test invalid password
    resp = client.post("/api/v1/auth/login", json={"username": "test_admin", "password": "wrong"})
    assert resp.status_code == 401

def test_station_creation_and_exits(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    st_payload = {
        "name": "Rohini Sector 18 Station",
        "code": "RS18_TEST",
        "line": "Yellow Line",
        "latitude": 28.74230,
        "longitude": 77.13510,
        "boundary_radius_m": 500.0,
        "catchment_radius_m": 800.0,
        "description": "Test station"
    }
    resp = client.post("/api/v1/stations", json=st_payload, headers=headers)
    assert resp.status_code == 201
    st_data = resp.json()
    assert st_data["id"] is not None
    station_id = st_data["id"]

    # Add exit
    exit_payload = {
        "station_id": station_id,
        "exit_number": "1",
        "name": "Gate 1",
        "latitude": 28.74250,
        "longitude": 77.13530,
        "has_step_free_ramp": True,
        "has_tactile_paving": True,
        "has_curb_ramp": True,
        "details": "Step free gate"
    }
    resp_exit = client.post(f"/api/v1/stations/{station_id}/exits", json=exit_payload, headers=headers)
    assert resp_exit.status_code == 201

def test_footpath_audit_with_irc_eval(client, reviewer_token):
    headers = {"Authorization": f"Bearer {reviewer_token}"}
    # Segment with clear width deficit (< 2.5m)
    seg_payload = {
        "station_id": 1,
        "name": "Mahavir Marg West",
        "street_name": "Bhagwan Mahavir Marg",
        "side_of_street": "north",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[77.114, 28.715], [77.115, 28.715]]
        },
        "footpath_exists": True,
        "total_width_m": 2.6,
        "clear_walking_width_m": 1.4, # Deficit!
        "surface_quality": "fair",
        "discontinuities_detected": True,
        "has_curb_ramps": False,
        "has_tactile_paving": True,
        "lighting_condition": "moderate",
        "obstruction_types": ["e_rickshaw_queue"],
        "estimated_pedestrian_volume": 350,
        "volume_method": "15-min sample count",
        "observer_confidence": "high",
        "provenance": "OBSERVED_FIELD_DATA"
    }
    resp = client.post("/api/v1/footpaths", json=seg_payload, headers=headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["irc_clear_width_compliant"] is False
    assert data["irc_deficit_m"] == 1.10  # 2.5 - 1.4 = 1.10m
    assert data["verification_status"] == "verified"

def test_hazard_reporting_lifecycle_and_duplicates(client, reviewer_token):
    # 1. Citizen submits hazard report
    rep_payload = {
        "station_id": 1,
        "report_type": "missing_ramp",
        "title": "Broken curb at gate entrance",
        "description": "High vertical step without ramp",
        "latitude": 28.71518,
        "longitude": 77.11538,
        "severity": "critical",
        "reporter_type": "resident"
    }
    resp = client.post("/api/v1/hazards", json=rep_payload)
    assert resp.status_code == 201
    data = resp.json()
    report_id = data["id"]
    assert data["status"] == "submitted"

    # 2. Check duplicate suggestions
    resp_dup = client.get(f"/api/v1/hazards/{report_id}/duplicates")
    assert resp_dup.status_code == 200

    # 3. Field reviewer transitions status to 'verified'
    headers = {"Authorization": f"Bearer {reviewer_token}"}
    trans_payload = {
        "new_status": "verified",
        "reviewer_notes": "Curb drop measured on-site: 22cm vertical barrier."
    }
    resp_trans = client.post(f"/api/v1/hazards/{report_id}/transition", json=trans_payload, headers=headers)
    assert resp_trans.status_code == 200
    assert resp_trans.json()["status"] == "verified"
    assert resp_trans.json()["reviewed_by"] == "test_reviewer"

def test_explainable_priority_engine():
    # Test that missing width produces completeness penalty, not fake values
    class DummySegment:
        name = "Unmeasured Path"
        clear_walking_width_m = None
        obstruction_types = ["e_rickshaw_queue"]
        footpath_exists = True
        surface_quality = "fair"
        has_curb_ramps = None
        has_tactile_paving = None
        discontinuities_detected = False
        geometry_geojson = {"coordinates": [[77.114, 28.714], [77.115, 28.715]]}
        verification_status = "submitted"

    eval_result = PriorityEngine.evaluate_footpath_segment(
        DummySegment(), station_lat=28.71452, station_lng=77.11475, nearby_verified_reports_count=0
    )
    assert eval_result["completeness_factor"] < 0.7
    assert eval_result["is_data_sufficient"] is False
    assert any("Unknown / Unmeasured" in c["raw_value"] for c in eval_result["components"])

def test_hotspot_clustering_no_data():
    empty_result = HotspotClusterer.cluster_observations([])
    assert empty_result == []

def test_ipa_engine_quadrants_and_sample_warning():
    # If sample size < 30, must issue confidence warning
    class DummySurvey:
        responses_json = {
            "universal_design": {"importance": 6, "satisfaction": 2},
            "illumination": {"importance": 5, "satisfaction": 2},
            "safety_security": {"importance": 6, "satisfaction": 3},
            "traffic_conflict": {"importance": 5, "satisfaction": 2},
            "footpath_continuity": {"importance": 5, "satisfaction": 2},
            "crossing_safety": {"importance": 6, "satisfaction": 3},
            "weather_comfort": {"importance": 4, "satisfaction": 3},
            "signage_wayfinding": {"importance": 3, "satisfaction": 5},
            "last_mile_access": {"importance": 6, "satisfaction": 2}
        }
    surveys = [DummySurvey() for _ in range(5)]
    res = IPAEngine.analyze_surveys(surveys, station_id=1)
    assert res["sample_size"] == 5
    assert res["confidence_warning"] is True
    assert "Kar et al. 2026" in res["confidence_note"]

def test_accessibility_routing_barrier_exclusion():
    # Test Dijkstra step-free constraint: must exclude stairs
    class Node:
        def __init__(self, id, name, lat, lng, step_free=True):
            self.id = id
            self.name = name
            self.latitude = lat
            self.longitude = lng
            self.is_step_free = step_free

    class Edge:
        def __init__(self, from_id, to_id, length, stairs=False, step_free=True):
            self.from_node_id = from_id
            self.to_node_id = to_id
            self.length_m = length
            self.has_stairs = stairs
            self.is_step_free = step_free
            self.has_steep_slope = False
            self.has_curb_ramp = True
            self.clear_walking_width_m = 2.5
            self.surface_quality = "good"

    nodes = [
        Node(1, "Gate 1", 28.7150, 77.1140),
        Node(2, "Midpoint Stair", 28.7151, 77.1145),
        Node(3, "Destination", 28.7152, 77.1150),
        Node(4, "Accessible Ramp Path", 28.7148, 77.1145)
    ]
    edges = [
        Edge(1, 2, 20.0, stairs=True, step_free=False),
        Edge(2, 3, 20.0, stairs=False, step_free=True),
        Edge(1, 4, 35.0, stairs=False, step_free=True),
        Edge(4, 3, 35.0, stairs=False, step_free=True)
    ]

    # Standard route should take short path (40m)
    std_route = AccessibilityRouter.find_route(
        nodes, edges, start_lat=28.7150, start_lng=77.1140, end_lat=28.7152, end_lng=77.1150, prefer_step_free=False
    )
    assert std_route["found"] is True
    assert std_route["total_distance_m"] == 40.0

    # Step-free route MUST bypass stairs and choose path 1 -> 4 -> 3 (70m)
    wheelchair_route = AccessibilityRouter.find_route(
        nodes, edges, start_lat=28.7150, start_lng=77.1140, end_lat=28.7152, end_lng=77.1150, prefer_step_free=True
    )
    assert wheelchair_route["found"] is True
    assert wheelchair_route["total_distance_m"] == 70.0
    assert wheelchair_route["step_free_certified"] is True

def test_exports_csv_and_pdf(client):
    # Test CSV export
    resp_csv = client.get("/api/v1/exports/csv?record_type=hazards&station_id=1")
    assert resp_csv.status_code == 200
    assert resp_csv.headers["content-type"].startswith("text/csv")
    assert "Report ID" in resp_csv.text

    # Test PDF export
    resp_pdf = client.get("/api/v1/exports/pdf?station_id=1")
    assert resp_pdf.status_code == 200
    assert resp_pdf.headers["content-type"] == "application/pdf"
    assert resp_pdf.content.startswith(b"%PDF")

def test_full_end_to_end_acceptance_workflow(client, reviewer_token):
    headers = {"Authorization": f"Bearer {reviewer_token}"}

    # Step 1 & 2: Create a footpath segment and queue observation
    seg_payload = {
        "station_id": 1,
        "name": "E2E Acceptance Corridor",
        "street_name": "Outer Ring Road Link",
        "side_of_street": "east",
        "geometry_geojson": {
            "type": "LineString",
            "coordinates": [[77.1145, 28.7148], [77.1152, 28.7150]]
        },
        "footpath_exists": True,
        "total_width_m": 2.4,
        "clear_walking_width_m": 1.2,
        "surface_quality": "poor",
        "discontinuities_detected": True,
        "has_curb_ramps": False,
        "has_tactile_paving": False,
        "lighting_condition": "poor",
        "obstruction_types": ["e_rickshaw_queue", "broken_surface"],
        "estimated_pedestrian_volume": 420,
        "volume_method": "15-min peak count",
        "observer_notes": "E2E test corridor audit",
        "observer_confidence": "high",
        "provenance": "OBSERVED_FIELD_DATA"
    }
    r_seg = client.post("/api/v1/footpaths", json=seg_payload, headers=headers)
    assert r_seg.status_code == 201
    seg_id = r_seg.json()["id"]

    q_payload = {
        "station_id": 1,
        "location_geojson": {"type": "Point", "coordinates": [77.1152, 28.7150]},
        "start_time": "08:30",
        "end_time": "09:30",
        "time_window": "morning_peak",
        "vehicle_count": 18,
        "queue_length_m": 50.0,
        "enters_walking_zone": True,
        "enters_crossing": True,
        "avg_wait_time_min": 4.5,
        "conflict_description": "Queue blocks pedestrian access to zebra crossing"
    }
    r_q = client.post("/api/v1/queues", json=q_payload, headers=headers)
    assert r_q.status_code == 201

    # Step 3: Retrieve from backend
    r_get = client.get(f"/api/v1/footpaths/{seg_id}")
    assert r_get.status_code == 200
    assert r_get.json()["clear_walking_width_m"] == 1.2
    assert r_get.json()["irc_clear_width_compliant"] is False

    # Step 4: Verify record as authorized reviewer
    r_verify = client.patch(f"/api/v1/footpaths/{seg_id}", json={"verification_status": "verified"}, headers=headers)
    assert r_verify.status_code == 200
    assert r_verify.json()["verification_status"] == "verified"

    # Step 5: Recompute & display explainable priority
    r_prio = client.get(f"/api/v1/footpaths/{seg_id}/priority")
    assert r_prio.status_code == 200
    prio_data = r_prio.json()
    assert prio_data["total_priority_score"] > 50
    assert prio_data["priority_level"] in ["High", "Critical"]
    assert len(prio_data["components"]) == 4

    # Step 6: Verify feature appears on map data
    r_map = client.get("/api/v1/footpaths?station_id=1")
    assert r_map.status_code == 200
    assert any(s["id"] == seg_id for s in r_map.json())

    # Step 7: Create and save MMI zone scenario
    scenario_payload = {
        "station_id": 1,
        "name": "E2E Reorganized Stand Scenario",
        "description": "Proposed feeder bay with 2.5m clear corridor buffer",
        "status": "draft",
        "zones": [{
            "zone_type": "erickshaw_stand",
            "name": "Proposed Curbside Bay 1",
            "geometry_geojson": {
                "type": "Polygon",
                "coordinates": [[[77.1148, 28.7149], [77.1150, 28.7149], [77.1150, 28.7151], [77.1148, 28.7151], [77.1148, 28.7149]]]
            },
            "candidate_capacity": 12,
            "walking_distance_to_station_m": 35.0,
            "addressed_issues": ["Eliminates queue spillover into walkway"],
            "potential_new_conflicts": ["Vehicle weave during offloading"],
            "missing_measurements": ["Curb drainage level survey"]
        }]
    }
    r_scen = client.post("/api/v1/scenarios", json=scenario_payload, headers=headers)
    assert r_scen.status_code == 201
    scen_id = r_scen.json()["id"]

    # Step 8: Run conflict checks and show limitations
    r_conf = client.get(f"/api/v1/scenarios/{scen_id}/conflicts")
    assert r_conf.status_code == 200
    conf_data = r_conf.json()
    assert "conflicts" in conf_data
    assert "legal_disclaimer" in conf_data
    assert "IRC:103-2022" in str(conf_data["conflicts"])

    # Step 9: Export evidence report
    r_pdf = client.get("/api/v1/exports/pdf?station_id=1")
    assert r_pdf.status_code == 200
    assert r_pdf.content.startswith(b"%PDF")

