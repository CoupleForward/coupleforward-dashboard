import { Card } from "../Card";

// Honest placeholder: weekly live sessions are a real part of the Lab's
// plan (the scarce-hours tier), but no schedule or recordings exist yet.
// No fake play buttons, no invented dates — the card says what is true.
export function LiveTeachingCard() {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="relative aspect-[21/7] min-h-[150px] bg-gradient-to-br from-[#3a2a1c] via-[#1f1612] to-[#0f0b08] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_60%,rgba(200,150,62,0.32),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,rgba(200,150,62,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-8 pb-5 sm:pb-6">
          <div className="text-[9px] font-semibold tracking-[0.24em] uppercase text-gold mb-1.5">
            Live Teaching
          </div>
          <h3 className="text-cream text-[20px] sm:text-[24px] font-semibold leading-[1.1]">
            Weekly live sessions are coming to the Lab
          </h3>
          <p className="mt-1.5 text-[12px] sm:text-[12.5px] text-cream-dim max-w-[75%]">
            Real teaching, live Q&amp;A, and real repair work with Christian.
            When the schedule exists, it will live right here. Not before.
          </p>
        </div>
      </div>
    </Card>
  );
}
