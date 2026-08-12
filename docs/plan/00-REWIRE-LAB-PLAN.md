# REWIRE Lab → Master Plan (living document)

Drafted 2026-08-11. Planning only: nothing in this set is implementation, and nothing has been built from it. This is the grounding pass for turning the Lab dashboard into the REWIRE Lab, the node-based journey engine described in the Couple Forward Brand Master v1, Section C.

**The document set:**

→ `00-REWIRE-LAB-PLAN.md` (this file) → current state, how to test what exists today, the decision slots waiting on Christian, and the open questions
→ `01-journey-architecture.md` → the node/journey engine: node anatomy, candidate sequence, stations, measurement
→ `02-build-sequence.md` → shortest path to quality: phases, MVP definition, trade-offs, what defers
→ `03-video-shoot-list.md` → the video library shoot list, structured per node, ready to fill when the node map is final
→ `04-animated-sales-video.md` → the animated roadmap sales video concept, designed to reuse the product's node map

Canonical copy lives in the repo at `docs/plan/` (versioned with the code). A read-only mirror lives in iCloud at `Couple Forward/03 Programs/REWIRE LAB/` for phone reading. Edit the repo copy in sessions; refresh the mirror after.

---

## The one-paragraph target (amended 2026-08-11 per Christian's clarification)

The REWIRE Lab stands on TWO anchors: the journey and the Huddle. Every Lab member gets the Huddle as their weekly ritual (video-explained, seeded by Christian's existing Huddle course), open access to ALL the apps and tools, and connection/satisfaction tracking: the original dashboard vision, intact as a real membership in its own right. On top of that rhythm sits the journey: every member carries a standing invitation to take the Inner Compass Assessment and step onto **the REWIRE journey** (just REWIRE, no sub-brand: naming settled 2026-08-11), the node-based journey that takes a couple OR an individual from where they are to where they want to be. Each node is a destination that also teaches a new skill; the tools (Inner Compass, Mapping My Story, The Witness, The Between, Rescript, Adventures, Couple Forward Compass, Transition, the Way Forward Roadmap) double as stations on that journey, each triggered at exactly the stage where it becomes the right tool, and AI holds the traveler accountable. The non-negotiable for the journey: it must produce CHANGE and MEASURE change (movement), never completion, streaks, or logins. The value ladder keeps Christian's hours at the top (weekly live, workshops, retreats) while the system and hired guides carry the daily journey.

### The two ways to be in the Lab

→ **Rhythm member**: runs the weekly Huddle, browses and uses every app freely, tracks connection and satisfaction, joins the weekly live. No journey obligation, ever. The invitation to more is always visible, never pushy.
→ **REWIRE traveler**: a member who accepted the invitation. Same Lab, same Huddle, same apps, plus the node path, the station tasks, the movement measurement, and the accountability voice.

Design consequence that runs through every doc in this set: **the journey layers ON TOP of the rhythm membership and never gates it.** Apps are an open shelf for all members; the journey ADDITIONALLY hands travelers the right tool with a specific task at the right node. The anti-PDS packaging rule (defined arc, end state, measured movement) binds the REWIRE journey, while the rhythm membership is honestly what it says it is: a ritual, tools, and tracking, anchored by the Huddle.

### Pricing model (direction set 2026-08-11, anchors still open)

→ **$47/month is the base**: the rhythm membership.
→ **The REWIRE journey is the upgrade inside the Lab.** Candidate mechanic, Christian's own: sign up for the Compass + REWIRE journey, the monthly subscription steps UP for the 90 days, then drops back to base after completion. A program with an arc, priced like one, inside a membership.
→ Still to figure: the anchor price for the Inner Compass inside the Lab, the elevated monthly for the journey, and the edge mechanic: nodes gate on movement, not on calendar, so what happens at day 90 if the couple has not arrived (billing drops anyway and the journey continues at base? extends at the elevated rate? grace period?). The pricing promise and the movement-gated arc need to agree before this goes on a sales page.
→ How the full high-touch REWIRE intensive ($5,200, anchoring toward $7,500) relates in copy to the in-Lab REWIRE journey is Christian's to define: same name, two configurations (system-guided in the Lab vs Christian-guided intensive). The ladder itself is unchanged: base Lab → in-Lab REWIRE journey → intensive/his hours at the top.

---

## A. Current state → the honest baseline (verified against the repo, 2026-08-11)

Two prior snapshots exist and both are partly stale. The July 5 deep-read called this "a clickable prototype with one feature and zero backend." That was true on July 5. The overnight FOUNDATION build of July 5-6 changed it materially. As of today the repo sits exactly where that build left it: seven commits, the last four local-only (main is 4 ahead of origin), untouched since July 6.

### What is REAL today

→ **Stack**: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, TypeScript strict. Polished dark design system (bg `#1a1a1a`, gold `#c8963e`, cream `#f5f0e8`).
→ **Auth + accounts**: Supabase Auth (email+password, magic link, PKCE callback), session refresh and route gating via `src/proxy.ts`. Real login page.
→ **Couple model**: Partner A creates the couple at `/welcome`, invites Partner B by email; B accepts at sign-in; two accounts share one couple. DB-enforced one-couple-per-user. Joining goes only through `create_couple` / `accept_couple_invite` RPCs.
→ **The Huddle, fully persistent**: all six stages (welcome → reflect → ask → plan → commit → done) write to the database as you type, debounced per field. Two-partner realtime sync (the other partner's edits stream in live). One huddle per couple per week, Monday-keyed. `complete_huddle` RPC advances a real streak and copies closeness ratings into `connection_scores`. Dictation, save-to-phone, and .ics export all still work.
→ **Live dashboard cards**: connection gauge, satisfaction sparkline, weekly pulse, upcoming rituals, 4,000 Weeks ring, and journal all compute from real DB data, with honest empty states.
→ **Schema on the live shared Supabase project** (`btlbgdrhujfoayxzbdjp`, same backend as Maps): 7 Lab tables (`couples`, `couple_members`, `couple_invites`, `huddles`, `huddle_answers`, `journal_entries`, `connection_scores`), 5 functions, 19 RLS policies, realtime on the sync tables. RLS scoped by couple membership on every table. Canonical SQL in `supabase/migrations/`.
→ **Test tooling**: `npm run test:rls` (11/11 passing at build time), `npm run verify:flow` (full couple lifecycle via API), `npm run typecheck` clean.

### What is PROTOTYPE or STUB

→ **Payments**: `src/lib/lab/membership.ts` always allows. The real flag is `profiles.dashboard_access`, fed by the coupleforward-web checkout provisioning. Stripe wiring belongs in coupleforward-web, not here.
→ **Live Teaching / video library card**: pure mock. Fake schedule, dead play buttons, gradient placeholders. No video host chosen.
→ **Sidebar station apps** (Witness, Mapping My Story, Adventures, In Between, Rescript, Compass, Roadmap, NARM, Feelings): dead nav items. Note three of these EXIST as live external apps (mappingmystory.coupleforward.com, thebetween.coupleforward.com, adventures.coupleforward.com); the dashboard just doesn't connect to them.
→ **Somatic tools, weekly prompt rotation, Substack/News feeds, mobile nav tabs, settings, notifications**: static or dead.

### What is MISSING entirely

→ Deploy (no Vercel config, repo not pushed since July 6, no domain decided)
→ Email delivery (invites are in-app only; auth emails use Supabase's default sender)
→ Huddle history browser (past weeks persist in the DB, no UI to see them)
→ Deletion/export story for intimate content (blocker for any real-couple launch)
→ Everything journey: there is no node model, no roadmap UI, no station routing, no measurement instrument, no AI accountability. The entire REWIRE Lab layer is greenfield.
→ Possibly still pending from July 6: the two demo users (`jonathan.demo@` / `elena.demo@coupleforward.test`) were created unconfirmed; if never confirmed since, sign-in with them still fails until the 30-second step below.

### The one-liner

The Lab today is a real, working, two-partner Huddle product with live sync and a real streak, wearing a dashboard shell that promises ten other things it does not yet do. The foundation (auth, couple model, RLS, realtime) is genuinely built and is exactly the substrate the journey engine needs. What does not exist is the journey itself.

---

## FIRST ACTION → Christian tests what exists (do this before any building decision)

You have not yet run the thing that was built in July. Fifteen minutes, on the Mac mini:

1. **Confirm the demo users** (one time): Supabase dashboard → project `btlbgdrhujfoayxzbdjp` → Authentication → Users → find `jonathan.demo@coupleforward.test` and `elena.demo@coupleforward.test` → ⋯ menu → Confirm email, on both. (Or delete them and sign up fresh accounts instead.)
2. **Run the automated proof**:

```bash
cd ~/Dev/coupleforward-dashboard && npm run verify:flow
```

   It signs in both partners and walks create couple → invite → accept → huddle → both answer → complete → streak advances → scores logged → shared journal, printing PASS/FAIL per step.
3. **Feel it in the browser**:

```bash
cd ~/Dev/coupleforward-dashboard && npm run dev
```

   → open http://localhost:3000 → sign in as `jonathan.demo@coupleforward.test` (password is `DEMO_PARTNER_PASSWORD` in `.env.local`) → do a Huddle.
4. **Watch the sync**: open a second private/incognito window, sign in as `elena.demo@`, and type in the same Huddle from both windows. Edits should stream across within a few seconds.

What to judge while testing: does the Huddle flow FEEL like the spine of a journey product, and which dashboard cards earn their place on a roadmap-first home screen. Notes from this session feed directly into the decision slots below.

---

## Decision slots → waiting on Christian, labeled and empty on purpose

**[SLOT 1 → THE HAND-DRAWN NODE MAP]** Christian is sending his own drawing of the journey nodes. The candidate sequence in `01-journey-architecture.md` is scaffolding to react against, not a proposal to defend. When the drawing arrives, it wins, and the candidate map gets rewritten to match it.

**[SLOT 2 → CHRISTIAN'S TWO IDEAS]** He has "a couple of ideas" not yet transmitted. Two labeled placeholders are held open in the journey doc (one at the node level, one at the mechanism level) so they can be slotted without restructuring.

**[SLOT 3 → TIMELINE]** No target date is set. The build sequence doc is phased by dependency, not by calendar, until this slot is filled.

**[SLOT 4 → COUPLES-FIRST vs BOTH AT LAUNCH]** The brand master argues the individual is the front door (the ready partner buys alone). The current dashboard is couple-shaped (the couple model is built; a solo member sees a "waiting for your partner" banner). Whether v1 of the journey launches couples-only, solo-capable, or both is Christian's call and changes the Phase 1 scope. The build doc carries both branches.

---

## Open questions the plan cannot resolve alone

Packaging (updated 2026-08-11, second pass):

0a. ~~Included vs upgrade~~ **DECIDED: $47/month is the base; the REWIRE journey is the upgrade** (subscription steps up for the 90 days, drops back after completion). Still open inside that decision: the Compass-in-Lab anchor price, the elevated monthly number, and the day-90-without-arrival mechanic (see the pricing model section above).
0b. **What exactly does the standing invitation look like in-product?** A permanent journey card, a periodic prompt keyed to Huddle data, a personal note from Christian at milestones. This is a design decision with a tone constraint: always offered, never upsell-pressured (the audience's allergy is exactly this).
0c. **Naming settled: it is just REWIRE.** No "Jr.", no sub-brand. Remaining copy question: distinguishing the in-Lab journey from the high-touch intensive when both carry the name.

Clinical (his, and blocking for the REWIRE journey, not for the rhythm launch):

1. **The movement dictionary, per node.** The brand master's key open item. Each node needs "what counts as movement here, and how would the system know." The G.2 audience dictionary ("blowups don't destroy three days," "I can name it in real time," recovery time after rupture, the driveway brace) is the first draft; assigning signals to nodes is a clinical judgment. Until it exists the accountability AI has nothing to optimize toward. First-draft assignments are pre-filled in `01-journey-architecture.md`, marked as drafts for his edit.
2. **Where the baseline comes from.** Inner Compass as the mandatory on-ramp instrument, an in-Lab shorter baseline, or both. Affects pricing bundling ($79/$199 Inner Compass vs $47/month Lab) and the measurement spine.
3. **How much intimate content the server should hold.** Huddle answers and journal are already server-side under RLS. Movement measurements and station outputs will be more clinically revealing. Deletion/export posture must be decided before real couples enter.

Product/architecture (jointly decidable, flagged now):

4. **Station integration model.** The three live station apps run on separate subdomains. Same Supabase project? Shared auth session? The journey engine needs at minimum "this member completed a session at station X and here is the movement signal." Options range from link-out + manual check-in, to shared-auth SSO, to full embedding. Needs a look inside those repos before choosing.
5. **The Witness problem.** The observer-self node is arguably the hinge of the whole journey ("insight to witness is the transition the brand sells"), and The Witness is a PARKED app that does not exist. v1 options: teach the node with video + practice + Huddle-carried assignments and no app, or build a minimal Witness module first. Trade-off framed in the build doc.
6. **The streak's public face.** Streaks are explicitly ruled out as a measure of progress, but the Huddle streak is real and motivating as a ritual cadence. Proposed resolution (needs his sign-off): keep the streak as rhythm/ritual UI, never present it as progress; movement metrics alone speak for progress.
7. **Domain + hosting** for the Lab (lab.coupleforward.com? members.?), and pushing the repo (4 local commits, single-machine risk right now).
8. **Video hosting** (Mux, Vimeo, YouTube unlisted) once the shoot list in `03-video-shoot-list.md` starts filling.

---

## What "done" looks like for this planning phase

→ Christian has tested the existing product (FIRST ACTION above)
→ Slots 1-4 filled
→ The movement dictionary drafted per node (question 1)
→ Then `02-build-sequence.md` Phase 1 can start with no open dependencies
