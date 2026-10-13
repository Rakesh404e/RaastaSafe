import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Star, Send, CheckCircle2, Heart, HelpCircle,
  Sparkles, Users, MessageSquare
} from 'lucide-react';

interface PublicSurveySectionProps {
  onSubmitted?: () => void;
}

export const PublicSurveySection: React.FC<PublicSurveySectionProps> = ({ onSubmitted }) => {
  const [commuterType, setCommuterType] = useState('daily_metro_rider');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1-5 Star ratings translated to 1-6 scale for Kar et al. IPA engine
  const [ratings, setRatings] = useState<Record<string, number>>({
    universal_design: 4,      // Kerb ramps & tactile pavers
    illumination: 3,          // Night lighting
    safety_security: 4,       // General personal safety
    traffic_conflict: 3,      // Conflict with motor vehicles / e-rickshaws
    footpath_continuity: 3,   // Footpath width & no missing slabs
    crossing_safety: 4        // Zebra crossing ease
  });

  const questions = [
    {
      id: 'footpath_continuity',
      title: 'Footpath Width & Continuous Surface',
      desc: 'Are pavements wide enough (min 2.5m) and free of broken slabs or debris?'
    },
    {
      id: 'universal_design',
      title: 'Kerb Ramps & Step-Free Accessibility',
      desc: 'Can wheelchairs, prams, or senior citizens cross smoothly without high curbs?'
    },
    {
      id: 'traffic_conflict',
      title: 'E-Rickshaw & Traffic Conflict',
      desc: 'Do informal e-rickshaw feeder queues spill into walking paths or block crossings?'
    },
    {
      id: 'crossing_safety',
      title: 'Road Crossing & Zebra Crossing Safety',
      desc: 'Is it easy and safe to cross arterial roads connecting to the station gates?'
    },
    {
      id: 'illumination',
      title: 'Night Streetlighting & Shadows',
      desc: 'Are walkways around the metro gates brightly lit and free from dark blindspots?'
    },
    {
      id: 'safety_security',
      title: 'Overall Comfort & Last-Mile Safety',
      desc: 'How secure and pleasant do you feel walking the last-mile to Rohini West?'
    }
  ];

  const handleStarClick = (questionId: string, starValue: number) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: starValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Map 1-5 stars into 1-6 scale format expected by IPA backend
      const mappedResponses: Record<string, { importance: number; satisfaction: number }> = {
        universal_design: { importance: 6, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.universal_design * 1.2))) },
        illumination: { importance: 5, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.illumination * 1.2))) },
        safety_security: { importance: 6, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.safety_security * 1.2))) },
        traffic_conflict: { importance: 5, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.traffic_conflict * 1.2))) },
        footpath_continuity: { importance: 5, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.footpath_continuity * 1.2))) },
        crossing_safety: { importance: 6, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.crossing_safety * 1.2))) },
        weather_comfort: { importance: 4, satisfaction: 3 },
        signage_wayfinding: { importance: 3, satisfaction: 4 },
        last_mile_access: { importance: 6, satisfaction: Math.min(6, Math.max(1, Math.round(ratings.safety_security * 1.2))) }
      };

      await api.submitSurvey({
        station_id: 1,
        responses: mappedResponses,
        commuter_type: commuterType,
        gender: gender !== 'prefer_not_to_say' ? gender : undefined,
        notes: comments || undefined
      });

      setIsSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      alert(err.message || 'Error submitting walkability feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-emerald-100">
            Commuter Walkability Pulse
          </span>
          <h2 className="text-2xl font-black mt-2">1-Minute Station Walkability Rating</h2>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Your anonymous ratings directly calibrate the station's <b>Importance–Performance Analysis (IPA)</b> to advocate for civic funding where it matters most.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20 text-xs">
          <Heart className="w-4 h-4 text-emerald-300" />
          <span>Community Powered</span>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 border border-civic-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-civic-900">Thank you for rating Rohini West!</h3>
          <p className="text-xs text-civic-600 max-w-md mx-auto leading-relaxed">
            Your feedback has been logged into the municipal evidence database. Station planners and DMRC engineers will see your aggregated ratings in the <b>Kar et al. (2026) IPA Matrix</b>.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-5 py-2 bg-transit-indigo text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all"
          >
            Submit Another Commuter Rating
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-200 shadow-sm space-y-6">
          {/* Commuter Profile Row */}
          <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-civic-100 text-xs">
            <div>
              <label className="block font-bold text-civic-700 mb-1">Your Commute Profile</label>
              <select
                value={commuterType}
                onChange={(e) => setCommuterType(e.target.value)}
                className="w-full p-2.5 border border-civic-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="daily_metro_rider">Daily Metro Commuter (Peak Hours)</option>
                <option value="local_resident">Local Rohini Sector 9/13 Resident</option>
                <option value="student">Student / Young Commuter</option>
                <option value="senior_citizen">Senior Citizen</option>
                <option value="wheelchair_or_pram">Person with Reduced Mobility / Wheelchair / Pram</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-civic-700 mb-1">Gender (Optional, for safety equity metrics)</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 border border-civic-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary / Other</option>
              </select>
            </div>
          </div>

          {/* Interactive Rating Questions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-civic-800">
              Rate Station Walkway Conditions (1 = Poor, 5 = Excellent)
            </h4>

            <div className="grid gap-3">
              {questions.map((q) => {
                const currentScore = ratings[q.id] || 3;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl border border-civic-200/80 hover:border-civic-300 bg-civic-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-civic-900">{q.title}</div>
                      <div className="text-[11px] text-civic-500">{q.desc}</div>
                    </div>

                    {/* Star Rating Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center bg-white px-3 py-1.5 rounded-xl border border-civic-200 shadow-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(q.id, star)}
                          className="p-1 hover:scale-115 transition-transform"
                          title={`${star} Stars`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= currentScore
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-civic-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-civic-700 ml-1.5 min-w-[20px] text-center">
                        {currentScore}/5
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optional Commuter Comment */}
          <div>
            <label className="block text-xs font-bold text-civic-700 mb-1">
              Suggestions or Specific Location Issues (Optional)
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Rickshaws crowding near Gate 2 zebra crossing make it hard to reach the bus stop in the rain..."
              className="w-full p-3 text-xs border border-civic-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Rating...' : 'Submit Walkability Rating'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
