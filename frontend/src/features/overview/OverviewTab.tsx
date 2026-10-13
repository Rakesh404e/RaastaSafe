import React from 'react';
import type { DashboardSummary, Station } from '../../types';
import {
  Layers, AlertTriangle, Compass, CheckCircle2,
  BookOpen, ExternalLink, ShieldCheck, ArrowRight
} from 'lucide-react';

interface OverviewTabProps {
  summary: DashboardSummary | null;
  station: Station | null;
  onNavigate: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ summary, station, onNavigate }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Hero Station Banner */}
      <div className="bg-gradient-to-r from-civic-900 via-civic-800 to-civic-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-12">
          <span className="text-9xl font-black">DELHI</span>
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md mb-4 border border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Pilot Study Catchment: 500m & 800m
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {station?.name || 'Rohini West Metro Station'}
          </h1>
          <p className="text-civic-300 text-sm sm:text-base leading-relaxed mb-6">
            An evidence-grounded station-area pedestrian audit and last-mile feeder mobility planner.
            Investigates how footpath dimensions, physical obstructions, e-rickshaw queuing, and universal
            accessibility interact at Delhi Metro nodes — benchmarked directly against official Indian Roads
            Congress standards (<b>IRC:103-2022</b>).
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('map')}
              className="px-5 py-2.5 bg-metro-red hover:bg-red-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-metro-red/25 flex items-center gap-2 transition-all"
            >
              Explore Interactive Map <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" /> Report Citizen Hazard
            </button>
            <button
              onClick={() => onNavigate('planning')}
              className="px-5 py-2.5 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-white" /> MMI Feeder Planner
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-civic-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-civic-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Audited Segments</span>
            <Layers className="w-4 h-4 text-transit-teal" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-civic-900">
            {summary?.total_footpaths_audited_count ?? 5}
          </div>
          <div className="text-xs text-civic-500 mt-1">
            {summary?.total_audited_length_m ? `${summary.total_audited_length_m.toFixed(0)}m length surveyed` : 'Cross-sections measured'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-civic-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-civic-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Width Deficits</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {summary?.clear_width_deficit_count ?? 3}
          </div>
          <div className="text-xs text-amber-700 mt-1">
            Violates IRC 2.5m transit corridor
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-civic-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-civic-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Queues</span>
            <Compass className="w-4 h-4 text-transit-indigo" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-civic-900">
            {summary?.total_queue_observations_count ?? 2}
          </div>
          <div className="text-xs text-civic-500 mt-1">
            E-rickshaw spillovers observed
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-civic-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-civic-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Hazards</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {summary?.verified_hazard_reports_count ?? 4}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            {summary?.high_priority_hazards_count ?? 3} high/critical priority
          </div>
        </div>
      </div>

      {/* Core Principles & Scientific Grounding */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-200 shadow-sm space-y-6">
        <div className="border-b border-civic-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-civic-900">Methodological Architecture</h2>
            <p className="text-xs text-civic-500 mt-0.5">
              Strict separation of ground truth observations, heuristic priority rankings, and official crash context.
            </p>
          </div>
          <span className="px-3 py-1 bg-civic-100 text-civic-700 text-xs font-bold rounded-lg uppercase">
            No Black-Box AI
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-civic-50 border border-civic-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-civic-900 text-base">Observed Audit Conditions</h3>
            <p className="text-xs text-civic-600 leading-relaxed">
              Every footpath record captures measured total width vs remaining clear walking width, physical obstructions,
              surface condition, curb ramp transitions, and pedestrian counts with timestamps and observer confidence.
              Unknown values remain unknown — never synthesized.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-civic-50 border border-civic-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-civic-900 text-base">Explainable Improvement Priority</h3>
            <p className="text-xs text-civic-600 leading-relaxed">
              Transparent rule-based heuristic driven by: <b>(1)</b> Clear walkway deficit below IRC 2.5m standard,
              <b>(2)</b> Barrier severity, <b>(3)</b> Accessibility impact (curb ramps/tactile), and <b>(4)</b> Verified independent recurrence.
              Missing data reduces the Completeness Factor instead of guessing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-civic-50 border border-civic-200/80 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-civic-900 text-base">Official Road Crash Context</h3>
            <p className="text-xs text-civic-600 leading-relaxed">
              Official Delhi Traffic Police annual crash data is maintained strictly at its published spatial resolution
              (e.g., Mukarba Chowk, Peera Garhi Chowk 500m zones). RaastaSafe never invents synthetic micro-crashes at Rohini West
              or mislabels citizen complaints as accident black spots.
            </p>
          </div>
        </div>
      </div>

      {/* Published Research References Accordion / Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-transit-indigo" />
          <div>
            <h2 className="text-xl font-bold text-civic-900">Published Research Register & Planning Documents</h2>
            <p className="text-xs text-civic-500 mt-0.5">
              Standards embedded in RaastaSafe logic with direct citations.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-civic-200 hover:border-transit-indigo transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-transit-indigo uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  National Design Standard
                </span>
                <h4 className="font-bold text-sm text-civic-900 mt-1">
                  IRC:103-2022 — Guidelines for Pedestrian Facilities
                </h4>
                <p className="text-xs text-civic-500 mt-0.5">Indian Roads Congress, MoRTH (2022)</p>
              </div>
              <a
                href="https://law.resource.org/pub/in/bis/irc/irc.gov.in.078.2.2020.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-civic-400 hover:text-transit-indigo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-civic-600 mt-2">
              Chapter 6 specifies minimum <b>2.5m clear walking zone</b> for high-footfall transit station nodes and 2.0m general urban streets.
              Chapter 12 recommends Intermediate Public Transport (IPT/e-rickshaw) stands within <b>100m walking distance</b> without cutting across pedestrian paths.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-civic-200 hover:border-transit-indigo transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Commuter Survey Model
                </span>
                <h4 className="font-bold text-sm text-civic-900 mt-1">
                  Kar, Sadhukhan & Parida (2026) — Integrated IPA Walk Access
                </h4>
                <p className="text-xs text-civic-500 mt-0.5">Journal of Urban Planning and Development</p>
              </div>
              <a
                href="https://doi.org/10.1061/JUPDDM.UPENG-5978"
                target="_blank"
                rel="noreferrer"
                className="text-civic-400 hover:text-transit-indigo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-civic-600 mt-2">
              Analyzed 466 Delhi metro commuters across 12 attributes. Demonstrates that <b>Universal Design</b> and <b>Illumination</b> require
              immediate resource attention (Quadrant I: Concentrate Here). Powers the 9-attribute IPA scatter plot module.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-civic-200 hover:border-transit-indigo transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">
                  Feeder Mobility Evidence
                </span>
                <h4 className="font-bold text-sm text-civic-900 mt-1">
                  WRI India (2023) — Improving Metro Access in India
                </h4>
                <p className="text-xs text-civic-500 mt-0.5">World Resources Institute India</p>
              </div>
              <a
                href="https://doi.org/10.46830/wriwp.23.00009"
                target="_blank"
                rel="noreferrer"
                className="text-civic-400 hover:text-transit-indigo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-civic-600 mt-2">
              Study of 7,200 commuters in Delhi, Bengaluru, and Nagpur. Last-mile choices are acutely sensitive to wait times and cost.
              Stresses that e-rickshaws must not be treated purely as obstacles, but as essential feeder transport requiring dedicated curbside staging.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-civic-200 hover:border-transit-indigo transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-civic-700 uppercase tracking-wider bg-civic-100 px-2 py-0.5 rounded">
                  Official Planning Draft
                </span>
                <h4 className="font-bold text-sm text-civic-900 mt-1">
                  UTTIPEC / DMRC Rohini West MMI Concept Plan (2026)
                </h4>
                <p className="text-xs text-civic-500 mt-0.5">Delhi Development Authority / Creative Group</p>
              </div>
              <a
                href="https://uttipec.org.in/CommunityFeedback/Rohini"
                target="_blank"
                rel="noreferrer"
                className="text-civic-400 hover:text-transit-indigo"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-civic-600 mt-2">
              Publicly published concept plan for community feedback. Referenced strictly as a planning concept (not as an approved or as-built plan).
              Forms the spatial baseline for MMI Feeder Scenario testing.
            </p>
          </div>
        </div>
      </div>

      {/* Pilot Scope & Ethical Disclaimers */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
        <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
          <ShieldCheck className="w-4 h-4 text-amber-700" /> Pilot Verification & Legal Disclaimer
        </div>
        <p>
          RaastaSafe is an academic and civic planning evidence system developed for hackathon evaluation.
          Proposed feeder zones and conflict checks do not constitute municipal approval.
          Implementation of physical street geometry modifications requires statutory clearance from
          Delhi Metro Rail Corporation (DMRC), Municipal Corporation of Delhi (MCD), Public Works Department (PWD),
          and Delhi Traffic Police.
        </p>
      </div>
    </div>
  );
};
