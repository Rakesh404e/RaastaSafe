import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type {
  Station, FootpathSegment, QueueObservation, HazardReport,
  CrashContext, MMIScenario
} from '../../types';
import {
  Layers, Filter, Eye, AlertTriangle, Compass, CheckCircle2,
  X, Info, ExternalLink, ShieldCheck
} from 'lucide-react';

// Custom Map Center Recenter component
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Create custom colored DivIcon for markers
const createCustomIcon = (bgColor: string, text: string) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
        border-radius: 9999px;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 11px;
      ">
        ${text}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

interface InteractiveMapTabProps {
  station: Station | null;
  footpaths: FootpathSegment[];
  queues: QueueObservation[];
  hazards: HazardReport[];
  crashes: CrashContext[];
  scenarios: MMIScenario[];
  onOpenAuditModal: () => void;
  onOpenReportModal: () => void;
}

export const InteractiveMapTab: React.FC<InteractiveMapTabProps> = ({
  station,
  footpaths,
  queues,
  hazards,
  crashes,
  scenarios,
  onOpenAuditModal,
  onOpenReportModal
}) => {
  // Layer visibility toggles
  const [showCatchments, setShowCatchments] = useState(true);
  const [showExits, setShowExits] = useState(true);
  const [showFootpaths, setShowFootpaths] = useState(true);
  const [showQueues, setShowQueues] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showCrashes, setShowCrashes] = useState(true);
  const [showScenarios, setShowScenarios] = useState(true);

  // Inspector sidebar state
  const [selectedFeature, setSelectedFeature] = useState<{
    type: 'segment' | 'hazard' | 'queue' | 'exit' | 'crash' | 'scenario_zone';
    data: any;
  } | null>(null);

  const defaultCenter: [number, number] = station
    ? [station.latitude, station.longitude]
    : [28.71452, 77.11475];

  // Helper to color footpath by IRC compliance
  const getSegmentColor = (seg: FootpathSegment) => {
    if (seg.clear_walking_width_m === null) return '#94a3b8'; // slate (unmeasured)
    if (seg.clear_walking_width_m >= 2.5) return '#059669'; // emerald (compliant)
    if (seg.clear_walking_width_m >= 1.8) return '#d97706'; // amber (moderate deficit)
    return '#dc2626'; // red (severe deficit / blocked)
  };

  const getHazardColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#e11d48';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#64748b';
    }
  };

  return (
    <div className="relative h-[calc(100vh-140px)] min-h-[580px] rounded-3xl overflow-hidden border border-civic-200 shadow-lg flex flex-col md:flex-row">
      {/* Map Control Bar & Layer Toggles (Floating Top Left) */}
      <div className="absolute top-4 left-4 z-20 max-w-sm w-full bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-civic-200 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-transit-indigo" />
            <span className="text-xs font-bold text-civic-900 uppercase tracking-wide">
              Station GIS Layers
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-civic-100 text-civic-600">
            {station?.code || 'RWST'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showFootpaths}
              onChange={(e) => setShowFootpaths(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Footpaths ({footpaths.length})</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showQueues}
              onChange={(e) => setShowQueues(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Queues ({queues.length})</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showHazards}
              onChange={(e) => setShowHazards(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Hazards ({hazards.length})</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showExits}
              onChange={(e) => setShowExits(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Gates ({station?.exits?.length || 4})</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showScenarios}
              onChange={(e) => setShowScenarios(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>MMI Zones</span>
          </label>

          <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showCrashes}
              onChange={(e) => setShowCrashes(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Crash Zones</span>
          </label>

          <label className="col-span-2 flex items-center gap-2 p-1.5 rounded-lg hover:bg-civic-50 cursor-pointer font-medium text-civic-700">
            <input
              type="checkbox"
              checked={showCatchments}
              onChange={(e) => setShowCatchments(e.target.checked)}
              className="rounded text-transit-indigo focus:ring-0"
            />
            <span>Catchment Envelopes (500m & 800m)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-civic-100 flex gap-2">
          <button
            onClick={onOpenAuditModal}
            className="flex-1 py-1.5 px-2 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold text-[11px] rounded-lg text-center transition-colors shadow-sm"
          >
            + Audit Footpath
          </button>
          <button
            onClick={onOpenReportModal}
            className="flex-1 py-1.5 px-2 bg-metro-red hover:bg-red-700 text-white font-semibold text-[11px] rounded-lg text-center transition-colors shadow-sm"
          >
            + Report Hazard
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 h-full w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <ChangeView center={defaultCenter} zoom={16} />

          {/* OpenStreetMap Tile Layer with Required ODbL Attribution */}
          <TileLayer
            attribution='Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ODbL 1.0'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Station Catchment Circles */}
          {showCatchments && (
            <>
              {/* 500m Audit Scope (IRC Clause 12.1 Station-Area Priority Zone) */}
              <Circle
                center={defaultCenter}
                radius={500}
                pathOptions={{
                  color: '#4f46e5',
                  weight: 2,
                  dashArray: '6, 6',
                  fillColor: '#4f46e5',
                  fillOpacity: 0.04
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <b>500m Priority Pedestrian Boundary</b><br />
                    IRC:103-2022 Chapter 12 recommends prioritising walking, cycling, and IPT staging within 500m of transit stations.
                  </div>
                </Popup>
              </Circle>

              {/* 800m Macro Walk Access Envelope (Bivina et al. 2019 Delhi Study) */}
              <Circle
                center={defaultCenter}
                radius={800}
                pathOptions={{
                  color: '#0d9488',
                  weight: 1.5,
                  dashArray: '4, 8',
                  fillColor: '#0d9488',
                  fillOpacity: 0.02
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <b>800m Walk Access Catchment Envelope</b><br />
                    Bivina, Gupta & Parida (2019) Delhi Metro walk accessibility boundary.
                  </div>
                </Popup>
              </Circle>
            </>
          )}

          {/* Station Exits Markers */}
          {showExits && station?.exits?.map((exit) => (
            <Marker
              key={`exit-${exit.id}`}
              position={[exit.latitude, exit.longitude]}
              icon={createCustomIcon('#dc2626', exit.exit_number)}
              eventHandlers={{
                click: () => setSelectedFeature({ type: 'exit', data: exit })
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-civic-900">{exit.name}</div>
                  <div className="text-civic-600">{exit.details}</div>
                  <div className="flex gap-2 pt-1 font-semibold text-[10px]">
                    <span className={exit.has_step_free_ramp ? 'text-emerald-700' : 'text-red-600'}>
                      {exit.has_step_free_ramp ? '✓ Step-free Ramp' : '✗ No Ramp'}
                    </span>
                    <span className={exit.has_tactile_paving ? 'text-emerald-700' : 'text-red-600'}>
                      {exit.has_tactile_paving ? '✓ Tactile Paving' : '✗ No Tactile'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Footpath Segments */}
          {showFootpaths && footpaths.map((seg) => {
            const coords = seg.geometry_geojson.coordinates.map(
              ([lng, lat]) => [lat, lng] as [number, number]
            );
            return (
              <Polyline
                key={`seg-${seg.id}`}
                positions={coords}
                pathOptions={{
                  color: getSegmentColor(seg),
                  weight: 6,
                  opacity: 0.85
                }}
                eventHandlers={{
                  click: () => setSelectedFeature({ type: 'segment', data: seg })
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-civic-900">{seg.name}</div>
                    <div>
                      Clear Width: <b>{seg.clear_walking_width_m ? `${seg.clear_walking_width_m}m` : 'Unmeasured'}</b>
                      {seg.clear_walking_width_m && seg.clear_walking_width_m < 2.5 && (
                        <span className="text-red-600 font-bold ml-1">
                          (Deficit: {(2.5 - seg.clear_walking_width_m).toFixed(2)}m)
                        </span>
                      )}
                    </div>
                    <div className="text-civic-500 text-[11px]">
                      Obstructions: {seg.obstruction_types.join(', ') || 'None observed'}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* Queue Observations */}
          {showQueues && queues.map((q) => {
            const coords = Array.isArray(q.location_geojson.coordinates[0])
              ? [q.location_geojson.coordinates[0][1], q.location_geojson.coordinates[0][0]] as [number, number]
              : [q.location_geojson.coordinates[1], q.location_geojson.coordinates[0]] as [number, number];

            return (
              <Marker
                key={`queue-${q.id}`}
                position={coords}
                icon={createCustomIcon('#4f46e5', 'E')}
                eventHandlers={{
                  click: () => setSelectedFeature({ type: 'queue', data: q })
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-transit-indigo">
                      E-Rickshaw Queue ({q.vehicle_count} vehicles, {q.queue_length_m}m)
                    </div>
                    <div className="text-civic-600">{q.conflict_description}</div>
                    <div className="text-[11px] font-semibold text-amber-700">
                      {q.enters_walking_zone ? '⚠ Spills into pedestrian clear zone' : 'Contained'}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Citizen Hazard Reports */}
          {showHazards && hazards.map((h) => (
            <Marker
              key={`hazard-${h.id}`}
              position={[h.latitude, h.longitude]}
              icon={createCustomIcon(getHazardColor(h.severity), '!')}
              eventHandlers={{
                click: () => setSelectedFeature({ type: 'hazard', data: h })
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-civic-900">{h.title}</div>
                  <div className="text-civic-600">{h.description}</div>
                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="font-semibold uppercase text-red-600">{h.severity}</span>
                    <span className="px-2 py-0.5 rounded bg-civic-100 text-civic-600 uppercase font-mono">
                      {h.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Proposed MMI Scenario Zones */}
          {showScenarios && scenarios.map((scen) =>
            scen.zones.map((zone) => {
              const polyCoords = zone.geometry_geojson.coordinates[0].map(
                ([lng, lat]) => [lat, lng] as [number, number]
              );
              const isFeederBay = zone.zone_type === 'erickshaw_stand';
              return (
                <Polygon
                  key={`zone-${zone.id}`}
                  positions={polyCoords}
                  pathOptions={{
                    color: isFeederBay ? '#4f46e5' : '#059669',
                    weight: 2,
                    dashArray: '4, 4',
                    fillColor: isFeederBay ? '#4f46e5' : '#059669',
                    fillOpacity: 0.25
                  }}
                  eventHandlers={{
                    click: () => setSelectedFeature({ type: 'scenario_zone', data: zone })
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-transit-indigo">{zone.name}</div>
                      <div>Type: {zone.zone_type.replace('_', ' ').toUpperCase()}</div>
                      <div>Candidate Capacity: {zone.candidate_capacity} vehicles / stalls</div>
                      <div className="text-[10px] text-amber-600 font-semibold">
                        Planning Concept — Field verification required
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })
          )}

          {/* Official Crash Context (Macro Blackspot Circles) */}
          {showCrashes && crashes.map((c) => (
            <Circle
              key={`crash-${c.id}`}
              center={[c.latitude, c.longitude]}
              radius={c.buffer_radius_m}
              pathOptions={{
                color: '#be123c',
                weight: 1.5,
                dashArray: '8, 8',
                fillColor: '#be123c',
                fillOpacity: 0.12
              }}
              eventHandlers={{
                click: () => setSelectedFeature({ type: 'crash', data: c })
              }}
            >
              <Popup>
                <div className="text-xs space-y-1">
                  <div className="font-bold text-red-900">{c.name}</div>
                  <div className="text-red-700 font-semibold">
                    Official Crash Prone Zone (Delhi Traffic Police)
                  </div>
                  <div>
                    Fatal crashes: {c.fatal_crashes_count} | Total: {c.total_crashes_count} ({c.reporting_period})
                  </div>
                  <div className="text-[10px] text-civic-500 italic">
                    Macro junction circle standard (500m). Not synthesized micro-points.
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {/* Feature Inspector Sidebar (Collapsible on Selection) */}
      {selectedFeature && (
        <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-civic-200 p-5 overflow-y-auto z-20 shadow-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-civic-100 pb-3">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-civic-100 text-civic-700">
                {selectedFeature.type.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-civic-400 hover:text-civic-900 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEGMENT INSPECTOR */}
            {selectedFeature.type === 'segment' && (
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-civic-900">
                  {selectedFeature.data.name}
                </h3>
                <div className="text-xs text-civic-500">
                  Street: {selectedFeature.data.street_name} ({selectedFeature.data.side_of_street} side)
                </div>

                <div className="grid grid-cols-2 gap-2 bg-civic-50 p-3 rounded-xl border border-civic-200/60 text-xs">
                  <div>
                    <span className="text-civic-500 block">Total Width</span>
                    <span className="font-bold text-civic-900">
                      {selectedFeature.data.total_width_m ? `${selectedFeature.data.total_width_m} m` : 'Unmeasured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Clear Walk Width</span>
                    <span className={`font-bold ${selectedFeature.data.clear_walking_width_m < 2.5 ? 'text-red-600' : 'text-emerald-700'}`}>
                      {selectedFeature.data.clear_walking_width_m ? `${selectedFeature.data.clear_walking_width_m} m` : 'Unmeasured'}
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Surface State</span>
                    <span className="font-bold capitalize text-civic-800">
                      {selectedFeature.data.surface_quality}
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">IRC 2.5m Deficit</span>
                    <span className="font-bold text-red-600">
                      {selectedFeature.data.clear_walking_width_m ? `${Math.max(0, 2.5 - selectedFeature.data.clear_walking_width_m).toFixed(2)} m` : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-civic-700 block">Active Obstructions</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeature.data.obstruction_types?.length > 0 ? (
                      selectedFeature.data.obstruction_types.map((obs: string) => (
                        <span key={obs} className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-medium text-[11px] border border-red-200">
                          {obs.replace('_', ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-civic-500 italic">None observed</span>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-civic-700 block">Observer Field Notes</span>
                  <p className="text-civic-600 bg-civic-50 p-2.5 rounded-lg border border-civic-200/60 leading-relaxed">
                    {selectedFeature.data.observer_notes || 'No field notes attached.'}
                  </p>
                </div>

                <div className="text-[11px] text-civic-400 font-mono">
                  Provenance: {selectedFeature.data.provenance} | Status: {selectedFeature.data.verification_status}
                </div>
              </div>
            )}

            {/* HAZARD INSPECTOR */}
            {selectedFeature.type === 'hazard' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${
                    selectedFeature.data.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                  }`}>
                    {selectedFeature.data.severity} Severity
                  </span>
                  <span className="text-xs text-civic-500 font-mono">
                    ID: {selectedFeature.data.id}
                  </span>
                </div>

                <h3 className="font-bold text-base text-civic-900">
                  {selectedFeature.data.title}
                </h3>

                <p className="text-xs text-civic-600 bg-civic-50 p-3 rounded-xl border border-civic-200/60 leading-relaxed">
                  {selectedFeature.data.description}
                </p>

                <div className="text-xs bg-civic-50 p-3 rounded-xl border border-civic-200/60 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-civic-500">Report Category:</span>
                    <span className="font-semibold text-civic-800">{selectedFeature.data.report_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-civic-500">Verification Status:</span>
                    <span className="font-semibold text-emerald-700 uppercase">{selectedFeature.data.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-civic-500">Reporter:</span>
                    <span className="font-semibold text-civic-800 capitalize">{selectedFeature.data.reporter_type}</span>
                  </div>
                </div>

                {selectedFeature.data.reviewer_notes && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-civic-700 block">Reviewer Notes</span>
                    <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                      {selectedFeature.data.reviewer_notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* QUEUE INSPECTOR */}
            {selectedFeature.type === 'queue' && (
              <div className="space-y-3">
                <h3 className="font-bold text-base text-civic-900">
                  E-Rickshaw Feeder Queue Observation
                </h3>
                <div className="grid grid-cols-2 gap-2 bg-civic-50 p-3 rounded-xl border border-civic-200/60 text-xs">
                  <div>
                    <span className="text-civic-500 block">Vehicles in Line</span>
                    <span className="font-bold text-civic-900">{selectedFeature.data.vehicle_count}</span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Queue Length</span>
                    <span className="font-bold text-civic-900">{selectedFeature.data.queue_length_m} m</span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Time Window</span>
                    <span className="font-bold text-civic-900 capitalize">{selectedFeature.data.time_window.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Avg Wait Sample</span>
                    <span className="font-bold text-civic-900">{selectedFeature.data.avg_wait_time_min ? `${selectedFeature.data.avg_wait_time_min} mins` : 'Unsampled'}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-bold text-civic-700 block">Observed Conflict</span>
                  <p className="text-civic-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-relaxed text-amber-900">
                    {selectedFeature.data.conflict_description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-civic-200 mt-4">
            <button
              onClick={() => setSelectedFeature(null)}
              className="w-full py-2 bg-civic-100 hover:bg-civic-200 text-civic-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
