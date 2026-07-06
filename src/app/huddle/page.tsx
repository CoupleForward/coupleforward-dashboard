"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  FlameIcon,
  HeartIcon,
  HuddleIcon,
  LinkIcon,
  MicIcon,
  ShareIcon,
  XIcon,
} from "@/components/icons";
import {
  DAY_LABELS,
  DAY_LONG,
  DAY_ORDER,
  RITUAL_CALENDAR_TITLES,
  type DayOfWeek,
  type PlanItem,
  type PlanKey,
  type PlanState,
  type TimeSlot,
  buildIcs,
  downloadIcs,
  formatTimeDisplay,
  sortSlots,
} from "@/lib/huddle";
import {
  useHuddle,
  type AskAnswers,
  type CommitState,
  type DualAnswer,
  type ReflectAnswers,
  type Slot,
  type UseHuddleResult,
} from "@/lib/lab/useHuddle";

// ─── Types ───────────────────────────────────────────────────────────────

type StageKey = "welcome" | "reflect" | "ask" | "plan" | "commit" | "done";

const STAGES: readonly StageKey[] = [
  "welcome",
  "reflect",
  "ask",
  "plan",
  "commit",
  "done",
] as const;

type Names = { a: string; b: string };

type Ritual = {
  key: PlanKey;
  title: string;
  cadence: string;
  shortDescription: string;
  fullExplanation: string;
  coachingQuestions: string[];
  proTip?: string;
  externalLink?: { label: string; url: string };
  detailsPlaceholder: string;
  scheduling?: { maxSlots: number; hasFood?: boolean };
};

// ─── Web Speech API (minimal typing) ─────────────────────────────────────

type SRAlternative = { transcript: string };
type SRResult = {
  isFinal: boolean;
  readonly length: number;
  [index: number]: SRAlternative;
};
type SRResultList = {
  readonly length: number;
  [index: number]: SRResult;
};
type SREvent = { resultIndex: number; results: SRResultList };
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SRConstructor = new () => SpeechRecognitionInstance;

function getSRConstructor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// ─── Content ─────────────────────────────────────────────────────────────

const rituals: Ritual[] = [
  {
    key: "morning",
    title: "Morning Ritual",
    cadence: "Daily",
    shortDescription:
      "How the day begins, together. Evaluate, adjust, experiment — partner in this.",
    fullExplanation:
      "Mornings set the tone. Most couples default into survival mode — coffee, phones, rush out the door. A morning ritual is the smallest possible act of choosing each other first. It can be 90 seconds. It can be 20 minutes. The form is less important than the intention: we greet each other before we greet the day.",
    coachingQuestions: [
      "What do our mornings actually look like right now?",
      "Where is the friction, and where is the opening we could use?",
      "What's one tiny thing we could try this week to connect first?",
    ],
    proTip:
      "Start with 60 seconds of eye contact and a real hug before coffee. You can build from there.",
    detailsPlaceholder:
      "What are we trying this week? (e.g., coffee together at 7am, no phones until 7:30)",
  },
  {
    key: "evening",
    title: "Evening Ritual",
    cadence: "Daily",
    shortDescription:
      "How the day closes. Even with different bedtimes — tuck-in, 15 min cuddle, a chapter read aloud.",
    fullExplanation:
      "The way you end your day together is how your nervous systems file the relationship. Without a ritual, the last thing you remember about each other might be a tense logistics conversation about tomorrow. An evening ritual gives the relationship the closing note it deserves.",
    coachingQuestions: [
      "How are we currently ending our days — is there a handoff, or do we just drift off?",
      "What would feel nourishing, not performative?",
      "Can one of us commit to the tuck-in even if our bedtimes don't match?",
    ],
    proTip:
      "A tuck-in works even when bedtimes don't match. Fifteen minutes under the covers is worth more than an hour on the couch.",
    detailsPlaceholder:
      "What are we trying this week? (e.g., 15 min cuddle + gratitudes before bed)",
  },
  {
    key: "convos",
    title: "Two Intentional Conversations",
    cadence: "2× per week",
    shortDescription:
      "20 minutes of undivided presence. Put them in the middle of the week.",
    fullExplanation:
      "An intentional conversation is not a status update. It's not logistics. It's 20 minutes of actually being interested in each other — no phones, no multitasking, no kids. Two of these a week keeps you from going weeks without really talking.",
    coachingQuestions: [
      "When in the week would a real conversation actually fit?",
      "What do we want to talk about that we've been putting off?",
      "Who's going to protect the time when life pushes back?",
    ],
    proTip:
      "Put them on the calendar like a client meeting. 'We'll get to it' is how a month goes by without one.",
    detailsPlaceholder: "What we want to talk about (optional)",
    scheduling: { maxSlots: 2 },
  },
  {
    key: "dinners",
    title: "Intentional Family Dinners",
    cadence: "3× per week",
    shortDescription:
      "At the table. No devices. Cook together, eat together, clean up together.",
    fullExplanation:
      "Family dinners are the most under-rated ritual of all. Research on family wellbeing points here again and again. But 'intentional' matters — a dinner eaten over phones in front of a screen is not the same ritual as one where you sit down, make eye contact, and ask each other real questions.",
    coachingQuestions: [
      "Which nights are realistic for a no-devices dinner this week?",
      "Who's cooking, who's cleaning, who's setting the tone?",
      "What's one question we'll ask the table to break the silence?",
    ],
    proTip:
      "Cook together, eat together, clean up together. The whole arc is the ritual — not just the meal.",
    detailsPlaceholder: "Who's cooking / cleaning / hosting (optional)",
    scheduling: { maxSlots: 3, hasFood: true },
  },
  {
    key: "adventure",
    title: "Couple Adventure",
    cadence: "1× per week",
    shortDescription:
      "No kids. No buffers. Seek novelty. Play. Don't just date — explore.",
    fullExplanation:
      "This is not date night. Date night is a dinner and a movie. An adventure is novelty, play, a shared experience that changes you in some small way. The neuroscience is clear: novelty together rebuilds the feeling of falling in love. Once a week, you commit to doing something new — together. Use the Couple Forward Adventures app to browse curated ideas — beginner to bold — so you don't have to start from scratch.",
    coachingQuestions: [
      "What's something neither of us has done before that we could do this week?",
      "What's getting in the way of us playing together?",
      "Do we need to book a sitter, or can we do this during the day?",
    ],
    proTip:
      "Rotate who plans it each week. Leave your phones in the car for the first hour — it matters more than you think.",
    externalLink: {
      label: "Couple Forward Adventures",
      url: "https://adventures.coupleforward.com/",
    },
    detailsPlaceholder: "What adventure we picked (optional)",
    scheduling: { maxSlots: 1 },
  },
  {
    key: "familyFriends",
    title: "Family / Friend Connection",
    cadence: "1× per week",
    shortDescription:
      "Fun and experiences — with the kids, or with the chosen family in your life.",
    fullExplanation:
      "We don't exist in a vacuum. The couples with the most resilient relationships have a wider web of connection — kids, extended family, friends, community. Once a week, make it intentional. Invite someone over. Take the kids somewhere new. Call the person you've been meaning to call.",
    coachingQuestions: [
      "Who's been on our minds that we haven't connected with?",
      "What's one thing we could do with our people this week?",
      "Are we giving the kids a whole-family memory this week, not just logistics?",
    ],
    proTip:
      "Default answers don't count. 'The usual Sunday thing' is not intentional — intentional means you chose it on purpose this week.",
    detailsPlaceholder: "Who and when? (e.g., Sunday brunch with the Harrises)",
  },
  {
    key: "personal",
    title: "Personal Growth Time",
    cadence: "1× per week each",
    shortDescription:
      "Protected time for autonomy — a friend, a class, a run, a trip. Plan for it, it won't be resented.",
    fullExplanation:
      "The most surprising part of a healthy relationship: each person has to keep growing on their own. Resentment builds when autonomy gets squeezed. The fix isn't to take less — it's to plan for it openly. Named time, supported by your partner, changes the whole energy around personal space.",
    coachingQuestions: [
      "What do I actually need this week that's just for me?",
      "How can I support the other person's time without scorekeeping?",
      "What usually stops us from taking this — permission, or logistics?",
    ],
    proTip:
      "When it's planned and named, no one resents it. When it's stolen or apologized for, it breeds guilt. Put it on the calendar out loud.",
    detailsPlaceholder:
      "What each of you needs (e.g., Saturday long run · Thursday yoga class)",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────

export default function HuddlePage() {
  const router = useRouter();
  const huddle = useHuddle();
  const [stageIdx, setStageIdx] = useState(0);
  const jumpedToDone = useRef(false);
  const stage = STAGES[stageIdx];

  useEffect(() => {
    if (huddle.status === "signed_out") router.replace("/login");
    if (huddle.status === "no_couple") router.replace("/welcome");
  }, [huddle.status, router]);

  // A huddle already completed this week opens on the done stage.
  useEffect(() => {
    if (huddle.completed && !jumpedToDone.current) {
      jumpedToDone.current = true;
      setStageIdx(STAGES.length - 1);
    }
  }, [huddle.completed]);

  const next = () => setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
  const back = () => setStageIdx((i) => Math.max(i - 1, 0));

  const showFooter =
    stage !== "welcome" && stage !== "done" && huddle.status === "ready";

  if (huddle.status !== "ready") {
    return (
      <div className="min-h-screen bg-bg text-cream flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-cream-mute text-[13px]">
          <HeartIcon className="size-4 text-gold" />
          Preparing your huddle…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col">
      <HuddleHeader stageIdx={stageIdx} />

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-10 lg:py-14">
          {stage === "welcome" && (
            <WelcomeStage onStart={next} names={huddle.names} />
          )}
          {stage === "reflect" && (
            <ReflectStage
              value={huddle.state.reflect}
              huddle={huddle}
            />
          )}
          {stage === "ask" && (
            <AskStage value={huddle.state.ask} huddle={huddle} />
          )}
          {stage === "plan" && (
            <PlanStage value={huddle.state.plan} onChange={huddle.setPlan} />
          )}
          {stage === "commit" && (
            <CommitStage
              value={huddle.state.commit}
              plan={huddle.state.plan}
              onChange={huddle.setCommit}
              onComplete={async () => {
                const err = await huddle.complete();
                if (!err) {
                  jumpedToDone.current = true;
                  setStageIdx(STAGES.length - 1);
                }
                return err;
              }}
            />
          )}
          {stage === "done" && <DoneStage streak={huddle.streak?.current ?? 1} />}
        </div>
      </main>

      {showFooter && (
        <footer className="border-t border-line-soft bg-bg-soft/40">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              className="text-[13px] text-cream-dim hover:text-cream transition"
            >
              ← Back
            </button>
            {stage !== "commit" && (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold text-[#1a1a1a] px-5 py-2 text-[13px] font-semibold hover:bg-gold-bright transition"
              >
                Next
                <ChevronRightIcon className="size-3.5" />
              </button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}

// ─── Shared UI bits ──────────────────────────────────────────────────────

function HuddleHeader({ stageIdx }: { stageIdx: number }) {
  return (
    <header className="border-b border-line-soft">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
        <Link
          href="/"
          aria-label="Leave huddle"
          className="size-9 rounded-full grid place-items-center text-cream-mute hover:text-cream hover:bg-card transition"
        >
          <XIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <HeartIcon className="size-4 text-gold" />
          <span className="text-[11px] tracking-[0.18em] uppercase text-cream-dim font-medium">
            Couple Forward Huddle
          </span>
        </div>
        <ProgressDots current={stageIdx} />
      </div>
    </header>
  );
}

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((stageNum) => {
        const isCurrent = current === stageNum;
        const isDone = current > stageNum;
        return (
          <span
            key={stageNum}
            className={`h-1.5 rounded-full transition-all ${
              isCurrent
                ? "w-6 bg-gold"
                : isDone
                  ? "w-1.5 bg-gold"
                  : "w-1.5 bg-line"
            }`}
          />
        );
      })}
    </div>
  );
}

function StageTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-gold">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-[30px] sm:text-[38px] font-semibold text-cream leading-tight">
        {title}
      </h2>
      <p className="mt-3 text-[14px] text-cream-dim leading-relaxed max-w-[600px]">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Mic button (Web Speech API) ─────────────────────────────────────────

function MicButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    setSupported(getSRConstructor() !== null);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  if (!supported) return null;

  const toggle = () => {
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }

    const SR = getSRConstructor();
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal && result.length > 0) {
          transcript += result[0].transcript;
        }
      }
      if (transcript) {
        const current = valueRef.current;
        const trimmed = transcript.trim();
        const next =
          current.length === 0
            ? trimmed
            : current.endsWith(" ")
              ? `${current}${trimmed}`
              : `${current} ${trimmed}`;
        onChange(next);
      }
    };
    rec.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    rec.onerror = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={recording}
      aria-label={recording ? "Stop dictation" : "Start dictation"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium transition shrink-0 ${
        recording
          ? "bg-gold text-[#1a1a1a]"
          : "bg-card-2/80 text-cream-mute hover:text-cream border border-line-soft/60"
      }`}
    >
      <MicIcon className="size-3" />
      {recording ? "Recording…" : "Dictate"}
    </button>
  );
}

// ─── Save-to-phone button (Web Share API → clipboard fallback) ───────────

function SavePromptButton({
  value,
  contextTitle,
  name,
}: {
  value: string;
  contextTitle: string;
  name: string;
}) {
  const [canShare, setCanShare] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      setCanShare(true);
    }
  }, []);

  const disabled = !value.trim();

  const handleClick = async () => {
    if (disabled) return;
    const title = `${contextTitle} — ${name}`;
    const text = value.trim();

    if (canShare) {
      try {
        await navigator.share({ title, text });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${title}\n${text}`);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      /* no clipboard */
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label="Save to my phone (reminders, calendar, or notes)"
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-medium transition shrink-0 border ${
        status === "saved"
          ? "bg-gold text-[#1a1a1a] border-gold"
          : disabled
            ? "bg-card-2/40 text-cream-mute/50 border-line-soft/40 cursor-not-allowed"
            : "bg-card-2/80 text-cream-mute hover:text-cream border-line-soft/60"
      }`}
    >
      {status === "saved" ? (
        <>
          <CheckIcon className="size-3" />
          Saved
        </>
      ) : (
        <>
          <ShareIcon className="size-3" />
          Save to phone
        </>
      )}
    </button>
  );
}

// ─── Dual-partner question card ──────────────────────────────────────────

function DualQuestionCard({
  title,
  subtitle,
  value,
  onChange,
  names,
  soloPartner,
}: {
  title: string;
  subtitle?: string;
  value: DualAnswer;
  onChange: (v: DualAnswer) => void;
  names: Names;
  soloPartner: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-line-soft px-5 sm:px-6 py-5">
      <h3 className="text-[17px] sm:text-[18px] font-medium text-cream leading-snug">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
          {subtitle}
        </p>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PartnerField
          name={names.a}
          contextTitle={title}
          value={value.a}
          onChange={(v) => onChange({ ...value, a: v })}
        />
        <PartnerField
          name={names.b}
          contextTitle={title}
          value={value.b}
          onChange={(v) => onChange({ ...value, b: v })}
          disabled={soloPartner}
        />
      </div>
    </div>
  );
}

function PartnerField({
  name,
  contextTitle,
  value,
  onChange,
  disabled = false,
}: {
  name: string;
  contextTitle: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-card-2/60 border border-line-soft/60 p-3 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gold">
          {name}
        </span>
        {!disabled && (
          <div className="flex items-center gap-1.5">
            <MicButton value={value} onChange={onChange} />
            <SavePromptButton
              value={value}
              contextTitle={contextTitle}
              name={name}
            />
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          disabled
            ? "Unlocks when your partner joins"
            : `${name}'s answer…`
        }
        rows={3}
        disabled={disabled}
        className="w-full resize-none bg-transparent text-[13.5px] text-cream placeholder:text-cream-mute/60 focus:outline-none disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Hug tracker ─────────────────────────────────────────────────────────

function HugTracker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const set = (v: number) => onChange(Math.max(0, v));
  return (
    <div className="rounded-2xl bg-card border border-line-soft px-5 sm:px-6 py-5">
      <div className="flex items-start gap-4">
        <div className="size-11 rounded-xl bg-gold-soft grid place-items-center text-gold shrink-0">
          <HeartIcon className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-medium text-cream leading-snug">
            6-Second Hugs this week
          </h3>
          <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
            A full-frontal hug for at least six seconds, every hello and
            goodbye. A rough count is fine — this is a tracker, not a test.
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => set(value - 1)}
          className="size-10 rounded-full border border-line hover:border-gold text-cream-dim hover:text-cream transition text-xl font-light"
          aria-label="Decrement hug count"
        >
          −
        </button>
        <div className="flex flex-col items-center min-w-[90px]">
          <div className="text-[42px] leading-none font-semibold text-cream tabular-nums">
            {value}
          </div>
          <div className="text-[9.5px] tracking-[0.18em] uppercase text-cream-mute mt-1">
            Hugs
          </div>
        </div>
        <button
          type="button"
          onClick={() => set(value + 1)}
          className="size-10 rounded-full border border-line hover:border-gold text-cream-dim hover:text-cream transition text-xl font-light"
          aria-label="Increment hug count"
        >
          +
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {[7, 14, 21, 28].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => set(preset)}
            className={`rounded-full px-3 py-1 text-[11.5px] transition ${
              value === preset
                ? "bg-gold text-[#1a1a1a] font-semibold"
                : "bg-card-2/60 text-cream-dim hover:text-cream border border-line-soft/60"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Closeness rating ────────────────────────────────────────────────────

function ClosenessRating({
  valueA,
  valueB,
  onChange,
  names,
  soloPartner,
}: {
  valueA: number;
  valueB: number;
  onChange: (slot: Slot, v: number) => void;
  names: Names;
  soloPartner: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-line-soft px-5 sm:px-6 py-5">
      <h3 className="text-[17px] font-medium text-cream leading-snug">
        How close did you feel to each other this week?
      </h3>
      <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
        1 is miles apart, 10 is deeply connected. No wrong answers — honest
        ones are the whole point.
      </p>
      <div className="mt-5 space-y-4">
        <RatingRow
          name={names.a}
          value={valueA}
          onChange={(v) => onChange("a", v)}
        />
        <RatingRow
          name={names.b}
          value={valueB}
          onChange={(v) => onChange("b", v)}
          disabled={soloPartner}
        />
      </div>
    </div>
  );
}

function RatingRow({
  name,
  value,
  onChange,
  disabled = false,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-60" : ""}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-gold">
          {name}
        </span>
        <span className="text-[12px] text-cream-dim tabular-nums">
          {disabled ? "Waiting to join" : value > 0 ? `${value} / 10` : "—"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const num = i + 1;
          const active = num <= value;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              disabled={disabled}
              className={`flex-1 h-8 rounded-md border text-[11px] font-medium transition ${
                active
                  ? "bg-gold border-gold text-[#1a1a1a]"
                  : "bg-card-2/40 border-line-soft/60 text-cream-mute hover:border-gold/60 hover:text-cream"
              } disabled:cursor-not-allowed disabled:hover:border-line-soft/60 disabled:hover:text-cream-mute`}
              aria-label={`${name} rating ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day & time slot picker ──────────────────────────────────────────────

function DaySlotPicker({
  slots,
  maxSlots,
  onChange,
}: {
  slots: TimeSlot[];
  maxSlots: number;
  onChange: (slots: TimeSlot[]) => void;
}) {
  const sorted = sortSlots(slots);
  const selectedDays = new Set(slots.map((s) => s.day));
  const atCapacity = slots.length >= maxSlots;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.has(day)) {
      onChange(slots.filter((s) => s.day !== day));
    } else {
      if (atCapacity) return;
      onChange([...slots, { day, time: "19:00" }]);
    }
  };

  const setTime = (day: DayOfWeek, time: string) => {
    onChange(slots.map((s) => (s.day === day ? { ...s, time } : s)));
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-2">
          {maxSlots === 1 ? "Pick a day" : `Pick up to ${maxSlots} days`}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DAY_ORDER.map((day) => {
            const selected = selectedDays.has(day);
            const disabled = !selected && atCapacity;
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                disabled={disabled}
                className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium border transition ${
                  selected
                    ? "bg-gold border-gold text-[#1a1a1a]"
                    : disabled
                      ? "bg-card-2/30 border-line-soft/40 text-cream-mute/40 cursor-not-allowed"
                      : "bg-card-2/60 border-line-soft/60 text-cream-dim hover:border-gold/60 hover:text-cream"
                }`}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      </div>
      {sorted.length > 0 && (
        <div>
          <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-2">
            What time?
          </div>
          <div className="space-y-2">
            {sorted.map((slot) => (
              <div
                key={slot.day}
                className="flex items-center gap-3 rounded-xl bg-card-2/60 border border-line-soft/60 px-3 py-2"
              >
                <span className="text-[12px] font-medium text-cream w-20 shrink-0">
                  {DAY_LONG[slot.day]}
                </span>
                <input
                  type="time"
                  value={slot.time}
                  onChange={(e) => setTime(slot.day, e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-cream focus:outline-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60"
                />
                <span className="text-[11px] text-cream-mute tabular-nums shrink-0">
                  {formatTimeDisplay(slot.time)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add-to-calendar button (.ics download) ──────────────────────────────

function AddToCalendarButton({
  ritualKey,
  slots,
  details,
  menuIdeas,
}: {
  ritualKey: PlanKey;
  slots: TimeSlot[];
  details: string;
  menuIdeas?: string;
}) {
  const [status, setStatus] = useState<"idle" | "downloaded">("idle");
  if (slots.length === 0) return null;

  const handleClick = () => {
    const title = RITUAL_CALENDAR_TITLES[ritualKey];
    const descParts = [details, menuIdeas ? `Menu: ${menuIdeas}` : ""].filter(
      Boolean,
    );
    const description =
      descParts.join("\n") || "A Couple Forward ritual for this week.";
    const ics = buildIcs({ title, description, slots });
    downloadIcs(`${title}-${ritualKey}`, ics);
    setStatus("downloaded");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-medium border transition ${
        status === "downloaded"
          ? "bg-gold border-gold text-[#1a1a1a]"
          : "bg-card-2/80 border-line-soft/60 text-cream hover:border-gold/60 hover:text-gold"
      }`}
    >
      {status === "downloaded" ? (
        <>
          <CheckIcon className="size-3" />
          Downloaded — open to add
        </>
      ) : (
        <>
          <CalendarIcon className="size-3" />
          {slots.length === 1
            ? "Add this to calendar"
            : `Add all ${slots.length} to calendar`}
        </>
      )}
    </button>
  );
}

// ─── Stages ──────────────────────────────────────────────────────────────

function WelcomeStage({
  onStart,
  names,
}: {
  onStart: () => void;
  names: Names;
}) {
  return (
    <div className="flex flex-col items-center text-center pt-6 sm:pt-12">
      <div className="size-16 rounded-2xl bg-gold-soft grid place-items-center text-gold mb-8">
        <HuddleIcon className="size-8" />
      </div>
      <h1 className="text-[36px] sm:text-[44px] font-semibold text-cream leading-tight">
        Let&apos;s Huddle, {names.a}
        {names.b !== "Your partner" ? ` & ${names.b}` : ""}.
      </h1>
      <p className="mt-5 text-cream-dim text-[14.5px] max-w-[600px] leading-relaxed">
        Welcome to the Couple Forward Huddle — where you design quality
        connections in and around structure, through systems and rituals of
        connection. This process wires the relationship for satisfaction and
        energy, creating predictable alignment that contextualizes everything
        life brings you.
      </p>
      <p className="mt-4 text-cream-mute text-[13px] max-w-[560px] leading-relaxed italic">
        It seems counterintuitive, but the more you ritualize consistent
        connection, the more flexible and free your relationship will feel.
      </p>

      <div className="mt-10 w-full max-w-md rounded-2xl bg-card/60 border border-line-soft px-5 py-5 text-left">
        <div className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute">
          Before you begin
        </div>
        <ul className="mt-3 space-y-2.5 text-[13px] text-cream-dim">
          <li className="flex gap-2.5">
            <span className="text-gold">•</span>
            Put your phones on Do Not Disturb.
          </li>
          <li className="flex gap-2.5">
            <span className="text-gold">•</span>
            Take three slow breaths together.
          </li>
          <li className="flex gap-2.5">
            <span className="text-gold">•</span>
            One of you records the answers — or take turns dictating.
          </li>
          <li className="flex gap-2.5">
            <span className="text-gold">•</span>
            Look at each other before the first question.
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] px-7 py-3 text-[14px] font-semibold hover:bg-gold-bright transition"
      >
        Begin the Huddle
        <ChevronRightIcon className="size-4" />
      </button>
      <p className="mt-4 text-[11px] text-cream-mute">
        Takes about 15–30 minutes · Saved to your couple as you go
      </p>
    </div>
  );
}

function ReflectStage({
  value,
  huddle,
}: {
  value: ReflectAnswers;
  huddle: UseHuddleResult;
}) {
  return (
    <div>
      <StageTitle
        eyebrow="Stage 1 of 4 · Reflect"
        title="Look back at last week."
        subtitle="This is a chance to improve and add quality — not to complain. Stay positive, name the wins, then name the gaps with warmth."
      />
      <div className="mt-8 space-y-5">
        <HugTracker value={value.hugCount} onChange={huddle.setHugCount} />
        <ClosenessRating
          valueA={value.closenessA}
          valueB={value.closenessB}
          onChange={huddle.setCloseness}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
        <DualQuestionCard
          title="What worked well for us last week?"
          subtitle="Start here. Name the moments that landed — the small ones too."
          value={value.worked}
          onChange={(v) => huddle.setDual("worked", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
        <DualQuestionCard
          title="What didn&rsquo;t work the way we thought it would?"
          subtitle="An observation, not a complaint list. Where did the plan meet reality?"
          value={value.didntWork}
          onChange={(v) => huddle.setDual("didntWork", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
        <DualQuestionCard
          title="What made you feel loved this week?"
          subtitle="Take turns. Be specific. Specific is where love lives."
          value={value.loved}
          onChange={(v) => huddle.setDual("loved", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
      </div>
    </div>
  );
}

function AskStage({
  value,
  huddle,
}: {
  value: AskAnswers;
  huddle: UseHuddleResult;
}) {
  return (
    <div>
      <StageTitle
        eyebrow="Stage 2 of 4 · Ask Each Other"
        title="How can we show up for each other this week?"
        subtitle="Look forward. Take turns — one answers fully before the other speaks. Don&rsquo;t cross-talk. Tap the share button on any answer to save it to your own phone."
      />
      <div className="mt-8 space-y-5">
        <DualQuestionCard
          title="What&rsquo;s on your plate this week that you want me to know about, support, or be engaged with?"
          subtitle="Calendars, stressors, big asks, small ones. Save anything you need into your own reminders, calendar, or notes."
          value={value.plate}
          onChange={(v) => huddle.setDual("plate", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
        <DualQuestionCard
          title="What&rsquo;s one small thing I can do this week to make you feel more loved?"
          subtitle="Small and specific beats grand. One thing."
          value={value.smallThing}
          onChange={(v) => huddle.setDual("smallThing", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
        <DualQuestionCard
          title="What personal intentions do you have this week that I can support?"
          subtitle="Autonomy isn&rsquo;t separate from us — it gets planned for."
          value={value.intentions}
          onChange={(v) => huddle.setDual("intentions", v)}
          names={huddle.names}
          soloPartner={huddle.soloPartner}
        />
      </div>
    </div>
  );
}

function PlanStage({
  value,
  onChange,
}: {
  value: PlanState;
  onChange: (v: PlanState) => void;
}) {
  return (
    <div>
      <StageTitle
        eyebrow="Stage 3 of 4 · Plan"
        title="Name the rituals for this week."
        subtitle="Quality over quantity. Tap any card to see the why and the coaching questions. Pick what matters this week, schedule it, and send it to your calendar."
      />
      <div className="mt-8 space-y-3.5">
        {rituals.map((ritual) => {
          const item = value[ritual.key];
          const toggle = () =>
            onChange({
              ...value,
              [ritual.key]: { ...item, committed: !item.committed },
            });
          const setDetails = (details: string) =>
            onChange({
              ...value,
              [ritual.key]: { ...item, details },
            });
          const setSlots = (slots: TimeSlot[]) =>
            onChange({
              ...value,
              [ritual.key]: { ...item, slots },
            });
          const setMenuIdeas = (menuIdeas: string) =>
            onChange({
              ...value,
              [ritual.key]: { ...item, menuIdeas },
            });
          return (
            <RitualCard
              key={ritual.key}
              ritual={ritual}
              item={item}
              onToggle={toggle}
              onDetailsChange={setDetails}
              onSlotsChange={setSlots}
              onMenuIdeasChange={setMenuIdeas}
            />
          );
        })}
      </div>
    </div>
  );
}

function RitualCard({
  ritual,
  item,
  onToggle,
  onDetailsChange,
  onSlotsChange,
  onMenuIdeasChange,
}: {
  ritual: Ritual;
  item: PlanItem;
  onToggle: () => void;
  onDetailsChange: (v: string) => void;
  onSlotsChange: (v: TimeSlot[]) => void;
  onMenuIdeasChange: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { committed, details, slots = [], menuIdeas = "" } = item;
  const hasScheduling = !!ritual.scheduling;

  return (
    <div
      className={`rounded-2xl border transition overflow-hidden ${
        committed
          ? "bg-gold-soft/40 border-gold/40"
          : "bg-card border-line-soft hover:border-line"
      }`}
    >
      <div className="px-5 sm:px-6 py-5">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={onToggle}
            className={`mt-0.5 size-5 rounded-md border-2 grid place-items-center transition shrink-0 ${
              committed
                ? "bg-gold border-gold text-[#1a1a1a]"
                : "border-line hover:border-gold/60"
            }`}
            aria-pressed={committed}
            aria-label={`Commit to ${ritual.title}`}
          >
            {committed && <CheckIcon className="size-3" />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-[16.5px] font-medium text-cream leading-snug">
                    {ritual.title}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-gold">
                    {ritual.cadence}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] text-cream-mute leading-snug">
                  {ritual.shortDescription}
                </p>
              </div>
              {ritual.externalLink && (
                <a
                  href={ritual.externalLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-card-2/80 border border-line-soft/60 px-3 py-1.5 text-[11px] font-medium text-cream hover:border-gold/60 hover:text-gold transition shrink-0"
                >
                  <LinkIcon className="size-3" />
                  {ritual.externalLink.label}
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-gold hover:text-gold-bright transition"
              aria-expanded={expanded}
            >
              {expanded ? "Hide guidance" : "How this ritual works"}
              <ChevronRightIcon
                className={`size-3 transition-transform ${
                  expanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {committed && (
              <div className="mt-4 space-y-4">
                {hasScheduling && ritual.scheduling && (
                  <DaySlotPicker
                    slots={slots}
                    maxSlots={ritual.scheduling.maxSlots}
                    onChange={onSlotsChange}
                  />
                )}
                {hasScheduling && ritual.scheduling?.hasFood && (
                  <div>
                    <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-2">
                      What are we thinking for food?
                    </div>
                    <textarea
                      value={menuIdeas}
                      onChange={(e) => onMenuIdeasChange(e.target.value)}
                      placeholder="Sketch the menu or who's cooking what (optional)"
                      rows={2}
                      className="w-full resize-none rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13px] text-cream placeholder:text-cream-mute/70 focus:outline-none focus:border-gold/50 transition"
                    />
                  </div>
                )}
                <div>
                  {hasScheduling && (
                    <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-2">
                      Notes
                    </div>
                  )}
                  <input
                    type="text"
                    value={details}
                    onChange={(e) => onDetailsChange(e.target.value)}
                    placeholder={ritual.detailsPlaceholder}
                    className="w-full rounded-xl bg-card-2/80 border border-line-soft/60 px-4 py-2.5 text-[13px] text-cream placeholder:text-cream-mute/70 focus:outline-none focus:border-gold/50 transition"
                  />
                </div>
                {hasScheduling && slots.length > 0 && (
                  <AddToCalendarButton
                    ritualKey={ritual.key}
                    slots={slots}
                    details={details}
                    menuIdeas={menuIdeas}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-line-soft/60 bg-bg-soft/40 px-5 sm:px-6 py-5 space-y-4">
          <div>
            <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-1.5">
              The why
            </div>
            <p className="text-[13px] text-cream-dim leading-relaxed">
              {ritual.fullExplanation}
            </p>
          </div>
          <div>
            <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute mb-2">
              Ask each other
            </div>
            <ol className="space-y-2 text-[13px] text-cream-dim leading-snug">
              {ritual.coachingQuestions.map((q, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-gold font-medium tabular-nums">
                    {i + 1}.
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>
          {ritual.proTip && (
            <div className="rounded-xl bg-gold-soft/30 border border-gold/20 px-4 py-3">
              <div className="text-[9.5px] font-semibold tracking-[0.18em] uppercase text-gold mb-1">
                Pro tip
              </div>
              <p className="text-[12.5px] text-cream leading-snug">
                {ritual.proTip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommitStage({
  value,
  plan,
  onChange,
  onComplete,
}: {
  value: CommitState;
  plan: PlanState;
  onChange: (v: CommitState) => void;
  onComplete: () => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const committedRituals = rituals.filter((r) => plan[r.key].committed);

  return (
    <div>
      <StageTitle
        eyebrow="Stage 4 of 4 · Commit"
        title="Set it in motion."
        subtitle="Turn your plan into action. Let Couple Forward nudge you through the week."
      />

      <div className="mt-8 space-y-4">
        <div className="rounded-2xl bg-card border border-line-soft px-5 sm:px-6 py-5">
          <div className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute">
            This week you committed to
          </div>
          {committedRituals.length === 0 ? (
            <p className="mt-3 text-[13px] text-cream-mute">
              No rituals selected yet. You can still complete the huddle — or
              go back and pick a few.
            </p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {committedRituals.map((r) => {
                const item = plan[r.key];
                const slots = sortSlots(item.slots || []);
                return (
                  <li key={r.key} className="flex items-start gap-3">
                    <CheckIcon className="size-4 text-gold shrink-0 mt-0.5" />
                    <div className="text-[13.5px] text-cream leading-snug min-w-0 flex-1">
                      <div className="font-medium">{r.title}</div>
                      {slots.length > 0 && (
                        <div className="text-[12px] text-cream-dim mt-0.5">
                          {slots
                            .map(
                              (s) =>
                                `${DAY_LABELS[s.day]} ${formatTimeDisplay(
                                  s.time,
                                )}`,
                            )
                            .join(" · ")}
                        </div>
                      )}
                      {item.details && (
                        <div className="text-[12px] text-cream-dim mt-0.5">
                          {item.details}
                        </div>
                      )}
                      {item.menuIdeas && (
                        <div className="text-[12px] text-cream-dim mt-0.5 italic">
                          Menu: {item.menuIdeas}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-card border border-line-soft px-5 sm:px-6 py-5">
          <div className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-cream-mute">
            How should we keep you on track?
          </div>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Add to our calendar"
              subtitle="Send plans to Apple and Google Calendar"
              checked={value.addToCalendar}
              onChange={(c) => onChange({ ...value, addToCalendar: c })}
            />
            <ToggleRow
              label="Set reminders on our phones"
              subtitle="Daily rituals become gentle nudges"
              checked={value.setReminders}
              onChange={(c) => onChange({ ...value, setReminders: c })}
            />
            <ToggleRow
              label="Email us a weekly summary"
              subtitle="A recap of this huddle and a midweek check-in"
              checked={value.emailSummary}
              onChange={(c) => onChange({ ...value, emailSummary: c })}
            />
          </div>
          <p className="mt-4 text-[11px] text-cream-mute leading-snug">
            Scheduled rituals already download as .ics files straight from each
            card — open them on your phone to add to Apple or Google Calendar.
            Reminders and email summaries are coming next.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const err = await onComplete();
            if (err) {
              setError(err);
              setBusy(false);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] px-8 py-3.5 text-[15px] font-semibold hover:bg-gold-bright transition disabled:opacity-50"
        >
          {busy ? "Saving your huddle…" : "Complete Huddle"}
          <CheckIcon className="size-4" />
        </button>
        {error ? (
          <p className="mt-3 text-[11.5px] text-[#e08a8a]">{error}</p>
        ) : (
          <p className="mt-3 text-[11px] text-cream-mute">
            Your streak will advance by one week
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  subtitle,
  checked,
  onChange,
}: {
  label: string;
  subtitle: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-4 text-left"
      role="switch"
      aria-checked={checked}
    >
      <div className="flex-1">
        <div className="text-[14px] font-medium text-cream">{label}</div>
        <div className="text-[11.5px] text-cream-mute mt-0.5">{subtitle}</div>
      </div>
      <div
        className={`relative h-6 w-11 rounded-full transition shrink-0 ${
          checked ? "bg-gold" : "bg-line"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-bg transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}

function DoneStage({ streak }: { streak: number }) {
  return (
    <div className="flex flex-col items-center text-center pt-8 sm:pt-16">
      <div className="size-20 rounded-full bg-gold-soft grid place-items-center text-gold mb-8">
        <FlameIcon className="size-10" />
      </div>
      <h1 className="text-[36px] sm:text-[44px] font-semibold text-cream leading-tight">
        Huddle complete.
      </h1>
      <p className="mt-4 text-cream-dim text-[15px] max-w-[480px] leading-relaxed">
        You&apos;ve logged{" "}
        <span className="text-gold font-medium">
          {streak} {streak === 1 ? "week" : "weeks"} of intentional living
        </span>
        . See you next week — same time, same ritual.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold text-[#1a1a1a] px-7 py-3 text-[14px] font-semibold hover:bg-gold-bright transition"
      >
        Back to Dashboard
        <ChevronRightIcon className="size-4" />
      </Link>
    </div>
  );
}
