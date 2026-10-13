import type {
  Station, FootpathSegment, QueueObservation, JunctionCrossingAudit,
  HazardReport, IPAResults, MMIScenario, MMIScenarioConflictCheck,
  RouteResult, LocationPriority, HotspotCluster, DashboardSummary,
  CrashContext, User
} from '../types';
import {
  mockStations, mockDashboardSummary, mockFootpaths,
  mockQueues, mockHazards, mockIPAResults, mockScenarios, mockCrashes
} from './mockData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('raastasafe_token');
};

export const setAuthToken = (token: string, role: string, username: string) => {
  localStorage.setItem('raastasafe_token', token);
  localStorage.setItem('raastasafe_role', role);
  localStorage.setItem('raastasafe_username', username);
};

export const clearAuthToken = () => {
  localStorage.removeItem('raastasafe_token');
  localStorage.removeItem('raastasafe_role');
  localStorage.removeItem('raastasafe_username');
};

const authHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// In-memory runtime state for static demo mode (e.g. GitHub Pages)
let demoHazards = [...mockHazards];
let demoQueues = [...mockQueues];

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) return res.json();
    } catch {
      // Offline fallback for static GitHub Pages demo
    }

    // Static demo fallback credentials
    if (username === 'admin' && password === 'AdminPass123!') {
      return {
        access_token: 'demo-jwt-token-admin',
        token_type: 'bearer',
        role: 'administrator',
        username: 'admin'
      };
    }
    if (username === 'reviewer' && password === 'ReviewerPass123!') {
      return {
        access_token: 'demo-jwt-token-reviewer',
        token_type: 'bearer',
        role: 'field_reviewer',
        username: 'reviewer'
      };
    }
    throw new Error('Invalid credentials');
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...authHeaders() }
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const role = (localStorage.getItem('raastasafe_role') as any) || 'public_visitor';
    const username = localStorage.getItem('raastasafe_username') || 'demo_user';
    return {
      id: 1,
      username,
      email: `${username}@delhi.gov.in`,
      role,
      is_active: true,
      created_at: new Date().toISOString()
    };
  },

  // Stations
  getStations: async (): Promise<Station[]> => {
    try {
      const res = await fetch(`${API_BASE}/stations`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockStations;
  },

  getStation: async (id: number): Promise<Station> => {
    try {
      const res = await fetch(`${API_BASE}/stations/${id}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockStations.find(s => s.id === id) || mockStations[0];
  },

  // Footpaths
  getFootpaths: async (stationId = 1, status?: string): Promise<FootpathSegment[]> => {
    try {
      const url = new URL(`${API_BASE}/footpaths`);
      url.searchParams.append('station_id', stationId.toString());
      if (status) url.searchParams.append('status', status);
      const res = await fetch(url.toString());
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockFootpaths;
  },

  getFootpathPriority: async (segmentId: number): Promise<LocationPriority> => {
    try {
      const res = await fetch(`${API_BASE}/footpaths/${segmentId}/priority`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      item_id: segmentId.toString(),
      item_type: 'footpath',
      title: 'Gate 2 to Sector 9 Feeder Walkway',
      latitude: 28.71515,
      longitude: 77.11540,
      priority_rank: 1,
      total_priority_score: 84.5,
      priority_level: 'critical',
      completeness_factor: 1.0,
      is_data_sufficient: true,
      components: [
        { name: 'Clear Width Deficit vs 2.5m Standard', raw_value: 1.1, weight: 0.35, weighted_score: 38.5, description: '1.4m width leaves 1.1m deficit below IRC:103 interchange requirement.' },
        { name: 'Physical Severity', raw_value: 'poor', weight: 0.25, weighted_score: 22.0, description: 'Cracked paver blocks and irregular heights.' },
        { name: 'Universal Accessibility Impact', raw_value: 'missing_ramp', weight: 0.20, weighted_score: 18.0, description: 'Missing kerb ramp forces wheelchairs into carriageway.' },
        { name: 'Citizen Recurrence & Queue Intrusion', raw_value: 2, weight: 0.20, weighted_score: 6.0, description: 'Multiple community defect reports and e-rickshaw queuing.' }
      ],
      explanation: 'Severe width deficit below 2.5m standard with heavy feeder queue intrusion.',
      irc_guidance_clause: 'IRC:103-2022 Section 5.2.2',
      provenance: 'OBSERVED_FIELD_DATA'
    };
  },

  createFootpath: async (payload: any): Promise<FootpathSegment> => {
    try {
      const res = await fetch(`${API_BASE}/footpaths`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const newFp = { ...mockFootpaths[0], ...payload, id: mockFootpaths.length + 1 };
    mockFootpaths.push(newFp);
    return newFp;
  },

  updateFootpath: async (segmentId: number, payload: any): Promise<FootpathSegment> => {
    try {
      const res = await fetch(`${API_BASE}/footpaths/${segmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return { ...mockFootpaths[0], ...payload, id: segmentId };
  },

  // Queues
  getQueues: async (stationId = 1): Promise<QueueObservation[]> => {
    try {
      const res = await fetch(`${API_BASE}/queues?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return demoQueues;
  },

  createQueue: async (payload: any): Promise<QueueObservation> => {
    try {
      const res = await fetch(`${API_BASE}/queues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const newQ: QueueObservation = {
      ...mockQueues[0],
      ...payload,
      id: demoQueues.length + 1,
      created_at: new Date().toISOString()
    };
    demoQueues.push(newQ);
    return newQ;
  },

  // Crossings
  getCrossings: async (stationId = 1): Promise<JunctionCrossingAudit[]> => {
    try {
      const res = await fetch(`${API_BASE}/crossings?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return [];
  },

  createCrossing: async (payload: any): Promise<JunctionCrossingAudit> => {
    const res = await fetch(`${API_BASE}/crossings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to record crossing audit');
    return res.json();
  },

  // Hazard Reports
  getHazards: async (stationId = 1, status?: string, includeDuplicates = false): Promise<HazardReport[]> => {
    try {
      const url = new URL(`${API_BASE}/hazards`);
      url.searchParams.append('station_id', stationId.toString());
      if (status) url.searchParams.append('status', status);
      if (includeDuplicates) url.searchParams.append('include_duplicates', 'true');
      const res = await fetch(url.toString());
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return demoHazards;
  },

  getHazard: async (id: string): Promise<HazardReport> => {
    try {
      const res = await fetch(`${API_BASE}/hazards/${id}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return demoHazards.find(h => h.id === id) || demoHazards[0];
  },

  getHazardDuplicates: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/hazards/${id}/duplicates`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      report_id: id,
      suggestions: [
        {
          candidate_id: 'RPT-DEL-RWST-002',
          similarity_score: 0.88,
          distance_meters: 22.4,
          reason: 'Nearby e-rickshaw queue spillover report along Gate 2 corridor.'
        }
      ]
    };
  },

  getHazardPriority: async (id: string): Promise<LocationPriority> => {
    try {
      const res = await fetch(`${API_BASE}/hazards/${id}/priority`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      item_id: id,
      item_type: 'hazard',
      title: '25cm Vertical Curb Drop at Gate 2',
      latitude: 28.71518,
      longitude: 77.11538,
      priority_rank: 1,
      total_priority_score: 79.0,
      priority_level: 'high',
      completeness_factor: 1.0,
      is_data_sufficient: true,
      components: [
        { name: 'Physical Severity', raw_value: 'critical', weight: 0.35, weighted_score: 31.5, description: 'Reported as critical hazard affecting transit connection.' },
        { name: 'Proximity to Metro Portal', raw_value: 25, weight: 0.35, weighted_score: 28.0, description: 'Located within 50m of Gate 2 entrance.' },
        { name: 'Citizen Recurrence', raw_value: 3, weight: 0.30, weighted_score: 19.5, description: 'Recurrent defect reported multiple times.' }
      ],
      explanation: 'Critical vertical curb barrier directly along high-volume interchange path.',
      irc_guidance_clause: 'IRC:103-2022 Section 5.4.1',
      provenance: 'CITIZEN_HAZARD_REPORT'
    };
  },

  submitHazard: async (payload: any): Promise<HazardReport> => {
    try {
      const res = await fetch(`${API_BASE}/hazards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const newId = `RPT-DEL-RWST-00${demoHazards.length + 1}`;
    const newHazard: HazardReport = {
      ...payload,
      id: newId,
      status: 'submitted',
      provenance: 'CITIZEN_HAZARD_REPORT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    demoHazards = [newHazard, ...demoHazards];
    return newHazard;
  },

  transitionHazardStatus: async (reportId: string, newStatus: string, reviewerNotes?: string): Promise<HazardReport> => {
    try {
      const res = await fetch(`${API_BASE}/hazards/${reportId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ new_status: newStatus, reviewer_notes: reviewerNotes })
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const h = demoHazards.find(x => x.id === reportId);
    if (h) {
      h.status = newStatus;
      if (reviewerNotes) h.reviewer_notes = reviewerNotes;
      return h;
    }
    return demoHazards[0];
  },

  confirmDuplicateHazard: async (reportId: string, duplicateOfId: string, notes?: string): Promise<HazardReport> => {
    try {
      const res = await fetch(`${API_BASE}/hazards/${reportId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ duplicate_of_id: duplicateOfId, notes })
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    const h = demoHazards.find(x => x.id === reportId);
    if (h) {
      h.status = 'duplicate';
      h.duplicate_of_id = duplicateOfId;
      return h;
    }
    return demoHazards[0];
  },

  // Surveys & IPA
  submitSurvey: async (payload: any) => {
    try {
      const res = await fetch(`${API_BASE}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return { success: true, message: 'Survey logged into station IPA database.' };
  },

  getIPAResults: async (stationId = 1): Promise<IPAResults> => {
    try {
      const res = await fetch(`${API_BASE}/surveys/ipa?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockIPAResults;
  },

  // MMI Scenarios
  getScenarios: async (stationId = 1): Promise<MMIScenario[]> => {
    try {
      const res = await fetch(`${API_BASE}/scenarios?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockScenarios;
  },

  createScenario: async (payload: any): Promise<MMIScenario> => {
    try {
      const res = await fetch(`${API_BASE}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return { ...mockScenarios[0], ...payload, id: mockScenarios.length + 1 };
  },

  getScenarioConflicts: async (scenarioId: number): Promise<MMIScenarioConflictCheck> => {
    try {
      const res = await fetch(`${API_BASE}/scenarios/${scenarioId}/conflicts`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      scenario_id: scenarioId,
      scenario_name: 'UTTIPEC Feeder Integration Concept 2026',
      overall_status: 'passed',
      conflicts: [],
      legal_disclaimer: 'Advisory research concept plan. Not an approved municipal or DDA scheme. All works subject to municipal jurisdiction and statutory approval.'
    };
  },

  // Routing
  planRoute: async (payload: {
    station_id: number;
    start_lat: number;
    start_lng: number;
    end_lat: number;
    end_lng: number;
    prefer_step_free: boolean;
    min_clear_width_m?: number;
  }): Promise<RouteResult> => {
    try {
      const res = await fetch(`${API_BASE}/routes/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      found: true,
      total_distance_m: 150.0,
      step_free_certified: true,
      unknown_accessibility_edges_count: 0,
      path_coordinates: [
        [payload.start_lng, payload.start_lat],
        [payload.end_lng, payload.end_lat]
      ],
      steps: [
        {
          step_index: 1,
          instruction: 'Proceed from Gate 1 via dedicated 2.6m wide step-free ramp.',
          distance_m: 60.0,
          clear_walking_width_m: 2.6,
          is_step_free: true
        },
        {
          step_index: 2,
          instruction: 'Follow continuous tactile paving along Outer Ring Road walkway.',
          distance_m: 90.0,
          clear_walking_width_m: 2.6,
          is_step_free: true
        }
      ]
    };
  },

  // Analytics
  getDashboardSummary: async (stationId = 1): Promise<DashboardSummary> => {
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockDashboardSummary;
  },

  getHotspots: async (stationId = 1): Promise<HotspotCluster[]> => {
    try {
      const res = await fetch(`${API_BASE}/analytics/hotspots?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return [
      {
        cluster_id: 'HOTSPOT-RWST-01',
        name: 'Gate 2 Sector 9 Feeder Apron Cluster',
        center_lat: 28.7152,
        center_lng: 77.1154,
        radius_m: 75.0,
        total_observations_count: 5,
        verified_count: 4,
        highest_severity: 'critical',
        priority_score: 88.5,
        dominant_issue: 'E-Rickshaw queue spillover and missing curb ramp',
        contributing_items: [
          { id: '1', item_type: 'footpath_audit', title: '1.4m width (1.1m deficit) near Gate 2', severity: 'high', distance_to_center_m: 12.0, verification_status: 'verified', provenance: 'OBSERVED_FIELD_DATA' },
          { id: '1', item_type: 'queue_observation', title: '22 rickshaws blocking apron & zebra crossing', severity: 'critical', distance_to_center_m: 15.0, verification_status: 'verified', provenance: 'OBSERVED_FIELD_DATA' },
          { id: 'RPT-DEL-RWST-001', item_type: 'hazard_report', title: 'Missing curb ramp / 25cm drop', severity: 'critical', distance_to_center_m: 8.0, verification_status: 'verified', provenance: 'CITIZEN_HAZARD_REPORT' }
        ],
        explanation: 'High concentration of pedestrian barriers and e-rickshaw queuing in transit apron.'
      }
    ];
  },

  getPriorityRanking: async (stationId = 1): Promise<LocationPriority[]> => {
    try {
      const res = await fetch(`${API_BASE}/analytics/priority-ranking?station_id=${stationId}`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return [
      {
        item_id: '1',
        item_type: 'footpath',
        title: 'Gate 2 to Sector 9 Feeder Walkway',
        latitude: 28.71515,
        longitude: 77.11540,
        priority_rank: 1,
        total_priority_score: 84.5,
        priority_level: 'critical',
        completeness_factor: 1.0,
        is_data_sufficient: true,
        components: [
          { name: 'Clear Width Deficit vs 2.5m Standard', raw_value: 1.1, weight: 0.35, weighted_score: 38.5, description: '1.4m width leaves 1.1m deficit below IRC:103 standard.' }
        ],
        explanation: 'Severe width deficit below 2.5m standard with heavy feeder queue intrusion.',
        irc_guidance_clause: 'IRC:103-2022 Section 5.2.2',
        provenance: 'OBSERVED_FIELD_DATA'
      }
    ];
  },

  // Crash Context
  getCrashes: async (): Promise<CrashContext[]> => {
    try {
      const res = await fetch(`${API_BASE}/crashes`);
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return mockCrashes;
  },

  // Photo Upload
  uploadPhoto: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/uploads`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) return res.json();
    } catch {
      // Fallback
    }
    return {
      file_path: '/uploads/sample_defect.jpg',
      original_filename: file.name
    };
  },

  // Exports URLs
  getCsvExportUrl: (recordType = 'hazards', stationId = 1) =>
    `${API_BASE}/exports/csv?record_type=${recordType}&station_id=${stationId}`,

  getPdfExportUrl: (stationId = 1) =>
    `${API_BASE}/exports/pdf?station_id=${stationId}`
};
