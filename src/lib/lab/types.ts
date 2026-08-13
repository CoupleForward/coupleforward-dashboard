import type { PlanState } from "@/lib/huddle";

export type Couple = {
  id: string;
  name: string | null;
  together_since: string | null;
  created_by: string | null;
  current_streak: number;
  longest_streak: number;
  last_huddle_week: string | null;
  is_solo: boolean;
  created_at: string;
};

export type CoupleMember = {
  couple_id: string;
  user_id: string;
  role: "owner" | "partner";
  display_name: string | null;
  birthday: string | null; // YYYY-MM-DD; column ships in 20260812170000
  joined_at: string;
};

export type CoupleInvite = {
  id: string;
  couple_id: string;
  invited_email: string;
  invited_name: string | null;
  invited_by: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
  accepted_at: string | null;
};

export type HuddleStatus = "in_progress" | "completed";

export type CommitPrefs = {
  addToCalendar?: boolean;
  setReminders?: boolean;
  emailSummary?: boolean;
};

export type Huddle = {
  id: string;
  couple_id: string;
  week_start: string;
  status: HuddleStatus;
  hug_count: number;
  plan: Partial<PlanState>;
  commit_prefs: CommitPrefs;
  started_by: string | null;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
};

export type HuddleStage = "reflect" | "ask";

export type HuddleAnswer = {
  id: string;
  huddle_id: string;
  couple_id: string;
  member_user_id: string;
  stage: HuddleStage;
  question_key: string;
  answer_text: string | null;
  rating: number | null;
  updated_by: string | null;
  updated_at: string;
};

export type JournalEntry = {
  id: string;
  couple_id: string;
  author_id: string | null;
  title: string | null;
  content: string;
  visibility: "couple" | "private";
  created_at: string;
  updated_at: string;
};

export type DailyCheckin = {
  id: string;
  couple_id: string;
  user_id: string;
  day: string; // local YYYY-MM-DD
  mood: number;
  happiness: number;
  connection: number;
  created_at: string;
  updated_at: string;
};

export type ConnectionScore = {
  id: string;
  couple_id: string;
  user_id: string;
  huddle_id: string | null;
  score: number;
  source: string;
  created_at: string;
};
