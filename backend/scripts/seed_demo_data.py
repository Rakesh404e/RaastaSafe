import os
import sys
from datetime import datetime, timedelta

# Ensure backend can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.models import (
    User, UserRole, Station, StationExit, FootpathSegment, QueueObservation,
    JunctionCrossingAudit, HazardReport, ReportAuditHistory, CommuterSurvey,
    MMIScenario, ProposedZone, RouteNode, RouteEdge, CrashContext,
    VerificationStatus, SeverityLevel, ProvenanceType
)
from backend.app.security.auth import hash_password

def seed_database():
    print("Dropping existing tables and recreating schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("1. Seeding Users (Admin, Field Reviewer, Citizen)...")
        users = [
            User(
                username="admin",
                email="admin@raastasafe.org",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMINISTRATOR.value,
                is_active=True
            ),
            User(
                username="reviewer",
                email="reviewer@raastasafe.org",
                hashed_password=hash_password("reviewer123"),
                role=UserRole.FIELD_REVIEWER.value,
                is_active=True
            ),
            User(
                username="citizen",
                email="citizen@raastasafe.org",
                hashed_password=hash_password("citizen123"),
                role=UserRole.PUBLIC_VISITOR.value,
                is_active=True
            )
        ]
        db.add_all(users)
        db.commit()

        print("2. Seeding Stations (Pilot: Rohini West, Context: Rohini Sector-18)...")
        st_rohini_west = Station(
            id=1,
            name="Rohini West Metro Station",
            code="RWST",
            line="Red Line (Line 1)",
            latitude=28.71452,
            longitude=77.11475,
            boundary_radius_m=500.0,
            catchment_radius_m=800.0,
            description="Pilot station for RaastaSafe audit. High-density residential and commercial node at Bhagwan Mahavir Marg. Major last-mile e-rickshaw hub serving Rohini Sectors 9, 10, 11, and 14."
        )
        st_rohini_sec18 = Station(
            id=2,
            name="Rohini Sector 18, 19 Metro Station",
            code="RS18",
            line="Yellow Line (Line 2)",
            latitude=28.74230,
            longitude=77.13510,
            boundary_radius_m=500.0,
            catchment_radius_m=800.0,
            description="Secondary research station. Featured in UTTIPEC Multi-Modal Integration plan archive."
        )
        db.add_all([st_rohini_west, st_rohini_sec18])
        db.commit()

        print("3. Seeding Station Exits for Rohini West...")
        exits = [
            StationExit(
                station_id=1,
                exit_number="1",
                name="Gate 1 (North-West / Swarn Jayanti Park)",
                latitude=28.71520,
                longitude=77.11410,
                has_step_free_ramp=True,
                has_tactile_paving=True,
                has_curb_ramp=True,
                details="Primary exit towards Japanese Park and Sector 10 residential blocks. Ramp gradient 1:12 with tactile lead-in."
            ),
            StationExit(
                station_id=1,
                exit_number="2",
                name="Gate 2 (North-East / Sector 9 Feeder Stand)",
                latitude=28.71515,
                longitude=77.11540,
                has_step_free_ramp=False,
                has_tactile_paving=True,
                has_curb_ramp=False,
                details="High-volume exit towards Sector 9 markets. Heavy unorganized e-rickshaw queuing along curbside. Curb ramp missing."
            ),
            StationExit(
                station_id=1,
                exit_number="3",
                name="Gate 3 (South-East / Ring Road Link)",
                latitude=28.71390,
                longitude=77.11530,
                has_step_free_ramp=False,
                has_tactile_paving=False,
                has_curb_ramp=False,
                details="Access via pedestrian foot overbridge with steep stairs. No lift or escalator to street level."
            ),
            StationExit(
                station_id=1,
                exit_number="4",
                name="Gate 4 (South-West / Sector 14 Feeder)",
                latitude=28.71385,
                longitude=77.11420,
                has_step_free_ramp=True,
                has_tactile_paving=False,
                has_curb_ramp=True,
                details="Ramp access available; tactile paving terminates abruptly at street curb boundary."
            )
        ]
        db.add_all(exits)
        db.commit()

        print("4. Seeding Audited Footpath Segments (with IRC:103-2022 width checks)...")
        footpaths = [
            FootpathSegment(
                station_id=1,
                name="Bhagwan Mahavir Marg — North Corridor",
                street_name="Bhagwan Mahavir Marg",
                side_of_street="north",
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11350, 28.71530],
                        [77.11410, 28.71520],
                        [77.11480, 28.71518],
                        [77.11540, 28.71515]
                    ]
                },
                footpath_exists=True,
                total_width_m=2.8,
                clear_walking_width_m=1.35,  # DEFICIT below 2.5m IRC standard!
                blocked_length_m=42.0,
                blocked_share_pct=38.0,
                surface_quality="fair",
                discontinuities_detected=True,
                has_curb_ramps=False,
                has_tactile_paving=True,
                lighting_condition="moderate",
                obstruction_types=["e_rickshaw_queue", "vendor_spillover"],
                estimated_pedestrian_volume=480,
                volume_method="15-min peak manual count (08:30-08:45 AM)",
                observer_notes="E-rickshaws mount the kerb at Gate 2 corner. Clear walking width severely constricted to 1.35m, violating IRC:103-2022 2.5m standard.",
                observer_confidence="high",
                verification_status=VerificationStatus.VERIFIED.value,
                verified_by="reviewer",
                verified_at=datetime.utcnow() - timedelta(days=2),
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            FootpathSegment(
                station_id=1,
                name="Sector 9 Feeder Link Road — West Side",
                street_name="Sector 9 Access Road",
                side_of_street="west",
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11540, 28.71515],
                        [77.11570, 28.71610],
                        [77.11600, 28.71700]
                    ]
                },
                footpath_exists=True,
                total_width_m=2.2,
                clear_walking_width_m=1.10,  # SEVERE DEFICIT
                blocked_length_m=65.0,
                blocked_share_pct=55.0,
                surface_quality="poor",
                discontinuities_detected=True,
                has_curb_ramps=False,
                has_tactile_paving=False,
                lighting_condition="poor",
                obstruction_types=["e_rickshaw_queue", "broken_surface", "parked_vehicles"],
                estimated_pedestrian_volume=320,
                volume_method="Sample count (09:00 AM)",
                observer_notes="High vehicle queue spillover. Pedestrians forced to step down into vehicular carriageway.",
                observer_confidence="high",
                verification_status=VerificationStatus.VERIFIED.value,
                verified_by="reviewer",
                verified_at=datetime.utcnow() - timedelta(days=1),
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            FootpathSegment(
                station_id=1,
                name="Swarn Jayanti Park Perimeter Pathway",
                street_name="Swarn Jayanti Marg",
                side_of_street="west",
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11410, 28.71520],
                        [77.11360, 28.71600],
                        [77.11320, 28.71690]
                    ]
                },
                footpath_exists=True,
                total_width_m=3.2,
                clear_walking_width_m=2.85,  # COMPLIANT with IRC standard!
                blocked_length_m=0.0,
                blocked_share_pct=0.0,
                surface_quality="good",
                discontinuities_detected=False,
                has_curb_ramps=True,
                has_tactile_paving=True,
                lighting_condition="good",
                obstruction_types=[],
                estimated_pedestrian_volume=260,
                volume_method="15-min off-peak count",
                observer_notes="Well maintained wide footpath with continuous tactile guidance and proper curb transitions.",
                observer_confidence="high",
                verification_status=VerificationStatus.VERIFIED.value,
                verified_by="reviewer",
                verified_at=datetime.utcnow() - timedelta(days=3),
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            FootpathSegment(
                station_id=1,
                name="Bhagwan Mahavir Marg — South Service Path",
                street_name="Bhagwan Mahavir Marg South",
                side_of_street="south",
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11380, 28.71380],
                        [77.11450, 28.71382],
                        [77.11530, 28.71385]
                    ]
                },
                footpath_exists=True,
                total_width_m=2.0,
                clear_walking_width_m=1.70,
                blocked_length_m=25.0,
                blocked_share_pct=20.0,
                surface_quality="fair",
                discontinuities_detected=False,
                has_curb_ramps=True,
                has_tactile_paving=False,
                lighting_condition="moderate",
                obstruction_types=["utility_pole_box"],
                estimated_pedestrian_volume=180,
                volume_method="Manual estimate",
                observer_notes="BSES electric distribution box placed in walking zone reduces clear width by 0.3m.",
                observer_confidence="medium",
                verification_status=VerificationStatus.SUBMITTED.value,
                verified_by=None,
                verified_at=None,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            FootpathSegment(
                station_id=1,
                name="Sector 14 Connection Walkway",
                street_name="Sector 14 Internal Road",
                side_of_street="south",
                geometry_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11380, 28.71380],
                        [77.11350, 28.71290],
                        [77.11320, 28.71200]
                    ]
                },
                footpath_exists=None,  # UNMEASURED
                total_width_m=None,
                clear_walking_width_m=None,
                blocked_length_m=None,
                blocked_share_pct=None,
                surface_quality="fair",
                discontinuities_detected=False,
                has_curb_ramps=None,
                has_tactile_paving=None,
                lighting_condition="moderate",
                obstruction_types=[],
                estimated_pedestrian_volume=None,
                volume_method=None,
                observer_notes="Preliminary street geometry recorded. Full physical cross-section audit scheduled.",
                observer_confidence="medium",
                verification_status=VerificationStatus.SUBMITTED.value,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            )
        ]
        db.add_all(footpaths)
        db.commit()

        print("5. Seeding E-Rickshaw Queue Observations...")
        queues = [
            QueueObservation(
                station_id=1,
                location_geojson={
                    "type": "Point",
                    "coordinates": [77.11545, 28.71520]
                },
                start_time="08:15",
                end_time="09:30",
                time_window="morning_peak",
                vehicle_count=22,
                queue_length_m=62.0,
                enters_walking_zone=True,
                enters_crossing=True,
                enters_cycle_lane=False,
                enters_carriageway=True,
                enters_metro_entrance=False,
                avg_wait_time_min=4.2,
                wait_time_method="Sample of 15 passenger boardings (stopwatch)",
                nearby_marked_stand="no",
                conflict_description="Queue spills 18 meters past the intersection corner directly onto pedestrian zebra ramp. Passengers queue on active roadway.",
                observer_confidence="high",
                verification_status=VerificationStatus.VERIFIED.value,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            QueueObservation(
                station_id=1,
                location_geojson={
                    "type": "Point",
                    "coordinates": [77.11415, 28.71525]
                },
                start_time="17:30",
                end_time="19:00",
                time_window="evening_peak",
                vehicle_count=16,
                queue_length_m=45.0,
                enters_walking_zone=True,
                enters_crossing=False,
                enters_cycle_lane=False,
                enters_carriageway=True,
                enters_metro_entrance=False,
                avg_wait_time_min=5.8,
                wait_time_method="Sample of 10 passenger boardings",
                nearby_marked_stand="unknown",
                conflict_description="Drivers waiting for returning office commuters occupy the outer curb lane and entrance plaza apron.",
                observer_confidence="high",
                verification_status=VerificationStatus.VERIFIED.value,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            )
        ]
        db.add_all(queues)
        db.commit()

        print("6. Seeding Junction Crossing Audits...")
        crossings = [
            JunctionCrossingAudit(
                station_id=1,
                location_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11538, 28.71515],
                        [77.11536, 28.71388]
                    ]
                },
                crossing_type="zebra",
                is_marked=True,
                measured_crossing_distance_m=24.5,
                traffic_speed_kmh=42.0,
                traffic_volume=1150,
                sightline_blocked=True,
                has_curb_ramps=True,
                tactile_continuity=False,
                lighting_condition="moderate",
                observed_conflict_level="high",
                verification_status=VerificationStatus.VERIFIED.value,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            ),
            JunctionCrossingAudit(
                station_id=1,
                location_geojson={
                    "type": "LineString",
                    "coordinates": [
                        [77.11540, 28.71520],
                        [77.11610, 28.71535]
                    ]
                },
                crossing_type="informal",
                is_marked=False,
                measured_crossing_distance_m=14.0,
                traffic_speed_kmh=None,  # UNMEASURED
                traffic_volume=None,      # UNMEASURED
                sightline_blocked=True,
                has_curb_ramps=False,
                tactile_continuity=False,
                lighting_condition="poor",
                observed_conflict_level="high",
                verification_status=VerificationStatus.VERIFIED.value,
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value
            )
        ]
        db.add_all(crossings)
        db.commit()

        print("7. Seeding Hazard Reports with Audit History...")
        hazards = [
            HazardReport(
                id="RST-2026-001",
                station_id=1,
                report_type="missing_ramp",
                title="Broken Tactile Paving & Missing Curb Ramp at Gate 2",
                description="The footpath curb at Gate 2 towards Sector 9 has a 25cm sheer vertical drop without a transition ramp. Tactile paving stops abruptly 2 meters short of the curb edge.",
                latitude=28.71518,
                longitude=77.11538,
                severity=SeverityLevel.CRITICAL.value,
                image_url=None,
                status=VerificationStatus.VERIFIED.value,
                reviewed_by="reviewer",
                reviewed_at=datetime.utcnow() - timedelta(days=2),
                reporter_type="student_auditor",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            ),
            HazardReport(
                id="RST-2026-002",
                station_id=1,
                report_type="queue_spillover",
                title="Unregulated E-Rickshaw Double-Parking Blocking Gate 2 Walkway",
                description="E-rickshaws waiting for arriving commuters double-park in front of Gate 2 entrance stairway, forcing pedestrians to walk around vehicles into fast moving traffic on Bhagwan Mahavir Marg.",
                latitude=28.71516,
                longitude=77.11542,
                severity=SeverityLevel.HIGH.value,
                image_url=None,
                status=VerificationStatus.ACTION_PROPOSED.value,
                reviewed_by="reviewer",
                reviewed_at=datetime.utcnow() - timedelta(days=1),
                reporter_type="commuter",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            ),
            HazardReport(
                id="RST-2026-003",
                station_id=1,
                report_type="broken_footpath",
                title="Open Stormwater Drain Slabs Along Sector 9 Link Road",
                description="Three consecutive RCC drain covers are collapsed or missing along the pedestrian corridor. Deep hazardous void unprotected by barricades.",
                latitude=28.71615,
                longitude=77.11575,
                severity=SeverityLevel.CRITICAL.value,
                image_url=None,
                status=VerificationStatus.VERIFIED.value,
                reviewed_by="reviewer",
                reviewed_at=datetime.utcnow() - timedelta(days=2),
                reporter_type="resident",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            ),
            HazardReport(
                id="RST-2026-004",
                station_id=1,
                report_type="dark_spot",
                title="Non-Functional Street Lighting Under Metro Flyover Pier 42",
                description="Two high-pressure sodium street lamps have been dark for over two weeks, creating a 50m unlit shadow zone on the southern crossing approach.",
                latitude=28.71430,
                longitude=77.11470,
                severity=SeverityLevel.HIGH.value,
                image_url=None,
                status=VerificationStatus.VERIFIED.value,
                reviewed_by="reviewer",
                reviewed_at=datetime.utcnow() - timedelta(days=3),
                reporter_type="commuter",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            ),
            HazardReport(
                id="RST-2026-005",
                station_id=1,
                report_type="obstruction",
                title="Unauthorized Tea Stall and Stool Spillover at Gate 1 Corner",
                description="Commercial kiosk has set up benches and gas cylinders across the footpath walking zone, narrowing effective width to under 1 meter.",
                latitude=28.71522,
                longitude=77.11415,
                severity=SeverityLevel.MEDIUM.value,
                image_url=None,
                status=VerificationStatus.UNDER_REVIEW.value,
                reviewed_by=None,
                reviewed_at=None,
                reporter_type="commuter",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            ),
            HazardReport(
                id="RST-2026-006",
                station_id=1,
                report_type="queue_spillover",
                title="E-rickshaws blocking Gate 2 corner",
                description="Duplicate report: multiple e-rickshaws parked right on the corner of Gate 2.",
                latitude=28.71517,
                longitude=77.11541,
                severity=SeverityLevel.HIGH.value,
                image_url=None,
                status=VerificationStatus.DUPLICATE.value,
                duplicate_of_id="RST-2026-002",
                reviewed_by="reviewer",
                reviewed_at=datetime.utcnow() - timedelta(hours=12),
                reporter_type="resident",
                provenance=ProvenanceType.CITIZEN_HAZARD_REPORT.value
            )
        ]
        db.add_all(hazards)
        db.commit()

        # Add audit logs
        history_entries = [
            ReportAuditHistory(report_id="RST-2026-001", previous_status="none", new_status="submitted", changed_by="student_auditor", notes="Report submitted"),
            ReportAuditHistory(report_id="RST-2026-001", previous_status="submitted", new_status="verified", changed_by="reviewer", notes="Physical barrier verified during morning field audit"),
            ReportAuditHistory(report_id="RST-2026-002", previous_status="none", new_status="submitted", changed_by="commuter", notes="Report submitted"),
            ReportAuditHistory(report_id="RST-2026-002", previous_status="submitted", new_status="verified", changed_by="reviewer", notes="Queue spillover confirmed"),
            ReportAuditHistory(report_id="RST-2026-002", previous_status="verified", new_status="action_proposed", changed_by="reviewer", notes="Added to MMI designated bay scenario A"),
            ReportAuditHistory(report_id="RST-2026-006", previous_status="none", new_status="submitted", changed_by="resident", notes="Report submitted"),
            ReportAuditHistory(report_id="RST-2026-006", previous_status="submitted", new_status="duplicate", changed_by="reviewer", notes="Linked as duplicate to master report RST-2026-002")
        ]
        db.add_all(history_entries)
        db.commit()

        print("8. Seeding Commuter IPA Survey Responses (N = 34)...")
        # Calibrated realistic ratings matching Kar et al. (2026) Delhi findings:
        # High importance, low satisfaction for Universal Design, Illumination, and Last-Mile Access
        surveys = []
        for i in range(34):
            # Realistic variance
            offset = (i % 3) - 1
            surveys.append(CommuterSurvey(
                station_id=1,
                commuter_type="daily_metro_rider" if i % 2 == 0 else "occasional_commuter",
                gender="female" if i % 2 == 0 else "male",
                responses_json={
                    "universal_design": {"importance": min(6, 6 + offset), "satisfaction": max(1, 2 + offset)},
                    "illumination": {"importance": min(6, 5 + offset), "satisfaction": max(1, 2 + offset)},
                    "safety_security": {"importance": min(6, 6), "satisfaction": max(2, 3 + offset)},
                    "traffic_conflict": {"importance": min(6, 5), "satisfaction": max(1, 2 + offset)},
                    "footpath_continuity": {"importance": min(6, 5 + offset), "satisfaction": max(1, 2 + offset)},
                    "crossing_safety": {"importance": min(6, 6), "satisfaction": max(2, 3 + offset)},
                    "weather_comfort": {"importance": max(1, 4 + offset), "satisfaction": max(1, 2 + offset)},
                    "signage_wayfinding": {"importance": max(1, 4 + offset), "satisfaction": min(6, 4 + offset)},
                    "last_mile_access": {"importance": min(6, 6), "satisfaction": max(1, 2 + offset)}
                },
                provenance=ProvenanceType.OBSERVED_FIELD_DATA.value,
                timestamp=datetime.utcnow() - timedelta(days=i % 10)
            ))
        db.add_all(surveys)
        db.commit()

        print("9. Seeding MMI Scenarios & Proposed Zones...")
        scenario_a = MMIScenario(
            id=1,
            station_id=1,
            name="Concept A: Dedicated Curbside Feeder Bay & 2.5m Pedestrian Clear Zone",
            description="Reorganizes e-rickshaw waiting queue at Gate 2 into a dedicated 12-bay indented curb pocket 45m north of the station gate, establishing a continuous 2.5m pedestrian clear corridor protected by bollards.",
            author="Civic Planner (Rohini Sub-City)",
            status="active",
            notes="Evaluated against IRC:103-2022 Chapter 12. Planning concept for public review; not legally approved."
        )
        db.add(scenario_a)
        db.flush()

        zones = [
            ProposedZone(
                scenario_id=1,
                zone_type="erickshaw_stand",
                name="Gate 2 Indented E-Rickshaw Feeder Bay",
                geometry_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [77.11548, 28.71530],
                        [77.11558, 28.71560],
                        [77.11568, 28.71560],
                        [77.11558, 28.71530],
                        [77.11548, 28.71530]
                    ]]
                },
                candidate_capacity=14,
                est_throughput_pax_hr=210,
                walking_distance_to_station_m=42.0,
                addressed_issues=[
                    "Eliminates e-rickshaw queue spillover into Gate 2 pedestrian portal",
                    "Clears zebra crossing sightline by enforcing 15m intersection setback",
                    "Provides designated passenger boarding platform with shelter"
                ],
                potential_new_conflicts=[
                    "Requires relocation of one streetlight pole",
                    "Vehicle merge speed conflict during peak traffic hours"
                ],
                missing_measurements=[
                    "Exact carriageway cross-section width at Chainage 0+045",
                    "Underground stormwater utility depth check"
                ],
                is_authority_approved=False
            ),
            ProposedZone(
                scenario_id=1,
                zone_type="pedestrian_plaza",
                name="Gate 1 Swarn Jayanti Pedestrian Buffer Plaza",
                geometry_geojson={
                    "type": "Polygon",
                    "coordinates": [[
                        [77.11410, 28.71515],
                        [77.11430, 28.71535],
                        [77.11450, 28.71530],
                        [77.11430, 28.71510],
                        [77.11410, 28.71515]
                    ]]
                },
                candidate_capacity=80,
                est_throughput_pax_hr=450,
                walking_distance_to_station_m=12.0,
                addressed_issues=[
                    "Separates high-volume metro exit surge from curbside pick-up traffic",
                    "Installs continuous 1:12 accessible transition ramp"
                ],
                potential_new_conflicts=[],
                missing_measurements=[
                    "DDA boundary line confirmation"
                ],
                is_authority_approved=False
            )
        ]
        db.add_all(zones)
        db.commit()

        print("10. Seeding Accessibility Route Network (Nodes and Edges)...")
        nodes = [
            RouteNode(id=1, station_id=1, name="Gate 1 Station Threshold", node_type="station_gate", latitude=28.71520, longitude=77.11410, is_step_free=True),
            RouteNode(id=2, station_id=1, name="Gate 2 Station Threshold", node_type="station_gate", latitude=28.71515, longitude=77.11540, is_step_free=False),
            RouteNode(id=3, station_id=1, name="Gate 3 Overbridge Foot", node_type="station_gate", latitude=28.71390, longitude=77.11530, is_step_free=False),
            RouteNode(id=4, station_id=1, name="Gate 4 South Portal", node_type="station_gate", latitude=28.71385, longitude=77.11420, is_step_free=True),
            RouteNode(id=5, station_id=1, name="Sector 9 Feeder Junction", node_type="intersection", latitude=28.71610, longitude=77.11570, is_step_free=True),
            RouteNode(id=6, station_id=1, name="Swarn Jayanti Park Gate 1", node_type="destination", latitude=28.71650, longitude=77.11350, is_step_free=True),
            RouteNode(id=7, station_id=1, name="Bhagwan Mahavir North Crossing", node_type="crossing", latitude=28.71518, longitude=77.11480, is_step_free=True),
            RouteNode(id=8, station_id=1, name="South Service Road Crossing", node_type="crossing", latitude=28.71382, longitude=77.11480, is_step_free=True)
        ]
        db.add_all(nodes)
        db.commit()

        edges = [
            RouteEdge(id=1, station_id=1, from_node_id=1, to_node_id=7, length_m=70.0, clear_walking_width_m=2.4, is_step_free=True, has_stairs=False, has_curb_ramp=True, surface_quality="good"),
            RouteEdge(id=2, station_id=1, from_node_id=7, to_node_id=2, length_m=60.0, clear_walking_width_m=1.35, is_step_free=False, has_stairs=False, has_curb_ramp=False, surface_quality="fair"), # missing curb ramp!
            RouteEdge(id=3, station_id=1, from_node_id=1, to_node_id=6, length_m=150.0, clear_walking_width_m=2.85, is_step_free=True, has_stairs=False, has_curb_ramp=True, surface_quality="good"), # Certified step free!
            RouteEdge(id=4, station_id=1, from_node_id=2, to_node_id=5, length_m=110.0, clear_walking_width_m=1.10, is_step_free=False, has_stairs=False, has_curb_ramp=False, surface_quality="poor"),
            RouteEdge(id=5, station_id=1, from_node_id=7, to_node_id=8, length_m=155.0, clear_walking_width_m=2.0, is_step_free=True, has_stairs=False, has_curb_ramp=True, surface_quality="fair"),
            RouteEdge(id=6, station_id=1, from_node_id=4, to_node_id=8, length_m=62.0, clear_walking_width_m=1.7, is_step_free=True, has_stairs=False, has_curb_ramp=True, surface_quality="fair"),
            RouteEdge(id=7, station_id=1, from_node_id=3, to_node_id=8, length_m=55.0, clear_walking_width_m=1.5, is_step_free=False, has_stairs=True, has_curb_ramp=False, surface_quality="fair"), # STAIR BARRIER!
            RouteEdge(id=8, station_id=1, from_node_id=5, to_node_id=6, length_m=230.0, clear_walking_width_m=None, is_step_free=True, has_stairs=False, has_curb_ramp=True, surface_quality="fair") # Unverified width
        ]
        db.add_all(edges)
        db.commit()

        print("11. Seeding Official Crash Context (Delhi Traffic Police / OpenCity)...")
        crashes = [
            CrashContext(
                name="Mukarba Chowk (Outer Ring Road / GTK Road)",
                zone_type="official_pedestrian_blackspot",
                latitude=28.73620,
                longitude=77.15130,
                buffer_radius_m=500.0,
                fatal_crashes_count=18,
                total_crashes_count=42,
                reporting_period="2021-2023",
                data_source="Delhi Traffic Police Annual Crash Report",
                source_url="https://traffic.delhipolice.gov.in/delhi-crash-report-2023",
                notes="High-speed grade-separated interchange with severe pedestrian at-grade crossing conflicts. 500m zone standard applied.",
                provenance=ProvenanceType.OFFICIAL_CRASH_CONTEXT.value
            ),
            CrashContext(
                name="Peera Garhi Chowk (Rohtak Road / Ring Road)",
                zone_type="official_pedestrian_blackspot",
                latitude=28.67910,
                longitude=77.09340,
                buffer_radius_m=500.0,
                fatal_crashes_count=15,
                total_crashes_count=38,
                reporting_period="2021-2023",
                data_source="Delhi Traffic Police Annual Crash Report",
                source_url="https://traffic.delhipolice.gov.in/delhi-crash-report-2023",
                notes="Heavy mixed commercial, transit interchange and goods carrier movement.",
                provenance=ProvenanceType.OFFICIAL_CRASH_CONTEXT.value
            ),
            CrashContext(
                name="Britannia Chowk (Ring Road / Lawrence Road)",
                zone_type="official_pedestrian_blackspot",
                latitude=28.69480,
                longitude=77.16300,
                buffer_radius_m=500.0,
                fatal_crashes_count=12,
                total_crashes_count=31,
                reporting_period="2021-2023",
                data_source="Delhi Traffic Police Annual Crash Report",
                source_url="https://traffic.delhipolice.gov.in/delhi-crash-report-2023",
                notes="Pedestrian crossing conflict zone at industrial feeder corridor.",
                provenance=ProvenanceType.OFFICIAL_CRASH_CONTEXT.value
            )
        ]
        db.add_all(crashes)
        db.commit()

        print("Successfully seeded all demo data for RaastaSafe!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
