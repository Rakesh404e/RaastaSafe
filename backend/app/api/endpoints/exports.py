from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models import HazardReport, FootpathSegment, Station
from backend.app.services.export_service import ExportService
from backend.app.api.endpoints.analytics import get_dashboard_summary, get_hotspot_clusters

router = APIRouter(prefix="/exports", tags=["Exports"])

@router.get("/csv")
def export_csv(
    record_type: str = Query("hazards", pattern="^(hazards|footpaths)$"),
    station_id: int = 1,
    db: Session = Depends(get_db)
):
    if record_type == "hazards":
        records = db.query(HazardReport).filter(HazardReport.station_id == station_id).all()
        csv_content = ExportService.generate_csv(records, record_type="hazards")
        filename = f"raastasafe_hazards_station_{station_id}.csv"
    else:
        records = db.query(FootpathSegment).filter(FootpathSegment.station_id == station_id).all()
        csv_content = ExportService.generate_csv(records, record_type="footpaths")
        filename = f"raastasafe_footpaths_station_{station_id}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/pdf")
def export_pdf(
    station_id: int = 1,
    db: Session = Depends(get_db)
):
    station = db.query(Station).filter(Station.id == station_id).first()
    station_name = station.name if station else "Rohini West Metro Station"

    segments = db.query(FootpathSegment).filter(FootpathSegment.station_id == station_id).all()
    dashboard_out = get_dashboard_summary(station_id=station_id, db=db)
    kpis = dashboard_out.model_dump() if hasattr(dashboard_out, "model_dump") else dashboard_out.dict()
    hotspots = get_hotspot_clusters(station_id=station_id, db=db)

    pdf_bytes = ExportService.generate_pdf_report(
        station_name=station_name,
        hotspots=hotspots,
        segments=segments,
        kpis=kpis
    )

    filename = f"raastasafe_evidence_report_station_{station_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
