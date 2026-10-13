import React, { useState, useEffect } from 'react';
import type { MMIScenario, MMIScenarioConflictCheck, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  Compass, ShieldAlert, CheckCircle2, AlertTriangle,
  Play, Plus, Info, ExternalLink, HelpCircle
} from 'lucide-react';

interface MMIPlanningTabProps {
  scenarios: MMIScenario[];
  onRefresh: () => void;
  userRole: UserRole;
}

export const MMIPlanningTab: React.FC<MMIPlanningTabProps> = ({
  scenarios,
  onRefresh,
  userRole
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(
    scenarios.length > 0 ? scenarios[0].id : null
  );
  const [conflictReport, setConflictReport] = useState<MMIScenarioConflictCheck | null>(null);
  const [checking, setChecking] = useState(false);

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  useEffect(() => {
    if (activeScenario) {
      runConflictCheck(activeScenario.id);
    }
  }, [selectedScenarioId]);

  const runConflictCheck = async (scenarioId: number) => {
    setChecking(true);
    try {
      const data = await api.getScenarioConflicts(scenarioId);
      setConflictReport(data);
    } catch (err: any) {
      console.error('Error running conflict checks', err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-bold text-civic-900">
          Multi-Modal Integration (MMI) Feeder Scenario Planner
        </h2>
        <p className="text-xs text-civic-500 mt-0.5">
          Evaluate designated e-rickshaw waiting bays and kiss-and-ride staging zones against IRC:103-2022 standards and audited pedestrian corridors.
        </p>
      </div>

      {/* Mandatory Statutory Disclaimer Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950">
            Statutory Design & Approval Notice
          </div>
          <p className="leading-relaxed">
            All proposed feeder stands and geometries are planning hypotheses for public evaluation only.
            Software conflict checks evaluate guideline consistency (IRC:103-2022 Chapter 12).
            <b> They do not constitute statutory engineering approval.</b> Formal implementation requires
            on-site geometric review and approval by DMRC, Delhi Traffic Police, and MCD.
          </p>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex gap-2 border-b border-civic-200 pb-2">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedScenarioId(s.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedScenarioId === s.id
                ? 'bg-civic-900 text-white shadow-md'
                : 'bg-white hover:bg-civic-100 text-civic-700 border border-civic-200'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {activeScenario && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* SCENARIO OVERVIEW & PROPOSED ZONES (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4">
              <div>
                <span className="text-[10px] font-bold text-transit-indigo bg-indigo-50 px-2.5 py-0.5 rounded font-mono uppercase">
                  Status: {activeScenario.status}
                </span>
                <h3 className="text-lg font-bold text-civic-900 mt-1">{activeScenario.name}</h3>
                <p className="text-xs text-civic-600 mt-1 leading-relaxed">{activeScenario.description}</p>
                <div className="text-[11px] text-civic-400 font-mono mt-2">Author: {activeScenario.author}</div>
              </div>

              <div className="pt-2 border-t border-civic-100 flex items-center justify-between">
                <span className="text-xs font-bold text-civic-800">
                  Proposed Zones ({activeScenario.zones.length})
                </span>
                <button
                  onClick={() => runConflictCheck(activeScenario.id)}
                  disabled={checking}
                  className="px-3 py-1.5 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  {checking ? 'Checking...' : 'Re-run Conflict Check'}
                </button>
              </div>

              <div className="space-y-3">
                {activeScenario.zones.map((zone) => (
                  <div key={zone.id} className="p-4 rounded-2xl bg-civic-50 border border-civic-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-transit-indigo bg-white px-2 py-0.5 rounded border border-civic-200">
                          {zone.zone_type.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-sm text-civic-900 mt-1">{zone.name}</h4>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-civic-500 block">Capacity</span>
                        <span className="font-bold text-civic-900">{zone.candidate_capacity} units</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-civic-200/60">
                      <div>
                        <span className="text-civic-500 block">Gate Walk Distance</span>
                        <span className="font-bold text-civic-900">{zone.walking_distance_to_station_m} m</span>
                      </div>
                      <div>
                        <span className="text-civic-500 block">Pax Throughput</span>
                        <span className="font-bold text-civic-900">{zone.est_throughput_pax_hr} pax/hr</span>
                      </div>
                    </div>

                    {zone.addressed_issues.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-emerald-800 block text-[11px]">Issues Addressed:</span>
                        <ul className="list-disc pl-4 text-emerald-700 text-[11px] space-y-0.5">
                          {zone.addressed_issues.map((iss, i) => (
                            <li key={i}>{iss}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AUTOMATED CONFLICT AUDIT REPORT (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-civic-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-civic-900">
                    Automated IRC:103-2022 Conflict Audit
                  </h3>
                  <p className="text-xs text-civic-500">Spatial overlap against measured pedestrian network</p>
                </div>
                {conflictReport && (
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono uppercase ${
                    conflictReport.overall_status.includes('Conflicts')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {conflictReport.overall_status}
                  </span>
                )}
              </div>

              {checking ? (
                <div className="p-8 text-center text-xs text-civic-500">
                  Running geometric intersection and buffer checks...
                </div>
              ) : conflictReport ? (
                <div className="space-y-4">
                  {conflictReport.conflicts.map((c, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-civic-50 border border-civic-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-civic-900">{c.zone_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.irc_ipt_proximity_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {c.irc_ipt_proximity_compliant ? 'IRC Proximity OK' : 'Exceeds 100m Proximity'}
                        </span>
                      </div>

                      {/* Guideline feedback notes */}
                      <div className="space-y-1 text-xs">
                        {c.irc_notes.map((note, nIdx) => (
                          <div key={nIdx} className="p-2 rounded-lg bg-white border border-civic-200/80 text-civic-700">
                            {note}
                          </div>
                        ))}
                      </div>

                      {/* Potential Hazards Created */}
                      {c.potential_hazards_created.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1">
                          <span className="font-bold text-red-900 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Potential Conflicts Created:
                          </span>
                          <ul className="list-disc pl-4 text-red-800 text-[11px] space-y-0.5">
                            {c.potential_hazards_created.map((haz, hIdx) => (
                              <li key={hIdx}>{haz}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Missing Measurements */}
                      {c.missing_field_checks.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                          <span className="font-bold text-amber-900 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-amber-600" /> Pending Engineering Surveys:
                          </span>
                          <ul className="list-disc pl-4 text-amber-800 text-[11px] space-y-0.5">
                            {c.missing_field_checks.map((chk, cIdx) => (
                              <li key={chk}>{chk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-civic-500">
                  Click 'Re-run Conflict Check' to evaluate scenario geometry.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
