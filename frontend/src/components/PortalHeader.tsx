import React from 'react';
import type { UserRole, Station } from '../types';
import {
  MapPin, Shield, ShieldCheck, Users,
  Building2, ChevronDown, Sparkles
} from 'lucide-react';

interface PortalHeaderProps {
  portalMode: 'public' | 'authority';
  onPortalModeChange: (mode: 'public' | 'authority') => void;
  stations: Station[];
  selectedStationId: number;
  onStationChange: (id: number) => void;
  userRole: UserRole;
  username: string | null;
  onOpenAuth: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  portalMode,
  onPortalModeChange,
  stations,
  selectedStationId,
  onStationChange,
  userRole,
  username,
  onOpenAuth
}) => {
  const isAuthUser = userRole !== 'public_visitor';

  return (
    <header className="bg-white border-b border-civic-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-metro-red to-transit-crimson flex items-center justify-center text-white font-extrabold shadow-md shadow-metro-red/20">
            <span className="text-lg">रा</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-civic-900">RaastaSafe</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-metro-red rounded-md">
                IRC:103
              </span>
            </div>
            <p className="text-[11px] text-civic-500 hidden sm:block">
              Metro Pedestrian Audit & Feeder Mobility Platform
            </p>
          </div>
        </div>

        {/* Center: DUAL-PORTAL SWITCHER PILL */}
        <div className="bg-civic-100 p-1 rounded-2xl border border-civic-200/80 flex items-center shadow-inner">
          <button
            onClick={() => onPortalModeChange('public')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              portalMode === 'public'
                ? 'bg-white text-civic-900 shadow-sm border border-civic-200'
                : 'text-civic-600 hover:text-civic-900'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${portalMode === 'public' ? 'text-metro-red' : 'text-civic-400'}`} />
            <span>Public Portal</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
              portalMode === 'public' ? 'bg-red-50 text-metro-red' : 'bg-civic-200 text-civic-500'
            }`}>
              Commuters
            </span>
          </button>

          <button
            onClick={() => onPortalModeChange('authority')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              portalMode === 'authority'
                ? 'bg-civic-900 text-white shadow-sm'
                : 'text-civic-600 hover:text-civic-900'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${portalMode === 'authority' ? 'text-indigo-300' : 'text-civic-400'}`} />
            <span>Authority & Managers</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
              portalMode === 'authority' ? 'bg-white/20 text-indigo-100' : 'bg-civic-200 text-civic-500'
            }`}>
              Planners
            </span>
          </button>
        </div>

        {/* Right: Station Selector & User Role */}
        <div className="flex items-center gap-2.5">
          {/* Station selector */}
          <div className="flex items-center bg-civic-50 rounded-xl px-2.5 py-1.5 border border-civic-200">
            <MapPin className="w-3.5 h-3.5 text-metro-red mr-1.5" />
            <select
              value={selectedStationId}
              onChange={(e) => onStationChange(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-civic-800 focus:outline-none cursor-pointer pr-1"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Role / Sign In */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-xs ${
              isAuthUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-civic-100 text-civic-700 border-civic-300 hover:bg-civic-200/70'
            }`}
          >
            {isAuthUser ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-civic-500" />
            )}
            <span>
              {username ? username : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
