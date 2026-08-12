# REWIRE Lab → Shortest Path to Quality (build sequence, planning)

Companion to `00-REWIRE-LAB-PLAN.md` and `01-journey-architecture.md`. Phased by dependency, not by calendar, until **[SLOT 3 → TIMELINE]** is filled. No implementation here: this is sequencing and trade-offs.

The governing constraints, restated once:

→ Quality survives scale or the Lab becomes the thing the brand opposes (the PDS failure). Every phase gate below asks "does this show movement or just content?"
→ The measurement spine blocks the journey engine, and the movement dictionary blocks the measurement spine, and the dictionary is Christian's clinical call. The critical path runs through his desk, not through code.
→ The brand master also says this is a contraction season: the constraint is publication, not construction. This plan deliberately reuses everything already built (foundation, live station apps, Rescript-in-build, Inner Compass) and builds as little new as a real journey allows.

---

## Phase 0 → Prove and secure what exists (days, not weeks)

1. Christian runs the FIRST ACTION test drive (master doc): confirm demo users, `verify:flow`, dev server, two-browser sync.
2. Push the repo (4 local commits exist on one machine; that is a single-disk risk on real work).
3. The two-browser realtime check and any bugs it surfaces.
4. Decide domain + hosting target so later phases have a deploy destination (no deploy needed yet).

Exit gate: the July foundation is verified working by its owner, and the code exists in more than one place.

## Phase 1 → Make the existing product launch-worthy (the pre-journey floor)

Not journey work: this is the floor any paid product needs regardless of what the journey becomes.

→ **Entitlements**: replace the always-allow stub with the real `profiles.dashboard_access` check; wire the flag from the existing coupleforward-web Stripe checkout (payments live THERE, by prior decision; do not build billing twice).
→ **Email**: production sender for auth + invites (invite emails currently do not send at all).
→ **Deploy** to the chosen domain, with the auth redirect allowlist sorted.
→ **Privacy floor**: deletion and export for huddle answers + journal, decided and built BEFORE real couples enter. Intimate content; this is not deferrable past first real users.
→ **Huddle history UI** (data already persists; small surface, big honesty win).
→ **The Huddle video explainer**: ingest Christian's existing Huddle course (locate the masters; the iCloud `03 Programs/Huddle Course` folder is currently empty and `30 Day Challenge & Huddle` holds covers/structure, so the video files live elsewhere: he points to them, they get hosted and wired into the Huddle flow and a course surface). This is upload-and-wire work, not a shoot.
→ **The open app shelf**: every sidebar app either links out to its live counterpart (Mapping My Story, The Between, Adventures exist today) or gets a truthful state. All Lab members get all apps: this is now a launch requirement of the rhythm membership, not a journey deliverable. Minimum viable integration is a clean authenticated link-out; the SSO question (master doc Q4) gets answered here instead of Phase 3.
→ **Honesty pass on the rest of the shell**: any card or nav item that will not be real at launch either comes out or gets a truthful state.

Exit gate: a real couple could pay, sign in, huddle weekly (with the course explaining it), use every app, watch their connection and satisfaction tracking, and trust the product with intimate content.

**Launch posture, revised per the 2026-08-11 clarification.** The rhythm membership IS a legitimate public launch, because the Lab's own definition now includes it: Huddle anchor + all apps + tracking, with the REWIRE journey always offered on top. The earlier caution (do not launch a rhythm-only Lab) is superseded; what remains of it is a framing rule, not a timing rule: the sales page leads with the ritual and the tracking it actually delivers, and presents the journey as the standing invitation, so the offer never reads as a content library. Pilot couples (2-5, alumni, comped) remain the right first move within this phase: they harden the rhythm product and become the journey's first travelers in Phase 3.

**Billing shape to design for (not build yet):** the decided pricing model is base $47/month with the REWIRE journey as a step-up subscription for ~90 days that drops back to base on completion. In Stripe terms that is subscription phases/schedules on the SAME subscription, not a second product: worth knowing now because the Phase 1 entitlement wiring in coupleforward-web should not paint itself into a one-price-forever corner. Anchor prices and the day-90-without-arrival mechanic are open (master doc, pricing model section).

## Phase 2 → The measurement spine (blocks everything; starts with Christian, not code)

Ordered before the journey engine on purpose: a journey UI without measurement is a course platform with a prettier map.

1. **The movement dictionary, per node** [BLOCKING INPUT → Christian]. First drafts are pre-filled in the journey doc; he edits per node: what counts as moved, what behavioral signal pairs with each self-report.
2. **Baseline decision** [Christian]: Inner Compass as mandatory on-ramp vs in-Lab baseline vs both (pricing/bundling consequence: does Lab membership include the assessment).
3. **Instrument design** (joint): how each signal is actually captured. Now concretely shaped by Christian's 2026-08-11 direction: a WEEKLY quiz (short, ritual-adjacent) plus deeper 30-DAY and 60-DAY quizzes, all updating the dashboard visually so the couple sees what is changing; plus in-the-moment catch logging, recovery-time capture, and the Node 9 re-take. Design for the two G.2 cautions: fluent self-narrators game self-report, so every self-report gets a behavioral pair (working posture detailed in journey doc 5a).
4. **Inner Compass report integration** (design here, build in Phase 3): both the individual and couple reports render inside the dashboard as the interpretive baseline. Includes the keying/privacy decision for Compass data on the shared backend.
5. **The movement record** (engineering, after 1-4): the longitudinal per-person record the AI reads, the quizzes write into, the drill-downs read from, and the proof asset is built from. Conceptually: baseline, signals over time, per-node arrival evidence.
6. **The drill-down rule adopted as a design standard**: every metric on the dashboard opens into a deeper understanding of itself (source answers, history, meaning, what moves it). Cheap to honor from the start, expensive to retrofit; from Phase 3 on, no new card or gauge ships without its depth view.

Exit gate: for every v1 node, a one-line answer exists to "what moved and how did the system know," signed off by Christian.

## Phase 3 → The journey engine MVP (the smallest real journey)

Scope discipline: THREE nodes, one phase boundary, real measurement, stations by link-out. Candidate MVP journey (adjust to the final node map): **Node 1 (Where You Actually Are) → Node 2 (The Loop, Named) → Node 4 (The Observer Self)**, i.e., on-ramp → one Map It node → the hinge. Rationale: it exercises every engine mechanic (baseline, station trigger, movement gate, phase transition) and lands the member on the single most on-thesis capacity (real-time naming) fast enough to prove the product's promise.

→ **Journey data layer**: nodes, per-member/per-couple position, practices, movement evidence. (Schema design happens here, under the same RLS discipline; conceptual list only in this plan.)
→ **The map UI**: "Your Journey" surface: the path drawn, position shown, current node open, next node visible-but-gated. Beside the card grid first; replaces the home screen when it has earned it.
→ **Station integration v1 = task + report-back on top of the shelf**: the shelf link-out already exists from Phase 1; the journey adds the named task ("trace one charged moment...") and the report-back that records movement evidence. Deeper app-side integration only if the Phase 1 SSO answer made it nearly free.
→ **Practices ride the Huddle**: current node injects its practice into the Huddle plan stage. This is the moment the two layers fuse and the product stops being two products.
→ **The dashboard face of the journey**: the REWIRE progress measurement on the home surface (movement-framed, never percent-complete), the Inner Compass reports rendered in-dashboard, the weekly quiz live (30/60-day instruments follow with the pilots' calendar), and drill-down depth views on the journey-fed metrics.
→ **Accountability v1 = rules, not AI**: scheduled nudges keyed to node + signals (missed catch-logging, stalled dwell, huddle skipped). Deterministic, inspectable, honest. The adaptive AI voice arrives in Phase 5 once there is a movement record for it to read; do not ship an "AI coach" that is actually a drip campaign.
→ **Witness fallback decision** executes here per the master doc Q5: video + noticing practice + catch log for v1, unless Christian prioritizes a minimal Witness build.
→ **Pilot couples travel it.** Their movement records are the launch evidence.

Exit gate: a pilot member has ARRIVED at a node on movement evidence, not completion. The system has correctly held someone back who finished content without movement. Both events witnessed in real data.

## Phase 4 → Launch shape

→ Video kit for the MVP nodes recorded and hosted (subset shoot list in `03-video-shoot-list.md`; host decided).
→ Weekly live wired into the product (schedule surface real; his scarce-hours tier made visible): the Live Teaching card finally becomes true.
→ Launch sequence per the pipeline master list: alumni email first, site placement second, ads third. Sales asset: the animated roadmap video (`04-animated-sales-video.md`), which reuses the now-final node map.
→ Pricing surface: $47/month base (Huddle + all apps + tracking + weekly live); the REWIRE journey as the step-up arc inside the Lab (elevated monthly for the 90 days, back to base on completion; anchor numbers pending). Show measured movement (pilot deltas, de-identified) not feature count.
→ The full REWIRE intensive stays visibly at the top of the ladder from inside the Lab: always offered, never pushed.

## Phase 5 → Deepen (post-launch, in whatever order the travelers force)

→ Remaining nodes of the full map; remaining stations (Rescript module integration when its build lands, Transition, Compass).
→ Adaptive AI accountability replacing rules where the movement record supports it: it optimizes toward the movement dictionary, and "finished but unmoved" is a state it must surface, not smooth over.
→ SSO/deeper station embedding; Between at-rupture flows into the repair node.
→ Guides tier (first hire the value ladder implies) once volume warrants; guide console reads the movement record.
→ Solo-path polish or couples-path polish, whichever **[SLOT 4]** deferred.
→ Track variants (Betrayal, Erotic Map, Transition track) as alternate node maps over the same engine. The engine is track-agnostic by design; do not special-case the first track.

## Explicitly deferred (named so they do not creep)

Native mobile apps; per-person path reordering (adaptive dwell only in v1); franchising/licensing surfaces; the 50+ segment variant (open brand question first); NARM/Feelings sidebar items unless a node claims them; any new standalone app.

## Sequencing truths worth stating once

→ Phases 1 and 2 can run in parallel: 1 is engineering, 2 starts as Christian's clinical writing.
→ Phase 3 cannot start before 2's exit gate, and that gate is his, which makes the movement dictionary the single most schedule-critical artifact in the whole plan.
→ The node map (SLOT 1) blocks the video shoot list and the sales video, but NOT Phases 0-2. There is real work available immediately regardless of when the drawing arrives.
