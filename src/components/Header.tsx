import { BellIcon, HeartIcon, SettingsIcon, UserIcon } from "./icons";
import { SignOutButton } from "./SignOutButton";

function Avatar() {
  return (
    <div className="size-12 rounded-full bg-card-2 ring-2 ring-gold/80 ring-offset-2 ring-offset-bg flex items-center justify-center text-cream-mute">
      <UserIcon className="size-6" />
    </div>
  );
}

function formatMonthYear(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function Header({
  coupleName,
  togetherSince,
  memberSince,
  soloPartner,
}: {
  coupleName: string;
  togetherSince: string | null;
  memberSince: string;
  soloPartner: boolean;
}) {
  const subtitle = [
    togetherSince ? `Together since ${formatMonthYear(togetherSince)}` : null,
    `Members since ${formatMonthYear(memberSince)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8 border-b border-line-soft">
      {/* Logo (mobile only — sidebar already shows it on desktop) */}
      <div className="flex items-center gap-2 lg:hidden">
        <HeartIcon className="size-5 text-gold" />
        <span className="font-medium tracking-[0.18em] text-[11px] text-cream">
          COUPLE FORWARD
        </span>
      </div>

      {/* Couple identity */}
      <div className="hidden md:flex items-center gap-4 mx-auto lg:mx-0">
        <div className="flex items-center -space-x-3">
          <Avatar />
          <div className="size-6 rounded-full bg-bg flex items-center justify-center z-10">
            <HeartIcon className="size-3.5 text-gold" />
          </div>
          <Avatar />
        </div>
        <div className="leading-tight">
          <div className="text-xl sm:text-2xl font-medium text-cream">
            {coupleName}
          </div>
          <div className="text-[11px] text-cream-mute mt-0.5">
            {soloPartner ? "Waiting for your partner to join · " : ""}
            {subtitle}
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="size-9 rounded-full grid place-items-center text-cream-dim hover:bg-card hover:text-cream transition"
          aria-label="Settings"
        >
          <SettingsIcon className="size-[18px]" />
        </button>
        <button
          type="button"
          className="size-9 rounded-full grid place-items-center text-cream-dim hover:bg-card hover:text-cream transition relative"
          aria-label="Notifications"
        >
          <BellIcon className="size-[18px]" />
        </button>
        <SignOutButton />
      </div>
    </header>
  );
}
