"use client";

// Shared depth-view container: every dashboard metric opens into one of
// these (the drill-down rule in docs/plan/01 §5a — nothing on the dashboard
// is a dead-end decoration). Bottom sheet on mobile, right slide-over on
// desktop. Escape or backdrop closes.

import { useEffect, type ReactNode } from "react";
import { XIcon } from "./icons";

export function DetailSheet({
  open,
  onClose,
  label,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:max-h-none sm:h-full sm:w-[420px] sm:rounded-none bg-bg-soft border-t sm:border-t-0 sm:border-l border-line-soft flex flex-col">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-line-soft shrink-0">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-cream-mute">
              {label}
            </div>
            <div className="text-[17px] font-semibold text-cream mt-0.5">
              {title}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full grid place-items-center text-cream-dim hover:bg-card hover:text-cream transition shrink-0"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// Small shared pieces for depth content, so every drill-down reads the same.

export function DepthSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6">
      <h3 className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cream-mute mb-2">
        {heading}
      </h3>
      <div className="text-[13px] text-cream-dim leading-relaxed">
        {children}
      </div>
    </section>
  );
}
