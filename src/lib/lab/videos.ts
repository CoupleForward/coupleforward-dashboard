// The Lab video library. Registry-driven: adding a video here puts it in
// the library rows, and `featured: true` puts it in the dashboard video
// window. Only real, watchable videos belong here — no placeholders.
//
// Thumbnails come straight off the Vimeo CDN (thumbBase is the video's
// CDN asset path; thumbUrl() appends a size). Grab both values from
// https://vimeo.com/api/oembed.json?url=<video url> when adding one.

export type LabVideo = {
  key: string;
  vimeoId: number;
  title: string;
  // Member-facing one-liner. Plain, specific, no hype.
  description: string;
  durationSec: number;
  // Library row this video lives in. Rows render in first-seen order.
  category: string;
  thumbBase: string;
  featured?: boolean;
};

export const LAB_VIDEOS: LabVideo[] = [
  {
    key: "couple-forward-compass",
    vimeoId: 763235498,
    title: "The Couple Forward Compass",
    description:
      "Where you are headed together, and how to find your heading again when you lose it. The full Compass teaching with Christian.",
    durationSec: 1710,
    category: "Foundations",
    thumbBase:
      "https://i.vimeocdn.com/video/1537825022-c8a99d5417d00c9b7cc3a9eee5aa4c608c9e9007c38f53e119b66866cba8e0e6-d",
    featured: true,
  },
];

export const FEATURED_VIDEO: LabVideo =
  LAB_VIDEOS.find((v) => v.featured) ?? LAB_VIDEOS[0];

export function videoByKey(key: string): LabVideo | undefined {
  return LAB_VIDEOS.find((v) => v.key === key);
}

// Rows for the library page, keyed by category, in first-seen order.
export function videoRows(): { category: string; videos: LabVideo[] }[] {
  const rows: { category: string; videos: LabVideo[] }[] = [];
  for (const v of LAB_VIDEOS) {
    const row = rows.find((r) => r.category === v.category);
    if (row) row.videos.push(v);
    else rows.push({ category: v.category, videos: [v] });
  }
  return rows;
}

export function thumbUrl(v: LabVideo, w = 640, h = 360): string {
  return `${v.thumbBase}_${w}x${h}?region=us`;
}

export function fmtDuration(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} hr ${m % 60} min`;
}

export function embedUrl(v: LabVideo, autoplay = false): string {
  const params = new URLSearchParams({
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1", // no Vimeo tracking cookies for members
    ...(autoplay ? { autoplay: "1" } : {}),
  });
  return `https://player.vimeo.com/video/${v.vimeoId}?${params}`;
}
