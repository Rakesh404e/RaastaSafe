import heapq
from typing import List, Dict, Any, Optional, Tuple
from backend.app.algorithms.priority_engine import calculate_haversine_distance

class AccessibilityRouter:
    """
    Pedestrian Accessibility Route Engine.
    Implements Dijkstra algorithm over verified pedestrian network edges.
    Features:
    1. Step-free / wheelchair routing (excludes stairs, steep slopes, missing curb ramps).
    2. Clear walking width weighting.
    3. Explicit tracking and warning of unverified / unknown accessibility segments.
    4. Honest 'No Compliant Route' reporting when physical barriers block step-free access.
    """

    @classmethod
    def find_route(
        cls,
        nodes: List[Any],
        edges: List[Any],
        start_lat: float,
        start_lng: float,
        end_lat: float,
        end_lng: float,
        prefer_step_free: bool = False,
        min_clear_width_m: Optional[float] = None
    ) -> Dict[str, Any]:
        if not nodes or not edges:
            return {
                "found": False,
                "total_distance_m": 0.0,
                "step_free_certified": False,
                "unknown_accessibility_edges_count": 0,
                "steps": [],
                "path_coordinates": [],
                "warning_message": "Pedestrian network graph is empty. Please audit or seed route edges."
            }

        # Build node lookup
        node_map = {n.id: n for n in nodes}

        # Find closest start and end node
        start_node_id = min(
            nodes,
            key=lambda n: calculate_haversine_distance(start_lat, start_lng, n.latitude, n.longitude)
        ).id
        end_node_id = min(
            nodes,
            key=lambda n: calculate_haversine_distance(end_lat, end_lng, n.latitude, n.longitude)
        ).id

        if start_node_id == end_node_id:
            n = node_map[start_node_id]
            return {
                "found": True,
                "total_distance_m": 0.0,
                "step_free_certified": n.is_step_free,
                "unknown_accessibility_edges_count": 0,
                "steps": [{
                    "step_index": 1,
                    "instruction": f"Arrive directly at {n.name}",
                    "distance_m": 0.0,
                    "clear_walking_width_m": 2.5,
                    "is_step_free": n.is_step_free,
                    "barrier_warning": None
                }],
                "path_coordinates": [[n.longitude, n.latitude]],
                "warning_message": None
            }

        # Build adjacency graph
        # graph[u] = list of (v, weight, edge_obj)
        adj: Dict[int, List[Tuple[int, float, Any]]] = {n.id: [] for n in nodes}

        for e in edges:
            u, v = e.from_node_id, e.to_node_id
            if u not in node_map or v not in node_map:
                continue

            # Filtering constraints
            if prefer_step_free:
                # Disqualify edges with stairs, steep slopes, or missing curb ramps
                if e.has_stairs or e.has_steep_slope or not e.is_step_free:
                    continue

            if min_clear_width_m is not None and e.clear_walking_width_m is not None:
                if e.clear_walking_width_m < min_clear_width_m:
                    continue

            # Weight calculation: base length + penalty for poor surface / narrow width
            penalty = 1.0
            if e.clear_walking_width_m is not None:
                if e.clear_walking_width_m < 1.8:
                    penalty += 0.8  # heavy penalty for severely bottlenecked paths
                elif e.clear_walking_width_m < 2.5:
                    penalty += 0.3
            else:
                penalty += 0.2  # minor penalty for unverified width

            if e.surface_quality in ["poor", "broken"]:
                penalty += 0.5

            cost = e.length_m * penalty

            adj[u].append((v, cost, e))
            adj[v].append((u, cost, e))  # Bidirectional pedestrian walking

        # Dijkstra algorithm
        distances: Dict[int, float] = {n.id: float("inf") for n in nodes}
        distances[start_node_id] = 0.0
        previous: Dict[int, Tuple[Optional[int], Optional[Any]]] = {n.id: (None, None) for n in nodes}

        pq = [(0.0, start_node_id)]

        while pq:
            cur_dist, u = heapq.heappop(pq)
            if cur_dist > distances[u]:
                continue
            if u == end_node_id:
                break

            for v, cost, edge_obj in adj.get(u, []):
                new_dist = cur_dist + cost
                if new_dist < distances[v]:
                    distances[v] = new_dist
                    previous[v] = (u, edge_obj)
                    heapq.heappush(pq, (new_dist, v))

        if distances[end_node_id] == float("inf"):
            warning = (
                "No step-free route found satisfying accessibility constraints. "
                "Known physical barriers (stairs or missing curb ramps) prevent continuous wheelchair access."
                if prefer_step_free else
                "No continuous pedestrian pathway found between selected coordinates."
            )
            return {
                "found": False,
                "total_distance_m": 0.0,
                "step_free_certified": False,
                "unknown_accessibility_edges_count": 0,
                "steps": [],
                "path_coordinates": [],
                "warning_message": warning
            }

        # Reconstruct path
        path_nodes = []
        path_edges = []
        curr = end_node_id
        while curr is not None:
            path_nodes.append(curr)
            prev_node, edge_obj = previous[curr]
            if edge_obj:
                path_edges.append(edge_obj)
            curr = prev_node

        path_nodes.reverse()
        path_edges.reverse()

        # Build steps and coordinate polyline
        steps = []
        total_dist_m = sum(e.length_m for e in path_edges)
        path_coords = []
        unknown_access_count = 0
        step_free_certified = True

        for i, n_id in enumerate(path_nodes):
            n = node_map[n_id]
            path_coords.append([n.longitude, n.latitude])

        for idx, e in enumerate(path_edges):
            from_n = node_map[e.from_node_id]
            to_n = node_map[e.to_node_id]
            
            barrier_warning = None
            if e.has_stairs:
                barrier_warning = "Contains flight of stairs"
                step_free_certified = False
            elif not e.has_curb_ramp:
                barrier_warning = "Missing kerb ramp at roadway transition"
                step_free_certified = False

            if e.clear_walking_width_m is None:
                unknown_access_count += 1

            inst = f"Walk along corridor from {from_n.name} towards {to_n.name} ({e.length_m:.0f} m)"
            steps.append({
                "step_index": idx + 1,
                "instruction": inst,
                "distance_m": round(e.length_m, 1),
                "clear_walking_width_m": e.clear_walking_width_m,
                "is_step_free": e.is_step_free,
                "barrier_warning": barrier_warning
            })

        warning_note = None
        if unknown_access_count > 0:
            warning_note = f"Route includes {unknown_access_count} segment(s) with unverified clear width. Caution advised."

        return {
            "found": True,
            "total_distance_m": round(total_dist_m, 1),
            "step_free_certified": step_free_certified,
            "unknown_accessibility_edges_count": unknown_access_count,
            "steps": steps,
            "path_coordinates": path_coords,
            "warning_message": warning_note
        }
