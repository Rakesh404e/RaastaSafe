import React, { useState, useEffect } from 'react';
import type { IPAResults, IPACoordinate } from '../../types';
import { api } from '../../services/api';
import {
  BarChart2, Users, AlertCircle, CheckCircle2,
  HelpCircle, ArrowUpRight, Plus, Sparkles
} from 'lucide-react';

interface IPASurveyTabProps {
  onRefresh?: () => void;
}

export const IPASurveyTab: React.FC<IPASurveyTabProps> = () => {
  const [ipaData, setIpaData] = useState<IPAResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttr, setSelectedAttr] = useState<IPACoordinate | null>(null);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Form ratings on 1-6 scale
  const [ratings, setRatings] = useState<Record<string, { importance: number; satisfaction: number }>>({
    universal_design: { importance: 6, satisfaction: 2 },
    illumination: { importance: 5, satisfaction: 2 },
    safety_security: { importance: 6, satisfaction: 3 },
    traffic_conflict: { importance: 5, satisfaction: 2 },
    footpath_continuity: { importance: 5, satisfaction: 2 },
    crossing_safety: { importance: 6, satisfaction: 3 },
    weather_comfort: { importance: 4, satisfaction: 3 },
    signage_wayfinding: { importance: 3, satisfaction: 5 },
    last_mile_access: { importance: 6, satisfaction: 2 }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIPA();
  }, []);

  const loadIPA = async () => {
    setLoading(true);
    try {
      const data = await api.getIPAResults(1);
      setIpaData(data);
      if (data.attributes.length > 0) setSelectedAttr(data.attributes[0]);
    } catch (err: any) {
      console.error('Error fetching IPA results', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (key: string, field: 'importance' | 'satisfaction', value: number) => {
    setRatings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitSurvey({
        station_id: 1,
        responses: ratings,
        commuter_type: 'daily_metro_rider',
        notes: 'User submitted feedback'
      });
      setIsSurveyModalOpen(false);
      loadIPA();
    } catch (err: any) {
      alert('Error submitting survey');
    } finally {
      setSubmitting(false);
    }
  };

  // Quadrant color mapping
  const getQuadrantStyle = (quadrant: string) => {
    switch (quadrant) {
      case 'Concentrate Here':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-600 text-white' };
      case 'Keep Up Good Work':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600 text-white' };
      case 'Low Priority':
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-500 text-white' };
      case 'Possible Overkill':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500 text-white' };
      default:
        return { bg: 'bg-civic-50', border: 'border-civic-200', text: 'text-civic-700', badge: 'bg-civic-600 text-white' };
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-civic-900">
            Commuter Importance–Performance Analysis (IPA)
          </h2>
          <p className="text-xs text-civic-500 mt-0.5">
            Grounded in Kar et al. (2026) Delhi Metro walk access methodology. Evaluates 9 street attributes on 1–6 Likert scale.
          </p>
        </div>
        <button
          onClick={() => setIsSurveyModalOpen(true)}
          className="px-4 py-2 bg-transit-indigo hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Submit Commuter Rating
        </button>
      </div>

      {/* Sample Size & Confidence Alert */}
      {ipaData && (
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          ipaData.confidence_warning
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {ipaData.confidence_warning ? (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5">
            <div className="font-bold">
              Sample Size: N = {ipaData.sample_size} Commuter Responses
            </div>
            <div className="leading-relaxed text-[11px] opacity-90">
              {ipaData.confidence_note}
            </div>
          </div>
        </div>
      )}

      {/* Main 4-Quadrant Visual Plot & Details */}
      {loading || !ipaData ? (
        <div className="p-12 text-center text-xs text-civic-500">Loading IPA Matrix...</div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* SVG Scatter Plot (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-civic-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-civic-800 uppercase tracking-wide">
                4-Quadrant Performance Grid
              </span>
              <span className="text-civic-500 text-[11px] font-mono">
                X: Satisfaction (1-6) | Y: Importance (1-6)
              </span>
            </div>

            {/* Custom SVG Interactive Matrix */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-civic-50/50 rounded-2xl border border-civic-200 overflow-hidden p-6 select-none">
              {/* Quadrant Background Labels */}
              <div className="absolute top-8 left-8 text-[11px] font-extrabold text-red-500/70 tracking-wider uppercase pointer-events-none">
                Quadrant I: Concentrate Here<br />
                <span className="text-[9px] font-normal text-red-400">High Importance, Low Satisfaction</span>
              </div>
              <div className="absolute top-8 right-8 text-[11px] font-extrabold text-emerald-600/70 tracking-wider uppercase text-right pointer-events-none">
                Quadrant II: Keep Up Good Work<br />
                <span className="text-[9px] font-normal text-emerald-400">High Importance, High Satisfaction</span>
              </div>
              <div className="absolute bottom-8 left-8 text-[11px] font-extrabold text-slate-500/70 tracking-wider uppercase pointer-events-none">
                Quadrant III: Low Priority<br />
                <span className="text-[9px] font-normal text-slate-400">Low Importance, Low Satisfaction</span>
              </div>
              <div className="absolute bottom-8 right-8 text-[11px] font-extrabold text-amber-500/70 tracking-wider uppercase text-right pointer-events-none">
                Quadrant IV: Possible Overkill<br />
                <span className="text-[9px] font-normal text-amber-400">Low Importance, High Satisfaction</span>
              </div>

              {/* Crosshair Lines */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                {/* Axes */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />

                {/* Plot Attributes */}
                {ipaData.attributes.map((attr, idx) => {
                  // Map scale 1 to 6 into 0 to 100
                  // Sat (x): 1 -> 5, 6 -> 95
                  const cx = Math.max(8, Math.min(92, ((attr.mean_satisfaction - 1) / 5) * 84 + 8));
                  // Imp (y): 1 -> 95 (bottom), 6 -> 5 (top)
                  const cy = Math.max(8, Math.min(92, 100 - (((attr.mean_importance - 1) / 5) * 84 + 8)));

                  const isSelected = selectedAttr?.attribute_key === attr.attribute_key;
                  const isQuad1 = attr.quadrant === 'Concentrate Here';

                  return (
                    <g
                      key={attr.attribute_key}
                      onClick={() => setSelectedAttr(attr)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 6 : 4.5}
                        fill={isQuad1 ? '#dc2626' : (attr.quadrant === 'Keep Up Good Work' ? '#059669' : '#64748b')}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        className="transition-all hover:scale-125"
                      />
                      <text
                        x={cx + 5}
                        y={cy - 2}
                        fontSize="3.8"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fill="#1e293b"
                        className="pointer-events-none select-none font-sans"
                      >
                        {idx + 1}. {attr.attribute_label.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ATTRIBUTE INSPECTOR & QUADRANT LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedAttr && (
              <div className={`p-5 rounded-3xl border shadow-sm space-y-3 ${getQuadrantStyle(selectedAttr.quadrant).bg} ${getQuadrantStyle(selectedAttr.quadrant).border}`}>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getQuadrantStyle(selectedAttr.quadrant).badge}`}>
                    {selectedAttr.quadrant}
                  </span>
                  <span className="text-xs font-mono font-bold text-civic-600">
                    Priority: {selectedAttr.priority_level}
                  </span>
                </div>

                <h3 className="font-bold text-base text-civic-900">
                  {selectedAttr.attribute_label}
                </h3>
                <p className="text-xs text-civic-700 leading-relaxed">
                  {selectedAttr.description}
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-white/80 rounded-xl border border-civic-200/60 text-xs">
                  <div>
                    <span className="text-civic-500 block">Stated Importance</span>
                    <span className="font-extrabold text-civic-900 text-sm">
                      {selectedAttr.mean_importance.toFixed(2)} / 6.00
                    </span>
                  </div>
                  <div>
                    <span className="text-civic-500 block">Observed Satisfaction</span>
                    <span className="font-extrabold text-civic-900 text-sm">
                      {selectedAttr.mean_satisfaction.toFixed(2)} / 6.00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* List of all 9 attributes with quadrant indicators */}
            <div className="bg-white rounded-2xl border border-civic-200 divide-y divide-civic-100 overflow-hidden shadow-sm">
              {ipaData.attributes.map((attr, i) => (
                <div
                  key={attr.attribute_key}
                  onClick={() => setSelectedAttr(attr)}
                  className={`p-3 text-xs flex items-center justify-between cursor-pointer hover:bg-civic-50 transition-colors ${
                    selectedAttr?.attribute_key === attr.attribute_key ? 'bg-civic-50/80 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-civic-100 flex items-center justify-center font-bold text-[10px] text-civic-600">
                      {i + 1}
                    </span>
                    <span className="text-civic-800">{attr.attribute_label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    attr.quadrant === 'Concentrate Here' ? 'bg-red-100 text-red-800' : 'bg-civic-100 text-civic-600'
                  }`}>
                    {attr.quadrant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SURVEY SUBMISSION MODAL */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-civic-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-civic-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-civic-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Commuter Importance & Satisfaction Survey</h3>
                <p className="text-xs text-civic-400">Rate local street accessibility on a 1 (Lowest) to 6 (Highest) scale</p>
              </div>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-civic-400 hover:text-white text-lg p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitSurvey} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid gap-3">
                {Object.entries(ratings).map(([key, val]) => (
                  <div key={key} className="p-3 bg-civic-50 rounded-xl border border-civic-200/80 text-xs space-y-2">
                    <div className="font-bold text-civic-900 capitalize">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-civic-600 text-[11px] mb-1">
                          <span>Importance (1=Trivial, 6=Essential)</span>
                          <span className="font-bold text-transit-indigo">{val.importance} / 6</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={val.importance}
                          onChange={(e) => handleRatingChange(key, 'importance', parseInt(e.target.value))}
                          className="w-full accent-transit-indigo"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-civic-600 text-[11px] mb-1">
                          <span>Satisfaction (1=Abysmal, 6=Excellent)</span>
                          <span className="font-bold text-transit-teal">{val.satisfaction} / 6</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="6"
                          value={val.satisfaction}
                          onChange={(e) => handleRatingChange(key, 'satisfaction', parseInt(e.target.value))}
                          className="w-full accent-transit-teal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-civic-100">
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(false)}
                  className="px-4 py-2 bg-civic-100 text-civic-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-transit-indigo text-white text-xs font-semibold rounded-xl"
                >
                  {submitting ? 'Submitting...' : 'Submit Ratings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
