import React, { useState } from 'react';
import type { FootpathSegment, UserRole, LocationPriority } from '../../types';
import { api } from '../../services/api';
import {
  Layers, Plus, CheckCircle2, AlertTriangle, Sparkles,
  Info, ChevronRight, X
} from 'lucide-react';

interface AuditsTabProps {
  footpaths: FootpathSegment[];
  onRefresh: () => void;
  userRole: UserRole;
}

export const AuditsTab: React.FC<AuditsTabProps> = ({ footpaths, onRefresh, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<LocationPriority | null>(null);
  const [loadingPriority, setLoadingPriority] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [sideOfStreet, setSideOfStreet] = useState('north');
  const [totalWidth, setTotalWidth] = useState<string>('2.8');
  const [clearWidth, setClearWidth] = useState<string>('1.4');
  const [surfaceQuality, setSurfaceQuality] = useState('fair');
  const [hasCurbRamps, setHasCurbRamps] = useState<string>('false');
  const [hasTactile, setHasTactile] = useState<string>('true');
  const [lighting, setLighting] = useState('moderate');
  const [obstructions, setObstructions] = useState<string[]>(['e_rickshaw_queue']);
  const [volume, setVolume] = useState<string>('350');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleObstruction = (obs: string) => {
    setObstructions(prev =>
      prev.includes(obs) ? prev.filter(o => o !== obs) : [...prev, obs]
    );
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        station_id: 1,
        name,
        street_name: streetName,
        side_of_street: sideOfStreet,
        geometry_geojson: {
          type: 'LineString',
          coordinates: [
            [77.1145, 28.7148],
            [77.1152, 28.7150]
          ]
        },
        footpath_exists: true,
        total_width_m: totalWidth ? parseFloat(totalWidth) : null,
        clear_walking_width_m: clearWidth ? parseFloat(clearWidth) : null,
        surface_quality: surfaceQuality,
        discontinuities_detected: false,
        has_curb_ramps: hasCurbRamps === 'null' ? null : hasCurbRamps === 'true',
        has_tactile_paving: hasTactile === 'null' ? null : hasTactile === 'true',
        lighting_condition: lighting,
        obstruction_types: obstructions,
        estimated_pedestrian_volume: volume ? parseInt(volume) : null,
        volume_method: '15-min peak field sample',
        observer_notes: notes,
        observer_confidence: 'high',
        provenance: 'OBSERVED_FIELD_DATA'
      };

      await api.createFootpath(payload);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error recording footpath audit');
    } finally {
      setSubmitting(false);
    }
  };

  const inspectPriority = async (segmentId: number) => {
    setLoadingPriority(true);
    try {
      const p = await api.getFootpathPriority(segmentId);
      setSelectedPriority(p);
    } catch (err: any) {
      alert('Failed to load priority calculation');
    } finally {
      setLoadingPriority(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-civic-900">Footpath Segment Field Audits</h2>
          <p className="text-xs text-civic-500 mt-0.5">
            Structured cross-section physical observations evaluated against IRC:103-2022 minimum 2.5m transit corridor standards.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Record New Footpath Audit
        </button>
      </div>

      {/* Footpath Audits Table */}
      <div className="bg-white rounded-2xl border border-civic-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-civic-50 text-civic-600 font-bold uppercase tracking-wider border-b border-civic-200">
              <tr>
                <th className="py-3 px-4">Segment Corridor</th>
                <th className="py-3 px-4">Street / Side</th>
                <th className="py-3 px-4">Total Width</th>
                <th className="py-3 px-4">Clear Walking Width</th>
                <th className="py-3 px-4">IRC 2.5m Deficit</th>
                <th className="py-3 px-4">Obstructions</th>
                <th className="py-3 px-4">Surface</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Explain Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-civic-100">
              {footpaths.map((s) => {
                const deficit = s.clear_walking_width_m !== null ? Math.max(0, 2.5 - s.clear_walking_width_m) : null;
                const isDeficit = deficit !== null && deficit > 0;
                return (
                  <tr key={s.id} className="hover:bg-civic-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-civic-900">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-civic-600">
                      {s.street_name} ({s.side_of_street})
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {s.total_width_m ? `${s.total_width_m.toFixed(1)}m` : <span className="text-civic-400">Unmeasured</span>}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      {s.clear_walking_width_m ? (
                        <span className={isDeficit ? 'text-red-600' : 'text-emerald-700'}>
                          {s.clear_walking_width_m.toFixed(2)}m
                        </span>
                      ) : (
                        <span className="text-civic-400">Unmeasured</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {deficit !== null ? (
                        deficit > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[11px]">
                            -{deficit.toFixed(2)}m deficit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            ✓ Compliant
                          </span>
                        )
                      ) : (
                        <span className="text-civic-400 text-[11px]">Pending survey</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {s.obstruction_types?.length > 0 ? (
                          s.obstruction_types.map((obs) => (
                            <span key={obs} className="px-1.5 py-0.2 rounded bg-civic-100 text-civic-700 text-[10px]">
                              {obs.replace('_', ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-600 text-[11px]">Clear</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize text-civic-700">
                      {s.surface_quality}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                        s.verification_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => inspectPriority(s.id)}
                        className="px-2.5 py-1 bg-civic-100 hover:bg-civic-200 text-transit-indigo text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRIORITY EXPLANATION MODAL */}
      {selectedPriority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-civic-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-civic-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-civic-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-transit-indigo font-bold">
                  Explainable Priority Engine
                </span>
                <h3 className="font-bold text-lg">{selectedPriority.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPriority(null)}
                className="text-civic-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between p-4 bg-civic-50 rounded-xl border border-civic-200">
                <div>
                  <div className="text-xs text-civic-500 uppercase font-semibold">Priority Score</div>
                  <div className="text-3xl font-extrabold text-civic-900">
                    {selectedPriority.total_priority_score} <span className="text-sm font-normal text-civic-500">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-civic-500 uppercase font-semibold">Action Tier</div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${
                    selectedPriority.priority_level === 'Critical'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedPriority.priority_level} Priority
                  </span>
                </div>
              </div>

              {/* Component breakdown */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-civic-800 uppercase tracking-wide">
                  Score Factors & Weighted Breakdown
                </div>
                {selectedPriority.components.map((comp) => (
                  <div key={comp.name} className="p-3 rounded-xl bg-civic-50 border border-civic-200/60 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-civic-800">
                      <span>{comp.name}</span>
                      <span className="font-mono text-transit-indigo">+{comp.weighted_score} pts (wt: {comp.weight * 100}%)</span>
                    </div>
                    <div className="text-civic-600 text-[11px]">{comp.description}</div>
                    <div className="text-[11px] font-semibold text-civic-500">Raw Value: {comp.raw_value}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold">Guidance Standard:</div>
                <p className="text-[11px]">{selectedPriority.irc_guidance_clause}</p>
                <div className="text-[10px] text-amber-700 italic pt-1">
                  Notice: Rule-based civic intervention ranking. Not a statistical accident forecast.
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-civic-50 border-t border-civic-200 text-right">
              <button
                onClick={() => setSelectedPriority(null)}
                className="px-4 py-2 bg-civic-200 hover:bg-civic-300 text-civic-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW AUDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-civic-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-civic-200 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-civic-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Record Footpath Cross-Section Audit</h3>
                <p className="text-xs text-civic-400">IRC:103-2022 Station Node Standards</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-civic-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAudit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Segment / Corridor Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Gate 2 East Feeder Walkway"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                    Street Name
                  </label>
                  <input
                    type="text"
                    required
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    placeholder="Bhagwan Mahavir Marg"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                    Side of Street
                  </label>
                  <select
                    value={sideOfStreet}
                    onChange={(e) => setSideOfStreet(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo"
                  >
                    <option value="north">North Side</option>
                    <option value="south">South Side</option>
                    <option value="east">East Side</option>
                    <option value="west">West Side</option>
                  </select>
                </div>
              </div>

              {/* Physical Width Measurements */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-civic-50 rounded-xl border border-civic-200">
                <div>
                  <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                    Total Measured Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={totalWidth}
                    onChange={(e) => setTotalWidth(e.target.value)}
                    placeholder="2.8"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-civic-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                    Clear Walking Width (m)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={clearWidth}
                    onChange={(e) => setClearWidth(e.target.value)}
                    placeholder="1.4"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-civic-300 bg-white"
                  />
                  {clearWidth && parseFloat(clearWidth) < 2.5 && (
                    <span className="text-[10px] text-red-600 font-bold block mt-1">
                      Deficit: {(2.5 - parseFloat(clearWidth)).toFixed(2)}m below IRC standard
                    </span>
                  )}
                </div>
              </div>

              {/* Universal Design Transitions */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Curb Ramps?</label>
                  <select
                    value={hasCurbRamps}
                    onChange={(e) => setHasCurbRamps(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No (Missing)</option>
                    <option value="null">Unchecked</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Tactile Paving?</label>
                  <select
                    value={hasTactile}
                    onChange={(e) => setHasTactile(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No (Missing)</option>
                    <option value="null">Unchecked</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Surface Quality</label>
                  <select
                    value={surfaceQuality}
                    onChange={(e) => setSurfaceQuality(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  >
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                    <option value="broken">Broken / Void</option>
                  </select>
                </div>
              </div>

              {/* Obstruction checklist */}
              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-2">
                  Observed Obstruction Types
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['e_rickshaw_queue', 'E-Rickshaw Queue Spillover'],
                    ['vendor_spillover', 'Street Vendor / Stall Spillover'],
                    ['parked_vehicles', 'Parked Private Vehicles'],
                    ['utility_pole_box', 'Utility Box / Pole in Pathway'],
                    ['broken_surface', 'Damaged / Open Drain Cover'],
                    ['debris', 'Construction Debris / Waste']
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 p-2 rounded-lg bg-civic-50 hover:bg-civic-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={obstructions.includes(val)}
                        onChange={() => toggleObstruction(val)}
                        className="rounded text-transit-indigo focus:ring-0"
                      />
                      <span className="text-civic-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Field Observer Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note specific bottlenecks, pedestrian curb step-downs, etc."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-civic-300 focus:outline-none focus:ring-2 focus:ring-transit-indigo"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-civic-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-civic-100 hover:bg-civic-200 text-civic-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-transit-indigo hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Audit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
