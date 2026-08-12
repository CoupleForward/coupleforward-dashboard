import Link from "next/link";
import { SHELF_APPS } from "@/lib/lab/apps";
import {
  ExternalIcon,
  HeartIcon,
  HistoryIcon,
  JournalIcon,
  LotusIcon,
} from "./icons";

// The open app shelf: every member sees every tool. Live tools link for
// real (the three station apps run on their own subdomains); parked tools
// carry an honest "Soon" and no dead click.

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[232px] shrink-0 flex-col border-r border-line-soft bg-bg-soft">
      {/* Brand */}
      <div className="px-6 pt-6 pb-7">
        <Link href="/" className="flex items-center gap-2.5">
          <HeartIcon className="size-5 text-gold" />
          <span className="font-medium tracking-[0.18em] text-[12px] text-cream">
            COUPLE FORWARD
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {SHELF_APPS.map((app) => {
          const Icon = app.icon;
          const isHuddle = app.key === "huddle";
          const className = `group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
            isHuddle
              ? "text-cream"
              : app.status === "live"
                ? "text-cream-dim hover:text-cream hover:bg-card/60"
                : "text-cream-mute cursor-default"
          }`;
          const content = (
            <>
              {isHuddle && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gold" />
              )}
              <Icon
                className={`size-[18px] shrink-0 ${
                  isHuddle ? "text-gold" : "text-cream-mute"
                }`}
              />
              <span className="flex-1 text-left">{app.label}</span>
              {app.status === "soon" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-1.5 py-0.5 text-[9px] font-medium text-gold uppercase tracking-wide">
                  <span className="size-1 rounded-full bg-gold" />
                  Soon
                </span>
              )}
              {app.status === "live" && app.external && (
                <ExternalIcon className="size-3 text-cream-mute opacity-0 group-hover:opacity-100 transition" />
              )}
            </>
          );

          if (app.status === "live" && app.href) {
            return app.external ? (
              <a
                key={app.key}
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {content}
              </a>
            ) : (
              <Link key={app.key} href={app.href} className={className}>
                {content}
              </Link>
            );
          }
          return (
            <div key={app.key} className={className}>
              {content}
            </div>
          );
        })}

        {/* Huddle history, right under the shelf */}
        <Link
          href="/history"
          className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-cream-dim hover:text-cream hover:bg-card/60 transition"
        >
          <HistoryIcon className="size-[18px] shrink-0 text-cream-mute" />
          <span className="flex-1 text-left">Past weeks</span>
        </Link>
      </nav>

      {/* Bottom shelf */}
      <div className="px-4 py-5 border-t border-line-soft">
        <div className="flex items-center justify-around">
          <Link
            href="/breathe"
            className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
          >
            <span className="size-9 rounded-full grid place-items-center bg-card">
              <LotusIcon className="size-[18px]" />
            </span>
            <span className="text-[10px] leading-tight text-center max-w-[70px]">
              Breathwork
            </span>
          </Link>
          <Link
            href="/journal"
            className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
          >
            <span className="size-9 rounded-full grid place-items-center bg-card">
              <JournalIcon className="size-[18px]" />
            </span>
            <span className="text-[10px] leading-tight">Journal</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
