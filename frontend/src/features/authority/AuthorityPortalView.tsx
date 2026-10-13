import React, { useState } from 'react';
import type {
  Station, FootpathSegment, QueueObservation, HazardReport,
  CrashContext, MMIScenario, DashboardSummary, UserRole
} from '../../types';
import { OverviewTab } from '../overview/OverviewTab';
import { InteractiveMapTab } from '../map/InteractiveMapTab';
import { AuditsTab } from '../audits/AuditsTab';
import { QueueTab } from '../queue-observations/QueueTab';
import { HotspotsTab } from '../hotspots/HotspotsTab';
import { IPASurveyTab } from '../ipa-survey/IPASurveyTab';
import { MMIPlanningTab } from '../planning/MMIPlanningTab';
import { AdminReviewTab } from '../admin/AdminReviewTab';
import { ExportsTab } from '../exports/ExportsTab';
import {
  Activity, Map, Layers, CheckCircle, Compass,
  BarChart2, ShieldCheck, FileText, Lock, UserCheck,
  ArrowLeft, AlertTriangle, Info, Eye
} from 'lucide-react';

interface AuthorityPortalViewProps {
  station: Station | null;
  summary: DashboardSummary | null;
  footpaths: FootpathSegment[];
  queues: QueueObservation[];
  hazards: HazardReport[];
  crashes: CrashContext[];
  scenarios: MMIScenario[];
  userRole: UserRole;
  username: string | null;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onSwitchToPublic: () => void;
}

export const AuthorityPortalView: React.FC<AuthorityPortalViewProps> = ({
  station,
  summary,
  footpaths,
  queues,
  hazards,
  crashes,
  scenarios,
  userRole,
  username,
  onRefresh,
  onOpenAuth,
  onSwitchToPublic
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');

  const adminTabs = [
    { id: 'overview', label: 'Executive Dashboard', icon: Activity },
    { id: 'map', label: 'Multi-Layer GIS', icon: Map },
    { id: 'audits', label: 'Footpath Audits (IRC:103)', icon: Layers },
    { id: 'admin', label: 'Review & Moderation', icon: CheckCircle, badge: `${hazards.filter(h => h.status === 'submitted').length} Pending` },
    { id: 'queues', label: 'Feeder Queues & Intrusion', icon: Compass },
    { id: 'hotspots', label: '75m Hotspots', icon: BarChart2 },
    { id: 'ipa', label: 'Kar et al. IPA Matrix', icon: BarChart2 },
    { id: 'planning', label: 'UTTIPEC MMI Studio', icon: Compass },
    { id: 'exports', label: 'Data & PDF Exports', icon: FileText }
  ];

  const isObserver = userRole === 'public_visitor';

  return (
    <div className="space-y-6">
      {/* Authority Banner */}
      <div className="bg-gradient-to-r from-civic-900 via-slate-900 to-civic-950 rounded-3xl p-6 sm:p-7 text-white shadow-md border border-civic-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 bg-transit-indigo rounded-full text-[10px] font-bold tracking-wider uppercase">
              Authority & Engineering Console
            </span>
            <span className="text-xs text-civic-300">
              MCD • DMRC • UTTIPEC • Delhi Traffic Police
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1.5 tracking-tight">
            Station Area Pedestrian Infrastructure & Feeder Integration
          </h2>
          <p className="text-xs text-civic-400 mt-0.5">
            Pilot Node: <b>{station?.name || 'Rohini West'}</b> (Red Line). Grounded in IRC:103-2022 standards and explainable engineering priority scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={onSwitchToPublic}
            className="px-3.5 py-2 bg-civic-800 hover:bg-civic-700 text-civic-200 border border-civic-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Public Portal</span>
          </button>

          <button
            onClick={onOpenAuth}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap border ${
              isObserver
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
            }`}
          >
            {isObserver ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>
              {isObserver
                ? 'Sign In (Observer Mode)'
                : `${username} (${userRole.replace('_', ' ')})`}
            </span>
          </button>
        </div>
      </div>

      {/* Observer Mode Notice with 1-Click Test Access */}
      {isObserver && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Viewing Console in Read-Only Observer Mode:</span> All 9 engineering modules, spatial algorithms, and research matrices are interactive. To approve hazard tickets or create planning scenarios, authenticate as a Field Reviewer or Administrator.
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap shadow-xs"
          >
            1-Click Test Sign In
          </button>
        </div>
      )}

      {/* Authority Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-civic-200 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 min-w-max">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-civic-900 text-white shadow-sm'
                    : 'text-civic-600 hover:text-civic-900 hover:bg-civic-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-civic-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-metro-red'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="pt-1">
        {activeAdminTab === 'overview' && (
          <OverviewTab
            summary={summary}
            station={station}
            onNavigate={(tab) => {
              // Map old tab names to admin tabs if applicable
              if (tab === 'audits') setActiveAdminTab('audits');
              else if (tab === 'reports') setActiveAdminTab('admin');
              else if (tab === 'queues') setActiveAdminTab('queues');
              else if (tab === 'hotspots') setActiveAdminTab('hotspots');
              else if (tab === 'ipa') setActiveAdminTab('ipa');
              else if (tab === 'planning') setActiveAdminTab('planning');
              else if (tab === 'map') setActiveAdminTab('map');
              else setActiveAdminTab(tab);
            }}
          />
        )}

        {activeAdminTab === 'map' && (
          <InteractiveMapTab
            station={station}
            footpaths={footpaths}
            queues={queues}
            hazards={hazards}
            crashes={crashes}
            scenarios={scenarios}
            onOpenAuditModal={() => setActiveAdminTab('audits')}
            onOpenReportModal={() => setActiveAdminTab('admin')}
          />
        )}

        {activeAdminTab === 'audits' && (
          <AuditsTab
            footpaths={footpaths}
            onRefresh={onRefresh}
            userRole={userRole}
          />
        )}

        {activeAdminTab === 'admin' && (
          <AdminReviewTab
            hazards={hazards}
            onRefresh={onRefresh}
            userRole={userRole}
            onOpenAuth={onOpenAuth}
          />
        )}

        {activeAdminTab === 'queues' && (
          <QueueTab
            queues={queues}
            onRefresh={onRefresh}
            userRole={userRole}
          />
        )}

        {activeAdminTab === 'hotspots' && (
          <HotspotsTab
            onNavigateToMap={() => setActiveAdminTab('map')}
          />
        )}

        {activeAdminTab === 'ipa' && (
          <IPASurveyTab
            onRefresh={onRefresh}
          />
        )}

        {activeAdminTab === 'planning' && (
          <MMIPlanningTab
            scenarios={scenarios}
            onRefresh={onRefresh}
            userRole={userRole}
          />
        )}

        {activeAdminTab === 'exports' && (
          <ExportsTab />
        )}
      </div>
    </div>
  );
};
