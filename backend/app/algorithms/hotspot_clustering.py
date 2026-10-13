from typing import List, Dict, Any
from backend.app.algorithms.priority_engine import calculate_haversine_distance

class HotspotClusterer:
    """
    Cluster geographic hazard reports and segment issues into coherent intervention hotspots.
    Rule: Never invent points or use random noise. Groups actual observations within a
    configurable spatial radius (default: 75m).
    """

    @classmethod
    def cluster_observations(
        cls,
        observations: List[Dict[str, Any]],
        radius_m: float = 75.0
    ) -> List[Dict[str, Any]]:
        """
        observations: list of dicts with:
        id, item_type, title, lat, lng, severity, status, priority_score, provenance
        """
        if not observations:
            return []

        clusters: List[List[Dict[str, Any]]] = []
        visited = set()

        for i, obs in enumerate(observations):
            if i in visited:
                continue

            # Start a new cluster
            current_cluster = [obs]
            visited.add(i)

            # Find all reachable points within radius_m
            for j, candidate in enumerate(observations):
                if j in visited:
                    continue

                dist = calculate_haversine_distance(
                    obs["lat"], obs["lng"], candidate["lat"], candidate["lng"]
                )
                if dist <= radius_m:
                    current_cluster.append(candidate)
                    visited.add(j)

            clusters.append(current_cluster)

        # Build hotspot summaries
        results = []
        for idx, cl in enumerate(clusters):
            # Compute center
            center_lat = sum(o["lat"] for o in cl) / len(cl)
            center_lng = sum(o["lng"] for o in cl) / len(cl)

            # Max distance from center to define cluster radius
            actual_radius = max(
                calculate_haversine_distance(center_lat, center_lng, o["lat"], o["lng"])
                for o in cl
            )
            # Minimum radius for visual rendering
            actual_radius = max(25.0, round(actual_radius, 1))

            verified_count = sum(1 for o in cl if o["status"] == "verified")
            
            # Severity hierarchy
            severities = [o["severity"].lower() for o in cl]
            if "critical" in severities:
                highest_sev = "Critical"
            elif "high" in severities:
                highest_sev = "High"
            elif "medium" in severities:
                highest_sev = "Medium"
            else:
                highest_sev = "Low"

            # Dominant issue / category
            issue_counts: Dict[str, int] = {}
            for o in cl:
                itype = o.get("report_type", o.get("item_type", "hazard"))
                issue_counts[itype] = issue_counts.get(itype, 0) + 1
            dominant_issue = max(issue_counts.items(), key=lambda x: x[1])[0]

            # Contributing items
            contributing = [
                {
                    "id": str(o["id"]),
                    "item_type": o.get("item_type", "hazard_report"),
                    "title": o.get("title", f"Observation {o['id']}"),
                    "severity": o.get("severity", "medium"),
                    "distance_to_center_m": round(
                        calculate_haversine_distance(center_lat, center_lng, o["lat"], o["lng"]), 1
                    ),
                    "verification_status": o.get("status", "submitted"),
                    "provenance": o.get("provenance", "OBSERVED_FIELD_DATA")
                }
                for o in cl
            ]

            # Priority score: highest single score + 5 points per additional verified item
            base_score = max(o.get("priority_score", 40.0) for o in cl)
            bonus = min(25.0, (len(cl) - 1) * 5.0 + verified_count * 3.0)
            cluster_priority = min(100.0, round(base_score + bonus, 1))

            results.append({
                "cluster_id": f"CLUST-{idx + 1:03d}",
                "name": f"Hotspot {idx + 1}: {dominant_issue.replace('_', ' ').title()} Zone",
                "center_lat": round(center_lat, 6),
                "center_lng": round(center_lng, 6),
                "radius_m": actual_radius,
                "total_observations_count": len(cl),
                "verified_count": verified_count,
                "highest_severity": highest_sev,
                "priority_score": cluster_priority,
                "dominant_issue": dominant_issue,
                "contributing_items": contributing,
                "explanation": (
                    f"Cluster formed by {len(cl)} spatially contiguous field observations within {actual_radius}m. "
                    f"{verified_count} verified on-site. Dominant conflict: {dominant_issue.replace('_', ' ')}."
                )
            })

        # Sort hotspots by priority score descending
        results.sort(key=lambda x: x["priority_score"], reverse=True)
        return results
