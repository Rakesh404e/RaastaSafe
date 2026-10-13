from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import RouteNode, RouteEdge, Station
from backend.app.schemas import RouteRequest, RouteResultOut
from backend.app.algorithms.accessibility_router import AccessibilityRouter

router = APIRouter(prefix="/routes", tags=["Accessibility Routing"])

@router.post("/plan", response_model=RouteResultOut)
def plan_route(req: RouteRequest, db: Session = Depends(get_db)):
    nodes = db.query(RouteNode).filter(RouteNode.station_id == req.station_id).all()
    edges = db.query(RouteEdge).filter(RouteEdge.station_id == req.station_id).all()

    if not nodes or not edges:
        raise HTTPException(
            status_code=400,
            detail="Accessibility route graph is not initialized for this station. Please ensure nodes and edges are seeded."
        )

    result = AccessibilityRouter.find_route(
        nodes=nodes,
        edges=edges,
        start_lat=req.start_lat,
        start_lng=req.start_lng,
        end_lat=req.end_lat,
        end_lng=req.end_lng,
        prefer_step_free=req.prefer_step_free,
        min_clear_width_m=req.min_clear_width_m
    )
    return result
