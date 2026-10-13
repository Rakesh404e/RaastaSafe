export type UserRole = 'public_visitor' | 'field_reviewer' | 'administrator';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface StationExit {
  id: number;
  station_id: number;
  exit_number: string;
  name: string;
  latitude: float;
  longitude: float;
  has_step_free_ramp: boolean;
  has_tactile_paving: boolean;
  has_curb_ramp: boolean;
  details?: string;
}

export type float = number;

export interface Station {
  id: number;
  name: string;
  code: string;
  line: string;
  latitude: number;
  longitude: number;
  boundary_radius_m: number;
  catchment_radius_m: number;
  description?: string;
  exits: StationExit[];
}

export interface FootpathSegment {
  id: number;
  station_id: number;
  name: string;
  street_name: string;
  side_of_street: string;
  geometry_geojson: {
    type: string;
    coordinates: number[][];
  };
  footpath_exists: boolean | null;
  total_width_m: number | null;
  clear_walking_width_m: number | null;
  blocked_length_m: number | null;
  blocked_share_pct: number | null;
  surface_quality: string;
  discontinuities_detected: boolean;
  has_curb_ramps: boolean | null;
  has_tactile_paving: boolean | null;
  lighting_condition: string;
  obstruction_types: string[];
  estimated_pedestrian_volume: number | null;
  volume_method?: string;
  observer_notes?: string;
  observer_confidence: string;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  provenance: string;
  created_at: string;
  irc_clear_width_compliant?: boolean | null;
  irc_deficit_m?: number | null;
}

export interface QueueObservation {
  id: number;
  station_id: number;
  location_geojson: {
    type: string;
    coordinates: number[] | number[][];
  };
  start_time: string;
  end_time: string;
  time_window: string;
  vehicle_count: number;
  queue_length_m: number;
  enters_walking_zone: boolean;
  enters_crossing: boolean;
  enters_cycle_lane: boolean;
  enters_carriageway: boolean;
  enters_metro_entrance: boolean;
  avg_wait_time_min?: number;
  wait_time_method?: string;
  nearby_marked_stand: string;
  conflict_description?: string;
  observer_confidence: string;
  verification_status: string;
  provenance: string;
  created_at: string;
}

export interface JunctionCrossingAudit {
  id: number;
  station_id: number;
  location_geojson: {
    type: string;
    coordinates: number[][] | number[];
  };
  crossing_type: string;
  is_marked: boolean;
  measured_crossing_distance_m?: number;
  traffic_speed_kmh?: number;
  traffic_volume?: number;
  sightline_blocked: boolean;
  has_curb_ramps: boolean;
  tactile_continuity: boolean;
  lighting_condition: string;
  observed_conflict_level: string;
  verification_status: string;
  provenance: string;
  created_at: string;
}

export interface ReportAuditHistory {
  id: number;
  report_id: string;
  previous_status: string;
  new_status: string;
  changed_by: string;
  notes?: string;
  timestamp: string;
}

export interface HazardReport {
  id: string;
  station_id: number;
  report_type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  image_url?: string;
  status: string;
  duplicate_of_id?: string;
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  reporter_type: string;
  provenance: string;
  created_at: string;
  updated_at: string;
  audit_history?: ReportAuditHistory[];
}

export interface IPACoordinate {
  attribute_key: string;
  attribute_label: string;
  mean_importance: number;
  mean_satisfaction: number;
  quadrant: string;
  priority_level: string;
  description: string;
}

export interface IPAResults {
  station_id: number;
  sample_size: number;
  confidence_warning: boolean;
  confidence_note: string;
  importance_median: number;
  satisfaction_median: number;
  attributes: IPACoordinate[];
}

export interface ProposedZone {
  id: number;
  scenario_id: number;
  zone_type: string;
  name: string;
  geometry_geojson: {
    type: string;
    coordinates: number[][][];
  };
  candidate_capacity: number;
  est_throughput_pax_hr: number;
  walking_distance_to_station_m: number;
  addressed_issues: string[];
  potential_new_conflicts: string[];
  missing_measurements: string[];
  is_authority_approved: boolean;
  created_at: string;
}

export interface MMIScenario {
  id: number;
  station_id: number;
  name: string;
  description: string;
  author: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  zones: ProposedZone[];
}

export interface ConflictCheckResult {
  zone_name: string;
  zone_type: string;
  overlap_with_pedestrian_path: boolean;
  overlap_with_crossing: boolean;
  distance_to_nearest_exit_m: number;
  irc_ipt_proximity_compliant: boolean;
  irc_notes: string[];
  potential_hazards_created: string[];
  missing_field_checks: string[];
  disclaimer: string;
}

export interface MMIScenarioConflictCheck {
  scenario_id: number;
  scenario_name: string;
  overall_status: string;
  conflicts: ConflictCheckResult[];
  legal_disclaimer: string;
}

export interface RouteStep {
  step_index: number;
  instruction: string;
  distance_m: number;
  clear_walking_width_m: number | null;
  is_step_free: boolean;
  barrier_warning?: string | null;
}

export interface RouteResult {
  found: boolean;
  total_distance_m: number;
  step_free_certified: boolean;
  unknown_accessibility_edges_count: number;
  steps: RouteStep[];
  path_coordinates: number[][];
  warning_message?: string | null;
}

export interface PriorityScoreComponent {
  name: string;
  raw_value: any;
  weight: number;
  weighted_score: number;
  description: string;
}

export interface LocationPriority {
  item_id: string;
  item_type: string;
  title: string;
  latitude: number;
  longitude: number;
  priority_rank: number;
  total_priority_score: number;
  priority_level: string;
  completeness_factor: number;
  is_data_sufficient: boolean;
  components: PriorityScoreComponent[];
  explanation: string;
  irc_guidance_clause: string;
  provenance: string;
}

export interface HotspotContributingItem {
  id: string;
  item_type: string;
  title: string;
  severity: string;
  distance_to_center_m: number;
  verification_status: string;
  provenance: string;
}

export interface HotspotCluster {
  cluster_id: string;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_m: number;
  total_observations_count: number;
  verified_count: number;
  highest_severity: string;
  priority_score: number;
  dominant_issue: string;
  contributing_items: HotspotContributingItem[];
  explanation: string;
}

export interface DashboardSummary {
  station_name: string;
  total_footpaths_audited_count: number;
  total_audited_length_m: number;
  clear_width_deficit_count: number;
  total_queue_observations_count: number;
  active_hazard_reports_count: number;
  verified_hazard_reports_count: number;
  high_priority_hazards_count: number;
  total_surveys_collected: number;
  active_mmi_scenarios_count: number;
  last_updated: string;
}

export interface CrashContext {
  id: number;
  name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  buffer_radius_m: number;
  fatal_crashes_count: number;
  total_crashes_count: number;
  reporting_period: string;
  data_source: string;
  source_url: string;
  notes?: string;
  provenance: string;
}
