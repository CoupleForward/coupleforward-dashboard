// The open app shelf. Every Lab member gets every tool — the shelf is never
// gated by the journey (docs/plan/01, "two hats per tool"). Items are either
// live today (real links) or honestly parked ("soon", no fake buttons).

import type { ComponentType, SVGProps } from "react";
import {
  CompassIcon,
  EyeIcon,
  HeartIcon,
  HuddleIcon,
  MapIcon,
  NarmIcon,
  PauseIcon,
  PencilIcon,
  RoadIcon,
  VideoIcon,
} from "@/components/icons";

export type ShelfApp = {
  key: string;
  label: string;
  // One-line, member-facing. Voice: plain, specific, no hype.
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  status: "live" | "soon";
  href?: string; // internal path or external URL
  external?: boolean;
};

export const SHELF_APPS: ShelfApp[] = [
  {
    key: "huddle",
    label: "Huddle",
    description:
      "Your weekly check-in ritual. Reflect on last week, ask for what you need, plan the week on purpose.",
    icon: HuddleIcon,
    status: "live",
    href: "/huddle",
  },
  {
    key: "mapping-my-story",
    label: "Mapping My Story",
    description:
      "Walk a charged moment down to the primary emotion and the unmet need underneath it, then say it so your partner can actually receive it.",
    icon: MapIcon,
    status: "live",
    href: "https://mappingmystory.coupleforward.com",
    external: true,
  },
  {
    key: "the-between",
    label: "The Between",
    description:
      "For the moment things go sideways. Bring a real exchange and see what was happening underneath, plus a better next line.",
    icon: PauseIcon,
    status: "live",
    href: "https://thebetween.coupleforward.com",
    external: true,
  },
  {
    key: "adventures",
    label: "Adventures",
    description:
      "Ideas and plans for time together that actually feels like time together.",
    icon: CompassIcon,
    status: "live",
    href: "https://adventures.coupleforward.com",
    external: true,
  },
  {
    key: "videos",
    label: "Video Library",
    description:
      "Every teaching in the Lab, in one place. Watch, rewatch, share one with your partner.",
    icon: VideoIcon,
    status: "live",
    href: "/videos",
  },
  {
    key: "witness",
    label: "The Witness",
    description:
      "Learn to catch the loop while you are standing in it, not three days later.",
    icon: EyeIcon,
    status: "soon",
  },
  {
    key: "rescript",
    label: "Rescript",
    description: "Take the fight you keep having and rewrite how it goes.",
    icon: PencilIcon,
    status: "soon",
  },
  {
    key: "compass",
    label: "Couple Forward Compass",
    description: "Direction and values work for where you are headed together.",
    icon: CompassIcon,
    status: "soon",
  },
  {
    key: "roadmap",
    label: "Way Forward Roadmap",
    description: "Your arc, mapped: where you started, what moved, what is next.",
    icon: RoadIcon,
    status: "soon",
  },
  {
    key: "narm",
    label: "NARM",
    description:
      "Your survival style, named with care: what it protects and what it costs.",
    icon: NarmIcon,
    status: "soon",
  },
  {
    key: "feelings",
    label: "Feelings",
    description: "A vocabulary for what is actually happening in you.",
    icon: HeartIcon,
    status: "soon",
  },
];

export const LIVE_APPS = SHELF_APPS.filter((a) => a.status === "live");
