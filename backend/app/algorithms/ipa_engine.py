from typing import List, Dict, Any, Tuple
import statistics

ATTRIBUTE_METADATA = {
    "universal_design": {
        "label": "Universal Design & Step-Free Access",
        "desc": "Kerb ramps, tactile paving, and barrier-free access for wheelchair users and seniors."
    },
    "illumination": {
        "label": "Night Illumination & Lighting",
        "desc": "Consistent street lighting along station approach corridors and under flyovers."
    },
    "safety_security": {
        "label": "Personal Safety & Security",
        "desc": "Perceived security against crime, eve-teasing, and unmonitored blind corners."
    },
    "traffic_conflict": {
        "label": "Traffic Conflict Management",
        "desc": "Protection from speeding motor vehicles, wrong-way driving, and unregulated curb spillover."
    },
    "footpath_continuity": {
        "label": "Footpath Continuity & Clear Width",
        "desc": "Unbroken 2.5m walking corridor free of vendor encroachment, utility boxes, and debris."
    },
    "crossing_safety": {
        "label": "Safe At-Grade Pedestrian Crossings",
        "desc": "Marked zebra crossings, pedestrian signals, and refuge islands across wide arterials."
    },
    "weather_comfort": {
        "label": "Weather Comfort & Shelter",
        "desc": "Shade trees, rain canopies, and absence of monsoon waterlogging/puddles."
    },
    "signage_wayfinding": {
        "label": "Legible Signage & Wayfinding",
        "desc": "Clear directional signage to metro gates, bus feeder stops, and civic landmarks."
    },
    "last_mile_access": {
        "label": "Organized Last-Mile Feeder Access",
        "desc": "Predictable e-rickshaw queuing, clear staging stands, and safe passenger boarding."
    }
}

class IPAEngine:
    """
    Revised Importance-Performance Analysis (IPA) Engine.
    Grounding: Kar, Sadhukhan & Parida (2026), Journal of Urban Planning and Development.
    Calculates attribute priority based on commuter-stated importance vs observed satisfaction.
    """

    @classmethod
    def analyze_surveys(cls, surveys: List[Any], station_id: int) -> Dict[str, Any]:
        sample_size = len(surveys)
        
        # If no surveys exist, return empty / baseline template with disclaimer
        if sample_size == 0:
            return {
                "station_id": station_id,
                "sample_size": 0,
                "confidence_warning": True,
                "confidence_note": "No commuter surveys collected yet for this station. Initializing baseline framework.",
                "importance_median": 4.5,
                "satisfaction_median": 3.0,
                "attributes": []
            }

        # Aggregate ratings
        attr_importance: Dict[str, List[float]] = {k: [] for k in ATTRIBUTE_METADATA}
        attr_satisfaction: Dict[str, List[float]] = {k: [] for k in ATTRIBUTE_METADATA}

        for s in surveys:
            resp = s.responses_json or {}
            for key in ATTRIBUTE_METADATA:
                if key in resp:
                    item = resp[key]
                    if isinstance(item, dict):
                        imp = item.get("importance")
                        sat = item.get("satisfaction")
                        if imp is not None:
                            attr_importance[key].append(float(imp))
                        if sat is not None:
                            attr_satisfaction[key].append(float(sat))

        # Compute means
        coords = []
        all_mean_imp = []
        all_mean_sat = []

        for key, meta in ATTRIBUTE_METADATA.items():
            imps = attr_importance[key]
            sats = attr_satisfaction[key]
            mean_imp = statistics.mean(imps) if imps else 4.0
            mean_sat = statistics.mean(sats) if sats else 3.0

            all_mean_imp.append(mean_imp)
            all_mean_sat.append(mean_sat)

            coords.append({
                "attribute_key": key,
                "attribute_label": meta["label"],
                "mean_importance": round(mean_imp, 2),
                "mean_satisfaction": round(mean_sat, 2),
                "description": meta["desc"]
            })

        # Thresholds: Median of observed means, or scale midpoint (3.5 on 1-6 scale)
        median_imp = round(statistics.median(all_mean_imp), 2)
        median_sat = round(statistics.median(all_mean_sat), 2)

        # Classify into 4 Quadrants
        classified_attributes = []
        for c in coords:
            imp = c["mean_importance"]
            sat = c["mean_satisfaction"]

            # Quadrant logic
            if imp >= median_imp and sat < median_sat:
                quadrant = "Concentrate Here"
                priority_level = "Immediate Action Needed"
            elif imp >= median_imp and sat >= median_sat:
                quadrant = "Keep Up Good Work"
                priority_level = "Maintain High Standard"
            elif imp < median_imp and sat < median_sat:
                quadrant = "Low Priority"
                priority_level = "Secondary Attention"
            else:
                quadrant = "Possible Overkill"
                priority_level = "Sufficient / Reallocate Resources"

            classified_attributes.append({
                **c,
                "quadrant": quadrant,
                "priority_level": priority_level
            })

        confidence_warning = sample_size < 30
        if confidence_warning:
            confidence_note = (
                f"Preliminary sample size (N = {sample_size}). "
                "Per research methodology (Kar et al. 2026), minimum N >= 30 is recommended "
                "for stable civic priority clustering. Treat these rankings as initial indications."
            )
        else:
            confidence_note = f"Sample size (N = {sample_size}) meets statistical stability threshold for localized station IPA."

        return {
            "station_id": station_id,
            "sample_size": sample_size,
            "confidence_warning": confidence_warning,
            "confidence_note": confidence_note,
            "importance_median": median_imp,
            "satisfaction_median": median_sat,
            "attributes": classified_attributes
        }
