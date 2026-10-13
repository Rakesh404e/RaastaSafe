import React, { useState, useEffect } from 'react';
import type { HazardReport, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  AlertTriangle, MapPin, CheckCircle2, Search
} from 'lucide-react';

interface PublicReportTabProps {
  hazards: HazardReport[];
  onRefresh: () => void;
  userRole: UserRole;
  initialLocation?: { lat: number; lng: number } | null;
}

export const PublicReportTab: React.FC<PublicReportTabProps> = ({
  hazards,
  onRefresh,
  userRole,
  initialLocation
}) => {
  const [reportType, setReportType] = useState('missing_ramp');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(initialLocation?.lat || 28.71518);
  const [longitude, setLongitude] = useState<number>(initialLocation?.lng || 77.11538);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [reporterType, setReporterType] = useState('resident');
  const [reporterContact, setReporterContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocation) {
      setLatitude(initialLocation.lat);
      setLongitude(initialLocation.lng);
    }
  }, [initialLocation]);

  // Filter state for reports list
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          alert('Could not retrieve current geolocation. Defaulting to Rohini West Metro gates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        station_id: 1,
        report_type: reportType,
        title,
        description,
        latitude,
        longitude,
        severity,
        reporter_type: reporterType,
        reporter_contact: reporterContact || undefined
      };

      const result = await api.submitHazard(payload);
      setSuccessId(result.id);
      setTitle('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredHazards = hazards.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* REPORT FORM (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-metro-red uppercase tracking-wide px-2 py-0.5 rounded bg-red-50">
                  Citizen Portal
                </span>
                <span className="text-[10px] font-mono text-civic-500 bg-civic-100 px-2 py-0.5 rounded">
                  Role: {userRole}
                </span>
              </div>
              <h2 className="text-xl font-bold text-civic-900 mt-2">Report a Pedestrian Hazard</h2>
              <p className="text-xs text-civic-500 mt-0.5">
                Submit observed physical barriers, e-rickshaw queue spillover, missing ramps, or broken footpaths around Rohini West.
              </p>
            </div>

            {successId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-900 text-sm">Report Registered!</div>
                  <div className="text-xs text-emerald-800">
                    Tracking ID: <span className="font-mono font-bold">{successId}</span>. Marked as <b>Submitted</b> pending field verification.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Hazard Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-metro-red"
                >
                  <option value="missing_ramp">Missing Curb Ramp / Vertical Step Barrier</option>
                  <option value="queue_spillover">E-Rickshaw Queue Spillover into Walkway</option>
                  <option value="broken_footpath">Damaged / Missing Drain Slab / Broken Pavers</option>
                  <option value="dark_spot">Unlit Night Shadow / Dark Spot</option>
                  <option value="obstruction">Vending / Commercial Encroachment</option>
                  <option value="unsafe_crossing">Unsafe Road Crossing / Sightline Blockage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Issue Summary
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 25cm curb drop at Gate 2 corner"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-metro-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe location, walking corridor impact, accessibility barriers..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-metro-red"
                />
              </div>

              {/* Coordinates Picker */}
              <div className="p-3.5 bg-civic-50 rounded-xl border border-civic-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-civic-800">Coordinates</span>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    className="text-transit-indigo hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" /> Get Current GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-civic-500">Latitude</span>
                    <input
                      type="number"
                      step="0.00001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="w-full p-1.5 border border-civic-300 rounded font-mono bg-white text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-civic-500">Longitude</span>
                    <input
                      type="number"
                      step="0.00001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="w-full p-1.5 border border-civic-300 rounded font-mono bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Severity & Reporter */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full p-2 border border-civic-300 rounded-xl"
                  >
                    <option value="low">Low (Minor inconvenience)</option>
                    <option value="medium">Medium (Requires detour)</option>
                    <option value="high">High (Forces road walking)</option>
                    <option value="critical">Critical (Fall / crash hazard)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Reporter Role</label>
                  <select
                    value={reporterType}
                    onChange={(e) => setReporterType(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-xl"
                  >
                    <option value="resident">Local Resident</option>
                    <option value="commuter">Metro Commuter</option>
                    <option value="student_auditor">Student Auditor</option>
                    <option value="anonymous">Anonymous Citizen</option>
                  </select>
                </div>
              </div>

              {/* Contact info (optional) */}
              <div className="text-xs">
                <label className="block font-bold text-civic-700 mb-1">Contact Email / Phone (Optional)</label>
                <input
                  type="text"
                  value={reporterContact}
                  onChange={(e) => setReporterContact(e.target.value)}
                  placeholder="e.g. resident@delhi.in (for resolution updates)"
                  className="w-full p-2 border border-civic-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-metro-red hover:bg-red-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-metro-red/20 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                {submitting ? 'Submitting...' : 'Register Hazard Report'}
              </button>

              <div className="text-[10px] text-civic-400 text-center leading-relaxed">
                Privacy Notice: Submissions are published without personally identifiable information. Contact details are securely hashed.
              </div>
            </form>
          </div>
        </div>

        {/* RECENT CITIZEN REPORTS LIST (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-civic-900">Active Station Hazard Submissions</h3>
                <p className="text-xs text-civic-500">Track report status and engineering reviews</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-civic-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ID, title..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-civic-300 focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-2 text-xs rounded-xl border border-civic-300"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="verified">Verified</option>
                  <option value="action_proposed">Action Proposed</option>
                  <option value="duplicate">Duplicate</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredHazards.map((h) => {
                const isCritical = h.severity === 'critical';
                const isHigh = h.severity === 'high';
                return (
                  <div
                    key={h.id}
                    className="p-4 rounded-2xl border border-civic-200/90 hover:border-civic-300 hover:shadow-sm transition-all space-y-2 bg-civic-50/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-civic-700 bg-civic-200 px-2 py-0.5 rounded">
                          {h.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCritical ? 'bg-red-100 text-red-800' : isHigh ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {h.severity}
                        </span>
                        <span className="text-xs text-civic-500 capitalize">
                          {h.report_type.replace('_', ' ')}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        h.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'action_proposed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : h.status === 'duplicate'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {h.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-civic-900">{h.title}</h4>
                    <p className="text-xs text-civic-600 leading-relaxed">{h.description}</p>

                    {h.reviewer_notes && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                        <b>Reviewer Note:</b> {h.reviewer_notes}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-civic-400 font-mono pt-1 border-t border-civic-100">
                      <span>Reported by: {h.reporter_type}</span>
                      <span>Coordinates: [{h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
