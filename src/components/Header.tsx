import { BellIcon, HeartIcon, SettingsIcon, UserIcon } from "./icons";

function Avatar() {
  return (
    <div className="size-12 rounded-full bg-card-2 ring-2 ring-gold/80 ring-offset-2 ring-offset-bg flex items-center justify-center text-cream-mute">
      <UserIcon className="size-6" />
    </div>
  );
}

export function Header() {
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
            Jonathan &amp; Elena
          </div>
          <div className="text-[11px] text-cream-mute mt-0.5">
            Together since March 2014 · Members since January 2026
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
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-gold" />
        </button>
        <button
          type="button"
          className="ml-1 hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/60 px-3.5 py-1.5 text-[12px] font-medium text-gold hover:bg-gold-soft transition"
        >
          <span className="size-1.5 rounded-full bg-gold animate-pulse" />
          Go Live
        </button>
      </div>
    </header>
  );
}
