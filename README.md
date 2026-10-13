# 🚶 RaastaSafe
### Metro-Area Pedestrian Audit and Last-Mile Feeder Mobility Planner
**Pilot Station:** Rohini West (Red Line, Delhi Metro) & Context Node: Rohini Sector-18

[![Live Demo](https://img.shields.io/badge/Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://rakeshsiwal.github.io/RaastaSafe/)
[![IRC:103-2022](https://img.shields.io/badge/Standard-IRC%3A103--2022-blue?style=for-the-badge)](https://irc.nic.in)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.141-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

---

## 📌 Problem Statement & Context

In developing megacities like Delhi, **public transit journeys do not end at the station exit gate**. Around elevated interchange stations like **Rohini West (Red Line)**, commuters face a fragmented, hostile last-mile environment:
- Footpaths frequently narrow below the **IRC:103-2022 minimum clear walking width of 2.5 meters** for transit nodes.
- High vertical curb drops ($>20\text{ cm}$) and missing curb ramps force wheelchairs, senior citizens, and strollers into active traffic.
- Informal electric rickshaws (*e-rickshaws*) provide indispensable feeder trips for thousands of commuters, yet lack designated holding aprons, leading to queue spillover across zebra crossings and station apron chokepoints.
- Traditional municipal apps treat civic issues as isolated tickets or deploy opaque "AI accident risk" black-boxes that lack physical audit grounding.

**RaastaSafe** bridges this gap through an evidence-based, dual-portal spatial platform that unites **everyday commuters** and **municipal authorities** (MCD, DMRC, UTTIPEC, Delhi Traffic Police) around transparent empirical data.

---

## 🌐 Live Demo & Dual-Portal Architecture

🔗 **Interactive Live Demo:** [https://rakeshsiwal.github.io/RaastaSafe/](https://rakeshsiwal.github.io/RaastaSafe/)

RaastaSafe features a 1-click persistent segmented switcher between two dedicated environments:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RAASTASAFE PLATFORM                                           │
│     [ 🚶 Public Commuter Portal ]                 [ 🏛️ Authority & Planning Console ]            │
└───────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         ▼                                                                             ▼
┌───────────────────────────────────────────────┐             ┌───────────────────────────────────────────────┐
│              PUBLIC COMMUTER SIDE             │             │          AUTHORITY & MANAGERS SIDE            │
│  Target: Daily Metro Commuters & Residents   │             │  Target: MCD, DMRC, UTTIPEC & Traffic Police  │
├───────────────────────────────────────────────┤             ├───────────────────────────────────────────────┤
│ 1. 🚨 Quick Hazard Reporting (GPS + Categories│             │ 1. 📊 Executive Dashboard (IRC:103 KPIs)      │
│ 2. 🗺️ Safety & Hazard Map (Gate Focus & Tap) │             │ 2. 🗺️ Multi-Layer GIS (100/250/500m rings)   │
│ 3. ⭐ 1-Minute Commuter Walkability Pulse     │             │ 3. 📐 Footpath Audits (Clear Width vs 2.5m)   │
│ 4. 🔍 Track My Report (Real-time Timeline)   │             │ 4. 🛡️ Reviewer Moderation & Duplicates        │
│                                               │             │ 5. 🛺 Feeder Queues & Intrusion Dynamics      │
│                                               │             │ 6. 🎯 Priority Hotspots (75m Spatial Clusters)│
│                                               │             │ 7. 📈 Kar et al. (2026) 4-Quadrant IPA Matrix │
│                                               │             │ 8. 🏗️ UTTIPEC MMI Scenario Studio & Conflicts │
│                                               │             │ 9. 📥 Official CSV & ReportLab PDF Exports    │
└───────────────────────────────────────────────┘             └───────────────────────────────────────────────┘
```

---

## 🚶 Side 1: Public Commuter Portal (`Nagrik Portal`)

Designed for daily riders, senior citizens, and local residents around Rohini West Metro Station:

- **🚨 Quick Hazard Reporting**: Category chips (*Missing Curb Ramp*, *Queue Spillover*, *Broken Paver / Drain Slab*, *Dark Spot*, *Commercial Encroachment*, *Unsafe Crossing*), 1-click GPS auto-detect, and immediate tracking ticket generation.
- **🗺️ Interactive Safety & Hazard Map**:
  - High-visibility markers (🔴 Severe Defect, 🛺 Feeder Queue, 🚇 Metro Gate, 🟢 Wide Path).
  - Quick filter pills: *All Items*, *Hazard Reports*, *E-Rickshaw Stands*, *Kerb Ramps*, *Metro Gates*.
  - **1-Click Gate Focus**: Instant zoom into `Gate 1 (Ramp Entry)`, `Gate 2 (Feeder Dropoff)`, `Gate 3 (FOB Stairs)`, or `Gate 4 (South-West)`.
  - **📍 Tap Map to Report**: Click anywhere on the map to drop a pin and automatically open the report form with coordinates pre-filled.
- **⭐ 1-Minute Commuter Walkability Pulse**: 5-star rating evaluating 6 key dimensions: Pavement Width, Wheelchair Ramps, Night Lighting, Rickshaw Orderliness, Road Crossings, and Overall Safety. Automatically calibrates the station's research IPA database.
- **🔍 Track My Report**: Live visual timeline tracking:
  $$\text{Submitted} \longrightarrow \text{Under Review} \longrightarrow \text{Verified} \longrightarrow \text{Scheduled for Repair} \longrightarrow \text{Resolved}$$

---

## 🏛️ Side 2: Authority & Planning Console

Built for municipal engineers (MCD/PWD), transit operators (DMRC), planning bodies (UTTIPEC), and Delhi Traffic Police:

- **📊 Executive Dashboard**: Real-time station KPIs: IRC:103 2.5m deficit percentages, queue overflow lengths, compliance rates, and research citations.
- **🗺️ Multi-Layer Spatial GIS**: 100m, 250m, 500m catchment analysis, color-coded footpath deficit segments, feeder queue polygons, and official Delhi Traffic Police crash corridor blackspots.
- **📐 IRC:103-2022 Footpath Audits**: Segment-by-segment inventory calculating clear walking width deficits against the 2.5m transit interchange mandate, tactile paving, and curb ramp slopes.
- **🛡️ Reviewer Moderation & Duplicates**: Field reviewer workbench to triage citizen tickets, approve/verify, update repair status, and link spatial ($\le 50\text{ m}$) & text duplicates with 1 click.
- **🛺 Feeder Queues & Intrusion Dynamics**: Field observation logger tracking vehicle counts, queue lengths, passenger boarding wait times, and carriageway intrusion points.
- **🎯 Priority Hotspots**: 75-meter greedy spatial clustering algorithm grouping empirical field observations into prioritized intervention zones.
- **📈 Kar et al. (2026) IPA Matrix**: 4-Quadrant scatter plot (*Concentrate Here*, *Keep Up Good Work*, *Low Priority*, *Possible Overkill*) evaluating 9 last-mile attributes with sample size reliability warning ($N < 30$).
- **🏗️ UTTIPEC MMI Scenario Studio**: Feeder bay layout planner with automated spatial conflict checks against 2.5m walkways and zebra crossing sightlines.
- **📥 Official Data Exports**: Download streaming CSV datasets or generate official ReportLab PDF station audit packages.

---

## 🔬 Strict 3-Way Epistemological Separation

RaastaSafe strictly avoids opaque "AI accident risk" black boxes, maintaining an explicit separation across all data models and UI layers:

| Layer | Data Source & Provenance | Role in Platform |
| :--- | :--- | :--- |
| **1. Observed Audit Conditions** | `OBSERVED_FIELD_DATA` & `CITIZEN_HAZARD_REPORT` | Direct physical measurements (clear width vs 2.5m, curb ramp drop, paver condition, queue count & spillover). |
| **2. Explainable Improvement Priority** | Deterministic Formula: Width Deficit + Severity + Accessibility + Recurrence | Transparent engineering score (0–100) explaining *why* an intervention is urgent without synthetic claims. |
| **3. Macro Crash Context** | `OFFICIAL_CRASH_CONTEXT` (Delhi Traffic Police Blackspot Corridor Studies) | Macro-level arterial safety context along Madhuban Chowk / Outer Ring Road corridor with disclaimers. |

---

## 📚 Academic & Research Foundations

1. **Indian Roads Congress (IRC)**, *Guidelines for Pedestrian Facilities (Second Revision)*, **IRC:103-2022**, New Delhi. (Enforcing the 2.5m interchange width threshold & $\le 1:12$ curb ramp slopes).
2. **Bivina, G. R., Gupta, A., & Parida, M. (2019)**, *Influence of pedestrian infrastructure on perceived quality of service at transit stations*, **Transport Policy**, 81, 142–155.
3. **Kar, A., Sharma, S., & Mathew, T. (2026)**, *Importance–Performance Analysis of Last-Mile Metro Feeder Environments in Developing Megacities*, **Journal of Public Transportation**.
4. **WRI India (2023)**, *Integrating Informal E-Rickshaw Ecosystems into Metro Station Catchment Design*, World Resources Institute India Ross Center.
5. **UTTIPEC (2022)**, *Multi-Modal Integration (MMI) Concept Plan for Metro Station Rohini West*, Unified Traffic and Transportation Infrastructure (Planning & Engineering) Centre, Delhi Development Authority.
6. **Delhi Traffic Police (2023)**, *Delhi Road Crash Fatalities and Vulnerable Road User Vulnerability Report*, Government of NCT of Delhi.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React-Leaflet & Leaflet 1.9, Lucide React.
- **Backend**: FastAPI 0.141, SQLAlchemy 2.0 ORM, Pydantic v2, PyJWT, Bcrypt, SQLite (spatial-ready GeoJSON schemas).
- **Export & Analytics**: ReportLab PDF generator, Shapely spatial operations, Python math/statistics.
- **Testing**: Pytest (10/10 automated tests passing), Vitest / TypeScript strict build verification.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/rakeshsiwal/RaastaSafe.git
cd RaastaSafe

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy pydantic shapely reportlab pyjwt bcrypt pytest

# Seed demo dataset for Rohini West station
python backend/scripts/seed_demo_data.py

# Run backend automated tests (10/10 pass)
pytest backend/app/tests/test_raastasafe_backend.py

# Launch FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
Swagger API docs will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Run frontend development server
npm run dev
```
Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

---

## 🔑 Test Credentials for Hackathon Evaluators

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Public Visitor** | *(No login)* | *(None)* | Full access to Public Portal (report hazards, view map, rate walkability, track reports). |
| **Field Reviewer** | `reviewer` | `ReviewerPass123!` | Moderation workbench, ticket verification, duplicate linking. |
| **Administrator** | `admin` | `AdminPass123!` | MMI scenario creation, system configuration, priority exports. |
| **Observer Mode** | *(1-Click Button)* | *(None)* | Read-only inspection of all 9 engineering console modules. |

---

## 📄 License & Attribution

- **License**: MIT License.
- **Map Data**: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
- **Statutory Notice**: Advisory research planning concept. All proposed engineering schemes subject to municipal approval by MCD, DDA, UTTIPEC, and Delhi Traffic Police.
