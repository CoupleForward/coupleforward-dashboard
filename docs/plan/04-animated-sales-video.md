# REWIRE Lab → The Animated Roadmap Sales Video (concept, planning only)

Companion to `01-journey-architecture.md` and `03-video-shoot-list.md`. Concept and reuse architecture for the animated video that sells the Lab by walking its actual map. Blocks on **[SLOT 1 → the node map]**; nothing here needs deciding before the map is final except the reuse principle, which should be agreed now because it constrains how the map gets drawn as an asset.

## The core idea → the sales video IS the product spine

One continuously drawn map. The camera travels a path through it. Each node is a destination that lights as the travelers reach it, and at each one, a single line names the skill gained there. The couple is rendered as two threads (or two points of light) that begin tangled, travel the path, and end moving together, distinct but coordinated. No feature tour, no screenshot montage, no testimonial collage: the map, the movement, the arc.

Why this is the right shape for THIS brand:

→ The product's whole claim is "one journey, not scattered tools." The only honest visualization of that claim is the journey itself.
→ "Sell the map" is already the brand's conversion doctrine. This is the map, literally, sold.
→ The packaging rule says show a defined arc and an end state, never an indefinite subscription. A path with a visible destination is that rule in picture form.
→ Show measured movement, not feature count: the video's midpoint beat (below) is the measurement promise drawn on screen.
→ And when a viewer later becomes a member, the product home screen is the SAME map. The ad was a tour of the real thing. That recognition moment is the anti-PDS proof no competitor selling a content library can fake.

## The reuse architecture (agree to this before drawing the final map)

Build the node map once, as a layered vector artifact (the master map), and let four consumers render it:

1. **The product**: the "Your Journey" surface renders the same geometry (position marker, gated nodes).
2. **The sales video**: the master map animated (path travel, node ignitions).
3. **Per-node cuts**: each node's ignition sequence exports as a 20-40s vertical cut → an Instagram/reel series ("Node 4: the skill nobody taught you"), each one a small ad for one destination. The reel accent gold (#C9A84C) discipline already exists in the social pipeline.
4. **Print/PDF**: the map as a one-page artifact for the sales page, the Way Forward capstone document, and the workshop room wall.

Practical consequence: Christian's hand drawing gets translated ONCE into this master vector (his drawing stays the source of truth for structure; the vector is the source of truth for pixels), and every downstream surface inherits it. No surface redraws the map by hand ever again.

## Script skeleton (v0, slots open)

Target 90-120 seconds. Christian VO throughout, private register, one viewer at a time. Draft beats:

1. **The cold open (0:00-0:15)** → the contrarian line over a tangled scribble of two threads: "Everyone can name the pattern now. Almost no one can exit it." (Or the season's chosen enemy phrasing: **[marquee phrasing still open per Brand Master Section H]**.)
2. **The turn (0:15-0:25)** → the scribble pulls apart and becomes the START of a path: "You don't need more insight. You need a sequence."
3. **The journey (0:25-1:10)** → the camera travels. Nodes ignite one by one; at each, one line, skill-named in movement language, e.g. "here, you learn to see the loop while you're standing in it" (Node 4), "here, a blowup stops costing you three days" (Node 7). Stations appear as small companions arriving AT the path, not a grid of apps. **[Node lines finalize from the movement dictionary + final map]**
4. **The measurement beat (1:10-1:25)** → the path leaves a trace behind the travelers: a drawn line of what moved. "We don't count what you finished. We measure what changed." This beat is non-negotiable in any cut-down.
5. **The arrival (1:25-1:45)** → the end state, concrete, Tuesday-night scale. The two threads move in step. The map zooms out ONCE, showing the whole arc just traveled: it has an end.
6. **The door (1:45-2:00)** → the invitation: start where you actually are. Inner Compass as the entry step (solo-capable: "you can start alone"). URL. No urgency mechanics.

Cut-downs: 60s (drop to 4-5 node ignitions), 30s (open + one node + measurement beat + door), plus the per-node vertical series from the reuse architecture.

## Production route (recommendation, decidable later)

Two viable routes, both compatible with the reuse architecture:

→ **Code-driven animation** (SVG/Canvas, e.g. Remotion or hand-rolled with the existing ffmpeg pipeline): the master map is already vector; path-travel and node-ignition are parametric, so the 10 per-node cuts generate rather than get hand-animated; revisions when the map changes are cheap. This route fits the tooling that already exists in this ecosystem. Recommended default.
→ **Motion designer** engagement for the hero 120s film only, working FROM the master vector, with the per-node cuts still generated. Buys polish on the flagship at the cost of revision agility.

Either way: VO records after the MVP node scripts exist (same register, same session block as the V1 arrival videos is efficient), music minimal, brand palette (the dark field + gold path is already the product's design system; the video should look like the dashboard, on purpose).

## Dependencies

→ Final node map (SLOT 1) → geometry
→ Movement dictionary → the node lines and the measurement beat
→ Enemy marquee phrasing (open brand item) → the cold open
→ Nothing else. The sales video deliberately has no dependency on the build phases; it can be produced as soon as the map and dictionary are final, and per the launch sequence it is wanted by Phase 4 (alumni email first, site second, ads third: the video serves the second and third).
