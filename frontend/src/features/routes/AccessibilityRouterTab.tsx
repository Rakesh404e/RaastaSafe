import React, { useState } from 'react';
import type { RouteResult } from '../../types';
import { api } from '../../services/api';
import { Navigation, AlertTriangle, Compass } from 'lucide-react';

export const AccessibilityRouterTab: React.FC = () => {
  const [startPoint, setStartPoint] = useState('gate_1');
  const [endPoint, setEndPoint] = useState('park_gate');
  const [preferStepFree, setPreferStepFree] = useState(true);
  const [minWidth, setMinWidth] = useState<string>('2.0');
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);

  const landmarks: Record<string, { name: string; lat: number; lng: number }> = {
    gate_1: { name: 'Gate 1 (North-West / Ramp Entrance)', lat: 28.71520, lng: 77.11410 },
    gate_2: { name: 'Gate 2 (North-East / Sector 9 Feeder)', lat: 28.71515, lng: 77.11540 },
    gate_3: { name: 'Gate 3 (South-East / Foot Overbridge Stairs)', lat: 28.71390, lng: 77.11530 },
    gate_4: { name: 'Gate 4 (South-West Portal)', lat: 28.71385, lng: 77.11420 },
    park_gate: { name: 'Swarn Jayanti Park (Japanese Park)', lat: 28.71650, lng: 77.11350 },
    sec_9_bus: { name: 'Sector 9 Feeder Junction', lat: 28.71610, lng: 77.11570 }
  };

  const handlePlanRoute = async () => {
    setLoading(true);
    try {
      const start = landmarks[startPoint];
      const end = landmarks[endPoint];

      const res = await api.planRoute({
        station_id: 1,
        start_lat: start.lat,
        start_lng: start.lng,
        end_lat: end.lat,
        end_lng: end.lng,
        prefer_step_free: preferStepFree,
        min_clear_width_m: minWidth ? parseFloat(minWidth) : undefined
      });
      setRouteResult(res);
    } catch (err: any) {
      alert(err.message || 'Error computing pedestrian route');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-bold text-civic-900">
          Accessible Pedestrian Route Graph & Wayfinding
        </h2>
        <p className="text-xs text-civic-500 mt-0.5">
          Dijkstra routing engine over verified station pedestrian edges with step-free / wheelchair constraints.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ROUTER CONTROLS (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-civic-800 uppercase tracking-wide">
            Route Preferences & Endpoints
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-civic-700 mb-1">Origin (Station Gate / Landmark)</label>
              <select
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="w-full p-2.5 border border-civic-300 rounded-xl font-medium"
              >
                {Object.entries(landmarks).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-civic-700 mb-1">Destination</label>
              <select
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                className="w-full p-2.5 border border-civic-300 rounded-xl font-medium"
              >
                {Object.entries(landmarks).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="p-3.5 bg-civic-50 rounded-2xl border border-civic-200/80 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-civic-800">
                <input
                  type="checkbox"
                  checked={preferStepFree}
                  onChange={(e) => setPreferStepFree(e.target.checked)}
                  className="rounded text-transit-indigo focus:ring-0"
                />
                <span>Wheelchair / Step-Free Mode (Bypass Stairs & Drops)</span>
              </label>

              <div>
                <span className="text-civic-500 block mb-1">Min Clear Walking Width Filter (m)</span>
                <input
                  type="number"
                  step="0.1"
                  value={minWidth}
                  onChange={(e) => setMinWidth(e.target.value)}
                  placeholder="2.0"
                  className="w-full p-2 border border-civic-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <button
              onClick={handlePlanRoute}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {loading ? 'Routing...' : 'Calculate Accessible Path'}
            </button>
          </div>
        </div>

        {/* ROUTE RESULT (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {routeResult ? (
            <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-civic-100 pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs text-civic-500 font-bold uppercase tracking-wider">Computed Route</div>
                  <div className="text-2xl font-extrabold text-civic-900">
                    {routeResult.total_distance_m} meters
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 ${
                  routeResult.step_free_certified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {routeResult.step_free_certified ? '✓ Step-Free Certified' : '⚠ Caution: Barriers'}
                </span>
              </div>

              {routeResult.warning_message && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{routeResult.warning_message}</div>
                </div>
              )}

              {/* Step by Step Navigation */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-civic-800 uppercase tracking-wide">
                  Step-by-Step Navigation ({routeResult.steps.length} segments)
                </span>
                <div className="space-y-2">
                  {routeResult.steps.map((st) => (
                    <div
                      key={st.step_index}
                      className="p-3.5 rounded-2xl bg-civic-50 border border-civic-200/80 text-xs flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-transit-indigo text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {st.step_index}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-civic-900">{st.instruction}</div>
                        <div className="flex gap-3 text-[11px] text-civic-500">
                          <span>Distance: <b>{st.distance_m}m</b></span>
                          <span>Clear Width: <b>{st.clear_walking_width_m ? `${st.clear_walking_width_m}m` : 'Unverified'}</b></span>
                        </div>
                        {st.barrier_warning && (
                          <div className="text-red-700 font-semibold text-[11px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> {st.barrier_warning}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-civic-200 shadow-sm text-center text-civic-500 text-xs space-y-2">
              <Compass className="w-8 h-8 text-civic-300 mx-auto" />
              <div>Select origin and destination to compute accessible path.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
