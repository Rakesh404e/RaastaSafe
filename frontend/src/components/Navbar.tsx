import React from 'react';
import type { UserRole, Station } from '../types';
import {
  MapPin, Shield, Layers, AlertTriangle, Activity, BarChart2,
  Compass, FileText, CheckCircle, Navigation, Map
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  stations: Station[];
  selectedStationId: number;
  onStationChange: (id: number) => void;
  userRole: UserRole;
  username: string | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  stations,
  selectedStationId,
  onStationChange,
  userRole,
  username,
  onOpenAuth
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview & Research', icon: Activity },
    { id: 'map', label: 'Interactive Map', icon: Map },
    { id: 'audits', label: 'Footpath Audits', icon: Layers },
    { id: 'reports', label: 'Report Hazard', icon: AlertTriangle },
    { id: 'queues', label: 'E-Rickshaw Queues', icon: Compass },
    { id: 'hotspots', label: 'Hotspots', icon: BarChart2 },
    { id: 'ipa', label: 'IPA Survey', icon: BarChart2 },
    { id: 'planning', label: 'MMI Planner', icon: Compass },
    { id: 'routes', label: 'Access Router', icon: Navigation },
    { id: 'admin', label: 'Review Center', icon: CheckCircle, reviewerOnly: true },
    { id: 'exports', label: 'Exports', icon: FileText }
  ];

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    public_visitor: { bg: 'bg-civic-100', text: 'text-civic-700', border: 'border-civic-300' },
    field_reviewer: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    administrator: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' }
  };

  return (
    <header className="bg-white border-b border-civic-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-metro-red to-transit-crimson flex items-center justify-center text-white font-extrabold shadow-md shadow-metro-red/20">
            <span className="text-xl">रा</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-civic-900">RaastaSafe</span>
              <span className="px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase bg-red-100 text-metro-red rounded-full">
                Pilot v1.0
              </span>
            </div>
            <p className="text-xs text-civic-500 hidden sm:block">
              Metro-Area Pedestrian Audit & Last-Mile Feeder Mobility Planner
            </p>
          </div>
        </div>

        {/* Station Selector & Auth Role Badge */}
        <div className="flex items-center gap-3">
          {/* Station selector */}
          <div className="flex items-center bg-civic-100 rounded-xl px-3 py-1.5 border border-civic-200">
            <MapPin className="w-4 h-4 text-metro-red mr-2" />
            <select
              value={selectedStationId}
              onChange={(e) => onStationChange(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-civic-800 focus:outline-none cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          {/* User Role Badge */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm ${roleColors[userRole].bg} ${roleColors[userRole].text} ${roleColors[userRole].border}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>
              {username ? `${username} (${userRole.replace('_', ' ')})` : 'Public Visitor'}
            </span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-civic-50 border-t border-civic-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1.5 no-scrollbar" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-transit-indigo shadow-sm border border-civic-200'
                      : 'text-civic-600 hover:text-civic-900 hover:bg-civic-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-transit-indigo' : 'text-civic-400'}`} />
                  {tab.label}
                  {tab.reviewerOnly && userRole === 'public_visitor' && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1 py-0.2 rounded font-mono">
                      auth
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
