# RaastaSafe — Research Brief, Data Sources, and Antigravity Build Prompt

**Prepared:** 12 October 2026  
**Purpose:** Ground the RaastaSafe application in published research, official Delhi planning documents, pedestrian design guidance, and data that can actually be obtained. Then use this evidence as instructions for a coding agent to build a working full-stack application.

---

# Part I — Research findings

## 1. Recommended project framing

**RaastaSafe: Metro-Area Pedestrian Audit and Last-Mile Mobility Planner**

RaastaSafe should not be framed as a generic complaint map or as a tool to ban e-rickshaws. E-rickshaws are an important last-mile transport mode. The actual problem to investigate is how pedestrian space, station access, e-rickshaw waiting/queueing, pick-up/drop-off, road crossings, and accessibility facilities interact at a specific metro station.

The strongest product is a station-area evidence platform that:

1. Records field-observed footpath conditions, obstructions, accessible clear width, crossing issues and e-rickshaw queue spillover.
2. Combines structured audits with commuter experience data.
3. Ranks locations for inspection and improvement, with an explanation for every ranking.
4. Lets a planner explore alternative e-rickshaw waiting/pick-up arrangements without implying that a proposed design is approved.
5. Tracks the status of recommendations and allows export of a source-backed evidence report.

A distinctive angle is to compare **observed conditions** against published station-area planning references and pedestrian facility guidance, rather than collecting unstructured complaints alone.

## 2. High-signal research and what to take from it

### A. IRC:103-2022 — Guidelines for Pedestrian Facilities

- **Issuer:** Indian Roads Congress; second revision, June 2022.
- **Source:** https://law.resource.org/pub/in/bis/irc/irc.gov.in.078.2.2020.pdf
- **Relevant parts:** Chapter 6 covers pedestrian facility design standards, walking zones and footpaths; Chapter 12 addresses pedestrian facilities around transit stations; Annexure 5 describes qualitative walk-score/level-of-service assessment.
- **Useful guidance:** The document treats a footpath as separated space for pedestrian movement and divides its width into a clear pedestrian/walking zone, a frontage/dead zone and a multi-utility zone. It gives a general recommended minimum 2 m clear walking zone and recommends a 2.5 m walking zone for high-footfall places such as transit nodes/metro stations. It states that streets around roughly 500 m of station entry/exit should prioritise walking, cycling and intermediate public transport; it recommends locating IPT stands within 100 m walking distance, frequent at-grade crossings every 80–150 m, and traffic calming around transit stations.
- **How to use it:** Create audit fields for clear walking width, obstruction, continuity, surface, accessible ramps, crossing provision, lighting, and pickup/waiting-zone placement. Add configurable flags against the relevant guidance.
- **Caveat:** These are design guidelines, not a substitute for a site-specific engineering review, local rules, or approval by the responsible agency. Do not label a location “illegal” only because a software rule flags it.

### B. Bivina, Gupta & Parida (2019) — “Influence of microscale environmental factors on perceived walk accessibility to metro stations”

- **Journal:** Transportation Research Part D: Transport and Environment, Volume 67, February 2019, pages 142–155.
- **DOI/source:** https://doi.org/10.1016/j.trd.2018.11.007
- **Publisher page:** https://www.sciencedirect.com/science/article/pii/S1361920918303341
- **Study:** Interviews with about 600 residents in 800 m catchments of Delhi Metro stations; structural equation modelling was used to study pedestrian access perceptions.
- **Findings:** Safety/security, comfort/convenience, mobility/infrastructure, and traffic factors significantly influenced perceived walk access; safety/security was the most influential latent construct in their model.
- **How to use it:** Audit experience and street design alongside physical obstruction reports. Provide a short optional commuter survey covering safety, comfort, accessibility, lighting, crossings and traffic conflict. Make the station catchment configurable instead of assuming one universal walking radius.

### C. Kar, Sadhukhan & Parida (2026) — “Evaluation of Walk Access Environment around Metro Stations from Pedestrians’ Perspectives Using an Integrated Revised IPA Fuzzy c-Means Clustering Technique”

- **Journal:** Journal of Urban Planning and Development, Volume 152, Issue 2; published online 20 March 2026.
- **DOI/source:** https://doi.org/10.1061/JUPDDM.UPENG-5978
- **Publisher page:** https://ascelibrary.org/doi/abs/10.1061/JUPDDM.UPENG-5978
- **Study:** 466 Delhi metro commuters rated the importance and satisfaction of 12 service attributes on a six-point Likert scale. The research used revised Importance–Performance Analysis (IPA) and fuzzy c-means clustering to prioritise interventions.
- **Findings:** Universal design, illumination, safety/security and extreme-weather protection were identified as requiring immediate resource attention. Footpath availability itself performed relatively well in that study, while other aspects had different priorities.
- **How to use it:** Implement an interpretable IPA matrix first: attributes with high importance but low satisfaction become investigation priorities. Add fuzzy clustering only if enough survey responses exist. The research does not imply that the same ranking will hold at every Rohini station; collect local data.

### D. WRI India (2023) — “Improving Metro Access in India: Evidence from Three Cities”

- **Authors:** Aloke Mukherjee, Sowmya Muruganantham, Archana Balachandran, Sudeept Maiti and Prasanna Kumar Ganesh.
- **Source:** https://wri-india.org/research/improving-metro-access-india
- **Working-paper PDF:** https://wri-india.org/sites/default/files/Improving%20metro%20access%20in%20India_%20Working%20Paper.pdf
- **DOI:** https://doi.org/10.46830/wriwp.23.00009
- **Study:** A three-city survey of 7,200 metro commuters, including Delhi, Bengaluru and Nagpur.
- **Findings:** Last-mile choices are sensitive to wait times and cost. The report notes women’s greater aversion to long waits and stresses that last-mile arrangements need location-specific data; improved pedestrian access and low-cost, frequent shared services matter together.
- **How to use it:** Treat the e-rickshaw queue and waiting experience as part of the transport system, not only as an obstruction. Capture queue size, where queues spill over, approximate waiting times, and whether queues disrupt the clear walking corridor. Do not propose a pickup zone without considering passenger wait, capacity and access.

### E. Kapoor & Brar (2022) — “Use of smartphones application to identify pedestrian barriers around existing metro stations in Noida”

- **Publication:** In *AIoT Technologies and Applications for Smart Environments*, pages 57–74; DOI https://doi.org/10.1049/PBPC057E_ch4
- **Available page:** https://www.researchgate.net/publication/368375805_Use_of_smartphones_application_to_identify_pedestrian_barriers_around_existing_metro_stations_in_Noida
- **Method:** Used KoboCollect/Open Data Kit (ODK) and GPS field verification to identify pedestrian barriers around 12 consecutive Noida metro stations.
- **How to use it:** Build a structured phone-friendly field-audit workflow with coordinates, timestamps, categories and GPS/photo evidence. Field verification should be a first-class feature, not an afterthought.

### F. Delhi Traffic Police crash reports and crash-prone zones

- **Official Delhi Traffic Police crash report page:** https://traffic.delhipolice.gov.in/delhi-crash-report-2023
- **Traffic Police maps page:** https://www.traffic.delhipolice.gov.in/en/maps
- **2022 Delhi Crash Report PDF:** https://www.traffic.delhipolice.gov.in/sites/default/files/uploads/2022/Delhi-Crash-Report-2022.pdf
- **OpenCity resource catalogue:** https://data.opencity.in/dataset/delhi-road-crashes-data
- **Accident-prone-area dataset page:** https://data.opencity.in/dataset/delhi-accident-prone-areas
- **Useful data found:** A public catalogue lists city-level annual crash/fatality statistics for 2014–2023, victim-type statistics for 2019–2023, accused-vehicle summaries, the 2023 crash report, and a Delhi crash-prone-area map/list. The 2022 crash report describes pedestrian crash-prone zones using a threshold of three or more fatal pedestrian crashes or ten or more total pedestrian crashes within a 500 m diameter; named examples include Peera Garhi Chowk, Britannia Chowk and Mukarba Chowk.
- **How to use it:** Add an optional city-level official crash-context layer and cite its date and source. Inspect the report’s actual fields before import.
- **Critical data limitation:** The openly listed CSV resources described above are largely aggregate statistics, not necessarily point-level geocoded crashes suitable for station-scale mapping. Do not turn aggregate citywide counts into precise Rohini crash markers. Do not call RaastaSafe’s field-report hotspots “accident black spots” unless you have authoritative crash data that meets the relevant definition.

### G. Official station-area planning references for Rohini

- **DDA/UTTIPEC community-feedback page — MMI Plan of Rohini West Metro Station:** https://uttipec.org.in/CommunityFeedback/Rohini
  - Lists DMRC as the agency and Creative Group Pvt. Ltd. as consultant; the concept plan and section were posted for community feedback on 18 February 2026, with a displayed feedback deadline of 4 March 2026.
  - Use as a planning reference only. Verify the current approval/implementation state before describing it as an approved or as-built plan.
- **DDA/UTTIPEC multi-modal integration plan archive:** https://uttipec.org.in/MultiModalIntegration_MMI_/Index
  - Lists archived MMI plans, including Rohini Sector-18. A prior official MMI proposal drawing is also reproduced in an EPCA report: https://cdn.cseindia.org/epca/EPCA-Reports1999-1917/EPCA-Report104.pdf
- **How to use them:** Where a clean plan file is available, show it as a separate source-labelled reference. Do not automatically treat a PDF drawing as geospatially aligned with the live map. If accurate georeferencing is not available, let an administrator manually trace candidate zones on the basemap and record the drawing citation alongside the scenario.

### H. StepUP / Walkable Cities — practical walkability audit methodology

- **Methodology:** https://walkablecities.in/methodology
- **Useful approach:** Identify a Priority Walking Network based on connectivity, destinations and observed pedestrian importance. Select a smaller Audit Network, then inspect footpath segments and junctions through on-ground visits. Their method covers categories including unsafe/dark areas, footpath quality, waste, encroachment and obstruction, and breaks audits into manageable 500–800 m segments.
- **How to use it:** Do not aim to survey all of Rohini initially. Define a priority walking network around one station and audit its most important segments and junctions at multiple times of day.

### I. ITDP — Pedestrians First: Tools for a Walkable City

- **Guide:** https://itdp.org/wp-content/uploads/2024/09/pedestrians_FINAL.pdf
- **Useful approach:** The guide includes local/neighbourhood-scale walkability assessment around transit stations and explains that detailed field data is needed for meaningful small-area audits.
- **How to use it:** Use as a supplementary checklist source. Prefer IRC:103-2022 for India-specific design values and cite the origin of all rules exposed in the app.

### J. Delhi MMI implementation context

- **DMRC/Delhi station-area coverage reported by Indian Express (2021):** https://indianexpress.com/article/cities/delhi/delhi-metro-stations-pedestrian-friendly-congestion-7686118/
- **DMRC station-area pickup/drop, pedestrian pathways/plazas and multi-modal integration coverage (2022):** https://indianexpress.com/article/cities/delhi/delhi-for-seamless-travel-metro-plans-pick-up-drop-facilities-pedestrian-plazas-cycle-lanes-10-stations-7910906/
- **Use:** Supports a practical problem framing around integrating pedestrian zones with waiting/pickup facilities. Treat news articles as context, not proof of present on-ground conditions at your selected Rohini station.

---

# Part II — Data strategy and design choices

## 3. Recommended pilot station

Start with **one** station, not a Delhi-wide deployment. Compare Rohini West and Rohini Sector-18 during initial field reconnaissance. Rohini West has a publicly listed DMRC MMI concept plan posted for community feedback in 2026; Rohini Sector-18 appears in the official MMI archive. Choose the pilot based on current observations, whether the relevant approaches can be safely surveyed, and whether usable reference drawings are available.

Use one configurable study boundary at first (for example 300–500 m around station exits) and optionally show an 800 m catchment for wider route context. Do not treat either radius as a universal standard: IRC’s station-area recommendations discuss 500 m; prior Delhi walk-access research used 800 m catchments.

## 4. Data sources to integrate

| Source | Use | Limitation / handling |
|---|---|---|
| Field audit collected by project team | Authoritative pilot observations: width, blockages, crossings, queue spillover, time and photos | Require date/time, observer/source and verification state; do not invent observations |
| OpenStreetMap | Initial roads, paths, station/building context where mapped | Completeness varies; field-verify paths, widths, accessibility and pickup-zone status; preserve OSM attribution and license compliance |
| IRC:103-2022 | Reference criteria and sourced explanation | Treat as design guidance; expose clause/source and allow site-specific review |
| DDA/UTTIPEC MMI plan | Reference concept/section for Rohini West or Sector-18 | Validate current status; drawings may require manual tracing/georeferencing |
| Delhi Traffic Police reports | Citywide road-crash context and published crash-prone zones | Do not invent point-level crashes or claim station-scale accuracy from aggregate tables |
| Anonymous commuter importance/satisfaction survey | Understand local perceived safety, accessibility and comfort | Minimise personal data; separate perception responses from measured conditions |
| E-rickshaw queue observations | Queue length, waiting time, spillover, pickup patterns | Sample morning/evening peak and off-peak; record sample time and method |

## 5. Field-audit schema

Each **footpath segment** should support:
- Segment ID, geometry, side of street, start/end points, survey time.
- Footpath exists: yes/no/unknown.
- Total measured width where safe and feasible.
- Clear walking width remaining after obstructions.
- Blocked length or approximate share of segment blocked.
- Surface quality, discontinuities, debris, waterlogging where observed.
- Kerb ramps and other step-free transitions, tactile paving if observed.
- Lighting and crossing conditions.
- Obstruction types: e-rickshaw queue/parking, other vehicle parking, vending/shop spillover, utility box/pole, broken surface, other.
- Pedestrian volume as a measured estimate with method and sampling window, not as a made-up fact.
- Photo/evidence references and observer confidence.
- Verification status and last-verified timestamp.

Each **e-rickshaw queue observation** should support:
- Observation point/line/polygon, start/end time and time window.
- Approximate number of vehicles and queue length.
- Whether the queue enters the pedestrian/walking zone, crossing area, cycle area, carriageway or metro entrance.
- Approximate wait-time sample, method and sample size.
- Nearby formal/marked pickup point if verified; otherwise mark unknown.
- Potential conflict description, source and reviewer status.

Each **junction/crossing audit** should support:
- Crossing type and marked/unmarked status.
- Approximate crossing distance where measured.
- Traffic speed or volume only if measured using a stated method or from a sourced dataset.
- Visibility/obstruction issues, curb ramps, accessible crossing continuity, and pedestrian desire line.

## 6. Scoring: separate street condition, priority and crashes

Do not use a single opaque “AI accident risk” score.

Implement three distinct concepts:

1. **Observed audit condition:** Display measured/observed fields such as clear walking width, obstruction type/extent, surface state, missing transition, crossing condition, queue spillover and lighting. Each value links back to evidence and timestamp.
2. **Improvement priority:** Use transparent, configurable rules based on hazard severity, affected walking space, independent verified recurrence, observed pedestrian exposure, accessibility impact, and evidence recency/completeness. Show the components and explain every priority. Treat default weights as pilot heuristics, not validated accident prediction.
3. **Official crash context:** Import only published, attributable crash data at its actual spatial resolution. Keep confirmed crashes distinct from near-miss observations and citizens’ hazard reports. Do not infer crash probability from complaint density.

Implement an **Importance–Performance Analysis (IPA)** survey using locally collected ratings (e.g. a six-point scale consistent with the 2026 Delhi study) for relevant factors: universal design, lighting, safety/security, traffic conflict, footpath obstruction/continuity, crossing access, comfort/weather protection, signage and ease of reaching pickup/drop-off. In the dashboard, highlight attributes with high reported importance and low local satisfaction. Show sample sizes and suppress overconfident results from tiny samples. Simple IPA comes first; fuzzy c-means clustering is optional after enough data exists.

## 7. What the MVP must prove

The strongest demo is one complete chain:

1. A real field observer records a footpath segment with reduced clear width and an e-rickshaw queue spilling into the walking zone.
2. The record is saved with location, time, evidence and verification status.
3. The map displays it and the dashboard explains why it is prioritised.
4. Other independently observed reports may establish recurrence; duplicate reports do not artificially inflate the score.
5. A planner creates a proposed waiting/pickup zone, checks its relation to the pedestrian corridor, crossings, station entrance and measured space.
6. The scenario lists conflicts that may be resolved, conflicts that may be created, missing measurements, and the need for authority review.
7. A source-backed export includes map/location, photos, measurements, data limitations and references to the appropriate guidance.

Success measures for a pilot should be truthful and measurable, for example: audited segments, verified observations, percentage of observations with complete attributes, time to review a report, repeated hazard locations, number of proposed scenarios checked, and pre/post observed clear width only if a real intervention is implemented and measured. Never report accident reduction unless there is adequate, credible before/after evidence.

---

# Part III — Antigravity master prompt

Copy everything between the markers into Antigravity.

## BEGIN ANTIGRAVITY PROMPT

You are the lead software architect and implementation engineer building **RaastaSafe — Metro-Area Pedestrian Audit and Last-Mile Mobility Planner**. Build and test the complete application, including its website, backend, database, GIS interactions, audit logic, algorithms, planning tools, exports, and documentation. Do not stop at the PRD, a plan, a static UI, or a collection of mockup pages.

Use the research and source register in `docs/RESEARCH_AND_DATA_SOURCES.md` below as the evidence foundation. Create that document in the repository with the supplied references, and keep citations attached to the rules and methods derived from them.

### 1. Product objective

Help residents, student auditors and civic planners identify pedestrian hazards and last-mile transport conflicts around one pilot Delhi Metro station in Rohini. Focus on blocked/unsafe footpaths, e-rickshaw queues spilling into pedestrian space, unsafe crossings, access/kerb-ramp barriers, damaged surfaces and lighting. Support better coexistence of pedestrians and e-rickshaws; do not frame all e-rickshaw use as bad.

The core workflow is:

**Field audit or hazard report → source/evidence validation → walkability analysis and hotspot grouping → explainable prioritisation → proposed pickup-zone scenario → review/export/action tracking.**

### 2. Research evidence to implement

- Use IRC:103-2022 as the primary India-specific pedestrian facility reference. Model the separation between clear pedestrian walking zone, frontage/dead zone and multi-utility zone. Store measured total width separately from clear walking width. For reference checks, incorporate the guideline's general recommended minimum 2 m walking zone and its 2.5 m recommendation for high-footfall areas such as metro/transit nodes, with editable/contextual settings and a clear note that local site review is needed.
- Support a configurable study area. Use 300–500 m as an initial field-audit boundary if appropriate and an optional wider 800 m catchment for context; these are study scopes, not absolute rules.
- Implement structured field collection inspired by phone/GPS pedestrian-barrier audits used around Noida metro stations. Record timestamp, coordinates, evidence and verification status.
- Offer an optional, privacy-preserving commuter survey to rate the importance and satisfaction of walk-access attributes. Implement an interpretable Importance–Performance Analysis (IPA) view inspired by the 2026 Delhi metro study. Use locally collected survey data only; label the sample size and do not assume Delhi-wide study results apply automatically to Rohini.
- Treat low-cost, short-wait last-mile services and walk access as jointly important, following the WRI India 2023 study. Collect observed queue length/spillover and sampled wait times where feasible, not just e-rickshaw counts.
- Use Delhi Traffic Police crash reports only as an attributable city-level context layer when the published data’s spatial granularity supports the chosen display. The public catalog contains aggregate statistics and blackspot map/list materials; do not synthesize exact crash coordinates from an aggregate CSV or represent citizen hazard counts as crash blackspots.
- Inspect and cite the DDA/UTTIPEC Rohini West MMI concept-plan page and the official MMI archive for Rohini Sector-18. Do not label a concept or feedback plan “approved” or “as-built” without verifying status. Do not automatically georeference a drawing unless you can establish alignment accurately; otherwise show the source drawing separately and allow manual map tracing.

### 3. Inspect first, then build

Inspect the existing repository, environment, available agents and dependencies before modifying files. Preserve valuable existing code. Create a clear implementation plan internally, define API/data contracts and then implement the software in this development session. Do not pause after documentation or ask for approval at every stage. Use good judgement, but document assumptions and limitations. If an external integration is blocked, implement a functional local alternative instead of a dead placeholder.

### 4. Technology

Use React + TypeScript + Vite + Tailwind CSS on the frontend; React-Leaflet/Leaflet for maps; Python + FastAPI + Pydantic + SQLAlchemy for the backend; SQLite for quick, reproducible local development with a design that can migrate to Postgres/PostGIS; Alembic for migrations. Use GeoJSON for transferable geographic features. Use Pytest for backend/algorithm tests, Vitest/React Testing Library for frontend tests, and Playwright for important end-to-end flows if available.

If the existing repository has a sound equivalent stack, adapt without needlessly rewriting it. Pin compatible dependency versions.

### 5. Required application pages and workflows

#### A. Public landing/overview
- Explain the problem and purpose plainly.
- Provide links to the map, report form and public, non-sensitive summary.
- Do not include fabricated crash reductions, fictional partnerships or unsupported impact metrics.

#### B. Interactive map
- Start at the chosen pilot station, configurable in application settings.
- Show station exits, streets/footpaths where available, field-audited segments, hazard reports, verified crossings and proposed zones.
- Show separate layers for observed hazards, official crash context, reference-plan features and proposed scenarios.
- Provide category, verification, time, source and severity filters; legend; search; selected-feature panel; loading, error and no-data states.
- Use OpenStreetMap with proper attribution and suitable tile usage. OSM geometry and tags are initial context only; they do not prove a footpath is accessible or a pickup zone is authorised.

#### C. Footpath-segment audit
Allow an authorised field observer to create/edit a path segment and record:
- segment geometry and side of street;
- footpath existence and continuity;
- total width (if measured) and clear walking width after obstructions;
- approximate blocked length/share;
- surface quality, level changes, debris/waterlogging if observed;
- kerb ramps/step-free transitions and tactile paving if checked;
- crossing conditions and illumination;
- obstruction type(s), including e-rickshaw queue, other parking, vending/shop spillover, pole/utility box or damaged surface;
- observation time, method, photos, observer notes, source and confidence;
- verification state and last-verified time.

Never invent a width, pedestrian volume, illumination reading or field observation. Let unknown remain unknown.

#### D. E-rickshaw queue observation
Record location/geometry, start/end time, estimated queue length/count and method, whether the queue intrudes into the walking zone/crossing/entrance/carriageway, approximate wait-time sample, nearby marked pickup zone when verified, evidence, reviewer and confidence. Collect observations at different times when possible. The system must separate queue presence from a verified pedestrian conflict.

#### E. Junction/crossing audit
Capture crossing type, marked/unmarked status, measured crossing distance where feasible, sight-line blockage, kerb ramps and continuity, lighting, observed vehicle/pedestrian interaction and evidence. Enter speeds or volume only where measured or sourced with a stated method.

#### F. Public hazard reporting
A responsive form allows location selection, optional consented geolocation, category, description, observation time, severity and optional photo. Support anonymous reports where possible. Validate on client and server. Return a stable report ID. Mark user submissions as unverified until reviewed. Validate upload type/size, use generated filenames and prevent unsafe file paths.

#### G. Review and audit history
Support states such as Submitted → Under Review → Verified → Action Proposed → In Progress → Resolved, plus Rejected/Duplicate/Reopened where applicable. Enforce transitions on the backend; record reviewer, timestamp, notes and state changes. Duplicate detection should suggest candidates and require human confirmation rather than silently discarding reports.

#### H. Explainable walkability and improvement-priority engine
Do not output an opaque “AI accident probability”. Implement separate outputs:
1. **Observed condition:** actual audit attributes and evidence.
2. **Improvement priority:** transparent, configurable ranking based on observed severity, extent of clear-walkway obstruction, independently verified recurrence, measured/estimated pedestrian exposure, accessibility impact, and evidence recency/completeness.
3. **Official crash context:** distinct, attributed official records only when spatial resolution permits.

Expose factors and formula/configuration. Default weights must be identified as pilot heuristics and not validated crash predictions. Duplicate reports do not increase recurrence. Missing fields must reduce completeness or produce “insufficient data”, not fabricated values. Near-miss reports, unverified citizen reports and confirmed crash records remain separate.

Implement geographic hotspot grouping over actual observed report/segment coordinates. Use configurable, tested distance thresholds and show contributing source records. Do not build hotspots from randomly generated coordinates.

#### I. Importance–Performance Analysis (IPA)
Build an optional short, anonymised commuter survey using a six-point importance and satisfaction scale for locally relevant attributes: universal design/accessibility, illumination, safety/security, traffic conflict, obstruction/continuity, crossing access, comfort/weather protection, signage and last-mile pickup access/waiting. Aggregate responses and display an IPA quadrant or equivalent. Highlight high-importance/low-satisfaction attributes for local follow-up. Always show sample size and date range; indicate small-sample uncertainty. Simple IPA is the MVP. Fuzzy clustering is optional only after meaningful data volume exists.

#### J. Multi-modal integration (MMI) scenario planner
This is a key differentiator.
- Let an authorised planner draw/edit/delete proposed e-rickshaw waiting, pick-up or drop-off areas on the map and create multiple named scenarios.
- Allow scenario notes, geometry, candidate capacity/throughput if estimates are available, estimated walking routes to station exits and review state.
- Flag potential overlap with audited pedestrian walking zones, crossings, ramps, station entrances and other conflicting features.
- Where width is measured, compare the remaining clear walking zone with the applicable configurable IRC guidance; if measurements or legal status are unknown, explicitly say “not assessed”.
- Show each scenario’s addressed issues, potential new conflicts, missing measurements, evidence and a transparent before/after comparison.
- Never imply a proposal is authorised, legally compliant or guaranteed to reduce accidents. Scenarios require field verification and approval from the responsible agency.
- Reference the official UTTIPEC Rohini West plan / Rohini Sector-18 archive where relevant, but do not inaccurately georeference drawings.

#### K. Pedestrian accessibility route graph
Implement only for network edges whose geometry and access properties are known or explicitly labelled demo data. Graph nodes are entrances/intersections and edges are pedestrian links. Support Dijkstra or A*. A step-free preference must exclude edges with verified stairs or other explicit disqualifying barriers. Unknown accessibility must not be described as accessible. If no compliant route is found, say so. Keep verified real data separate from synthetic demo edges.

#### L. Dashboard and exports
Create summary counts from actual database records: submitted, unverified, verified, high-priority, in progress and resolved. Add report filtering, hotspot ranking and explanations, survey summary, field audit coverage and scenario comparison. Export filtered records/evidence to CSV and an evidence report to PDF. Include source, observation date, verification state, methodology and limitations. Exclude unnecessary reporter personal data from public or exported views.

### 6. Authentication, permissions, data model, APIs

Implement secure administrative login, password hashing, role checks on the backend and an initial admin bootstrap documented for local development. Suggested roles: public visitor, field reviewer, administrator. Public users must never receive administrative permissions.

Create models/migrations for stations, station exits, footpath segments, junction/crossing audits, e-rickshaw queue observations, hazard reports, evidence assets, commuter survey responses, review/status history, source references, hotspots/results, planning scenarios, proposed zones, route nodes/edges, users/roles and audit events.

Create consistent REST endpoints for report CRUD/filters, audits, uploads, verification/state transitions, survey submission/aggregation, hotspot calculations, risk explanations, scenarios/zones, routes, dashboard summary and exports. Validate payloads, use pagination, correct HTTP status codes and safe error responses. Connect the actual frontend to these APIs; no dead buttons or fake charts.

### 7. Data sources and licensing

Create `docs/RESEARCH_AND_DATA_SOURCES.md` and `docs/DATA_PROVENANCE.md`. Cite the source for every embedded rule, guideline-based flag, external data import and reference plan. Preserve OpenStreetMap attribution and comply with source licenses. Provide a source URL, retrieval timestamp, license/permission note, fields, resolution, limitations and an update method for each imported dataset.

Seed the app with a repeatable, clearly labelled synthetic dataset covering different obstruction types, statuses and scenarios. Synthetic sample records must be visually labelled DEMO/SYNTHETIC and must never be presented as real Rohini observations. Keep real field records separate. Include a reset/reseed script.

Before importing Delhi accident information, inspect actual fields. If data has no latitude/longitude, only use citywide charts or a properly labelled broad contextual map; never assign arbitrary coordinates. Do not scrape private information or store face/vehicle-identity details without need and permission.

### 8. UX and visual quality

Create a polished, responsive civic-tech tool with a clear map-first workflow, restrained urban-planning visual design, readable typography, clear status labels, accessible contrast and keyboard navigation. Provide meaningful loading, empty, validation, no-route, no-data and server-error states. Build reusable components. Avoid excessive gradients, decorative animations, dead controls and static mock stats.

### 9. Tests and acceptance criteria

Write/run meaningful tests for:
- audit creation/validation and coordinate bounds;
- clear-width fields and unknown values;
- upload constraints;
- report status permissions/transitions and audit logs;
- duplicate suggestion/confirmation;
- scoring, missing data and duplicate suppression;
- hotspot grouping and no-data state;
- IPA aggregation, sample counts and empty/small samples;
- MMI zone conflict checks and unknown width;
- route constraints and no compliant route;
- role-based access, exports and privacy filtering;
- key frontend flows and a full integration workflow.

The end-to-end acceptance test should:
1. seed demo data;
2. create a footpath/queue-observation record;
3. retrieve it from the backend;
4. verify the record as an authorised reviewer;
5. recompute/display the explainable priority;
6. display the feature on the map;
7. create and save an MMI zone scenario;
8. run conflict checks and show limitations;
9. export an evidence report.

The build is not complete just because files exist. Start the frontend and backend, initialise/migrate the database, run tests, verify the site and API in the available environment, and fix all resolvable integration defects.

### 10. Suggested repository structure

Adapt as needed to the repository already present:

- `frontend/src/features/map/`
- `frontend/src/features/audits/`
- `frontend/src/features/reports/`
- `frontend/src/features/queue-observations/`
- `frontend/src/features/hotspots/`
- `frontend/src/features/ipa-survey/`
- `frontend/src/features/planning/`
- `frontend/src/features/routes/`
- `frontend/src/features/admin/`
- `backend/app/api/`
- `backend/app/models/`
- `backend/app/schemas/`
- `backend/app/services/`
- `backend/app/algorithms/`
- `backend/app/security/`
- `backend/app/tests/`
- `backend/alembic/`
- `data/demo/`
- `docs/`
- `scripts/`

### 11. Execution and final report

Inspect the repository, define shared API/data contracts, and then implement a complete vertical slice rather than isolated pages. Use multiple coding agents if they are available, with explicit tasks and file ownership; keep one coordinator responsible for integration.

After implementation, report exactly what works, exact commands to install dependencies/initialise the database/seed data/run frontend/run backend/run tests, required environment variables, the tests that passed or failed, and all remaining limitations. Do not claim a deployed service, authority integration, official approval, real field evidence or accident reduction unless those things are actually verified.

Start repository inspection now and continue implementing until the most complete, functional, tested version possible is running.

## END ANTIGRAVITY PROMPT

---

# Part IV — Source index (quick links)

1. **IRC:103-2022 Pedestrian Facilities:** https://law.resource.org/pub/in/bis/irc/irc.gov.in.078.2.2020.pdf
2. **Delhi metro walk-access study (2019):** https://doi.org/10.1016/j.trd.2018.11.007
3. **Delhi station access importance-performance study (2026):** https://doi.org/10.1061/JUPDDM.UPENG-5978
4. **WRI India — Improving Metro Access (2023):** https://doi.org/10.46830/wriwp.23.00009
5. **Noida smartphone barrier audit study (2022):** https://doi.org/10.1049/PBPC057E_ch4
6. **Delhi Traffic Police crash reports:** https://traffic.delhipolice.gov.in/delhi-crash-report-2023
7. **Delhi Traffic Police maps / crash-prone areas:** https://www.traffic.delhipolice.gov.in/en/maps
8. **OpenCity Delhi crash data catalogue:** https://data.opencity.in/dataset/delhi-road-crashes-data
9. **OpenCity Delhi accident-prone areas:** https://data.opencity.in/dataset/delhi-accident-prone-areas
10. **UTTIPEC Rohini West MMI proposal page:** https://uttipec.org.in/CommunityFeedback/Rohini
11. **UTTIPEC MMI plan archive (includes Rohini Sector-18):** https://uttipec.org.in/MultiModalIntegration_MMI_/Index
12. **Walkable Cities audit methodology:** https://walkablecities.in/methodology
13. **ITDP Pedestrians First:** https://itdp.org/wp-content/uploads/2024/09/pedestrians_FINAL.pdf
14. **Delhi MMI context (Indian Express, 2021):** https://indianexpress.com/article/cities/delhi/delhi-metro-stations-pedestrian-friendly-congestion-7686118/
15. **Delhi pickup/drop, pathways and MMI context (Indian Express, 2022):** https://indianexpress.com/article/cities/delhi/delhi-for-seamless-travel-metro-plans-pick-up-drop-facilities-pedestrian-plazas-cycle-lanes-10-stations-7910906/
