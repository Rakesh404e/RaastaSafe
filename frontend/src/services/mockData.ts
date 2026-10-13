import type {
  Station, FootpathSegment, QueueObservation, HazardReport,
  CrashContext, MMIScenario, DashboardSummary, IPAResults, LocationPriority
} from '../types';

export const mockStations: Station[] = [
  {
    id: 1,
    name: 'Rohini West Metro Station',
    code: 'RWST',
    line: 'Red Line (Delhi Metro)',
    latitude: 28.71452,
    longitude: 77.11475,
    boundary_radius_m: 500,
    catchment_radius_m: 800,
    description: 'Elevated interchange station on Delhi Metro Red Line, bordering Sector 9 and Sector 13 with high feeder e-rickshaw volume.',
    exits: [
      {
        id: 1,
        station_id: 1,
        exit_number: '1',
        name: 'Gate 1 (North-West / Japanese Park Portal)',
        latitude: 28.71520,
        longitude: 77.11410,
        has_step_free_ramp: true,
        has_tactile_paving: true,
        has_curb_ramp: true,
        details: 'Grade-level ramp access directly connecting to Swarn Jayanti Park walkway.'
      },
      {
        id: 2,
        station_id: 1,
        exit_number: '2',
        name: 'Gate 2 (North-East / Sector 9 Feeder Stand)',
        latitude: 28.71515,
        longitude: 77.11540,
        has_step_free_ramp: true,
        has_tactile_paving: false,
        has_curb_ramp: false,
        details: 'Primary e-rickshaw boarding apron. High pedestrian spillover during morning peak.'
      },
      {
        id: 3,
        station_id: 1,
        exit_number: '3',
        name: 'Gate 3 (South-East / Ring Road Foot Overbridge)',
        latitude: 28.71390,
        longitude: 77.11530,
        has_step_free_ramp: false,
        has_tactile_paving: false,
        has_curb_ramp: false,
        details: 'Staircase access to FOB across Outer Ring Road; lacks tactile paving and step-free ramp.'
      },
      {
        id: 4,
        station_id: 1,
        exit_number: '4',
        name: 'Gate 4 (South-West / Madhuban Chowk Approach)',
        latitude: 28.71385,
        longitude: 77.11420,
        has_step_free_ramp: true,
        has_tactile_paving: true,
        has_curb_ramp: true,
        details: 'Direct accessible portal with continuous paver tiles toward Sector 14 market.'
      }
    ]
  }
];

export const mockDashboardSummary: DashboardSummary = {
  station_name: 'Rohini West Metro Station',
  total_footpaths_audited_count: 5,
  total_audited_length_m: 640.0,
  clear_width_deficit_count: 4,
  total_queue_observations_count: 2,
  active_hazard_reports_count: 6,
  verified_hazard_reports_count: 4,
  high_priority_hazards_count: 3,
  total_surveys_collected: 34,
  active_mmi_scenarios_count: 1,
  last_updated: '2026-10-13T10:00:00'
};

export const mockFootpaths: FootpathSegment[] = [
  {
    id: 1,
    station_id: 1,
    name: 'Gate 2 to Sector 9 Market Feeder Walkway',
    street_name: 'Bhagwan Mahavir Marg Service Road',
    side_of_street: 'North',
    geometry_geojson: {
      type: 'LineString',
      coordinates: [
        [77.11540, 28.71515],
        [77.11560, 28.71540],
        [77.11580, 28.71580]
      ]
    },
    footpath_exists: true,
    total_width_m: 2.8,
    clear_walking_width_m: 1.4,
    has_tactile_paving: false,
    has_curb_ramps: false,
    surface_quality: 'poor',
    discontinuities_detected: true,
    blocked_length_m: 45.0,
    blocked_share_pct: 35.0,
    lighting_condition: 'poor',
    obstruction_types: ['vending_stalls', 'parked_two_wheelers'],
    estimated_pedestrian_volume: 240,
    observer_confidence: 'high',
    verification_status: 'verified',
    provenance: 'OBSERVED_FIELD_DATA',
    created_at: '2026-10-10T10:00:00',
    irc_clear_width_compliant: false,
    irc_deficit_m: 1.1
  },
  {
    id: 2,
    station_id: 1,
    name: 'Gate 1 Outer Ring Road Walkway Westbound',
    street_name: 'Outer Ring Road (Madhuban Chowk - Rithala)',
    side_of_street: 'North',
    geometry_geojson: {
      type: 'LineString',
      coordinates: [
        [77.11410, 28.71520],
        [77.11360, 28.71525],
        [77.11300, 28.71530]
      ]
    },
    footpath_exists: true,
    total_width_m: 3.2,
    clear_walking_width_m: 2.6,
    has_tactile_paving: true,
    has_curb_ramps: true,
    surface_quality: 'good',
    discontinuities_detected: false,
    blocked_length_m: 0.0,
    blocked_share_pct: 0.0,
    lighting_condition: 'good',
    obstruction_types: [],
    estimated_pedestrian_volume: 180,
    observer_confidence: 'high',
    verification_status: 'verified',
    provenance: 'OBSERVED_FIELD_DATA',
    created_at: '2026-10-10T10:00:00',
    irc_clear_width_compliant: true,
    irc_deficit_m: 0.0
  },
  {
    id: 3,
    station_id: 1,
    name: 'Gate 3 South Access towards Sector 14',
    street_name: 'Outer Ring Road South Service Lane',
    side_of_street: 'South',
    geometry_geojson: {
      type: 'LineString',
      coordinates: [
        [77.11530, 28.71390],
        [77.11500, 28.71350],
        [77.11460, 28.71320]
      ]
    },
    footpath_exists: true,
    total_width_m: 2.0,
    clear_walking_width_m: 1.1,
    has_tactile_paving: false,
    has_curb_ramps: false,
    surface_quality: 'broken',
    discontinuities_detected: true,
    blocked_length_m: 60.0,
    blocked_share_pct: 45.0,
    lighting_condition: 'poor',
    obstruction_types: ['broken_slabs', 'commercial_encroachment'],
    estimated_pedestrian_volume: 310,
    observer_confidence: 'high',
    verification_status: 'verified',
    provenance: 'OBSERVED_FIELD_DATA',
    created_at: '2026-10-10T10:00:00',
    irc_clear_width_compliant: false,
    irc_deficit_m: 1.4
  }
];

export const mockQueues: QueueObservation[] = [
  {
    id: 1,
    station_id: 1,
    location_geojson: {
      type: 'Point',
      coordinates: [77.11540, 28.71515]
    },
    start_time: '08:30',
    end_time: '09:30',
    time_window: 'morning_peak',
    vehicle_count: 22,
    queue_length_m: 65.0,
    enters_walking_zone: true,
    enters_crossing: true,
    enters_cycle_lane: false,
    enters_carriageway: true,
    enters_metro_entrance: false,
    avg_wait_time_min: 4.8,
    wait_time_method: 'Observed sample of 12 boarding cycles',
    nearby_marked_stand: 'no',
    conflict_description: 'E-rickshaws double-park at Gate 2 entrance curb, forcing pedestrians to walk in active carriageway.',
    observer_confidence: 'high',
    verification_status: 'verified',
    provenance: 'OBSERVED_FIELD_DATA',
    created_at: '2026-10-12T09:30:00'
  },
  {
    id: 2,
    station_id: 1,
    location_geojson: {
      type: 'Point',
      coordinates: [77.11530, 28.71390]
    },
    start_time: '18:00',
    end_time: '19:15',
    time_window: 'evening_peak',
    vehicle_count: 18,
    queue_length_m: 48.0,
    enters_walking_zone: true,
    enters_crossing: false,
    enters_cycle_lane: false,
    enters_carriageway: true,
    enters_metro_entrance: false,
    avg_wait_time_min: 3.5,
    wait_time_method: 'Observed sample of 8 boarding cycles',
    nearby_marked_stand: 'no',
    conflict_description: 'Queue spills across FOB staircase landing, blocking ramp access for evening commuters.',
    observer_confidence: 'high',
    verification_status: 'verified',
    provenance: 'OBSERVED_FIELD_DATA',
    created_at: '2026-10-12T19:15:00'
  }
];

export const mockHazards: HazardReport[] = [
  {
    id: 'RPT-DEL-RWST-001',
    station_id: 1,
    title: '25cm Vertical Curb Drop at Gate 2 Crossing',
    description: 'No curb ramp exists at the corner of Gate 2 where passengers cross toward Sector 9. Forces wheelchairs and strollers into traffic.',
    report_type: 'missing_ramp',
    latitude: 28.71518,
    longitude: 77.11538,
    severity: 'critical',
    reporter_type: 'resident',
    status: 'verified',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-10T11:20:00',
    updated_at: '2026-10-11T12:00:00',
    reviewer_notes: 'Confirmed on site audit. Priority 82/100. Added to MCD civil works list.'
  },
  {
    id: 'RPT-DEL-RWST-002',
    station_id: 1,
    title: 'E-Rickshaw Feeder Spillover across Zebra Crossing',
    description: 'Informal feeder queue blocks entire zebra crossing leading to Gate 2 bus stop during morning peak hours.',
    report_type: 'queue_spillover',
    latitude: 28.71525,
    longitude: 77.11550,
    severity: 'high',
    reporter_type: 'commuter',
    status: 'under_review',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-11T08:45:00',
    updated_at: '2026-10-11T09:00:00',
    reviewer_notes: 'Under review for dedicated feeder bay demarcation under UTTIPEC plan.'
  },
  {
    id: 'RPT-DEL-RWST-003',
    station_id: 1,
    title: 'Broken Paver Tiles and Open Drain Slab near Gate 3',
    description: 'Multiple concrete drain slabs cracked with 15cm gaps; severe tripping hazard after sunset.',
    report_type: 'broken_footpath',
    latitude: 28.71402,
    longitude: 77.11515,
    severity: 'critical',
    reporter_type: 'resident',
    status: 'scheduled_for_repair',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-09T17:15:00',
    updated_at: '2026-10-10T10:00:00',
    reviewer_notes: 'Work order RWST-PW-44 issued for slab replacement.'
  },
  {
    id: 'RPT-DEL-RWST-004',
    station_id: 1,
    title: 'Unlit Walking Corridor under Metro Viaduct',
    description: 'Two consecutive street lamps non-functional; creates dark shadow zone near pedestrian underpass.',
    report_type: 'dark_spot',
    latitude: 28.71440,
    longitude: 77.11460,
    severity: 'medium',
    reporter_type: 'commuter',
    status: 'submitted',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-12T20:10:00',
    updated_at: '2026-10-12T20:10:00'
  },
  {
    id: 'RPT-DEL-RWST-005',
    station_id: 1,
    title: 'Tea Stalls & Commercial Encroachment on Walkway',
    description: 'Vendor carts take up 1.5m of the 2.5m footpath, leaving less than 1m for walking.',
    report_type: 'obstruction',
    latitude: 28.71490,
    longitude: 77.11430,
    severity: 'high',
    reporter_type: 'student_auditor',
    status: 'verified',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-11T14:30:00',
    updated_at: '2026-10-11T15:00:00',
    reviewer_notes: 'Forwarded to MCD enforcement division.'
  },
  {
    id: 'RPT-DEL-RWST-006',
    station_id: 1,
    title: 'Absence of Tactile Guidance for Visually Impaired',
    description: 'No yellow blister or directional tactile tiles along the 200m approach corridor from bus stop to Gate 1.',
    report_type: 'missing_ramp',
    latitude: 28.71470,
    longitude: 77.11380,
    severity: 'high',
    reporter_type: 'resident',
    status: 'verified',
    provenance: 'CITIZEN_HAZARD_REPORT',
    created_at: '2026-10-08T10:00:00',
    updated_at: '2026-10-08T11:00:00',
    reviewer_notes: 'Audit confirmed non-compliance with IRC:103-2022 Section 5.4.'
  }
];

export const mockIPAResults: IPAResults = {
  station_id: 1,
  sample_size: 34,
  confidence_warning: false,
  confidence_note: 'Adequate sample size (N=34 > 30) for IPA analysis.',
  importance_median: 5.2,
  satisfaction_median: 2.8,
  attributes: [
    {
      attribute_key: 'universal_design',
      attribute_label: 'Universal Design & Step-Free Kerb Ramps',
      mean_importance: 5.62,
      mean_satisfaction: 2.18,
      quadrant: 'concentrate_here',
      priority_level: 'High Priority',
      description: 'Major gap between high importance and low satisfaction.'
    },
    {
      attribute_key: 'traffic_conflict',
      attribute_label: 'E-Rickshaw Feeder Conflict Isolation',
      mean_importance: 5.41,
      mean_satisfaction: 2.29,
      quadrant: 'concentrate_here',
      priority_level: 'High Priority',
      description: 'Critical bottleneck area requiring dedicated holding bay.'
    },
    {
      attribute_key: 'footpath_continuity',
      attribute_label: 'Continuous Clear Walking Width (IRC:103)',
      mean_importance: 5.35,
      mean_satisfaction: 2.38,
      quadrant: 'concentrate_here',
      priority_level: 'High Priority',
      description: 'Encroachments and broken surfaces reduce effective width below 2.5m.'
    },
    {
      attribute_key: 'crossing_safety',
      attribute_label: 'Zebra Crossing Sightline & Protection',
      mean_importance: 5.24,
      mean_satisfaction: 2.50,
      quadrant: 'concentrate_here',
      priority_level: 'High Priority',
      description: 'Midblock crossings lack pedestrian refuge islands.'
    },
    {
      attribute_key: 'last_mile_access',
      attribute_label: 'Metro Interchange Feeder Proximity',
      mean_importance: 5.12,
      mean_satisfaction: 3.44,
      quadrant: 'keep_up_good_work',
      priority_level: 'Maintain Quality',
      description: 'Passengers appreciate close proximity of feeder services.'
    },
    {
      attribute_key: 'illumination',
      attribute_label: 'Streetlighting Consistency',
      mean_importance: 4.70,
      mean_satisfaction: 2.65,
      quadrant: 'low_priority',
      priority_level: 'Secondary Priority',
      description: 'Under-viaduct lighting needs minor pole upgrades.'
    },
    {
      attribute_key: 'weather_comfort',
      attribute_label: 'Canopy / Rain Shading on Walkways',
      mean_importance: 4.15,
      mean_satisfaction: 2.45,
      quadrant: 'low_priority',
      priority_level: 'Secondary Priority',
      description: 'Tree canopy partially shelters north walkway.'
    },
    {
      attribute_key: 'signage_wayfinding',
      attribute_label: 'Pedestrian Directional Wayfinding',
      mean_importance: 3.82,
      mean_satisfaction: 3.88,
      quadrant: 'possible_overkill',
      priority_level: 'Adequate',
      description: 'Metro exit signage is clear and sufficient.'
    }
  ]
};

export const mockScenarios: MMIScenario[] = [
  {
    id: 1,
    station_id: 1,
    name: 'UTTIPEC Feeder Integration Concept 2026',
    description: 'Demarcated 8-bay e-rickshaw queue apron along Gate 2 service road with 2.5m protected pedestrian corridor and bulb-out curb ramps.',
    author: 'UTTIPEC Planning Cell',
    status: 'draft',
    created_at: '2026-10-10T10:00:00',
    updated_at: '2026-10-12T14:00:00',
    zones: [
      {
        id: 1,
        scenario_id: 1,
        zone_type: 'feeder_bay',
        name: 'Gate 2 Designated E-Rickshaw Holding Bay',
        geometry_geojson: {
          type: 'Polygon',
          coordinates: [[[77.11545, 28.71510], [77.11565, 28.71535], [77.11575, 28.71530], [77.11555, 28.71505], [77.11545, 28.71510]]]
        },
        candidate_capacity: 12,
        est_throughput_pax_hr: 480,
        walking_distance_to_station_m: 25.0,
        addressed_issues: ['Footpath apron blockage', 'Double parking'],
        potential_new_conflicts: [],
        missing_measurements: [],
        is_authority_approved: false,
        created_at: '2026-10-10T10:00:00'
      }
    ]
  }
];

export const mockCrashes: CrashContext[] = [
  {
    id: 1,
    name: 'Madhuban Chowk to Rithala Metro Corridor (Outer Ring Road)',
    zone_type: 'blackspot_corridor',
    latitude: 28.71180,
    longitude: 77.12150,
    buffer_radius_m: 500,
    fatal_crashes_count: 14,
    total_crashes_count: 32,
    reporting_period: '2020-2023',
    data_source: 'Delhi Traffic Police Annual Crash Fatalities & Blackspots Report 2023',
    source_url: 'https://delhitrafficpolice.nic.in/reports',
    notes: 'High speed vehicular traffic, lack of mid-block pedestrian refuge island, e-rickshaw boarding in active lane',
    provenance: 'OFFICIAL_CRASH_CONTEXT'
  }
];
