# REWIRE Lab → Journey Architecture (planning)

Companion to `00-REWIRE-LAB-PLAN.md`. This is the node/journey engine design at the architecture level: what a node IS, how stations attach, how movement is measured, and a candidate node sequence grounded in the existing frameworks. No schemas, no code.

**Status of the map below: CANDIDATE.** It is built from the canon (MAPSS descent, insight → witness → intention ladder, the four reverse-engineering questions, Map It / Rewire It / Lock It In, the Way Forward Roadmap arc). It exists so Christian has something concrete to mark up. His hand-drawn node map **[SLOT 1]** supersedes it wherever they differ.

---

## 1. The core reframe, restated as product mechanics (amended 2026-08-11)

The Lab stands on two anchors: the Huddle and the journey. Today's dashboard hub (cards, apps, tracking) is not replaced; it IS the rhythm membership, and it stays the home surface for every member. What gets added is the journey: for members who accept the standing invitation (Inner Compass → the REWIRE journey), a MAP surface shows one path drawn as nodes with the couple's (or individual's) position on it. Inside the journey, the member never has to go shopping for the right tool: the path hands them the right one, with a specific task, at the moment it will work. Outside the journey, the shelf stays open: every Lab member can use every app freely, whether or not they ever travel.

Three layers, stacked:

→ **The rhythm layer** (already real, and a complete membership by itself): the weekly Huddle (video-explained; Christian's existing Huddle course seeds this), the streak as cadence, the journal, upcoming rituals, connection/satisfaction tracking, and open access to all apps. This keeps running underneath every node, unchanged. The Huddle is also the journey's delivery vehicle: node practices and assignments ride into the week through the Huddle's plan stage.
→ **The journey layer** (new, opt-in = the REWIRE journey): the node path, position, arrival logic, station routing, the adaptive/accountability voice. Layers on top of the rhythm; never gates it.
→ **The measurement layer** (new, and load-bearing): baseline, per-node movement signals, and the longitudinal record that proves change. Connection/satisfaction tracking serves ALL members; the per-node movement machinery belongs to travelers. This layer is the journey's reason to exist and the proof asset the brand cannot generate any other way.

The anti-pattern to design against, permanently: a traveler who completes everything and moves nothing must be VISIBLE to the system as a failure state. If the UI, the data model, or the AI cannot represent "finished but unmoved," the journey has become PDS. (The rhythm membership is exempt from this test by design: it promises a ritual, tools, and tracking, and it must deliver exactly that, no more claimed.)

## 2. Anatomy of a node

Every node is a destination, not a lesson. Uniform anatomy so nodes are addressable by the engine:

| Element | What it is |
|---|---|
| **Name** | Destination-named, not curriculum-named ("The Observer Self," not "Module 4") |
| **Stage** | Which phase of the arc it belongs to (Map It / Rewire It / Lock It In) |
| **The skill** | The ONE new capacity this node installs. Skill AND insight, never insight alone |
| **Arrival story** | What life looks like when you are AT this node (written in the audience's own movement language) |
| **Station trigger** | Which tool comes alongside here, and the specific task it arrives with |
| **Videos** | Christian's guidance for this node (see `03-video-shoot-list.md` for the per-node video kit) |
| **Practice** | The between-Huddle assignment(s); these inject into the Huddle plan stage |
| **Movement definition** | What counts as moved here, and HOW the system knows (self-report paired with something behavioral, per the G.2 cautions) |
| **Arrival condition** | The gate to the next node: evidence of movement, never completion of content |
| **Human touchpoint** | Where a guide (or Christian's weekly live) is load-bearing at this node, if anywhere |
| **Solo variant** | How the node runs for an individual traveling without their partner |

Two engine rules that fall out of this:

→ **Nodes gate on movement, not on watching.** A member can consume every asset at a node and still be "traveling toward" it. Arrival is declared by the movement signal (plus, where needed, guide confirmation). This is the single deepest difference from a course platform, and it must be true in the data model from day one.
→ **The path is one spine with adaptive breadth.** One canonical sequence (so the map is drawable, sellable, and shared), with the adaptive layer varying dwell time, practices, prompts, and side-quests per person rather than reordering the spine. Full per-person path reordering is a later ambition; do not pay its complexity cost in v1.

## 3. Stations → where each tool triggers

Per the brand master: tools are stations on one journey, each with a trigger point. Current inventory and status:

| Station | Status today | Natural trigger point |
|---|---|---|
| **Inner Compass Assessment** | Live product ($79/$199) | The on-ramp: baseline instrument before or at Node 1 |
| **Mapping My Story** | LIVE app (mappingmystory.coupleforward.com) | Mapping stage: tracing a charged moment down the layers |
| **The Between** | LIVE app (thebetween.coupleforward.com) | Conflict stage: 24/7 companion at the moment of rupture |
| **Adventures** | LIVE app (adventures.coupleforward.com) | Reconnection stage; also feeds the Huddle's adventure ritual all along |
| **The Witness** | PARKED (does not exist) | Observer-self stage: the hinge node (see the Witness problem, master doc Q5) |
| **Rescript** | In build, Lab module by decision | Conflict stage: rewriting the fight; has the model measurement (credibility pre/post) |
| **Transition** | PARKED (framework exists: Six Domains, 1-9 scale, Reset, Anchors, Baseline, Floor) | Regulation stage: the somatic floor under everything |
| **Couple Forward Compass** | PARKED | Values/direction work in the Lock It In arc |
| **Way Forward Roadmap** | Framework (psychoeducation → mapping → way forward) | Not one station: it IS the arc. The journey map is the Way Forward Roadmap rendered as software |
| **The Huddle** | REAL, built, syncing | Not a node: the metronome under all nodes, installed early and never removed |

Integration depth is a build-sequence question (link-out first, SSO later, embedding last). Architecturally, all the journey engine requires of a station is: (a) the journey can send a member there with a specific task, and (b) the station reports back a movement-relevant signal.

**Two hats per tool (the 2026-08-11 clarification made this explicit):** every tool is BOTH an open-shelf app available to all Lab members AND a station the journey triggers with a task for travelers. The shelf listing and the station trigger are different surfaces over the same tool. Rhythm members browse the shelf; travelers get handed the station. Nothing on the shelf is locked behind the journey.

## 4. The candidate node sequence

Grounding: Phase names from the 90-Day REWIRE arc (Map It / Rewire It / Lock It In). Descent order from MAPSS (MIND → ATTRIBUTION → PERSPECTIVE → SENTIMENT → STORY). The ladder the brand sells: insight → witness → intention. The four questions (what do I want / who would I have to be / what would I have to do / what would I have to learn) run underneath as the member-facing frame.

> **[SLOT 1 → CHRISTIAN'S HAND-DRAWN NODE MAP]**
> His drawing replaces this sequence wherever they differ. Nothing below is final.
>
> **[SLOT 2a → CHRISTIAN'S IDEA #1]** reserved node-level placement.
> **[SLOT 2b → CHRISTIAN'S IDEA #2]** reserved mechanism-level placement (e.g., a routing, accountability, or measurement mechanic).

### PHASE I → MAP IT

**Node 1 → Where You Actually Are** (the on-ramp)
→ Skill: honest baseline; naming what you want to have happen (question 1: what does Tuesday night look like).
→ Station: Inner Compass Assessment (solo-capable by design; the ready partner enters alone).
→ Movement draft: a stated, concrete destination in the member's own words + baseline scores captured. (This node is the one place where completion IS the movement, because its product is the baseline itself.)

**Node 2 → The Loop, Named**
→ Skill: seeing the fight as a loop with two positions, not a character problem. MAPSS MIND + ATTRIBUTION layers.
→ Station: Mapping My Story, with the task "trace one charged moment down to the primary emotion and the unmet need."
→ Movement draft: member can narrate their loop in pattern language (not verdict language) about a REAL recent fight; both partners' maps name the same loop. Marker from the dictionary: attribution shifts off the partner-as-diagnosis.

**Node 3 → What the Pattern Protects**
→ Skill: survival strategies as protection-with-a-function. MAPSS PERSPECTIVE + SENTIMENT layers; NARM survival-style vocabulary made personal.
→ Station: Mapping My Story deepening task + (future) NARM profile surface; guide touchpoint candidate.
→ Movement draft: member states their own survival strategy in function language ("this protects me from X") rather than identity language ("I'm just avoidant"). The verdict/identity trap from the brand position is the explicit failure mode this node tests against.

### PHASE II → REWIRE IT

**Node 4 → The Observer Self** (the hinge)
→ Skill: witnessing the loop while standing in it. THE transition the whole brand sells: "I can name what's happening in real time instead of only in hindsight."
→ Station: The Witness (the parked-app problem; v1 fallback is video + a daily noticing practice carried by the Huddle + a real-time logging mechanic).
→ Movement draft: straight from the dictionary: frequency of real-time catches vs hindsight-only, logged in the moment or same-day. Pair self-report with the behavioral trace (timestamped catches).

**Node 5 → The Body Comes With You**
→ Skill: regulation floor; reading autonomic state; a working Reset. The SENTIMENT layer as lived practice, not psychoeducation.
→ Station: Transition framework (Six Domains, 1-9 scale, Reset, Anchors, Floor) + the somatic tools card finally made real.
→ Movement draft: somatic anticipatory-threat markers from the dictionary ("I stopped bracing at the driveway," "chest doesn't tighten at 'can we talk'"), tracked as recurring self-scans; recovery-time-to-baseline after activation.

**Node 6 → The Conversation, Rewired**
→ Skill: the Order of Conversation and the Intentional Conversation Protocol run under load. Saying what you need without three days of rehearsal.
→ Stations: Rescript (rewrite the recurring fight; credibility movement pre/post is the proven measurement shape) + The Between (the 24/7 companion at the moment of rupture).
→ Movement draft: Rescript credibility delta (already the model); a conversation the couple previously could not have, had, and named as such.

**Node 7 → Repair Becomes Normal**
→ Skill: initiated repair. The dream state is not the absence of conflict, it is the presence of repair.
→ Station: The Between + Huddle reflect data.
→ Movement draft: recovery time after rupture ("blowups don't destroy three days of connection"), trended; repair INITIATIVE (who moves first, unprompted) as the behavioral pair.

### PHASE III → LOCK IT IN

**Node 8 → Wanting, Not Performing**
→ Skill: reconnection and desire; honest rather than perfect, in the body, in sex, in the home.
→ Station: Adventures (experience engine) + track-specific deepenings later (Erotic Map material is a natural extension, not v1).
→ Movement draft: wanting-vs-performing self-reports paired with initiated-connection behaviors (adventures proposed, not just completed).

**Node 9 → The Way Forward**
→ Skill: intentional life design as a couple; the 90-Day Loop categories (holidays, occasions, travel, goals) become theirs to author. Question 1 revisited from the far side: Tuesday night, now real.
→ Station: Couple Forward Compass + Way Forward Roadmap document as the capstone artifact.
→ Movement draft: baseline instruments re-taken; delta against Node 1 IS the graduation evidence. Per the honest limit: per-person movement is the defensible unit, never claimed couple-level transformation.

**Node 10 → Graduation → Continuation**
→ Not a destination to leave, a change of relationship with the system: the journey arc ends (defined end state, per the anti-PDS packaging rule) and the member chooses the continuation shape: the Lab as ongoing rhythm (Huddle, adventures, weekly live), a next track, or out with their map in hand. This node is where "program with an arc" and "$47/month" reconcile: the arc ends; the rhythm membership continues by choice.

### The individual path (the front door)

Per the brand master, the buyer is nearly always one person acting alone; the solo path is the main entrance, not the fallback. Design consequence: every node above carries a solo variant (Nodes 1-5 are naturally solo-capable; Nodes 6-7 have solo forms: rewiring YOUR side of the conversation, YOUR repair initiative; Nodes 8-9 adapt). The couple mechanics (dual answers, partner sync) activate when the partner joins, at any node, without restarting the journey. The existing couple-invite machinery already supports late partner arrival; the "waiting for your partner" state becomes a designed solo journey rather than a banner.

**[SLOT 4]** Whether v1 launches solo-capable or couples-first changes how much of this section is Phase 1 scope. Held open.

## 5. The measurement spine (summary; the decision is Christian's)

Principles already decided: measure change, not completion; the AI optimizes for "did something move"; pair every self-report with something behavioral; per-person movement is the unit. Draft signal types across the map:

→ **Baseline/delta instruments**: Inner Compass at Node 1 and Node 9 (and possibly a light mid-journey pulse).
→ **In-the-moment traces**: real-time catches (Node 4), Between sessions at rupture (Nodes 6-7), reset usage (Node 5).
→ **Trend metrics**: recovery time after rupture, closeness ratings (already captured weekly by the Huddle into `connection_scores`: the one movement-shaped series the product ALREADY records).
→ **Artifact deltas**: Rescript credibility pre/post (the model), loop narration quality at Nodes 2-3 (needs a rubric or AI-assisted scoring with his rubric).
→ **What is explicitly NOT movement**: logins, videos watched, modules finished, streak length. These may be shown as rhythm, never as progress.

The per-node movement definitions above are FIRST DRAFTS assembled from the G.2 audience dictionary. They are his to correct, and the build sequence treats that correction as a blocking input, because the brand master says exactly that.

### 5a. The dashboard as the visible face of measurement (added 2026-08-11, his direction)

Four requirements, stated by Christian, that turn the dashboard from a status display into the measurement layer's front end:

→ **REWIRE progress is a dashboard measurement.** Travelers see their journey progress as one of the graphs/gauges beside connection and satisfaction, on the home surface. Design constraint carried over from the movement principle: this gauge shows movement evidence (what changed), framed by position on the path, not a percent-complete bar. A completion bar would put the forbidden metric on the most visible surface in the product.
→ **The Inner Compass reports live IN the dashboard.** Both the individual report and the couple report render inside the Lab, not as external PDFs. This makes the Compass the dashboard's interpretive backbone: the baseline everything else is read against. (Keying/de-identification posture for Compass data inside the shared backend gets decided with the privacy floor.)
→ **Every metric opens into depth.** Universal drill-down principle: every icon, graph, gauge, and tracker on the dashboard opens into a deeper understanding of itself: what this number is, where it came from (which answers, which weeks), what it means, what tends to move it, and its full history. Nothing on the dashboard is a dead-end decoration. This is also the honesty mechanism: a member can always interrogate a number down to its source, which is exactly the opposite of the black-box score PDS-style products show.
→ **The quiz cadence feeds the visuals.** A weekly quiz (short, ritual-adjacent, possibly attached to or following the Huddle), plus deeper 30-day and 60-day quizzes, all updating the dashboard visually so the couple SEES what is changing. The 30/60 instruments are the mid-journey delta reads between the Node 1 baseline and the Node 9 re-take; the weekly quiz is the connective tissue. Instrument design (questions, scoring, what each updates) is Phase 2 work and rides on the movement dictionary.

The self-report problem, named honestly: most of this is self-reporting, and the audience's defining trait is fluent self-narration, which is the signal most vulnerable to insight-as-defense. Working posture (to be designed properly in Phase 2): pair each self-report scale with at least one behavioral or in-the-moment trace (real-time catches, Between usage at rupture, recovery-time stamps, repair initiations); trend deltas rather than absolute scores; both partners' reads shown side by side where safe (divergence between partners is itself signal); and the drill-down principle applied to quizzes too, so members see WHY the graph moved, which keeps the instrument honest in both directions.

## 6. What this means for the dashboard we have

→ The Huddle survives untouched as the first anchor, gains its video explainer (Christian's existing Huddle course, uploaded), and gains a delivery role for travelers (node practices ride in through the plan stage).
→ The home surface STAYS the dashboard: cards, tracking, apps. That is the rhythm membership, and it was the original plan; it stands. A "Your Journey" surface joins it: for travelers, the map with their position; for rhythm members, the same map as a standing invitation (see where the path goes, take the Inner Compass, start the REWIRE journey). For travelers, REWIRE progress ALSO appears as a dashboard measurement in its own right, beside connection and satisfaction (his direction, 2026-08-11): the journey is visible from the home surface, not only from the map.
→ The sidebar's app list becomes the open shelf, real for every member: each item links to its live app (three exist today) or its in-Lab tool. The journey does not gate the shelf; it adds station tasks on top. "Soon" badges become honest by shipping the links, not by hiding them behind the map.
→ `connection_scores` and the completed-huddle history are the seed of the measurement layer and they serve BOTH modes: rhythm members see their tracking (the original dashboard promise); travelers additionally accrue movement evidence.
→ The couple/member/RLS model carries both modes without structural change (journey tables key off the same couple membership; a member's mode is just the presence or absence of journey state).
