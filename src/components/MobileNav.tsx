import {
  GridIcon,
  HomeIcon,
  JournalIcon,
  UserIcon,
  VideoIcon,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

type Tab = {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean;
};

const tabs: Tab[] = [
  { label: "Home", icon: HomeIcon, active: true },
  { label: "Apps", icon: GridIcon },
  { label: "Live", icon: VideoIcon },
  { label: "Journal", icon: JournalIcon },
  { label: "Profile", icon: UserIcon },
];

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-soft/95 backdrop-blur border-t border-line-soft">
      <div className="max-w-screen-sm mx-auto grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              type="button"
              className={`flex flex-col items-center gap-1 py-1 text-[10px] transition ${
                tab.active ? "text-gold" : "text-cream-mute hover:text-cream"
              }`}
            >
              <Icon className="size-[20px]" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
