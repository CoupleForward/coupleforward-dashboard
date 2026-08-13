"use client";

// Five drawn faces, sad to glad: eyes, a small nose, and a mouth. No
// enclosing circle, no emoji (Christian's spec, 2026-08-13). Each face
// carries a weight on the same 1-10 scale the database and the blended
// couple math already use.

export const FACE_VALUES = [2, 4, 6, 8, 10] as const;

// Mouth per step, drawn in a 24x24 box. Negative curve = frown, flat =
// neutral, then a fuller closed smile, and the last face is ecstatic:
// mouth wide open (a filled shape, not a line).
const CLOSED_MOUTHS = [
  "M7.5 17.5 Q12 13.5 16.5 17.5", // deep frown
  "M7.5 16.8 Q12 14.8 16.5 16.8", // soft frown
  "M8 16.2 L16 16.2", // flat
  "M7 15 Q12 19.2 17 15", // full closed smile
];
const OPEN_MOUTH = "M7 14.6 Q12 15.6 17 14.6 Q16 20.8 12 20.8 Q8 20.8 7 14.6 Z";

// Eyes lift slightly as the face brightens.
const EYE_Y = [8.6, 8.5, 8.4, 8.3, 8.1];

function Face({ step, className }: { step: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {/* eyes */}
      <circle cx="8.6" cy={EYE_Y[step]} r="0.9" fill="currentColor" stroke="none" />
      <circle cx="15.4" cy={EYE_Y[step]} r="0.9" fill="currentColor" stroke="none" />
      {/* nose */}
      <path d="M12 10.8 L11.4 13 L12.4 13" strokeWidth="1.3" />
      {/* mouth */}
      {step === 4 ? (
        <path d={OPEN_MOUTH} fill="currentColor" stroke="none" />
      ) : (
        <path d={CLOSED_MOUTHS[step]} />
      )}
    </svg>
  );
}

export function FaceScale({
  label,
  hint,
  value, // stored 1-10 value or null
  onPick,
}: {
  label: string;
  hint: string;
  value: number | null;
  onPick: (weight: number) => void;
}) {
  // Map a stored 1-10 value back to the nearest face step.
  const activeStep =
    value === null
      ? null
      : Math.min(4, Math.max(0, Math.round(value / 2) - 1));

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-cream">{label}</span>
        <span className="text-[10px] text-cream-mute">{hint}</span>
      </div>
      <div className="mt-1.5 grid grid-cols-5 gap-1.5">
        {FACE_VALUES.map((weight, step) => (
          <button
            key={weight}
            type="button"
            onClick={() => onPick(weight)}
            aria-label={`${label}: ${step + 1} of 5`}
            className={`h-11 rounded-lg grid place-items-center transition ${
              activeStep === step
                ? "bg-gold-soft border border-gold text-gold"
                : "bg-card-2/70 border border-line-soft/60 text-cream-mute hover:border-gold/40 hover:text-cream-dim"
            }`}
          >
            <Face step={step} className="size-7" />
          </button>
        ))}
      </div>
    </div>
  );
}
