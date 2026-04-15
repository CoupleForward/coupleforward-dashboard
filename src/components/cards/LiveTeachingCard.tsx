import { Card } from "../Card";
import { ChevronRightIcon, PlayIcon } from "../icons";

const pastRecordings = [
  { title: "The Loop Explained", length: "4:39" },
  { title: "FAQ: When Your Partner Shuts Down", length: "3:28" },
  { title: "Live Session: Real Couple, Real Repair", length: "4:20" },
  { title: "Podcast Ep. 12: Witness", length: "3:19" },
  { title: "The Ritual of Re-Entry", length: "5:11" },
  { title: "Nervous System 101", length: "6:02" },
];

export function LiveTeachingCard() {
  return (
    <Card padded={false} className="overflow-hidden flex flex-col">
      {/* Hero — cinematic widescreen */}
      <div className="relative aspect-[21/9] bg-gradient-to-br from-[#3a2a1c] via-[#1f1612] to-[#0f0b08] overflow-hidden">
        {/* faux room glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(200,150,62,0.38),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,rgba(200,150,62,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Live badge top-right */}
        <div className="absolute top-5 right-5 inline-flex items-center gap-2 rounded-full bg-black/50 backdrop-blur px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-cream-dim">
          <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
          Featured
        </div>

        {/* Play button */}
        <button
          type="button"
          className="absolute inset-0 grid place-items-center group"
          aria-label="Play live teaching"
        >
          <span className="size-20 rounded-full bg-black/45 backdrop-blur-sm border border-white/15 grid place-items-center text-cream group-hover:bg-gold/30 group-hover:border-gold transition shadow-2xl">
            <PlayIcon className="size-8 ml-1" />
          </span>
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-6 sm:pb-7">
          <div className="text-[9px] font-semibold tracking-[0.24em] uppercase text-gold mb-2">
            Love Rewired · Live Teaching
          </div>
          <h3 className="text-cream text-[24px] sm:text-[32px] md:text-[38px] font-semibold leading-[1.05] max-w-[80%]">
            Conflict as Connection
          </h3>
          <p className="mt-2 text-[12px] sm:text-[13px] text-cream-dim max-w-[60%]">
            Dr. Christian walks a real couple through a full repair — live,
            unscripted, end-to-end.
          </p>
        </div>
      </div>

      {/* Upcoming strip */}
      <div className="px-6 sm:px-7 py-4 border-t border-line-soft flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-cream">
            Next live session
          </div>
          <div className="text-[11px] text-cream-mute mt-0.5">
            Saturday · 3PM &amp; 7PM PT
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-line-soft/60 bg-card-2/80 px-3.5 py-1.5 text-[11.5px] font-medium text-cream hover:border-gold/60 hover:text-gold transition"
          aria-label="View schedule"
        >
          View schedule
          <ChevronRightIcon className="size-3.5" />
        </button>
      </div>

      {/* Past recordings */}
      <div className="px-6 sm:px-7 pb-6">
        <div className="text-[11px] text-cream-mute mb-2.5">Past recordings</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1">
          {pastRecordings.map((rec) => (
            <button
              key={rec.title}
              type="button"
              className="shrink-0 w-[160px] text-left group"
            >
              <div className="relative aspect-[16/10] rounded-md overflow-hidden bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(200,150,62,0.25),transparent_65%)]" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="size-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/15 grid place-items-center text-cream group-hover:bg-gold/30 group-hover:border-gold transition">
                    <PlayIcon className="size-3.5 ml-0.5" />
                  </span>
                </div>
                <span className="absolute bottom-1 right-1 text-[9px] tabular-nums bg-black/60 px-1 py-px rounded text-cream">
                  {rec.length}
                </span>
              </div>
              <div className="text-[11px] text-cream-dim mt-1.5 leading-tight line-clamp-2">
                {rec.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
