// Canonical labels for the huddle's saved answers, keyed exactly as
// huddle_answers.question_key stores them (see DUAL_KEYS in useHuddle.ts).
// Used by the history views; the huddle flow itself keeps its own copy of
// this copywriting inline.

import type { HuddleStage } from "./types";

export type QuestionDef = {
  key: string;
  stage: HuddleStage;
  label: string;
};

export const REFLECT_QUESTIONS: QuestionDef[] = [
  {
    key: "worked",
    stage: "reflect",
    label: "What worked well for us last week?",
  },
  {
    key: "didnt_work",
    stage: "reflect",
    label: "What didn’t work the way we thought it would?",
  },
  {
    key: "loved",
    stage: "reflect",
    label: "What made you feel loved this week?",
  },
];

export const ASK_QUESTIONS: QuestionDef[] = [
  {
    key: "plate",
    stage: "ask",
    label:
      "What’s on your plate this week that you want me to know about, support, or be engaged with?",
  },
  {
    key: "small_thing",
    stage: "ask",
    label:
      "What’s one small thing I can do this week to make you feel more loved?",
  },
  {
    key: "intentions",
    stage: "ask",
    label: "What personal intentions do you have this week that I can support?",
  },
];

export const ALL_QUESTIONS: QuestionDef[] = [
  ...REFLECT_QUESTIONS,
  ...ASK_QUESTIONS,
];
