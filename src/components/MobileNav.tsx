import Link from "next/link";
import {
  GridIcon,
  HomeIcon,
  HuddleIcon,
  JournalIcon,
  UserIcon,
} from "./icons";
import type { ComponentType, SVGProps } from "react";

type TabKey = "home" | "apps" | "huddle" | "journal" | "account";

type Tab = {
  key: TabKey;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href: string;
};

const tabs: Tab[] = [
  { key: "home", label: "Home", icon: HomeIcon, href: "/" },
  { key: "apps", label: "Apps", icon: GridIcon, href: "/apps" },
  { key: "huddle", label: "Huddle", icon: HuddleIcon, href: "/huddle" },
  { key: "journal", label: "Journal", icon: JournalIcon, href: "/journal" },
  { key: "account", label: "Account", icon: UserIcon, href: "/account" },
];

// Pass no `active` on pages that aren't one of the five tabs — nothing
// highlights, which is the honest state.
export function MobileNav({ active }: { active?: TabKey }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-soft/95 backdrop-blur border-t border-line-soft">
      <div className="max-w-screen-sm mx-auto grid grid-cols-5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 text-[10px] transition ${
                tab.key === active
                  ? "text-gold"
                  : "text-cream-mute hover:text-cream"
              }`}
            >
              <Icon className="size-[20px]" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
