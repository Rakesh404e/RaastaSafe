# RaastaSafe — Research and Data Sources Register

**Document Version:** 1.0.0  
**Effective Date:** October 2026  
**Application Scope:** RaastaSafe Metro-Area Pedestrian Audit and Last-Mile Mobility Planner  
**Pilot Study Node:** Rohini West Metro Station (Delhi Metro Red Line, 28.7145° N, 77.1147° E) and Rohini Sector-18 Context

---

## 1. Guiding Philosophy & Methodology

RaastaSafe grounds its algorithms, data schema, and planning tools in published urban transportation research and official Indian road guidelines. Rather than framing e-rickshaws as an unmitigated nuisance or treating pedestrian walkability through opaque machine learning scores, RaastaSafe:

1. **Treats Last-Mile Feeder Mobility as an Integral Public Asset:** E-rickshaws provide low-cost, zero-emission last-mile connectivity critical for metro ridership. Conflicts arise from inadequate station curbside infrastructure and lack of designated staging space, not merely driver behavior.
2. **Maintains Clear Separation of Evidence Categories:**
   - *Direct Field Observations:* Ground-truth measurements of footpath width, clear walking width, physical obstructions, and queue spillovers.
   - *Improvement Priority Heuristic:* Transparent, explainable rule-based scoring based on clear walkway deficit, verified recurrence, hazard severity, and vulnerable user accessibility impact.
   - *Official Road Crash Context:* Coarse, authoritative data from Delhi Traffic Police, strictly preserving spatial granularity (preventing false black-spot attribution at micro-station scales).
3. **Explicitly Flags Data Provenance:** Every record is distinguished as `OBSERVED_FIELD_DATA`, `OFFICIAL_PLANNING_REFERENCE`, or `DEMO_SYNTHETIC`.

---

## 2. Formal Source Register & Academic References

### A. IRC:103-2022 — Guidelines for Pedestrian Facilities
- **Issuing Body:** Indian Roads Congress (IRC), Ministry of Road Transport and Highways, Government of India.
- **Publication Date:** Second Revision, June 2022.
- **Reference URL:** [https://law.resource.org/pub/in/bis/irc/irc.gov.in.078.2.2020.pdf](https://law.resource.org/pub/in/bis/irc/irc.gov.in.078.2.2020.pdf)
- **Key Clauses & Standards Used in RaastaSafe:**
  - *Clause 6.2 (Footpath Width Allocation):* Defines three distinct longitudinal zones:
    1. **Clear Pedestrian/Walking Zone:** Unobstructed path for continuous walking movement.
    2. **Dead / Frontage Zone:** Buffer between walking zone and building property line / fences (0.5 m to 1.0 m).
    3. **Multi-Utility Zone (MUZ):** Street furniture, tree pits, utility poles, bollards, and vending kiosks (1.0 m to 1.5 m).
  - *Clear Walking Zone Dimension:*
    - Standard urban streets: Minimum **2.0 m**.
    - High-footfall transit station zones / Metro node catchments: Minimum **2.5 m**.
  - *Clause 12.1 (Pedestrian Transit Integration):*
    - Priority pedestrian/cycling zone within **500 m** of station gates.
    - Intermediate Public Transport (IPT / E-rickshaws, autos) staging stands within **100 m** walking distance of transit entrances without crossing primary pedestrian corridors.
    - Frequent at-grade crossings spaced every **80 m to 150 m**.
- **Implementation in Code:**
  - `backend/app/algorithms/priority_engine.py`: Flags segments where `clear_walking_width_m < 2.5m` within 500m of Rohini West exits.
  - `backend/app/algorithms/mmi_planner.py`: Validates proposed e-rickshaw stands against the 100m proximity threshold and 2.5m clear corridor buffer.

---

### B. Bivina, Gupta & Parida (2019) — Perceived Walk Accessibility to Metro Stations
- **Journal:** *Transportation Research Part D: Transport and Environment*, Vol. 67, Feb 2019, pp. 142–155.
- **DOI:** [10.1016/j.trd.2018.11.007](https://doi.org/10.1016/j.trd.2018.11.007)
- **Key Findings:** Structural equation modeling over 600 commuters in Delhi Metro 800 m catchment areas demonstrated that safety and security are the single strongest latent determinants of perceived walk accessibility, exceeding pure distance or speed.
- **Application in Code:**
  - Commuter survey weightings incorporate safety/security, lighting, and perceived conflict as primary latent variables.
  - Catchment buffers include both the micro-audit boundary (300 m – 500 m) and the macro walk-access envelope (800 m).

---

### C. Kar, Sadhukhan & Parida (2026) — Integrated Revised IPA for Metro Walk Access
- **Journal:** *Journal of Urban Planning and Development*, Vol. 152, Issue 2, Mar 2026.
- **DOI:** [10.1061/JUPDDM.UPENG-5978](https://doi.org/10.1061/JUPDDM.UPENG-5978)
- **Key Findings:** Revised Importance–Performance Analysis (IPA) of 466 Delhi Metro commuters across 12 street attributes identified universal design (kerb ramps, tactile continuity), illumination, and weather shelter as the attributes with the highest performance deficit (High Importance, Low Satisfaction).
- **Application in Code:**
  - `backend/app/algorithms/ipa_engine.py`: Analyzes local 6-point Likert ratings into a 4-quadrant IPA matrix:
    - *Quadrant I (Concentrate Here):* High Importance (> median), Low Satisfaction (< median) -> Triggers audit escalation.
    - *Quadrant II (Keep Up Good Work):* High Importance, High Satisfaction.
    - *Quadrant III (Low Priority):* Low Importance, Low Satisfaction.
    - *Quadrant IV (Possible Overkill):* Low Importance, High Satisfaction.
  - Visual display explicitly communicates sample size $N$ and confidence threshold notices ($N < 30$).

---

### D. WRI India (2023) — Improving Metro Access in India: Evidence from Three Cities
- **Authors:** Aloke Mukherjee, Sowmya Muruganantham, Archana Balachandran, Sudeept Maiti, Prasanna Kumar Ganesh.
- **Source:** World Resources Institute (WRI) India Working Paper.
- **DOI:** [10.46830/wriwp.23.00009](https://doi.org/10.46830/wriwp.23.00009)
- **Key Findings:** Last-mile choices are acutely sensitive to passenger wait times and fare predictability. Women commuters experience significantly higher aversion to unorganized, lengthy waiting lines. Shared last-mile services and dedicated pedestrian pathways must be co-designed.
- **Application in Code:**
  - `QueueObservation` model captures sampled wait times, passenger queues, and spillover into walking corridors rather than merely counting parked vehicles.

---

### E. Kapoor & Brar (2022) — Smartphone Pedestrian Barrier Audits in Noida
- **Publication:** *AIoT Technologies and Applications for Smart Environments*, pp. 57–74.
- **DOI:** [10.1049/PBPC057E_ch4](https://doi.org/10.1049/PBPC057E_ch4)
- **Key Findings:** Field audits using mobile forms (ODK/KoboCollect) with timestamped geolocation and photographic evidence across 12 metro stations proved that human-verified micro-scale barrier mapping is substantially more reliable than remote satellite imagery.
- **Application in Code:**
  - Field audit workflow enforces coordinates, timestamps, observer confidence, structured obstruction tags, and reviewer verification states.

---

### F. Delhi Traffic Police Official Crash Reports & Crash-Prone Zones
- **Source:** Delhi Traffic Police Annual Crash Reports (2022, 2023) and OpenCity Datasets.
- **Portals:**
  - [https://traffic.delhipolice.gov.in/delhi-crash-report-2023](https://traffic.delhipolice.gov.in/delhi-crash-report-2023)
  - [https://data.opencity.in/dataset/delhi-road-crashes-data](https://data.opencity.in/dataset/delhi-road-crashes-data)
  - [https://data.opencity.in/dataset/delhi-accident-prone-areas](https://data.opencity.in/dataset/delhi-accident-prone-areas)
- **Authoritative Definition:** Delhi Traffic Police defines a pedestrian crash-prone zone as having $\ge 3$ fatal pedestrian crashes or $\ge 10$ total pedestrian crashes within a 500 m diameter over three consecutive years (e.g., Peera Garhi Chowk, Mukarba Chowk, Britannia Chowk).
- **Data Policy in RaastaSafe:**
  - Preserves macro-corridor boundary context.
  - **Does NOT** fabricate synthetic point-level crash markers at Rohini West station where micro-level police records are not publicly published.
  - **Does NOT** mislabel citizen complaints as "accident black spots".

---

### G. Unified Traffic and Transportation Infrastructure (Planning & Engineering) Centre (UTTIPEC)
- **Agency:** Delhi Development Authority (DDA), Govt. of NCT of Delhi.
- **References:**
  - *Rohini West Metro Station Multi-Modal Integration (MMI) Concept Plan:* Posted for community feedback on 18 February 2026 by DMRC / Creative Group Pvt. Ltd. ([https://uttipec.org.in/CommunityFeedback/Rohini](https://uttipec.org.in/CommunityFeedback/Rohini)).
  - *Rohini Sector-18 MMI Archive Plan:* ([https://uttipec.org.in/MultiModalIntegration_MMI_/Index](https://uttipec.org.in/MultiModalIntegration_MMI_/Index)).
- **Application in Code:**
  - Informs the pilot station layout for Rohini West.
  - Stored strictly as a "Draft / Proposed Planning Concept" with explicit disclaimers indicating it is not an approved as-built record.

---

### H. Walkable Cities & ITDP Pedestrian Facility Assessment
- **Sources:**
  - Walkable Cities StepUP Audit Methodology ([https://walkablecities.in/methodology](https://walkablecities.in/methodology))
  - ITDP *Pedestrians First: Tools for a Walkable City* ([https://itdp.org/wp-content/uploads/2024/09/pedestrians_FINAL.pdf](https://itdp.org/wp-content/uploads/2024/09/pedestrians_FINAL.pdf))
- **Application in Code:**
  - Prioritizes auditing key desire lines and pedestrian priority networks around transit hubs.
  - Segments paths into distinct survey blocks with standardized surface condition classifications.
