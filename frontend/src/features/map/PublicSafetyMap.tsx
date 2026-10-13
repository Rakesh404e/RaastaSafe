import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type {
  Station, FootpathSegment, QueueObservation, HazardReport
} from '../../types';
import {
  MapPin, AlertTriangle, Compass, CheckCircle2,
  Navigation, Eye, Filter, Plus, ArrowRight, ShieldAlert,
  Sparkles, Layers
} from 'lucide-react';

// Helper component for smooth map panning
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom, { animate: true });
  return null;
};

// Map click listener for Tap-to-Report mode
const MapClickListener: React.FC<{
  enabled: boolean;
  onMapClick: (lat: number, lng: number) => void;
}> = ({ enabled, onMapClick }) => {
  const map = useMap();
  React.useEffect(() => {
    if (!enabled) return;
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [enabled, map, onMapClick]);
  return null;
};

// Simple custom DivIcons for friendly map pins
const createPinIcon = (color: string, symbol: string) => {
  return L.divIcon({
    className: 'public-map-pin',
    html: `
      <div style="
        background: ${color};
        color: white;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border-radius: 9999px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.15s ease;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

interface PublicSafetyMapProps {
  station: Station | null;
  footpaths: FootpathSegment[];
  queues: QueueObservation[];
  hazards: HazardReport[];
  onReportAtLocation: (lat: number, lng: number) => void;
  onSelectReportToTrack?: (reportId: string) => void;
}

export const PublicSafetyMap: React.FC<PublicSafetyMapProps> = ({
  station,
  footpaths,
  queues,
  hazards,
  onReportAtLocation,
  onSelectReportToTrack
}) => {
  // Center coordinates for Rohini West Metro
  const defaultCenter: [number, number] = station
    ? [station.latitude, station.longitude]
    : [28.71452, 77.11475];

  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState<number>(17);

  // Filter state for public commuters
  const [filterType, setFilterType] = useState<'all' | 'hazards' | 'queues' | 'ramps' | 'gates'>('all');

  // Tap-to-report mode
  const [tapToReportActive, setTapToReportActive] = useState(false);
  const [pendingReportLocation, setPendingReportLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Selected item modal / quick drawer
  const [activeItem, setActiveItem] = useState<{
    type: 'hazard' | 'queue' | 'exit' | 'footpath';
    data: any;
  } | null>(null);

  // Gate presets for quick navigation
  const gatePresets = [
    { name: 'Gate 1 (North-West)', lat: 28.71520, lng: 77.11410, desc: 'Wheelchair Ramp Entry' },
    { name: 'Gate 2 (North-East)', lat: 28.71515, lng: 77.11540, desc: 'E-Rickshaw Feeder Dropoff' },
    { name: 'Gate 3 (South-East)', lat: 28.71390, lng: 77.11530, desc: 'Foot Overbridge Stairs' },
    { name: 'Gate 4 (South-West)', lat: 28.71385, lng: 77.11420, desc: 'Japanese Park Portal' }
  ];

  const handleGateClick = (preset: typeof gatePresets[0]) => {
    setMapCenter([preset.lat, preset.lng]);
    setMapZoom(18);
  };

  const handleResetView = () => {
    setMapCenter(defaultCenter);
    setMapZoom(17);
  };

  const handleMapClicked = (lat: number, lng: number) => {
    setPendingReportLocation({ lat, lng });
  };

  // Filter hazards
  const filteredHazards = hazards.filter(h => {
    if (filterType === 'all') return true;
    if (filterType === 'hazards') return true;
    if (filterType === 'ramps') return h.report_type === 'missing_ramp';
    return false;
  });

  const showQueues = filterType === 'all' || filterType === 'queues';
  const showGates = filterType === 'all' || filterType === 'gates';

  return (
    <div className="space-y-3">
      {/* Top Filter & Action Bar */}
      <div className="bg-white rounded-2xl p-3 border border-civic-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Simple Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-civic-900 text-white shadow-xs'
                : 'bg-civic-100 hover:bg-civic-200 text-civic-700'
            }`}
          >
            All Safety Features ({hazards.length + queues.length})
          </button>

          <button
            onClick={() => setFilterType('hazards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'hazards'
                ? 'bg-metro-red text-white shadow-xs'
                : 'bg-red-50 hover:bg-red-100 text-metro-red'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hazard Reports ({hazards.length})</span>
          </button>

          <button
            onClick={() => setFilterType('queues')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'queues'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>E-Rickshaw Stands ({queues.length})</span>
          </button>

          <button
            onClick={() => setFilterType('ramps')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'ramps'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            <span>♿ Kerb Ramps</span>
          </button>

          <button
            onClick={() => setFilterType('gates')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterType === 'gates'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}
          >
            <span>🚇 Metro Gates</span>
          </button>
        </div>

        {/* Tap Map to Report Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTapToReportActive(!tapToReportActive);
              setPendingReportLocation(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
              tapToReportActive
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-white hover:bg-civic-50 text-civic-800 border border-civic-300'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${tapToReportActive ? 'text-white' : 'text-metro-red'}`} />
            <span>{tapToReportActive ? 'Click on Map...' : 'Tap Map to Report'}</span>
          </button>
        </div>
      </div>

      {/* Tap-to-Report Banner Notification */}
      {tapToReportActive && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold">
              Tap to Report Mode Active: Click anywhere on the map around Rohini West to pin a physical defect.
            </span>
          </div>

          {pendingReportLocation && (
            <button
              onClick={() => onReportAtLocation(pendingReportLocation.lat, pendingReportLocation.lng)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Submit Report at Pinned Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Gate Zoom Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="font-bold text-civic-500 text-[11px] uppercase tracking-wider whitespace-nowrap">
          Quick Gate Focus:
        </span>
        {gatePresets.map((g, idx) => (
          <button
            key={idx}
            onClick={() => handleGateClick(g)}
            className="px-2.5 py-1 bg-white hover:bg-civic-100 border border-civic-200 rounded-lg text-civic-700 font-semibold whitespace-nowrap shadow-2xs"
          >
            {g.name}
          </button>
        ))}
        <button
          onClick={handleResetView}
          className="px-2.5 py-1 bg-civic-200 hover:bg-civic-300 rounded-lg text-civic-800 font-bold whitespace-nowrap"
        >
          Reset View
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-[550px] rounded-3xl overflow-hidden border border-civic-200 shadow-md">
        <MapContainer
          center={defaultCenter}
          zoom={17}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController center={mapCenter} zoom={mapZoom} />
          <MapClickListener enabled={tapToReportActive} onMapClick={handleMapClicked} />

          {/* Pending Report Pin from Map Click */}
          {pendingReportLocation && (
            <Marker
              position={[pendingReportLocation.lat, pendingReportLocation.lng]}
              icon={createPinIcon('#059669', '📍')}
            >
              <Popup>
                <div className="p-1 space-y-2 text-xs">
                  <div className="font-bold text-emerald-800">Pin Dropped Here!</div>
                  <div className="text-[11px] text-civic-600 font-mono">
                    {pendingReportLocation.lat.toFixed(5)}, {pendingReportLocation.lng.toFixed(5)}
                  </div>
                  <button
                    onClick={() => onReportAtLocation(pendingReportLocation.lat, pendingReportLocation.lng)}
                    className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-center"
                  >
                    Open Hazard Report Form
                  </button>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Station Exits / Gates */}
          {showGates && (station?.exits || []).map((exit) => (
            <Marker
              key={exit.id}
              position={[exit.latitude, exit.longitude]}
              icon={createPinIcon('#2563eb', exit.exit_number ? `G${exit.exit_number}` : '🚇')}
              eventHandlers={{
                click: () => setActiveItem({ type: 'exit', data: exit })
              }}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 text-sm">
                    {exit.name}
                  </div>
                  <div className="text-civic-600">
                    Step-Free Ramp: <b>{exit.has_step_free_ramp ? 'Certified ✓' : 'None ✗'}</b>
                  </div>
                  {exit.details && (
                    <div className="text-civic-500 text-[11px]">
                      {exit.details}
                    </div>
                  )}
                  <button
                    onClick={() => onReportAtLocation(exit.latitude, exit.longitude)}
                    className="w-full py-1 bg-civic-100 hover:bg-civic-200 text-civic-800 font-bold rounded text-[11px] mt-1"
                  >
                    + Report Defect at this Gate
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Footpath Polylines (Color-coded by width) */}
          {footpaths.map((fp) => {
            if (!fp.geometry_geojson || !fp.geometry_geojson.coordinates) return null;
            const positions = fp.geometry_geojson.coordinates.map((pt: number[]) => [pt[1], pt[0]] as [number, number]);
            const isCompliant = fp.clear_walking_width_m !== null && fp.clear_walking_width_m >= 2.5;
            const color = isCompliant ? '#059669' : '#dc2626';

            return (
              <Polyline
                key={fp.id}
                positions={positions}
                pathOptions={{
                  color,
                  weight: 5,
                  opacity: 0.85
                }}
                eventHandlers={{
                  click: () => setActiveItem({ type: 'footpath', data: fp })
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="font-bold text-civic-900">{fp.name}</div>
                    <div className="text-civic-600">
                      Clear Width: <b>{fp.clear_walking_width_m ? `${fp.clear_walking_width_m}m` : 'Unverified'}</b> (IRC Std: 2.5m)
                    </div>
                    <div className={`font-bold text-[11px] ${isCompliant ? 'text-emerald-700' : 'text-red-700'}`}>
                      {isCompliant ? '✓ Meets IRC:103-2022' : '⚠ Width Deficit — Crowded'}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          {/* E-Rickshaw Queue Polygons */}
          {showQueues && queues.map((q) => {
            if (!q.location_geojson || !q.location_geojson.coordinates) return null;
            const coords = q.location_geojson.coordinates;
            const lat = typeof coords[1] === 'number' ? coords[1] : (coords as number[][])[0][1];
            const lng = typeof coords[0] === 'number' ? coords[0] : (coords as number[][])[0][0];

            return (
              <Marker
                key={q.id}
                position={[lat, lng]}
                icon={createPinIcon('#d97706', '🛺')}
                eventHandlers={{
                  click: () => setActiveItem({ type: 'queue', data: q })
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs">
                    <div className="font-bold text-amber-900">
                      E-Rickshaw Feeder Stand
                    </div>
                    <div className="text-civic-700">
                      Peak Queue: <b>{q.vehicle_count} vehicles</b> (~{q.queue_length_m}m)
                    </div>
                    <div className="text-civic-600">
                      Avg Commuter Wait: <b>{q.avg_wait_time_min ? `${q.avg_wait_time_min} mins` : 'N/A'}</b>
                    </div>
                    {q.enters_walking_zone && (
                      <div className="text-red-700 font-bold text-[11px] bg-red-50 p-1 rounded">
                        ⚠ Spills into pedestrian corridor
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {filteredHazards.map((h) => {
            const isCritical = h.severity === 'critical' || h.severity === 'high';
            const pinColor = isCritical ? '#dc2626' : '#d97706';
            const iconSymbol = h.report_type === 'missing_ramp' ? '♿' : '⚠';

            return (
              <Marker
                key={h.id}
                position={[h.latitude, h.longitude]}
                icon={createPinIcon(pinColor, iconSymbol)}
                eventHandlers={{
                  click: () => setActiveItem({ type: 'hazard', data: h })
                }}
              >
                <Popup>
                  <div className="p-1 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-civic-500 bg-civic-100 px-1.5 py-0.5 rounded">
                        {h.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        h.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'verified'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {h.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="font-bold text-civic-900">
                      {h.title}
                    </div>

                    <p className="text-[11px] text-civic-600 line-clamp-2">
                      {h.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-civic-100 text-[11px]">
                      <span className="capitalize font-semibold text-metro-red">
                        {h.severity} Severity
                      </span>
                      {onSelectReportToTrack && (
                        <button
                          onClick={() => onSelectReportToTrack(h.id)}
                          className="text-transit-indigo font-bold hover:underline"
                        >
                          Track Status &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Quick Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-civic-200 shadow-md text-xs space-y-1.5 pointer-events-auto">
          <span className="font-bold text-civic-800 uppercase tracking-wider text-[10px] block">
            Map Legend
          </span>
          <div className="flex flex-col gap-1 text-[11px] text-civic-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
              <span>Reported Pedestrian Barrier</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>E-Rickshaw Feeder Queue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>Metro Station Gate (1-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-emerald-600 inline-block" />
              <span>Wide Safe Path ( $\ge$ 2.5m )</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-red-600 inline-block" />
              <span>Footpath Width Deficit</span>
            </div>
          </div>
        </div>

        {/* Selected Item Floating Inspector Card (Bottom Right) */}
        {activeItem && (
          <div className="absolute bottom-4 right-4 z-20 max-w-xs w-full bg-white rounded-2xl p-4 border border-civic-200 shadow-xl space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-civic-500 uppercase tracking-wider">
                {activeItem.type.toUpperCase()} INSPECTION
              </span>
              <button
                onClick={() => setActiveItem(null)}
                className="text-civic-400 hover:text-civic-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {activeItem.type === 'hazard' && (
              <>
                <div className="font-bold text-sm text-civic-900">
                  {activeItem.data.title}
                </div>
                <div className="text-civic-600 text-[11px]">
                  {activeItem.data.description}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-civic-100">
                  <span className="font-mono text-[10px] bg-civic-100 px-2 py-0.5 rounded">
                    {activeItem.data.id}
                  </span>
                  <span className="capitalize font-bold text-metro-red">
                    {activeItem.data.severity}
                  </span>
                </div>
              </>
            )}

            {activeItem.type === 'queue' && (
              <>
                <div className="font-bold text-sm text-amber-900">
                  E-Rickshaw Stand
                </div>
                <div className="text-civic-700 text-[11px]">
                  {activeItem.data.vehicle_count} rickshaws in queue • {activeItem.data.queue_length_m}m line
                </div>
                <div className="text-civic-600 text-[11px]">
                  Avg passenger boarding wait: <b>{activeItem.data.avg_wait_time_min || 4.5} mins</b>
                </div>
              </>
            )}

            {activeItem.type === 'exit' && (
              <>
                <div className="font-bold text-sm text-blue-900">
                  {activeItem.data.name}
                </div>
                <div className="text-civic-700 text-[11px]">
                  Ramp: {activeItem.data.has_step_free_ramp ? 'Certified ✓' : 'None'} • {activeItem.data.details || 'Gate Entrance'}
                </div>
              </>
            )}

            {activeItem.type === 'footpath' && (
              <>
                <div className="font-bold text-sm text-civic-900">
                  {activeItem.data.name}
                </div>
                <div className="text-civic-700 text-[11px]">
                  Clear width: <b>{activeItem.data.clear_walking_width_m}m</b> (Standard: 2.5m)
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
