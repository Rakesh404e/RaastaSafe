import React, { useState } from 'react';
import type { QueueObservation, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  Compass, Plus, Clock, Users, AlertTriangle,
  Info, CheckCircle2, ShieldCheck
} from 'lucide-react';

interface QueueTabProps {
  queues: QueueObservation[];
  onRefresh: () => void;
  userRole: UserRole;
}

export const QueueTab: React.FC<QueueTabProps> = ({ queues, onRefresh, userRole }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicleCount, setVehicleCount] = useState<string>('20');
  const [queueLength, setQueueLength] = useState<string>('55');
  const [timeWindow, setTimeWindow] = useState('morning_peak');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:30');
  const [entersWalkingZone, setEntersWalkingZone] = useState(true);
  const [entersCrossing, setEntersCrossing] = useState(true);
  const [entersCarriageway, setEntersCarriageway] = useState(true);
  const [avgWaitTime, setAvgWaitTime] = useState<string>('4.5');
  const [conflictDesc, setConflictDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        station_id: 1,
        location_geojson: {
          type: 'Point',
          coordinates: [77.1154, 28.7152]
        },
        start_time: startTime,
        end_time: endTime,
        time_window: timeWindow,
        vehicle_count: parseInt(vehicleCount) || 0,
        queue_length_m: parseFloat(queueLength) || 0,
        enters_walking_zone: entersWalkingZone,
        enters_crossing: entersCrossing,
        enters_cycle_lane: false,
        enters_carriageway: entersCarriageway,
        enters_metro_entrance: false,
        avg_wait_time_min: avgWaitTime ? parseFloat(avgWaitTime) : undefined,
        wait_time_method: 'Sample of 10 passenger boardings',
        nearby_marked_stand: 'no',
        conflict_description: conflictDesc || 'Queue occupies footpath apron and blocks curb ramp access.',
        observer_confidence: 'high'
      };

      await api.createQueue(payload);
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error recording queue observation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-civic-900">E-Rickshaw Feeder Queue Observations</h2>
          <p className="text-xs text-civic-500 mt-0.5">
            Documenting last-mile staging space, passenger boarding queues, and pedestrian corridor spillovers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Record Queue Observation
        </button>
      </div>

      {/* WRI Research Grounding Card */}
      <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs space-y-2">
        <div className="font-bold text-sm flex items-center gap-2 text-indigo-900">
          <Compass className="w-4 h-4 text-transit-indigo" />
          Research Framing: WRI India (2023) Metro Access Evidence
        </div>
        <p className="leading-relaxed">
          E-rickshaws provide zero-emission, low-cost last-mile transit indispensable to Rohini's metro ridership.
          Banning them increases commuter costs and private vehicle use. The engineering objective is to
          <b> separate pedestrian corridors from vehicle waiting pockets</b> by designating organized curbside staging bays
          within 100m of station exits (IRC:103-2022 Cl. 12.1).
        </p>
      </div>

      {/* Queues Table */}
      <div className="bg-white rounded-2xl border border-civic-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-civic-50 text-civic-600 font-bold uppercase tracking-wider border-b border-civic-200">
              <tr>
                <th className="py-3 px-4">Observation Window</th>
                <th className="py-3 px-4">Vehicles Counted</th>
                <th className="py-3 px-4">Queue Length</th>
                <th className="py-3 px-4">Passenger Wait</th>
                <th className="py-3 px-4">Walkway Spillover</th>
                <th className="py-3 px-4">Crossing Spillover</th>
                <th className="py-3 px-4">Conflict Description</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-civic-100">
              {queues.map((q) => (
                <tr key={q.id} className="hover:bg-civic-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-civic-900">
                    <span className="capitalize">{q.time_window.replace('_', ' ')}</span>
                    <span className="text-civic-400 block text-[11px] font-mono">
                      {q.start_time} - {q.end_time}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-transit-indigo">
                    {q.vehicle_count} vehicles
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-civic-800">
                    {q.queue_length_m} m
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {q.avg_wait_time_min ? `${q.avg_wait_time_min} mins` : 'Unsampled'}
                  </td>
                  <td className="py-3 px-4">
                    {q.enters_walking_zone ? (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                        ⚠ Enters Path
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Clear
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {q.enters_crossing ? (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                        ⚠ Blocks Crossing
                      </span>
                    ) : (
                      <span className="text-civic-400 text-[11px]">No overlap</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs text-civic-700">
                    {q.conflict_description}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase font-mono">
                      {q.verification_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW QUEUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-civic-950/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-civic-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-civic-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Record E-Rickshaw Queue</h3>
                <p className="text-xs text-civic-400">Peak / Off-Peak Last-Mile Staging Sample</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-civic-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateQueue} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Time Window</label>
                  <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  >
                    <option value="morning_peak">Morning Peak</option>
                    <option value="evening_peak">Evening Peak</option>
                    <option value="off_peak">Off-Peak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Vehicles in Queue</label>
                  <input
                    type="number"
                    required
                    value={vehicleCount}
                    onChange={(e) => setVehicleCount(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Queue Length (m)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={queueLength}
                    onChange={(e) => setQueueLength(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-civic-700 mb-1">Avg Wait (mins)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={avgWaitTime}
                    onChange={(e) => setAvgWaitTime(e.target.value)}
                    className="w-full p-2 border border-civic-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Spillover checkboxes */}
              <div className="p-3 bg-civic-50 rounded-xl border border-civic-200 text-xs space-y-2">
                <span className="font-bold text-civic-800 block">Corridor Intrusion Points</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entersWalkingZone}
                    onChange={(e) => setEntersWalkingZone(e.target.checked)}
                    className="rounded text-transit-indigo"
                  />
                  <span>Queue vehicles spill into clear pedestrian walking corridor</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entersCrossing}
                    onChange={(e) => setEntersCrossing(e.target.checked)}
                    className="rounded text-transit-indigo"
                  />
                  <span>Queue blocks pedestrian zebra crossing or sightlines</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entersCarriageway}
                    onChange={(e) => setEntersCarriageway(e.target.checked)}
                    className="rounded text-transit-indigo"
                  />
                  <span>Queue overflows into main roadway carriageway</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-civic-700 uppercase mb-1">
                  Conflict Notes
                </label>
                <textarea
                  rows={2}
                  value={conflictDesc}
                  onChange={(e) => setConflictDesc(e.target.value)}
                  placeholder="Describe boarding conflict, curb ramp blockage, or traffic bottleneck..."
                  className="w-full p-2 text-xs border border-civic-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-civic-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-civic-100 text-civic-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-transit-indigo text-white text-xs font-semibold rounded-lg"
                >
                  {submitting ? 'Saving...' : 'Save Queue Sample'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
