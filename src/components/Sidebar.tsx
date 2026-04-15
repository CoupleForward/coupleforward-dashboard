import Link from "next/link";
import {
  CompassIcon,
  EyeIcon,
  HeartIcon,
  HuddleIcon,
  JournalIcon,
  LotusIcon,
  LockIcon,
  MapIcon,
  NarmIcon,
  PauseIcon,
  PencilIcon,
  RoadIcon,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  active?: boolean;
  comingSoon?: boolean;
};

const items: NavItem[] = [
  { label: "Witness", icon: EyeIcon },
  { label: "Huddle", icon: HuddleIcon, active: true, href: "/huddle" },
  { label: "Mapping My Story", icon: MapIcon },
  { label: "Adventures", icon: CompassIcon, comingSoon: true },
  { label: "In Between", icon: PauseIcon, comingSoon: true },
  { label: "Rescript", icon: PencilIcon, comingSoon: true },
  { label: "Compass", icon: CompassIcon, comingSoon: true },
  { label: "Roadmap", icon: RoadIcon, comingSoon: true },
  { label: "NARM", icon: NarmIcon, comingSoon: true },
  { label: "Feelings", icon: HeartIcon, comingSoon: true },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-[232px] shrink-0 flex-col border-r border-line-soft bg-bg-soft">
      {/* Brand */}
      <div className="px-6 pt-6 pb-7">
        <div className="flex items-center gap-2.5">
          <HeartIcon className="size-5 text-gold" />
          <span className="font-medium tracking-[0.18em] text-[12px] text-cream">
            COUPLE FORWARD
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const className = `group relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition ${
            item.active
              ? "text-cream"
              : "text-cream-dim hover:text-cream hover:bg-card/60"
          }`;
          const content = (
            <>
              {item.active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-gold" />
              )}
              <Icon
                className={`size-[18px] shrink-0 ${
                  item.active ? "text-gold" : "text-cream-mute"
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.comingSoon && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-1.5 py-0.5 text-[9px] font-medium text-gold uppercase tracking-wide">
                  <LockIcon className="size-2.5" />
                  Soon
                </span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className={className}>
                {content}
              </Link>
            );
          }
          return (
            <button key={item.label} type="button" className={className}>
              {content}
            </button>
          );
        })}
      </nav>

      {/* Bottom shelf */}
      <div className="px-4 py-5 border-t border-line-soft">
        <div className="flex items-center justify-around">
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
          >
            <span className="size-9 rounded-full grid place-items-center bg-card">
              <LotusIcon className="size-[18px]" />
            </span>
            <span className="text-[10px] leading-tight text-center max-w-[70px]">
              Breathwork / somatic
            </span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 text-cream-mute hover:text-cream transition"
          >
            <span className="size-9 rounded-full grid place-items-center bg-card">
              <JournalIcon className="size-[18px]" />
            </span>
            <span className="text-[10px] leading-tight">Journal</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
