import io
import csv
from datetime import datetime
from typing import List, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class ExportService:
    @classmethod
    def generate_csv(cls, records: List[Any], record_type: str = "hazards") -> str:
        output = io.StringIO()
        writer = csv.writer(output)

        if record_type == "hazards":
            # Header excluding private reporter email / personal info
            writer.writerow([
                "Report ID", "Station Code", "Report Type", "Title",
                "Severity", "Status", "Latitude", "Longitude",
                "Provenance", "Created At", "Reviewed By", "Reviewed At"
            ])
            for r in records:
                writer.writerow([
                    r.id,
                    getattr(r, "station_id", "RWST"),
                    r.report_type,
                    r.title,
                    r.severity,
                    r.status,
                    r.latitude,
                    r.longitude,
                    r.provenance,
                    r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
                    r.reviewed_by or "Unreviewed",
                    r.reviewed_at.strftime("%Y-%m-%d %H:%M") if r.reviewed_at else ""
                ])

        elif record_type == "footpaths":
            writer.writerow([
                "Segment ID", "Name", "Street Name", "Side of Street",
                "Footpath Exists", "Total Width (m)", "Clear Walking Width (m)",
                "Surface Quality", "Curb Ramps", "Tactile Paving",
                "Obstructions", "Status", "Provenance", "Created At"
            ])
            for s in records:
                writer.writerow([
                    s.id,
                    s.name,
                    s.street_name,
                    s.side_of_street,
                    "Yes" if s.footpath_exists else ("No" if s.footpath_exists is False else "Unknown"),
                    s.total_width_m if s.total_width_m is not None else "Unmeasured",
                    s.clear_walking_width_m if s.clear_walking_width_m is not None else "Unmeasured",
                    s.surface_quality,
                    "Yes" if s.has_curb_ramps else ("No" if s.has_curb_ramps is False else "Unknown"),
                    "Yes" if s.has_tactile_paving else ("No" if s.has_tactile_paving is False else "Unknown"),
                    "; ".join(s.obstruction_types or []),
                    s.verification_status,
                    s.provenance,
                    s.created_at.strftime("%Y-%m-%d %H:%M") if s.created_at else ""
                ])

        return output.getvalue()

    @classmethod
    def generate_pdf_report(
        cls,
        station_name: str,
        hotspots: List[dict],
        segments: List[Any],
        kpis: dict
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=14
        )
        section_style = ParagraphStyle(
            "SectionTitle",
            parent=styles["Heading2"],
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#0f172a"),
            spaceBefore=12,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )
        alert_style = ParagraphStyle(
            "Alert",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#b45309")
        )

        elements = []

        # Header
        elements.append(Paragraph("RAASTASAFE — STATION EVIDENCE REPORT", title_style))
        elements.append(Paragraph(
            f"<b>Study Station:</b> {station_name} | <b>Generated:</b> {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')} | <b>Methodology:</b> IRC:103-2022",
            subtitle_style
        ))
        elements.append(Spacer(1, 6))

        # KPI Summary Table
        elements.append(Paragraph("1. Executive Summary & Audit Coverage", section_style))
        kpi_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Audited Segments", str(kpis.get("total_footpaths_audited_count", 0)), "Total Audited Length", f"{kpis.get('total_audited_length_m', 0):.0f} m"],
            ["Clear Width Deficit Segments", str(kpis.get("clear_width_deficit_count", 0)), "Active E-Rickshaw Queues", str(kpis.get("total_queue_observations_count", 0))],
            ["Verified Hazard Reports", str(kpis.get("verified_hazard_reports_count", 0)), "High/Critical Priority Items", str(kpis.get("high_priority_hazards_count", 0))]
        ]
        t_kpi = Table(kpi_data, colWidths=[160, 100, 160, 120])
        t_kpi.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_kpi)
        elements.append(Spacer(1, 10))

        # Prioritized Hotspots
        elements.append(Paragraph("2. Prioritized Hotspots & Field Evidence", section_style))
        hotspot_rows = [["ID", "Name", "Dominant Issue", "Observed Items", "Priority Score"]]
        for h in hotspots[:5]:
            hotspot_rows.append([
                h.get("cluster_id", ""),
                h.get("name", "")[:32],
                h.get("dominant_issue", "").replace("_", " ").title(),
                f"{h.get('total_observations_count', 0)} ({h.get('verified_count', 0)} verified)",
                f"{h.get('priority_score', 0):.1f}/100"
            ])

        t_hotspots = Table(hotspot_rows, colWidths=[65, 175, 120, 100, 80])
        t_hotspots.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_hotspots)
        elements.append(Spacer(1, 10))

        # Key Footpath Audits
        elements.append(Paragraph("3. Sample Footpath Cross-Section Audits", section_style))
        seg_rows = [["Segment", "Measured Width", "Clear Width", "IRC Deficit (<2.5m)", "Surface", "Curb Ramp"]]
        for s in segments[:6]:
            tot = f"{s.total_width_m:.1f}m" if s.total_width_m else "Unmeasured"
            clr = f"{s.clear_walking_width_m:.1f}m" if s.clear_walking_width_m else "Unmeasured"
            defic = f"{max(0.0, 2.5 - s.clear_walking_width_m):.2f}m" if s.clear_walking_width_m else "Pending"
            seg_rows.append([
                s.name[:25],
                tot,
                clr,
                defic,
                s.surface_quality.capitalize(),
                "Yes" if s.has_curb_ramps else ("No" if s.has_curb_ramps is False else "Unknown")
            ])

        t_segs = Table(seg_rows, colWidths=[150, 80, 80, 100, 65, 65])
        t_segs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(t_segs)
        elements.append(Spacer(1, 14))

        # Methodology & Legal Limitations Notice
        elements.append(Paragraph("4. Research Grounding & Limitations Notice", section_style))
        notice_text = (
            "<b>Research Foundation:</b> Standards evaluated against Indian Roads Congress IRC:103-2022 "
            "(Guidelines for Pedestrian Facilities), WRI India (2023) Metro Access Study, and Kar et al. (2026) Delhi Walk Accessibility Research.<br/>"
            "<b>Data Integrity Notice:</b> Observations labeled DEMO/SYNTHETIC represent calibrated test scenarios. "
            "Reported priority scores are explainable decision-support heuristics, NOT statistical crash forecasts.<br/>"
            "<b>Non-Approval Disclaimer:</b> RaastaSafe does not issue municipal infrastructure approvals. "
            "All physical interventions require formal engineering review by DMRC, MCD, and Delhi Traffic Police."
        )
        elements.append(Paragraph(notice_text, alert_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
