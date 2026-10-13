import React, { useState } from 'react';
import type {
  Station, FootpathSegment, QueueObservation, HazardReport,
  CrashContext, MMIScenario, UserRole
} from '../../types';
import { PublicReportTab } from '../reports/PublicReportTab';
import { PublicSafetyMap } from '../map/PublicSafetyMap';
import { TrackReportSection } from './TrackReportSection';
import { PublicSurveySection } from './PublicSurveySection';
import {
  AlertTriangle, Map, Star, Search,
  ArrowRight, MapPin, CheckCircle2
} from 'lucide-react';

interface PublicPortalViewProps {
  station: Station | null;
  footpaths: FootpathSegment[];
  queues: QueueObservation[];
  hazards: HazardReport[];
  crashes: CrashContext[];
  scenarios: MMIScenario[];
  userRole: UserRole;
  onRefresh: () => void;
  onSwitchToAuthority: () => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  station,
  footpaths,
  queues,
  hazards,
  userRole,
  onRefresh,
  onSwitchToAuthority
}) => {
  // 4 Clean, essential tabs for the public commuter:
  // 1. report (Report Hazard)
  // 2. map (Safety & Hazard Map)
  // 3. survey (1-Min Walkability Pulse)
  // 4. track (Track Reports)
  const [activePublicTab, setActivePublicTab] = useState<'report' | 'map' | 'survey' | 'track'>('report');

  // Pre-filled location if citizen clicked "Tap on Map to Report"
  const [pinnedLocationForReport, setPinnedLocationForReport] = useState<{ lat: number; lng: number } | null>(null);

  const publicTabs = [
    {
      id: 'report' as const,
      label: 'Report a Hazard',
      icon: AlertTriangle,
      badge: '1-Min',
      color: 'text-metro-red'
    },
    {
      id: 'map' as const,
      label: 'Safety & Hazard Map',
      icon: Map,
      badge: 'Live',
      color: 'text-transit-indigo'
    },
    {
      id: 'survey' as const,
      label: '1-Min Walkability Pulse',
      icon: Star,
      color: 'text-amber-500'
    },
    {
      id: 'track' as const,
      label: 'Track Reports',
      icon: Search,
      badge: `${hazards.length}`,
      color: 'text-purple-600'
    }
  ];

  const resolvedCount = hazards.filter(h => h.status === 'resolved' || h.status === 'verified').length;

  const handleReportAtLocation = (lat: number, lng: number) => {
    setPinnedLocationForReport({ lat, lng });
    setActivePublicTab('report');
  };

  return (
    <div className="space-y-6">
      {/* Friendly Citizen Hero Banner */}
      <div className="bg-gradient-to-br from-civic-900 via-civic-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-metro-red/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-transit-indigo/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Nagrik Portal • Rohini West Metro
              </span>
              <span className="px-2.5 py-0.5 bg-metro-red/80 rounded-full text-[10px] font-bold tracking-wide uppercase">
                Red Line Transit Node
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Safer Walkways. Transparent Action.
            </h1>
            <p className="text-xs sm:text-sm text-civic-200 leading-relaxed">
              Real-time pedestrian safety guide for <b>Rohini West Metro Station</b>. Report broken pavers, missing ramps, or e-rickshaw queue bottlenecks, and track municipal repairs directly.
            </p>
          </div>

          {/* Quick Switch to Authority Banner */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px] self-stretch lg:self-auto">
            <div>
              <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider">
                Authority & Planning Side
              </div>
              <div className="text-xs font-semibold text-white mt-0.5">
                MCD, DMRC & UTTIPEC Console
              </div>
              <p className="text-[11px] text-civic-300 mt-1">
                Access IRC:103 audits, feeder queue modeling, and duplicate moderation.
              </p>
            </div>
            <button
              onClick={onSwitchToAuthority}
              className="w-full py-2 px-3 bg-white hover:bg-civic-50 text-civic-900 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 group"
            >
              <span>Open Authority Console</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[10px] text-civic-300 block">Station Portals</span>
            <span className="text-base font-extrabold text-white">4 Active Gates</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[10px] text-civic-300 block">Wheelchair Ramp</span>
            <span className="text-base font-extrabold text-emerald-400">Gate 1 Certified</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[10px] text-civic-300 block">Total Reports Logged</span>
            <span className="text-base font-extrabold text-white">{hazards.length} Community Reports</span>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <span className="text-[10px] text-civic-300 block">Reviewed & Verified</span>
            <span className="text-base font-extrabold text-indigo-300">{resolvedCount} Verified / In Action</span>
          </div>
        </div>
      </div>

      {/* Public Navigation Pills (4 focused tabs) */}
      <div className="bg-white rounded-2xl p-2 border border-civic-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          {publicTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePublicTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePublicTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-civic-900 text-white shadow-md'
                    : 'bg-civic-50 hover:bg-civic-100 text-civic-700 hover:text-civic-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-civic-200 text-civic-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Public Tab Content */}
      <div className="pt-1">
        {activePublicTab === 'report' && (
          <div className="space-y-4">
            {pinnedLocationForReport && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Location pre-filled from map pin: <b>{pinnedLocationForReport.lat.toFixed(5)}, {pinnedLocationForReport.lng.toFixed(5)}</b>
                  </span>
                </div>
                <button
                  onClick={() => setPinnedLocationForReport(null)}
                  className="font-bold underline text-emerald-700 hover:text-emerald-900"
                >
                  Reset Location
                </button>
              </div>
            )}
            <PublicReportTab
              hazards={hazards}
              onRefresh={onRefresh}
              userRole={userRole}
              initialLocation={pinnedLocationForReport}
            />
          </div>
        )}

        {activePublicTab === 'map' && (
          <div className="space-y-4">
            {/* Friendly introduction banner */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-900">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-transit-indigo flex-shrink-0" />
                <span>
                  <b>Station Pedestrian Safety Map</b>: View real-time reported barriers, e-rickshaw stands, and wide footpaths. Click any pin to inspect details or tap the map to report a new defect.
                </span>
              </div>
              <button
                onClick={() => setActivePublicTab('report')}
                className="font-bold text-transit-indigo hover:text-indigo-950 underline whitespace-nowrap self-end sm:self-auto"
              >
                + Open Hazard Form
              </button>
            </div>

            {/* Simple, interactive PublicSafetyMap */}
            <PublicSafetyMap
              station={station}
              footpaths={footpaths}
              queues={queues}
              hazards={hazards}
              onReportAtLocation={handleReportAtLocation}
              onSelectReportToTrack={() => {
                setActivePublicTab('track');
              }}
            />
          </div>
        )}

        {activePublicTab === 'survey' && (
          <PublicSurveySection onSubmitted={onRefresh} />
        )}

        {activePublicTab === 'track' && (
          <TrackReportSection
            hazards={hazards}
            onNavigateToReportForm={() => setActivePublicTab('report')}
          />
        )}
      </div>
    </div>
  );
};
