"use client";

// The dashboard video window with a real feed. Shows the featured
// teaching over its Vimeo thumbnail; Play swaps the player in right in
// the window. The bar on the card's bottom edge is the only door to the
// Video Library on the dashboard (Christian, 2026-08-13 — no separate
// banner elsewhere on the page).

import Link from "next/link";
import { useState } from "react";
import { Card } from "../Card";
import { ChevronRightIcon, PlayIcon } from "../icons";
import {
  FEATURED_VIDEO,
  embedUrl,
  fmtDuration,
  thumbUrl,
} from "@/lib/lab/videos";

export function VideoWindowCard() {
  const [playing, setPlaying] = useState(false);
  const video = FEATURED_VIDEO;

  if (playing) {
    return (
      <Card padded={false} className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          <iframe
            src={embedUrl(video, true)}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5">
          <div className="text-[12px] text-cream-dim truncate">
            {video.title}
          </div>
          <Link
            href="/videos"
            className="shrink-0 text-[11.5px] text-gold hover:text-gold-bright transition"
          >
            Video Library
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="relative aspect-[21/7] min-h-[150px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUrl(video, 1280, 720)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(200,150,62,0.18),transparent_55%)]" />

        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-4 sm:pb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[9px] font-semibold tracking-[0.24em] uppercase text-gold mb-1.5">
              Featured Teaching
            </div>
            <h3 className="text-cream text-[18px] sm:text-[24px] font-semibold leading-[1.1]">
              {video.title}
            </h3>
            <p className="mt-1 text-[11.5px] sm:text-[12.5px] text-cream-dim">
              {fmtDuration(video.durationSec)} · with Christian
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] pl-4 pr-5 py-2.5 text-[13px] font-semibold hover:bg-gold-bright transition"
          >
            <PlayIcon className="size-4" />
            Play
          </button>
        </div>
      </div>

      <Link
        href="/videos"
        className="flex items-center justify-between gap-3 px-5 sm:px-8 py-2.5 text-[11.5px] text-cream-dim hover:text-cream transition"
      >
        <span>Browse the full Video Library</span>
        <ChevronRightIcon className="size-3.5 text-gold" />
      </Link>
    </Card>
  );
}
