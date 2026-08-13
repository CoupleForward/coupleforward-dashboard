// The guided meditation registry. Each meditation is either:
// → recorded: audioSrc points at Christian's recording under
//   public/audio/meditations/ (drop the file in, set the path, done), or
// → guided text: audioSrc is null and the player paces the cues below,
//   one at a time, like a slower breathwork session.
//
// Scripts are Couple Forward originals in Christian's register. Licensed
// third-party somatic material (50_SOMATIC_RESOURCES) must never be
// transcribed into these — his own concepts and words only.

export type MeditationCue = {
  seconds: number;
  text: string;
};

export type Meditation = {
  key: string;
  title: string;
  // One line, member-facing, plain.
  tagline: string;
  audioSrc: string | null;
  cues: MeditationCue[];
};

export const MEDITATIONS: Meditation[] = [
  {
    key: "settling",
    title: "Settling",
    tagline: "Three minutes to arrive where you actually are.",
    audioSrc: null,
    cues: [
      { seconds: 20, text: "Sit however you sit. Let your hands rest. Nothing to fix yet." },
      { seconds: 20, text: "Feel the weight of you: the chair holding you, the floor under your feet." },
      { seconds: 25, text: "Let your breath drop lower. Not deeper on purpose. Just lower, slower." },
      { seconds: 25, text: "Notice what your body was doing before you sat down. Rushing? Bracing? Holding?" },
      { seconds: 25, text: "You don't have to put any of it down. Just notice you're carrying it." },
      { seconds: 25, text: "One more slow breath out. Longer than the one in." },
      { seconds: 20, text: "Whatever is next today, you get to arrive there like this." },
    ],
  },
  {
    key: "body-scan",
    title: "Body Scan",
    tagline: "Four minutes, head to feet, noticing without fixing.",
    audioSrc: null,
    cues: [
      { seconds: 20, text: "Close your eyes if that's comfortable. Start at the top of your head." },
      { seconds: 25, text: "Your face: jaw, eyes, forehead. Where is it working? Let it stop working." },
      { seconds: 25, text: "Shoulders and neck. They carry more than their share. Just notice." },
      { seconds: 25, text: "Your chest. Is the breath high or low? Fast or slow? No fixing. Noticing." },
      { seconds: 25, text: "Your belly. Soft or held? A held belly is a body expecting something." },
      { seconds: 25, text: "Your hands. Open them if they're closed. Feel what leaves when you do." },
      { seconds: 25, text: "Your legs, your feet, the ground. You are held up. You can stop helping." },
      { seconds: 25, text: "The whole body at once now. One picture. This is where you live." },
      { seconds: 20, text: "One slow breath out, and open your eyes." },
    ],
  },
  {
    key: "before-a-hard-conversation",
    title: "Before a Hard Conversation",
    tagline: "Settle the brace before you walk in.",
    audioSrc: null,
    cues: [
      { seconds: 20, text: "You're about to talk about something that matters. Take a seat first." },
      { seconds: 25, text: "Find the brace. Somewhere in your body is the part that's already defending." },
      { seconds: 25, text: "You don't have to drop your guard. Just know exactly where it is." },
      { seconds: 25, text: "Now ask: what do I actually want to come out of this? Not to win. Underneath that." },
      { seconds: 30, text: "Say it to yourself in one sentence. If it starts with 'I need them to', try again with 'I want us to'." },
      { seconds: 25, text: "Breathe out slow. The exhale tells your body the tiger isn't in the room." },
      { seconds: 25, text: "Your partner is probably braced too. Remember that when you see their face." },
      { seconds: 20, text: "Go slow. You can always take another breath mid-sentence." },
    ],
  },
];

export function meditationByKey(key: string): Meditation | undefined {
  return MEDITATIONS.find((m) => m.key === key);
}

export function meditationDuration(m: Meditation): number {
  return m.cues.reduce((a, c) => a + c.seconds, 0);
}
