import React, { useState, useEffect } from 'react';
import { PortalHeader } from './components/PortalHeader';
import { AuthModal } from './components/AuthModal';
import { PublicPortalView } from './features/public/PublicPortalView';
import { AuthorityPortalView } from './features/authority/AuthorityPortalView';

import type {
  Station, FootpathSegment, QueueObservation, HazardReport,
  CrashContext, MMIScenario, DashboardSummary, UserRole
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  // Dual-portal mode: 'public' for citizens, 'authority' for administrators/engineers
  const [portalMode, setPortalMode] = useState<'public' | 'authority'>('public');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Auth state
  const [userRole, setUserRole] = useState<UserRole>(
    (localStorage.getItem('raastasafe_role') as UserRole) || 'public_visitor'
  );
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('raastasafe_username') || null
  );

  // App data state
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [footpaths, setFootpaths] = useState<FootpathSegment[]>([]);
  const [queues, setQueues] = useState<QueueObservation[]>([]);
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [crashes, setCrashes] = useState<CrashContext[]>([]);
  const [scenarios, setScenarios] = useState<MMIScenario[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [selectedStationId]);

  const loadInitialData = async () => {
    try {
      const [stList, summ, fp, q, haz, cr, sc] = await Promise.all([
        api.getStations().catch(() => []),
        api.getDashboardSummary(selectedStationId).catch(() => null),
        api.getFootpaths(selectedStationId).catch(() => []),
        api.getQueues(selectedStationId).catch(() => []),
        api.getHazards(selectedStationId, undefined, true).catch(() => []),
        api.getCrashes().catch(() => []),
        api.getScenarios(selectedStationId).catch(() => [])
      ]);

      if (stList.length > 0) {
        setStations(stList);
      } else {
        // Fallback default pilot station if API not ready
        setStations([{
          id: 1,
          name: 'Rohini West Metro Station',
          code: 'RWST',
          line: 'Red Line',
          latitude: 28.71452,
          longitude: 77.11475,
          boundary_radius_m: 500,
          catchment_radius_m: 800,
          exits: []
        }]);
      }

      setSummary(summ);
      setFootpaths(fp);
      setQueues(q);
      setHazards(haz);
      setCrashes(cr);
      setScenarios(sc);
    } catch (err) {
      console.error('Error loading initial data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = (role: UserRole, user: string | null) => {
    setUserRole(role);
    setUsername(user);
    if (role !== 'public_visitor') {
      // Automatically switch to Authority Console on successful managerial login
      setPortalMode('authority');
    }
  };

  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0] || null;

  return (
    <div className="min-h-screen bg-civic-50 text-civic-900 flex flex-col font-sans selection:bg-transit-indigo selection:text-white">
      {/* Top Header with Dual-Portal Switcher */}
      <PortalHeader
        portalMode={portalMode}
        onPortalModeChange={setPortalMode}
        stations={stations}
        selectedStationId={selectedStationId}
        onStationChange={setSelectedStationId}
        userRole={userRole}
        username={username}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {portalMode === 'public' ? (
          <PublicPortalView
            station={currentStation}
            footpaths={footpaths}
            queues={queues}
            hazards={hazards}
            crashes={crashes}
            scenarios={scenarios}
            userRole={userRole}
            onRefresh={loadInitialData}
            onSwitchToAuthority={() => setPortalMode('authority')}
          />
        ) : (
          <AuthorityPortalView
            station={currentStation}
            summary={summary}
            footpaths={footpaths}
            queues={queues}
            hazards={hazards}
            crashes={crashes}
            scenarios={scenarios}
            userRole={userRole}
            username={username}
            onRefresh={loadInitialData}
            onOpenAuth={() => setIsAuthOpen(true)}
            onSwitchToPublic={() => setPortalMode('public')}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUserRole={userRole}
        currentUsername={username}
        onAuthChange={handleAuthChange}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-civic-200 py-6 text-xs text-civic-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-civic-900">RaastaSafe</span>
            <span>&copy; 2026. Delhi Metro Pedestrian Audit & Feeder Mobility Research.</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>IRC:103-2022 Guidelines</span>
            <span>•</span>
            <span>WRI India (2023) Metro Access</span>
            <span>•</span>
            <span>Kar et al. (2026) Delhi IPA</span>
            <span>•</span>
            <span>UTTIPEC Rohini West MMI</span>
            <span>•</span>
            <span>OpenStreetMap ODbL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
