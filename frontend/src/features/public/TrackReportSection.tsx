import React, { useState } from 'react';
import type { HazardReport } from '../../types';
import {
  Search, CheckCircle2, Clock, ShieldCheck,
  AlertTriangle, Wrench, CheckCircle, ArrowRight
} from 'lucide-react';

interface TrackReportSectionProps {
  hazards: HazardReport[];
  onSelectReport?: (report: HazardReport) => void;
  onNavigateToReportForm?: () => void;
}

export const TrackReportSection: React.FC<TrackReportSectionProps> = ({
  hazards,
  onNavigateToReportForm
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    hazards.length > 0 ? hazards[0].id : null
  );

  const filtered = hazards.filter(h =>
    h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.report_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeReport = hazards.find(h => h.id === selectedReportId) || filtered[0] || null;

  const statusSteps = [
    { key: 'submitted', label: 'Submitted', desc: 'Received from citizen via mobile/portal' },
    { key: 'under_review', label: 'Under Review', desc: 'Assigned to field inspector for assessment' },
    { key: 'verified', label: 'Verified', desc: 'Physical audit confirmed defect & priority scored' },
    { key: 'scheduled_for_repair', label: 'Scheduled', desc: 'Forwarded to MCD/PWD road maintenance roster' },
    { key: 'resolved', label: 'Resolved', desc: 'Repair executed and verified on site' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'verified': return 2;
      case 'scheduled_for_repair': return 3;
      case 'resolved': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = activeReport ? getStepIndex(activeReport.status) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-transit-indigo to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-indigo-100">
            Citizen Transparency Portal
          </span>
          <h2 className="text-2xl font-black mt-2">Track Hazard & Defect Reports</h2>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Check the real-time engineering review and maintenance lifecycle for any reported issue around Rohini West Metro Station.
          </p>
        </div>

        {onNavigateToReportForm && (
          <button
            onClick={onNavigateToReportForm}
            className="px-5 py-2.5 bg-white text-transit-indigo hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-metro-red" />
            Report New Hazard
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-civic-200 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-civic-400 flex-shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter Report ID (e.g. RPT-DEL-RWST-001) or search keywords (ramp, paver, e-rickshaw)..."
          className="w-full text-xs text-civic-800 placeholder-civic-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-civic-400 hover:text-civic-600 px-2 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report List / Search Results (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-civic-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-civic-100">
            <h3 className="font-bold text-xs text-civic-800 uppercase tracking-wider">
              Recent Submissions ({filtered.length})
            </h3>
            <span className="text-[11px] text-civic-400">Click to view timeline</span>
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-civic-400">
                No reports found matching "{searchQuery}"
              </div>
            ) : (
              filtered.map((r) => {
                const isSelected = activeReport?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-transit-indigo bg-indigo-50/50 shadow-sm'
                        : 'border-civic-200 hover:border-civic-300 hover:bg-civic-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono text-[11px] font-bold text-civic-600">
                        {r.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'verified'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'scheduled_for_repair'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-civic-900 mt-1 line-clamp-1">
                      {r.title}
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-civic-500">
                      <span className="capitalize">{r.report_type.replace(/_/g, ' ')}</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-metro-red">{r.severity} severity</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Tracker & Lifecycle Stepper (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-6">
          {activeReport ? (
            <>
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-civic-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-transit-indigo bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {activeReport.id}
                    </span>
                    <span className="text-xs text-civic-400">
                      {new Date(activeReport.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-civic-900 mt-1">
                    {activeReport.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeReport.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeReport.status === 'verified'
                      ? 'bg-blue-100 text-blue-800'
                      : activeReport.status === 'scheduled_for_repair'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {activeReport.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-civic-800 uppercase tracking-wider block">
                  Official Lifecycle Progress
                </span>

                <div className="relative pl-6 space-y-5 border-l-2 border-civic-200 ml-2">
                  {statusSteps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="relative">
                        {/* Dot / Check Icon */}
                        <div className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-civic-200 text-civic-500'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${
                              isCurrent ? 'text-transit-indigo' : isCompleted ? 'text-civic-900' : 'text-civic-400'
                            }`}>
                              {step.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-indigo-100 text-transit-indigo px-2 py-0.5 rounded-full">
                                Current State
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-civic-500 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details & Reviewer Feedback */}
              <div className="p-4 bg-civic-50 rounded-2xl border border-civic-200/80 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-civic-700 block">Citizen Description</span>
                  <p className="text-civic-800 mt-0.5 leading-relaxed">
                    {activeReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-civic-200">
                  <div>
                    <span className="text-civic-500 text-[10px] uppercase font-bold block">Location</span>
                    <span className="font-mono text-civic-800 text-[11px]">
                      {activeReport.latitude.toFixed(4)}, {activeReport.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 text-[10px] uppercase font-bold block">Report Type</span>
                    <span className="capitalize text-civic-800 text-[11px]">
                      {activeReport.report_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 text-[10px] uppercase font-bold block">Reported By</span>
                    <span className="capitalize text-civic-800 text-[11px]">
                      {activeReport.reporter_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {activeReport.reviewer_notes && (
                  <div className="pt-2 border-t border-civic-200">
                    <span className="font-bold text-civic-700 block">Official Engineering Notes</span>
                    <p className="text-civic-800 italic mt-0.5">
                      "{activeReport.reviewer_notes}"
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-xs text-civic-400">
              Select a report to view tracking timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
