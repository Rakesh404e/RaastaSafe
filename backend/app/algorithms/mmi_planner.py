from typing import List, Dict, Any, Optional
from shapely.geometry import shape, Point, Polygon, LineString
from backend.app.algorithms.priority_engine import calculate_haversine_distance
from backend.app.config import settings

class MMIPlannerEngine:
    """
    Multi-Modal Integration (MMI) Scenario Conflict Checker.
    Grounding: IRC:103-2022 Chapter 12 (Station Pedestrian Transit Integration)
    and UTTIPEC Station-Area MMI Planning Guidelines.

    Key Checks:
    1. Proximity to transit gates (IRC recommends <= 100m walking distance).
    2. Encroachment into 2.5m clear pedestrian walking corridor.
    3. Conflict with designated crossings and sightlines.
    4. Mandatory legal disclaimer: software scenario != approved engineering drawing.
    """

    LEGAL_DISCLAIMER = (
        "Planning Concept Scenario for Evaluation Only. RaastaSafe does NOT authorize, "
        "certify, or legally approve street redesigns. Implementation requires formal site review "
        "and statutory approval by DMRC, Delhi Traffic Police, and MCD/PWD."
    )

    @classmethod
    def check_scenario_conflicts(
        cls,
        scenario: Any,
        station_exits: List[Any],
        footpath_segments: List[Any],
        crossings: List[Any]
    ) -> Dict[str, Any]:
        conflict_results = []
        overall_conflicts_found = False

        for zone in scenario.zones:
            geom_data = zone.geometry_geojson
            try:
                zone_geom = shape(geom_data)
                # Compute centroid coordinates
                centroid = zone_geom.centroid
                zone_lng, zone_lat = centroid.x, centroid.y
            except Exception:
                zone_lat, zone_lng = 28.7145, 77.1147
                zone_geom = Point(zone_lng, zone_lat).buffer(0.0001)

            # 1. Proximity to nearest station gate
            min_dist_exit = float("inf")
            nearest_exit_name = "Unknown Exit"
            for exit_node in station_exits:
                d = calculate_haversine_distance(
                    zone_lat, zone_lng, exit_node.latitude, exit_node.longitude
                )
                if d < min_dist_exit:
                    min_dist_exit = d
                    nearest_exit_name = f"Exit {exit_node.exit_number} ({exit_node.name})"

            if min_dist_exit == float("inf"):
                min_dist_exit = zone.walking_distance_to_station_m or 50.0

            # Proximity compliance (IRC recommends within 100m)
            irc_proximity_ok = min_dist_exit <= settings.IRC_MAX_IPT_STAND_DISTANCE_M

            irc_notes = []
            potential_hazards = []
            missing_checks = []

            if irc_proximity_ok:
                irc_notes.append(
                    f"Compliant with IRC:103-2022 Cl. 12.1: Located {min_dist_exit:.1f}m from {nearest_exit_name} (Guideline: <= 100m)."
                )
            else:
                irc_notes.append(
                    f"Warning: Located {min_dist_exit:.1f}m from nearest entrance (exceeds IRC recommended 100m threshold)."
                )
                potential_hazards.append("Long passenger walk distance may induce informal boarding in unauthorized spots.")

            if min_dist_exit < 15.0:
                potential_hazards.append(
                    f"Critical Conflict: Zone is only {min_dist_exit:.1f}m from gate portal. Risk of blocking emergency evacuation corridor."
                )
                overall_conflicts_found = True

            # 2. Check overlap with audited footpaths
            overlap_pedestrian_path = False
            for seg in footpath_segments:
                try:
                    seg_geom = shape(seg.geometry_geojson)
                    if zone_geom.intersects(seg_geom):
                        overlap_pedestrian_path = True
                        if seg.clear_walking_width_m is not None:
                            if seg.clear_walking_width_m < settings.IRC_MIN_WALKING_ZONE_TRANSIT_M:
                                potential_hazards.append(
                                    f"Encroaches on footpath '{seg.name}' which already suffers deficit: "
                                    f"only {seg.clear_walking_width_m:.2f}m clear width remaining (IRC requires 2.5m)."
                                )
                                overall_conflicts_found = True
                        else:
                            missing_checks.append(
                                f"Clear width on intersecting footpath '{seg.name}' is unmeasured. Field cross-section survey required."
                            )
                except Exception:
                    continue

            # 3. Check overlap with crossings
            overlap_crossing = False
            for cr in crossings:
                try:
                    cr_geom = shape(cr.location_geojson)
                    # Use a 15-meter buffer around crossing
                    if zone_geom.distance(cr_geom) < 0.00015:  # ~15 meters in degrees approx
                        overlap_crossing = True
                        potential_hazards.append(
                            f"Zone buffer intersects pedestrian crossing (Crossing ID: {cr.id}). "
                            "May obstruct pedestrian desire lines or driver sightlines at intersection."
                        )
                        overall_conflicts_found = True
                except Exception:
                    continue

            if zone.zone_type == "erickshaw_stand":
                if zone.candidate_capacity > 15:
                    potential_hazards.append(
                        f"High vehicle capacity ({zone.candidate_capacity} e-rickshaws) may cause queue spillover into main carriageway during peak hours."
                    )
                missing_checks.append("Verify curbside charging / battery swap access feasibility with DISCOM.")
            
            if not zone.missing_measurements:
                missing_checks.append("Topographical curb level and drainage slope verification.")

            conflict_results.append({
                "zone_name": zone.name,
                "zone_type": zone.zone_type,
                "overlap_with_pedestrian_path": overlap_pedestrian_path,
                "overlap_with_crossing": overlap_crossing,
                "distance_to_nearest_exit_m": round(min_dist_exit, 1),
                "irc_ipt_proximity_compliant": irc_proximity_ok,
                "irc_notes": irc_notes,
                "potential_hazards_created": potential_hazards,
                "missing_field_checks": missing_checks,
                "disclaimer": cls.LEGAL_DISCLAIMER
            })

        overall_status = "Conflicts Identified" if overall_conflicts_found else "Preliminary Layout Pass (Requires Field Review)"

        return {
            "scenario_id": scenario.id,
            "scenario_name": scenario.name,
            "overall_status": overall_status,
            "conflicts": conflict_results,
            "legal_disclaimer": cls.LEGAL_DISCLAIMER
        }
