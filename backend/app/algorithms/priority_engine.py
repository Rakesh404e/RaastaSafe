import math
from typing import List, Dict, Any, Optional
from backend.app.config import settings

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class PriorityEngine:
    """
    Explainable Improvement-Priority Engine.
    Grounding: IRC:103-2022 Guidelines for Pedestrian Facilities (Clause 6.2 & Clause 12.1),
    and Bivina et al. (2019) Delhi Metro catchment walk accessibility models.

    Rule principles:
    1. Does NOT output black-box 'accident prediction'.
    2. Separates measured physical street conditions from civic hazard reports.
    3. Missing data explicitly reduces the Completeness Factor rather than inventing values.
    4. Duplicate reports are filtered and do not artificially multiply recurrence scores.
    """

    IRC_TRANSIT_WIDTH_TARGET = settings.IRC_MIN_WALKING_ZONE_TRANSIT_M  # 2.5 meters

    @classmethod
    def evaluate_footpath_segment(
        cls,
        segment: Any,
        station_lat: float,
        station_lng: float,
        nearby_verified_reports_count: int = 0
    ) -> Dict[str, Any]:
        components = []
        completeness_checks = []

        # 1. Clear Walking Width Deficit (Weight: 35%)
        # Based on IRC:103-2022 Clause 6.2 (Transit node minimum clear walkway = 2.5m)
        width_weight = 0.35
        if segment.clear_walking_width_m is not None:
            completeness_checks.append(1.0)
            deficit = max(0.0, cls.IRC_TRANSIT_WIDTH_TARGET - segment.clear_walking_width_m)
            # Deficit normalized to 2.5m scale (e.g. 1.25m deficit -> 50% score)
            width_score = min(1.0, deficit / cls.IRC_TRANSIT_WIDTH_TARGET) * 100.0
            components.append({
                "name": "Clear Walking Width Deficit",
                "raw_value": f"{segment.clear_walking_width_m:.2f} m (Target: {cls.IRC_TRANSIT_WIDTH_TARGET} m)",
                "weight": width_weight,
                "weighted_score": round(width_score * width_weight, 2),
                "description": f"IRC:103-2022 Clause 6.2 specifies a 2.5m minimum clear walking zone for transit nodes. Observed clear width deficit: {deficit:.2f}m."
            })
        else:
            completeness_checks.append(0.0)
            components.append({
                "name": "Clear Walking Width Deficit",
                "raw_value": "Unknown / Unmeasured",
                "weight": width_weight,
                "weighted_score": 0.0,
                "description": "Clear walking width was not measured on-site. Field measurement is pending."
            })

        # 2. Obstruction & Severity Factor (Weight: 25%)
        sev_weight = 0.25
        obstructions = segment.obstruction_types or []
        obs_count = len(obstructions)
        # Severity calculation based on active obstructions
        if "e_rickshaw_queue" in obstructions or "broken_surface" in obstructions:
            raw_sev = "High"
            base_sev_score = 80.0
        elif obs_count > 0:
            raw_sev = "Medium"
            base_sev_score = 50.0
        elif segment.footpath_exists is False:
            raw_sev = "Critical"
            base_sev_score = 95.0
        else:
            raw_sev = "Low"
            base_sev_score = 15.0

        if segment.surface_quality in ["poor", "broken"]:
            base_sev_score = min(100.0, base_sev_score + 20.0)

        components.append({
            "name": "Physical Obstruction Severity",
            "raw_value": f"{raw_sev} ({obs_count} active barriers: {', '.join(obstructions) if obstructions else 'None'})",
            "weight": sev_weight,
            "weighted_score": round(base_sev_score * sev_weight, 2),
            "description": f"Audited physical obstacles impacting pedestrian flow (Surface quality: {segment.surface_quality})."
        })
        completeness_checks.append(1.0)

        # 3. Accessibility & Universal Design Impact (Weight: 20%)
        # Based on Kar et al. (2026) Delhi study: universal accessibility is #1 priority deficit
        access_weight = 0.20
        access_deficit_score = 0.0
        access_reasons = []

        if segment.has_curb_ramps is False or segment.discontinuities_detected:
            access_deficit_score += 50.0
            access_reasons.append("Missing curb ramp or step-free transition")
        if segment.has_tactile_paving is False:
            access_deficit_score += 30.0
            access_reasons.append("Missing tactile guidance for visually impaired")
        if segment.has_curb_ramps is None:
            completeness_checks.append(0.5)
        else:
            completeness_checks.append(1.0)

        access_deficit_score = min(100.0, access_deficit_score)
        components.append({
            "name": "Accessibility & Universal Design Deficit",
            "raw_value": f"{access_deficit_score:.0f}/100 deficit",
            "weight": access_weight,
            "weighted_score": round(access_deficit_score * access_weight, 2),
            "description": "; ".join(access_reasons) if access_reasons else "Curb ramps and tactile paving verified in place."
        })

        # 4. Verified Recurrence & Proximity Exposure (Weight: 20%)
        exp_weight = 0.20
        # Recurrence capped at 5 independent verified reports (each adds 15 points)
        recurrence_score = min(75.0, nearby_verified_reports_count * 15.0)

        # Check proximity to station coordinates (approx center of segment coordinates)
        coords = segment.geometry_geojson.get("coordinates", [])
        if coords and len(coords) > 0:
            mid_lng, mid_lat = coords[len(coords) // 2]
            dist_to_station = calculate_haversine_distance(mid_lat, mid_lng, station_lat, station_lng)
            if dist_to_station < 150.0:
                recurrence_score = min(100.0, recurrence_score + 25.0)
            elif dist_to_station < 300.0:
                recurrence_score = min(100.0, recurrence_score + 15.0)

        components.append({
            "name": "Station Proximity & Verified Recurrence",
            "raw_value": f"{nearby_verified_reports_count} verified reports nearby",
            "weight": exp_weight,
            "weighted_score": round(recurrence_score * exp_weight, 2),
            "description": f"Weight reflects high pedestrian transit surge exposure within station radius and independent field corroboration."
        })
        completeness_checks.append(1.0 if segment.verification_status == "verified" else 0.7)

        # Completeness factor
        completeness_factor = round(sum(completeness_checks) / len(completeness_checks), 2)
        base_sum = sum(c["weighted_score"] for c in components)
        total_priority_score = round(base_sum * completeness_factor, 1)

        is_data_sufficient = completeness_factor >= 0.7

        if total_priority_score >= 70:
            priority_level = "Critical"
        elif total_priority_score >= 50:
            priority_level = "High"
        elif total_priority_score >= 30:
            priority_level = "Medium"
        else:
            priority_level = "Low"

        explanation = (
            f"Segment '{segment.name}' rated {priority_level} Priority (Score: {total_priority_score}/100, "
            f"Completeness: {int(completeness_factor*100)}%). Driven by: "
            f"{'clear width deficit of ' + f'{cls.IRC_TRANSIT_WIDTH_TARGET - segment.clear_walking_width_m:.2f}m below IRC:103-2022' if segment.clear_walking_width_m and segment.clear_walking_width_m < cls.IRC_TRANSIT_WIDTH_TARGET else 'field barrier severity'}, "
            f"with {nearby_verified_reports_count} verified independent hazard corroboration(s)."
        )

        return {
            "total_priority_score": total_priority_score,
            "priority_level": priority_level,
            "completeness_factor": completeness_factor,
            "is_data_sufficient": is_data_sufficient,
            "components": components,
            "explanation": explanation,
            "irc_guidance_clause": "IRC:103-2022 Chapter 6 (Footpath Zones) & Chapter 12 (Transit Node Facilities)"
        }

    @classmethod
    def evaluate_hazard_report(
        cls,
        report: Any,
        station_lat: float,
        station_lng: float,
        nearby_verified_reports_count: int = 0
    ) -> Dict[str, Any]:
        components = []
        completeness_checks = []

        # 1. Reported Hazard Severity (Weight: 40%)
        sev_weight = 0.40
        sev_map = {"critical": 100.0, "high": 75.0, "medium": 45.0, "low": 20.0}
        base_sev = sev_map.get(report.severity.lower(), 45.0)
        components.append({
            "name": "Reporter Hazard Severity",
            "raw_value": report.severity.capitalize(),
            "weight": sev_weight,
            "weighted_score": round(base_sev * sev_weight, 2),
            "description": f"Initial severity rated by reporter for {report.report_type.replace('_', ' ')}."
        })
        completeness_checks.append(1.0)

        # 2. Verification State & Evidence Quality (Weight: 25%)
        verif_weight = 0.25
        if report.status == "verified":
            verif_score = 100.0
            verif_note = f"Audited and verified by reviewer {report.reviewed_by or 'staff'}."
            completeness_checks.append(1.0)
        elif report.status in ["under_review", "action_proposed", "in_progress"]:
            verif_score = 65.0
            verif_note = "Under active engineering / civic review."
            completeness_checks.append(0.8)
        elif report.status == "duplicate":
            verif_score = 0.0
            verif_note = f"Linked duplicate of report {report.duplicate_of_id}. Score suppressed to prevent inflation."
            completeness_checks.append(1.0)
        else:
            verif_score = 30.0
            verif_note = "Unverified citizen report pending field inspection."
            completeness_checks.append(0.5)

        if report.image_url:
            verif_score = min(100.0, verif_score + 15.0)

        components.append({
            "name": "Verification & Evidence Quality",
            "raw_value": report.status.replace("_", " ").capitalize(),
            "weight": verif_weight,
            "weighted_score": round(verif_score * verif_weight, 2),
            "description": verif_note
        })

        # 3. Transit Node Proximity & Pedestrian Surge (Weight: 20%)
        dist_weight = 0.20
        dist_m = calculate_haversine_distance(report.latitude, report.longitude, station_lat, station_lng)
        if dist_m <= 100.0:
            dist_score = 100.0
            dist_desc = f"Directly at station entry threshold ({dist_m:.1f}m away). Max transit surge risk."
        elif dist_m <= 300.0:
            dist_score = 70.0
            dist_desc = f"Within core 300m transit walking zone ({dist_m:.1f}m away)."
        elif dist_m <= 500.0:
            dist_score = 40.0
            dist_desc = f"Within 500m station catchment perimeter ({dist_m:.1f}m away)."
        else:
            dist_score = 15.0
            dist_desc = f"Outside primary transit gate catchment ({dist_m:.1f}m away)."

        components.append({
            "name": "Station Proximity Exposure",
            "raw_value": f"{dist_m:.0f} m from Station",
            "weight": dist_weight,
            "weighted_score": round(dist_score * dist_weight, 2),
            "description": dist_desc
        })
        completeness_checks.append(1.0)

        # 4. Verified Corroboration / Recurrence (Weight: 15%)
        rec_weight = 0.15
        rec_score = min(100.0, nearby_verified_reports_count * 25.0)
        components.append({
            "name": "Independent Recurrence",
            "raw_value": f"{nearby_verified_reports_count} nearby verified reports",
            "weight": rec_weight,
            "weighted_score": round(rec_score * rec_weight, 2),
            "description": "Corroborated by independent field observations within 50m radius."
        })
        completeness_checks.append(1.0)

        completeness_factor = round(sum(completeness_checks) / len(completeness_checks), 2)
        base_sum = sum(c["weighted_score"] for c in components)
        total_priority_score = round(base_sum * completeness_factor, 1)

        is_data_sufficient = completeness_factor >= 0.7

        if total_priority_score >= 70:
            priority_level = "Critical"
        elif total_priority_score >= 50:
            priority_level = "High"
        elif total_priority_score >= 30:
            priority_level = "Medium"
        else:
            priority_level = "Low"

        explanation = (
            f"Report '{report.title}' [{report.id}] rated {priority_level} Priority (Score: {total_priority_score}/100). "
            f"Status: {report.status}, Proximity: {dist_m:.0f}m from metro gate. "
            f"Evidence completeness: {int(completeness_factor*100)}%."
        )

        return {
            "total_priority_score": total_priority_score,
            "priority_level": priority_level,
            "completeness_factor": completeness_factor,
            "is_data_sufficient": is_data_sufficient,
            "components": components,
            "explanation": explanation,
            "irc_guidance_clause": "IRC:103-2022 Chapter 12 (Station Pedestrian Priority)"
        }
