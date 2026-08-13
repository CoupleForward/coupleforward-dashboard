"use client";

// The app shelf as a slide-out panel (Christian's call, 2026-08-13): the
// permanent sidebar gave its width back to the dashboard. The trigger
// lives in the Header; the panel slides over from the left with a
// backdrop, closes on Esc, backdrop, or navigation.

import Link from "next/link";
import { useEffect, useState } from "react";
import { SHELF_APPS } from "@/lib/lab/apps";
import {
  ExternalIcon,
  HistoryIcon,
  JournalIcon,
  LotusIcon,
  MenuIcon,
  XIcon,
} from "./icons";

export function NavDrawer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the app menu"
        className="size-9 rounded-full grid place-items-center text-cream-dim hover:bg-card hover:text-cream transition shrink-0"
      >
        <MenuIcon className="size-[18px]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-bg-soft border-r border-line-soft flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-line-soft">
              <span className="font-medium tracking-[0.18em] text-[12px] text-cream">
                YOUR TOOLS
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="size-8 rounded-full grid place-items-center text-cream-dim hover:bg-card hover:text-cream transition"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {SHELF_APPS.map((app) => {
                const Icon = app.icon;
                const className = `group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
                  app.status === "live"
                    ? "text-cream-dim hover:text-cream hover:bg-card/60"
                    : "text-cream-mute cursor-default"
                }`;
                const content = (
                  <>
                    <Icon className="size-[18px] shrink-0 text-cream-mute" />
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
                      onClick={() => setOpen(false)}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      key={app.key}
                      href={app.href}
                      className={className}
                      onClick={() => setOpen(false)}
                    >
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

              <Link
                href="/history"
                onClick={() => setOpen(false)}
                className="group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-cream-dim hover:text-cream hover:bg-card/60 transition"
              >
                <HistoryIcon className="size-[18px] shrink-0 text-cream-mute" />
                <span className="flex-1 text-left">Past weeks</span>
              </Link>
            </nav>

            <div className="px-4 py-4 border-t border-line-soft flex items-center justify-around">
              <Link
                href="/breathe"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
              >
                <span className="size-9 rounded-full grid place-items-center bg-card">
                  <LotusIcon className="size-[18px]" />
                </span>
                <span className="text-[10px] leading-tight">Breathwork</span>
              </Link>
              <Link
                href="/journal"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
              >
                <span className="size-9 rounded-full grid place-items-center bg-card">
                  <JournalIcon className="size-[18px]" />
                </span>
                <span className="text-[10px] leading-tight">Journal</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
