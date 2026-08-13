import { dayKey } from "./week";
import { hashPick } from "./prompts";

// Mentor voices for the journal: a registry of thinkers whose words open
// a writing prompt. SHIPPING RULE (Christian, 2026-08-13): only
// public-domain mentors get quoted. His ranked mentor list is pending;
// in-copyright voices (e.g. Maya Angelou) wait on his call — they may
// only ever appear as inspired-by originals, never quoted. All quotes
// below are from public-domain translations: George Long (Meditations),
// Richard Gummere (Seneca's Letters), Elizabeth Carter (Enchiridion),
// Benjamin Jowett (Plato).
//
// The reflection questions are Couple Forward originals. Voice rules:
// plain, specific, no em dashes.

export type MentorPrompt = {
  quote: string;
  source: string;
  question: string;
};

export type Mentor = {
  key: string;
  name: string;
  era: string;
  // One line on why this voice is in the room. Member-facing.
  tagline: string;
  prompts: MentorPrompt[];
};

export const MENTORS: Mentor[] = [
  {
    key: "marcus-aurelius",
    name: "Marcus Aurelius",
    era: "Roman emperor, 121–180",
    tagline:
      "Wrote to himself at night about staying steady. Never meant for an audience.",
    prompts: [
      {
        quote:
          "The best way of avenging thyself is not to become like the wrong-doer.",
        source: "Meditations, Book VI",
        question:
          "Think of the last time your partner hurt you. What would it look like to answer it without becoming it?",
      },
      {
        quote: "Confine thyself to the present.",
        source: "Meditations, Book VII",
        question:
          "What are you carrying into today's version of your relationship that actually belongs to an older fight?",
      },
      {
        quote:
          "How much trouble he avoids who does not look to see what his neighbour says or does.",
        source: "Meditations, Book IV",
        question:
          "Where did comparing your relationship to someone else's cost you something this week?",
      },
      {
        quote:
          "Adapt thyself to the things with which thy lot has been cast: and the men among whom thou hast received thy portion, love them, but do it truly.",
        source: "Meditations, Book VI",
        question:
          "What would loving your partner truly ask of you this week that performing love does not?",
      },
    ],
  },
  {
    key: "seneca",
    name: "Seneca",
    era: "Roman philosopher, c. 4 BC–AD 65",
    tagline: "Letters to a friend on how to live. Practical, warm, unsparing.",
    prompts: [
      {
        quote: "We suffer more often in imagination than in reality.",
        source: "Letters, XIII",
        question:
          "What fight have you been having with your partner in your head that you have not had in the room? What does the imagined version protect you from?",
      },
      {
        quote: "While we are postponing, life speeds by.",
        source: "Letters, I",
        question:
          "What have you been meaning to say to your partner when the time is right? What is the postponement costing?",
      },
      {
        quote: "No good thing is pleasant to possess, without friends to share it.",
        source: "Letters, VI",
        question:
          "What good thing happened to you lately that your partner never got to enjoy with you? What kept you from bringing it home?",
      },
      {
        quote: "It is quality rather than quantity that matters.",
        source: "Letters, XLV",
        question:
          "Where could ten undistracted minutes with your partner do more than a whole distracted evening?",
      },
    ],
  },
  {
    key: "epictetus",
    name: "Epictetus",
    era: "Stoic teacher, c. 50–135",
    tagline:
      "Born enslaved, taught free. Everything he taught starts with what is actually yours to control.",
    prompts: [
      {
        quote: "Some things are in our control and others not.",
        source: "Enchiridion, 1",
        question:
          "In the pattern you two keep repeating, what is actually yours to change? Name the one piece that is in your hands.",
      },
      {
        quote:
          "Men are disturbed, not by things, but by the principles and notions which they form concerning things.",
        source: "Enchiridion, 5",
        question:
          "The last time you got flooded with your partner, what story did you attach to what happened? What else could that moment have meant?",
      },
      {
        quote:
          "Everything has two handles: one by which it may be borne, another by which it cannot.",
        source: "Enchiridion, 43",
        question:
          "Pick something your partner did that still stings. You have been carrying it by one handle. What is the other one?",
      },
      {
        quote:
          "Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are.",
        source: "Enchiridion, 8",
        question:
          "What are you wishing were different about your partner this week? Write about what working with what is real would change.",
      },
    ],
  },
  {
    key: "plato",
    name: "Plato",
    era: "Greek philosopher, c. 428–348 BC",
    tagline: "Dialogues on love, wholeness, and what a life is for.",
    prompts: [
      {
        quote: "The unexamined life is not worth living.",
        source: "Apology",
        question:
          "What is one pattern in how you love that you have never actually examined? Start here.",
      },
      {
        quote: "The desire and pursuit of the whole is called love.",
        source: "Symposium",
        question:
          "Where do you treat your partner as the missing half of you instead of a whole person beside you? What changes when you see them whole?",
      },
      {
        quote: "The beginning is the most important part of any work.",
        source: "Republic, Book II",
        question:
          "How do you start things with your partner: conversations, evenings, repairs? What do your beginnings set in motion?",
      },
      {
        quote:
          "The direction in which education starts a man will determine his future life.",
        source: "Republic, Book IV",
        question:
          "What did you learn about love before you were ten that still runs the show? Who taught it to you?",
      },
    ],
  },
];

export function mentorByKey(key: string): Mentor | undefined {
  return MENTORS.find((m) => m.key === key);
}

// Today's default prompt for a mentor, stable across the day, with an
// offset so "show me another" can walk the bank.
export function mentorPrompt(mentor: Mentor, offset = 0): MentorPrompt {
  const base = hashPick(dayKey() + mentor.key, mentor.prompts.length);
  return mentor.prompts[(base + offset) % mentor.prompts.length];
}
