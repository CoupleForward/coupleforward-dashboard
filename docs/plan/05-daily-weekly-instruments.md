# Daily + Weekly Instruments → spec for Christian's review

Drafted 2026-08-12 from his direction. This is the review copy: edit anything, especially the quiz questions, which are a clinical instrument and his call. Mirrored to iCloud `03 Programs/REWIRE LAB/`.

## 1. The daily check-in (the ping)

Three taps per partner, under 15 seconds, once a day:

→ **Mood** → how I feel in myself today (1-10)
→ **Happiness** → how I feel about my day (1-10)
→ **Connection** → how connected I feel to you today (1-10)

Mechanics (DECIDED by Christian, 2026-08-12 review):

→ **Raw daily answers are PRIVATE to their author, enforced by RLS.** Both partners see the dashboard outputs only: the blended couple connection score, the gap band, check-in status, and streaks. Your own mood line is visible only to you. (Honest math note, accepted: with two people, your own connection score plus the average discloses your partner's connection score by arithmetic; mood and happiness are never blended and stay truly private.)
→ **Weighting = average, with the gap always visible.** A 9 and a 3 average to 6, but the dashboard never shows a bare 6: it shows the 6 AND the spread, because the spread is the clinical signal. [CONFIRMED]
→ **The ping is in-app for now**; real push notifications arrive with deploy + notification infrastructure. [CONFIRMED]
→ **Daily check-in streaks exist alongside the Huddle streak** (his call): yours, your partner's, and a together streak (days you both checked in). Framed as rhythm, never progress, same as the Huddle streak.
→ Solo members: same check-in; their connection score reads as their own report, labeled honestly. Solo streak is just theirs.

**Journaling is two-lane (his call): private AND couple, separately.** Every entry is either shared with the couple (the default) or just-for-me, chosen at writing time, enforced by RLS. The weekly quiz's journal attachment stays optional.

## 2. The weekly quiz (draft questions → HIS RED PEN GOES HERE)

Five scored questions plus one optional journal attachment. Language pulled from the movement dictionary (recovery time, real-time naming, the brace, rehearsing, repair initiative, wanting vs performing). Once a week, each partner separately; both partners' answers visible to each other after both complete (or after 48 hours).

1. **Recovery.** "When something went sideways between you this week, what did it cost?" → We bounced back the same day / It took about a day / It took most of the week / We are still in it / Nothing went sideways this week.
2. **Real-time naming.** "How often could you name what was happening between you while it was happening, not days later?" → 1-10.
3. **The body.** "When a hard conversation started, what did your body do?" → Braced hard (1) … stayed open (10).
4. **Asking.** "How able were you to say what you needed without rehearsing it first?" → 1-10.
5. **Repair initiative.** "Did either of you move first to repair, without being asked?" → I did / They did / We both did / Neither of us / There was nothing to repair.
6. **Optional journal attachment.** "One moment from this week worth keeping: what happened, and what did it mean?" → lands in the shared journal, tagged to the week, for the couple to reread later.

Scoring: questions 2-4 average into the weekly movement pulse per partner; questions 1 and 5 are tracked as their own trends (recovery time and repair initiative are the two most on-thesis behavioral signals). Nothing here is a grade; every number drills down to its own answers per the dashboard rule.

**Explicitly separate from the REWIRE 30/60/90 instruments**, which are the deeper journey delta reads and get designed with the movement dictionary pass.

## 3. Dashboard additions

→ **Daily check-in card**: today's three taps, or today's result once answered.
→ **Mood strip**: both partners' mood lines over the last 14 days, side by side.
→ **Daily connection line**: the blended score with the gap band around it.
→ All three follow the drill-down rule (what it is, the source answers, the history, honest framing).
→ Weekly quiz results fold into the existing Satisfaction surface plus a repair/recovery trend in the depth views.

## 4. The personalized roadmap → what the database actually holds (investigated 2026-08-12)

Read-only findings from the shared backend:

→ **Pullable per-user today**: Mapping My Story sessions (`map_sessions` with full transcript, `map_descent` with the five-layer answers, `map_cards` with the RENDERED map images). A Lab member's maps can appear in their dashboard with a couple of days' work: same user accounts, same database.
→ **Profile flags that already exist**: `rewire_candidate`, `inner_compass_invited`, `dashboard_access`, `paid_maps`.
→ **NOT in the database**: Inner Compass Assessment scores or reports. There is no results table. The scoring and the MAPSS Grid / Healing Grid roadmaps live in the clinical workflow as documents.

**Consequence, stated plainly**: "your roadmap is built from your Inner Compass maps" needs an ingestion step, because the assessment results are not machine-readable anywhere yet. Proposed v1: a `compass_reports` table + a small attach flow where the finished individual reports and the couple's roadmap grids get attached to the couple (by Christian or an admin step in the clinical pipeline). The Lab then renders them in-dashboard (his standing requirement) and the unique roadmap builds from the grids. Automating the scoring itself is a later, separate project. [NEEDS HIS OK on this shape]

→ His hand drawing still owns the roadmap's visual form. Nothing above blocks on it.

## 5. Open on his desk

→ Veto or bless the three daily-check-in defaults (visibility, weighting, in-app ping).
→ Red-pen the five quiz questions above.
→ OK the `compass_reports` attach-flow shape for personalized roadmaps.
→ Ranked mentor list (and the Angelou call: inspired-by originals or omit).
→ Meditation recordings when ready; the player gets built meanwhile.
