import React, { useState, useEffect } from 'react';
import type { HotspotCluster, LocationPriority } from '../../types';
import { api } from '../../services/api';
import {
  BarChart2, AlertTriangle, MapPin, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, Layers, Info
} from 'lucide-react';

interface HotspotsTabProps {
  onNavigateToMap: () => void;
}

export const HotspotsTab: React.FC<HotspotsTabProps> = ({ onNavigateToMap }) => {
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [priorityRankings, setPriorityRankings] = useState<LocationPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [hData, pData] = await Promise.all([
        api.getHotspots(1),
        api.getPriorityRanking(1)
      ]);
      setHotspots(hData);
      setPriorityRankings(pData);
      if (hData.length > 0) setExpandedCluster(hData[0].cluster_id);
    } catch (err: any) {
      console.error('Error loading hotspots', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-bold text-civic-900">Prioritized Intervention Hotspots</h2>
        <p className="text-xs text-civic-500 mt-0.5">
          Spatially clustered aggregations of on-ground hazard reports and footpath width deficits.
          Clusters are calculated over real observed coordinates (75m radius threshold) — never randomly synthesized.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-civic-500">
          Calculating spatial clusters and ranking interventions...
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* HOTSPOT CLUSTERS (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-bold text-civic-800 uppercase tracking-wide">
              Spatial Hazard Clusters ({hotspots.length})
            </h3>

            {hotspots.map((cl) => {
              const isExpanded = expandedCluster === cl.cluster_id;
              const isCritical = cl.highest_severity === 'Critical';
              return (
                <div
                  key={cl.cluster_id}
                  className="bg-white rounded-2xl border border-civic-200 overflow-hidden shadow-sm transition-all"
                >
                  <div
                    onClick={() => setExpandedCluster(isExpanded ? null : cl.cluster_id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-civic-50/60 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-transit-indigo bg-indigo-50 px-2 py-0.5 rounded">
                          {cl.cluster_id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {cl.highest_severity} Severity
                        </span>
                        <span className="text-xs text-civic-500 font-mono">
                          Radius: {cl.radius_m}m
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-civic-900">{cl.name}</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-civic-500">Priority Score</div>
                        <div className="text-xl font-extrabold text-civic-900">
                          {cl.priority_score.toFixed(1)} <span className="text-xs font-normal text-civic-400">/ 100</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-civic-400" /> : <ChevronDown className="w-5 h-5 text-civic-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-civic-100 space-y-4 bg-civic-50/30">
                      <p className="text-xs text-civic-700 leading-relaxed bg-white p-3 rounded-xl border border-civic-200/60">
                        {cl.explanation}
                      </p>

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-civic-800 block">
                          Contributing Field Observations ({cl.contributing_items.length})
                        </span>
                        <div className="space-y-1.5">
                          {cl.contributing_items.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded-xl bg-white border border-civic-200 text-xs flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-civic-900">{item.title}</span>
                                <div className="text-[11px] text-civic-500">
                                  {item.distance_to_center_m}m from cluster center | {item.item_type.replace('_', ' ')}
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] uppercase font-semibold">
                                {item.verification_status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* INDIVIDUAL LOCATION PRIORITY RANKINGS (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-civic-800 uppercase tracking-wide">
              Ranked Hazard Interventions
            </h3>

            <div className="bg-white rounded-2xl border border-civic-200 divide-y divide-civic-100 overflow-hidden shadow-sm">
              {priorityRankings.slice(0, 7).map((p) => (
                <div key={`${p.item_type}-${p.item_id}`} className="p-3.5 space-y-1.5 hover:bg-civic-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-civic-700">
                      #{p.priority_rank} {p.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.priority_level === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.total_priority_score} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-civic-600 line-clamp-2 leading-relaxed">
                    {p.explanation}
                  </p>
                  <div className="text-[10px] text-civic-400 font-mono">
                    Completeness: {(p.completeness_factor * 100).toFixed(0)}% | {p.provenance}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
