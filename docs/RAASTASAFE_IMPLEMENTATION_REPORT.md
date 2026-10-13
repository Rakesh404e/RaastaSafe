# RaastaSafe — Metro-Area Pedestrian Audit and Last-Mile Mobility Planner
**Pilot Station:** Rohini West (Red Line, Delhi Metro) & Context Node: Rohini Sector-18

---

## 1. Dual-Portal System Architecture

To serve both everyday citizens and municipal authorities without interface clutter, **RaastaSafe** is structured into two dedicated portals accessible via a 1-click segmented switcher:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    RAASTASAFE PLATFORM                                          │
│     [ 🚶 Public Commuter Portal ]                 [ 🏛️ Authority & Planning Console ]            │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌───────────────────────────────────────────────┐             ┌───────────────────────────────────────────────┐
│              PUBLIC COMMUTER SIDE             │             │          AUTHORITY & MANAGERS SIDE            │
│  Target: Daily Metro Commuters & Residents   │             │  Target: MCD, DMRC, UTTIPEC & Traffic Police  │
├───────────────────────────────────────────────┤             ├───────────────────────────────────────────────┤
│ 1. 🚨 Quick Hazard Reporting (GPS + Photos)   │             │ 1. 📊 Executive Dashboard (IRC:103 KPIs)      │
│ 2. 🗺️ Live Safety & Barrier Map              │             │ 2. 🗺️ Multi-Layer GIS (100/250/500m rings)   │
│ 3. ♿ Step-Free Accessible Router (Dijkstra)  │             │ 3. 📐 Footpath Audits (Clear Width vs 2.5m)   │
│ 4. ⭐ 1-Minute Commuter Walkability Pulse     │             │ 4. 🛡️ Reviewer Moderation & Duplicates        │
│ 5. 🔍 Track My Report (Real-time Timeline)   │             │ 5. 🛺 Feeder Queues & Intrusion Logger        │
│                                               │             │ 6. 🎯 Priority Hotspots (75m Spatial Clusters)│
│                                               │             │ 7. 📈 Kar et al. (2026) 4-Quadrant IPA Matrix │
│                                               │             │ 8. 🏗️ UTTIPEC MMI Scenario Studio & Conflicts │
│                                               │             │ 9. 📥 Official CSV & ReportLab PDF Exports    │
└───────────────────────────────────────────────┘             └───────────────────────────────────────────────┘
```

---

## 2. Public Commuter Portal Details

The Public Portal is streamlined, mobile-responsive, and welcoming for daily riders, senior citizens, and persons with disabilities:

1. **🚨 Quick Hazard Reporting (`report`)**:
   - Frictionless form with category chips: *Missing Curb Ramp*, *E-Rickshaw Queue Spillover*, *Broken Paver / Drain Slab*, *Dark Spot*, *Encroachment*, and *Unsafe Road Crossing*.
   - One-click GPS retrieval with default anchor to Rohini West Metro exits.
   - Immediate generation of tracking code (e.g. `RPT-DEL-RWST-001`) with direct tracking link.

2. **🗺️ Live Safety & Hazard Map (`map`)**:
   - Clean Leaflet map displaying station gates, safe accessible paths, verified defect pins, and e-rickshaw feeder stands.

3. **♿ Step-Free Accessible Router (`routes`)**:
   - Dijkstra routing algorithm configured to avoid steps, vertical drops, and missing ramps.
   - Returns step-free certified paths with turn-by-turn walking instructions connecting station gates to local landmarks (e.g., Japanese Park, Sector 9 bus terminal).

4. **⭐ 1-Minute Commuter Walkability Pulse (`survey`)**:
   - 5-Star rating system covering 6 daily commuter dimensions: Pavement Width, Wheelchair Ramps, Night Lighting, Rickshaw Orderliness, Road Crossings, and Overall Safety.
   - Automatically translates ratings into the empirical **Kar et al. (2026)** Importance–Performance Analysis database.

5. **🔍 Track My Report (`track`)**:
   - Visual lifecycle stepper showing status transitions:
     `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Verified` $\rightarrow$ `Scheduled for Repair` $\rightarrow$ `Resolved`.
   - Displays assigned priority scores and official engineering review notes transparently.

---

## 3. Authority & Planning Console Details

Designed specifically for municipal engineers (MCD/PWD), transit operators (DMRC), planning authorities (UTTIPEC), and traffic police:

1. **📊 Executive Dashboard (`overview`)**:
   - Real-time station KPIs: Clear width deficit %, compliance with **IRC:103-2022** (2.5m standard), peak queue overflow meters, and research citations.

2. **🗺️ Multi-Layer GIS (`map`)**:
   - Comprehensive spatial inspection with 100m, 250m, and 500m catchment circles, footpath segments, queue polygons, citizen reports, and official Delhi Traffic Police crash corridor blackspots.

3. **📐 IRC:103-2022 Footpath Audits (`audits`)**:
   - Segment-by-segment audit table calculating clear walking width deficits against the 2.5m transit interchange mandate, continuous tactile paving, and curb ramp slopes.
   - Explainable priority engine modal decomposing scores (0–100) into width deficit, severity, universal accessibility penalty, and citizen recurrence.

4. **🛡️ Review & Duplicate Moderation (`admin`)**:
   - Field reviewer workbench for triaging incoming public hazard reports.
   - Automated spatial ($\le 50\text{ m}$) and textual duplicate detection with one-click master linking.
   - Status transition workflow from `submitted` to `resolved`.

5. **🛺 Feeder Queues & Intrusion Dynamics (`queues`)**:
   - Field queue observation logger tracking vehicle counts, queue lengths, passenger boarding wait times, and walking zone spillovers.

6. **🎯 Priority Hotspots (`hotspots`)**:
   - 75-meter greedy spatial clustering algorithm grouping empirical field observations into prioritized intervention zones.

7. **📈 Kar et al. (2026) IPA Matrix (`ipa`)**:
   - 4-Quadrant scatter plot (*Concentrate Here*, *Keep Up Good Work*, *Low Priority*, *Possible Overkill*) evaluating 9 last-mile attributes with sample size reliability warning ($N < 30$).

8. **🏗️ UTTIPEC MMI Scenario Studio (`planning`)**:
   - Scenario modeling tool for feeder bay allocation with automated spatial conflict checks against 2.5m clear walkways and zebra crossing sightlines.
   - Mandatory statutory disclaimer affirming advisory research status.

9. **📥 Data & PDF Exports (`exports`)**:
   - Streaming CSV downloads and ReportLab-generated official PDF audit summaries ready for municipal submission.

---

## 4. Verification & Health Summary

- **Backend Tests**: 10 out of 10 tests passed (`pytest backend/app/tests/test_raastasafe_backend.py`).
- **Frontend Build**: Vite + React production build compiled clean (`dist/` created).
- **Live Servers**:
  - Frontend: `http://127.0.0.1:5173/`
  - Backend: `http://127.0.0.1:8000/` (Swagger docs: `/docs`)
- **Live Endpoint Verification**: 13/13 endpoints verified with Status 200 OK.
