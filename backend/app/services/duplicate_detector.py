from typing import List, Dict, Any, Optional
from backend.app.algorithms.priority_engine import calculate_haversine_distance

class DuplicateDetector:
    """
    Identifies potential duplicate hazard reports based on spatial proximity (< 35m)
    and report category matching.
    Crucial Rule: Suggests candidate duplicates for human reviewer confirmation;
    never discards public reports silently.
    """

    DUPLICATE_DISTANCE_THRESHOLD_M = 35.0

    @classmethod
    def find_potential_duplicates(
        cls,
        new_lat: float,
        new_lng: float,
        report_type: str,
        existing_reports: List[Any],
        exclude_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        candidates = []

        for r in existing_reports:
            if exclude_id and r.id == exclude_id:
                continue

            # Don't match against already marked duplicates or resolved
            if r.status in ["duplicate", "resolved", "rejected"]:
                continue

            dist = calculate_haversine_distance(new_lat, new_lng, r.latitude, r.longitude)

            if dist <= cls.DUPLICATE_DISTANCE_THRESHOLD_M:
                # Same category gives high match confidence
                category_match = (r.report_type == report_type)
                match_confidence = "High" if category_match and dist <= 15.0 else ("Medium" if category_match else "Low")

                candidates.append({
                    "id": r.id,
                    "title": r.title,
                    "report_type": r.report_type,
                    "distance_m": round(dist, 1),
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "status": r.status,
                    "match_confidence": match_confidence
                })

        candidates.sort(key=lambda x: x["distance_m"])
        return candidates
