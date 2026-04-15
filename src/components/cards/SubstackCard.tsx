import { Card } from "../Card";
import { ChevronRightIcon } from "../icons";

export function SubstackCard() {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="flex">
        {/* Article thumbnail */}
        <div className="relative w-[88px] shrink-0 bg-gradient-to-br from-[#3a2a1c] via-[#2a1f14] to-[#1a120a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(200,150,62,0.35),transparent_60%)]" />
          <span className="absolute top-1.5 right-1.5 size-4 rounded-sm bg-gold/90 grid place-items-center text-[8px] font-bold text-[#1a1a1a]">
            S
          </span>
        </div>

        <div className="flex-1 p-4 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-cream-mute">
            Latest article from Substack
          </div>
          <h3 className="mt-1 text-[13.5px] font-semibold text-cream leading-snug line-clamp-2">
            The Map You Married: Why Your Partner&apos;s Reality Isn&apos;t Yours
          </h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="text-[10px] text-cream-mute truncate">
              Christian J. Charette · 8 min read
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-gold hover:text-gold-bright transition shrink-0"
            >
              Read
              <ChevronRightIcon className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
