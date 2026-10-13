# RaastaSafe — Data Provenance, Licensing, and Methodology Register

**Version:** 1.0.0  
**Repository:** RaastaSafe — Metro-Area Pedestrian Audit and Last-Mile Mobility Planner  
**Date:** October 2026  

---

## 1. Data Provenance Classification

All geographic, survey, and audit records processed by RaastaSafe carry an immutable data provenance flag:

| Provenance Level | Description | Handling & Visualization Guardrails |
|---|---|---|
| `OBSERVED_FIELD_DATA` | Verified on-ground audits captured with coordinates, timestamps, measurements, and field photos by trained auditors. | Displayed with full attribute detail and verification badge; eligible for priority engine scoring. |
| `CITIZEN_HAZARD_REPORT` | Crowdsourced public hazard submissions. | Displayed as `Unverified` until confirmed by a field reviewer; duplicate detection prevents artificial score inflation. |
| `OFFICIAL_PLANNING_REFERENCE` | Published government drafts (e.g. UTTIPEC MMI concept plans, DDA layout plans). | Explicitly marked as "Planning Concept (Not As-Built)"; rendered on a distinct reference overlay layer. |
| `OFFICIAL_CRASH_CONTEXT` | Aggregated road safety statistics from Delhi Traffic Police / OpenCity. | Rendered as macro corridor or circle buffer; never synthesized into micro-point black spots. |
| `DEMO_SYNTHETIC` | High-fidelity synthetic records generated for testing, demonstration, and algorithm verification. | Always carries a visible `[DEMO / SYNTHETIC]` tag in UI, API responses, and exported reports. |

---

## 2. External Dataset Inventory & Licensing

### A. OpenStreetMap (OSM)
- **Source URL:** [https://www.openstreetmap.org](https://www.openstreetmap.org)
- **License:** Open Database License (ODbL) 1.0; Tiles © OpenStreetMap contributors.
- **Attribution Display:** "Map data © OpenStreetMap contributors, ODbL 1.0" rendered continuously on all Leaflet viewports.
- **Scope & Fields Extracted:** Station node coordinates, street network geometry, highway classifications, footway tags around Rohini West Metro Station.
- **Limitations:** OSM footway tags frequently lack measured width, surface condition, kerb ramp status, and obstruction details. OSM geometries serve as the initial spatial base, not proof of pedestrian accessibility.
- **Update Method:** Periodic Overpass API queries or local GeoJSON export updates with attribution retention.

### B. Indian Roads Congress (IRC:103-2022)
- **Document:** *Guidelines for Pedestrian Facilities* (Second Revision, June 2022).
- **Source:** Indian Roads Congress / Ministry of Road Transport and Highways.
- **License / Legal Status:** Public domain national technical standard.
- **Embedded Standards in RaastaSafe:**
  - Clear walking width threshold: $\ge 2.5\text{ m}$ in transit station catchment ($500\text{ m}$), $\ge 2.0\text{ m}$ general urban standard.
  - E-rickshaw / IPT stand spacing: within $100\text{ m}$ of transit station entrance, separated from pedestrian desire line.
  - At-grade crossings: spaced every $80\text{ m}$ to $150\text{ m}$.
- **Disclaimer:** IRC guidelines are planning standards and do not replace formal municipal approval or site-specific engineering drawings.

### C. DDA / UTTIPEC Multi-Modal Integration (MMI) Concept Plans
- **Source URL:** [https://uttipec.org.in/CommunityFeedback/Rohini](https://uttipec.org.in/CommunityFeedback/Rohini)
- **Agency:** Delhi Metro Rail Corporation (DMRC) / Creative Group Pvt. Ltd. / UTTIPEC (DDA).
- **Document Date:** Concept plan posted for community feedback on 18 February 2026.
- **License / Status:** Public planning document published for public review.
- **Limitations:** This is a conceptual feedback plan, not an approved or as-built infrastructure record.
- **Handling in Code:** Concept zones (feeder bays, plazas) are georeferenced as reference layers with explicit disclaimers: *"DDA/UTTIPEC Concept Plan for Feedback Only — Not Legally Approved or As-Built"*.

### D. Delhi Traffic Police Road Crash Statistics
- **Source URL:** [https://traffic.delhipolice.gov.in/delhi-crash-report-2023](https://traffic.delhipolice.gov.in/delhi-crash-report-2023)
- **Catalog Portal:** OpenCity Delhi Road Crash Datasets ([https://data.opencity.in](https://data.opencity.in))
- **Data Period:** 2014–2023 citywide totals, fatal crash statistics, pedestrian crash-prone junction lists.
- **Limitations & Ethics:** Public reports provide aggregate circle-level or junction-level data (e.g. Mukarba Chowk, Peera Garhi Chowk). Spatial coordinates are strictly limited to official named junctions. RaastaSafe does not impute pseudo-random coordinates to represent accidents at Rohini West station.

---

## 3. Privacy & Personal Data Protections

1. **Anonymous Public Reporting:** Citizen hazard reports do not require personally identifiable information (PII). Any optional contact emails provided during reporting are hashed or kept strictly confidential in reviewer-only views.
2. **Photographic Evidence Processing:** Auditors and users are advised not to submit photos featuring identifiable faces or vehicle license plates. Uploaded image assets are assigned random UUID filenames and sanitized before storage.
3. **No Direct Tracking:** The application performs client-side geolocation solely upon explicit user consent to populate latitude/longitude in the reporting form.

---

## 4. Reset & Reseed Scripts

The project maintains a deterministic seeding pipeline:
- `backend/scripts/seed_demo_data.py`: Generates the baseline Rohini West station nodes, exits, audited footpath segments, e-rickshaw queue observations, crossings, commuter surveys, and MMI scenarios.
- `backend/scripts/reset_db.py`: Cleans the SQLite database for automated testing and reproducible local setup.
