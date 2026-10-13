import React, { useState } from 'react';
import type { HazardReport, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, Clock,
  ArrowRight, Users, Copy, Lock
} from 'lucide-react';

interface AdminReviewTabProps {
  hazards: HazardReport[];
  onRefresh: () => void;
  userRole: UserRole;
  onOpenAuth: () => void;
}

export const AdminReviewTab: React.FC<AdminReviewTabProps> = ({
  hazards,
  onRefresh,
  userRole,
  onOpenAuth
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    hazards.length > 0 ? hazards[0].id : null
  );
  const [newStatus, setNewStatus] = useState('verified');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const activeReport = hazards.find(h => h.id === selectedReportId) || hazards[0];

  React.useEffect(() => {
    if (activeReport) {
      loadDuplicates(activeReport.id);
    }
  }, [selectedReportId]);

  const loadDuplicates = async (id: string) => {
    try {
      const data = await api.getHazardDuplicates(id);
      setDuplicates(data.duplicate_candidates || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransitionStatus = async (statusOverride?: string) => {
    if (!activeReport) return;
    setSubmitting(true);
    try {
      await api.transitionHazardStatus(
        activeReport.id,
        statusOverride || newStatus,
        reviewerNotes || 'Reviewed and validated on-site.'
      );
      setReviewerNotes('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkDuplicate = async (targetMasterId: string) => {
    if (!activeReport) return;
    setSubmitting(true);
    try {
      await api.confirmDuplicateHazard(activeReport.id, targetMasterId, 'Confirmed spatial duplicate');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Duplicate linking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (userRole === 'public_visitor') {
    return (
      <div className="bg-white rounded-3xl p-12 border border-civic-200 text-center max-w-lg mx-auto space-y-4 my-12 shadow-sm">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-civic-900">Reviewer Authentication Required</h3>
        <p className="text-xs text-civic-500 leading-relaxed">
          The Action Center and Report Verification Pipeline requires Field Reviewer or Administrator permissions.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all inline-flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" /> Sign In as Field Reviewer / Admin
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-bold text-civic-900">Reviewer & Engineering Action Center</h2>
        <p className="text-xs text-civic-500 mt-0.5">
          Lifecycle management pipeline: Submitted &rarr; Under Review &rarr; Verified &rarr; Action Proposed &rarr; Resolved.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* SUBMISSION QUEUE (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-civic-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-civic-700 uppercase tracking-wide">
            Reports Requiring Action ({hazards.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {hazards.map((h) => (
              <div
                key={h.id}
                onClick={() => setSelectedReportId(h.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                  selectedReportId === h.id
                    ? 'border-transit-indigo bg-indigo-50/50 shadow-sm'
                    : 'border-civic-200 hover:bg-civic-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-civic-700">{h.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                    h.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : h.status === 'action_proposed'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {h.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-bold text-civic-900 line-clamp-1">{h.title}</div>
                <div className="text-[11px] text-civic-500 flex justify-between">
                  <span>Severity: <b className="capitalize text-civic-800">{h.severity}</b></span>
                  <span>{h.reporter_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WORKBENCH & DUPLICATE RESOLUTION (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {activeReport && (
            <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-civic-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-transit-indigo bg-indigo-50 px-2.5 py-0.5 rounded">
                    ACTIVE INSPECTION: {activeReport.id}
                  </span>
                  <h3 className="text-lg font-bold text-civic-900 mt-1">{activeReport.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                  activeReport.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeReport.severity} Severity
                </span>
              </div>

              <p className="text-xs text-civic-700 bg-civic-50 p-3.5 rounded-xl border border-civic-200/60 leading-relaxed">
                {activeReport.description}
              </p>

              {/* Duplicate Candidate Detection */}
              {duplicates.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-3">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Copy className="w-4 h-4 text-amber-700" />
                    Potential Spatial Duplicates Detected Nearby ({duplicates.length})
                  </div>
                  <div className="space-y-2">
                    {duplicates.map((dup) => (
                      <div key={dup.id} className="p-2.5 bg-white rounded-xl border border-amber-200/80 flex items-center justify-between">
                        <div>
                          <span className="font-bold font-mono text-civic-800">{dup.id}</span>
                          <span className="text-civic-600 ml-2">{dup.title}</span>
                          <div className="text-[10px] text-civic-400">
                            Distance: {dup.distance_m}m away | Match Confidence: {dup.match_confidence}
                          </div>
                        </div>
                        <button
                          onClick={() => handleLinkDuplicate(dup.id)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg text-[10px]"
                        >
                          Link as Duplicate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Transition Control */}
              <div className="p-4 rounded-2xl bg-civic-50 border border-civic-200 space-y-3 text-xs">
                <span className="font-bold text-civic-800 block">Transition Status & Review</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-civic-600 mb-1">New Workflow Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2 border border-civic-300 rounded-lg bg-white"
                    >
                      <option value="under_review">Under Review</option>
                      <option value="verified">Verified (Confirmed on-ground)</option>
                      <option value="action_proposed">Action Proposed (Added to MMI scenario)</option>
                      <option value="in_progress">In Progress (PWD/DMRC action)</option>
                      <option value="resolved">Resolved (Physical fix completed)</option>
                      <option value="rejected">Rejected (Not a hazard)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-civic-600 mb-1">Engineering / Review Notes</label>
                    <input
                      type="text"
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      placeholder="e.g. Measured 22cm vertical step..."
                      className="w-full p-2 border border-civic-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleTransitionStatus('verified')}
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Quick Mark Verified
                  </button>
                  <button
                    onClick={() => handleTransitionStatus()}
                    disabled={submitting}
                    className="px-4 py-2 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs"
                  >
                    Apply Transition
                  </button>
                </div>
              </div>

              {/* Audit Trail / History */}
              {activeReport.audit_history && activeReport.audit_history.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-civic-800 uppercase tracking-wide block">
                    Audit Trail & History
                  </span>
                  <div className="space-y-1.5">
                    {activeReport.audit_history.map((hist) => (
                      <div key={hist.id} className="p-2 rounded-lg bg-civic-50 border border-civic-200/60 text-[11px] flex justify-between items-center">
                        <div>
                          <span className="font-bold text-civic-800">{hist.changed_by}: </span>
                          <span className="text-civic-600">{hist.notes || `Changed to ${hist.new_status}`}</span>
                        </div>
                        <span className="text-civic-400 font-mono">
                          {new Date(hist.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
