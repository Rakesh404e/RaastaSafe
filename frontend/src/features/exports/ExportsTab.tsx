import React from 'react';
import { api } from '../../services/api';
import {
  FileText, Download, ShieldCheck, BookOpen, ExternalLink,
  Table, CheckCircle2, AlertTriangle
} from 'lucide-react';

export const ExportsTab: React.FC = () => {
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-civic-900">Evidence Export & Documentation Center</h2>
        <p className="text-xs text-civic-500 mt-0.5">
          Generate source-backed civic reports, GIS datasets, and research-attributed documentation for local transit authorities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PDF Evidence Report */}
        <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-metro-red flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-civic-900">
              Station Evidence Report (PDF)
            </h3>
            <p className="text-xs text-civic-600 leading-relaxed">
              Comprehensive municipal evidence brief formatted with official ReportLab layout.
              Includes executive audit coverage metrics, prioritized hotspot tables, footpath cross-section surveys,
              and academic citations (IRC:103-2022, WRI 2023, Kar et al. 2026).
            </p>
          </div>

          <a
            href={api.getPdfExportUrl(1)}
            download="raastasafe_evidence_report.pdf"
            className="w-full py-2.5 px-4 bg-metro-red hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-metro-red/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Official PDF Report
          </a>
        </div>

        {/* CSV GIS Datasets */}
        <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-transit-indigo flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-civic-900">
              Structured Audit Datasets (CSV)
            </h3>
            <p className="text-xs text-civic-600 leading-relaxed">
              Download clean tabular data for GIS analysis in QGIS or ArcGIS.
              Contains measured widths, clear walking corridors, physical obstructions, and timestamps.
              Reporter emails are strictly excluded for privacy preservation.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={api.getCsvExportUrl('footpaths', 1)}
              download="footpaths.csv"
              className="flex-1 py-2.5 px-3 bg-civic-100 hover:bg-civic-200 text-civic-800 font-semibold rounded-xl text-xs border border-civic-300 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Footpaths CSV
            </a>
            <a
              href={api.getCsvExportUrl('hazards', 1)}
              download="hazards.csv"
              className="flex-1 py-2.5 px-3 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Hazards CSV
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Documentation and Provenance Notice */}
      <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-civic-900">
          <BookOpen className="w-4 h-4 text-transit-indigo" />
          Repository Research & Data Provenance Documents
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-civic-50 border border-civic-200/80 space-y-1">
            <div className="font-bold text-civic-900 font-mono">docs/RESEARCH_AND_DATA_SOURCES.md</div>
            <p className="text-civic-600 text-[11px] leading-relaxed">
              Full formal register of Indian Roads Congress standards, peer-reviewed Delhi walk access research, and UTTIPEC MMI concept plans.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-civic-50 border border-civic-200/80 space-y-1">
            <div className="font-bold text-civic-900 font-mono">docs/DATA_PROVENANCE.md</div>
            <p className="text-civic-600 text-[11px] leading-relaxed">
              Classification of field data vs synthetic calibration records, OpenStreetMap ODbL compliance, and privacy safeguards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
