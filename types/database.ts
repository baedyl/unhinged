export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** profiles table (id = free UUID; clerk_id = Clerk user ID) */
export interface DbProfile {
  id: string;
  clerk_id: string | null;
  name: string | null;
  age: number | null;
  neighbourhood: string | null;
  language_preference: string | null;
  onboarding_step: number;
  photo_urls: string[];
  created_at?: string;
  updated_at?: string;
}

export type ProfileInsert = Omit<DbProfile, 'id' | 'created_at' | 'updated_at'> &
  Partial<Pick<DbProfile, 'id'>>;
export type ProfileUpdate = Partial<Omit<DbProfile, 'id'>>;

/** waitlist table */
export interface DbWaitlist {
  id: string;
  email: string;
  neighbourhood: string | null;
  status: string | null;
  hot_take: string | null;
  vibe_check: string | null;
  referral_source: string | null;
  created_at: string;
}

/** interests table */
export interface DbInterest {
  id: string;
  slug: string;
  label_en: string;
  label_fr: string;
  category: string;
  is_active: boolean;
}

/** user_interests (join table) */
export interface DbUserInterest {
  id: string;
  user_id: string;
  interest_id: string;
  created_at: string;
}

/** prompts table */
export interface DbPrompt {
  id: number;
  question_en: string;
  question_fr: string;
  sort_order: number;
  is_active: boolean;
}

/** user_prompt_answers table */
export interface DbPromptAnswer {
  id: string;
  user_id: string;
  prompt_id: string; // uuid referencing prompts.id
  answer_text: string;
  created_at: string;
}

/** Shape returned by get_matches() RPC */
export interface MatchResult {
  id: string;
  name: string | null;
  age: number | null;
  neighbourhood: string | null;
  photo_urls: string[];
  shared_count: number;
  common_interests: string[];
  all_interests: string[];
  prompt: { question: string; answer: string } | null;
}
