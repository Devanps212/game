import type { END } from "./chat.types";

/* ───────────── Flags / conditions ───────────── */

export type FlagValue = boolean | number | string;
export type Flags = Record<string, FlagValue>;

/** `{ suspicion: { add: 1 } }` increments, anything else assigns. */
export type Effects = Record<string, FlagValue | { add: number }>;

export type Condition =
  | { flag: string; is?: FlagValue; gte?: number; lt?: number } // bare {flag} = truthy
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

export type Branch = { when?: Condition; to: string | typeof END };
/** A step id, END, or a list of branches (first one whose `when` passes wins). */
export type NextRef = string | typeof END | Branch[];

/* ───────────── Media ───────────── */

export type TranscriptLine = { speaker?: string; text: string; note?: boolean };

export type Media =
  | { kind: "image"; src: string; alt: string }
  | {
      kind: "video";
      src: string;
      poster?: string;
      durationSec: number;
      alt: string;
    }
  | { kind: "audio"; src: string; durationSec: number }
  | { kind: "transcript"; title: string; lines: TranscriptLine[] }
  | { kind: "location"; label: string }
  | {
      kind: "call";
      status: "ended" | "missed" | "declined";
      direction: "incoming" | "outgoing";
      durationSec?: number;
    }
  | {
      kind: "clipping";
      tone: "paper" | "sticky" | "screen";
      heading: string;
      byline?: string;
      body?: string;
    };

/** Replaces the old Message type (re-export it from chat.types.ts). */
export type Message = {
  id: number;
  /** "system" = narration, time stamps, in-person dialogue, call logs. */
  from: "me" | "them" | "system";
  text?: string;
  media?: Media;
  /** Sender label. On "them" it shows above the bubble (group-chat style);
   *  on "system" it turns the line into an in-person dialogue card. */
  speaker?: string;
  /** System messages only. Defaults to "dialogue" if `speaker` is set, else "narration". */
  variant?: "narration" | "stamp" | "dialogue" | "title";
};

/* ───────────── Calls ───────────── */

export type CallSpec = {
  name: string;
  voiceSrc: string;
  direction?: "incoming" | "outgoing";
  /** Ring time before it connects (outgoing) or is answered. */
  ringMs?: number;
};

/* ───────────── Beats (scripted lines) ───────────── */

export type Beat = Partial<Omit<Message, "id">> & {
  delayMs?: number;
  typingMs?: number;
  /** Typing, stop, pause, typing again, then send. */
  hesitate?: { typingMs: number; pauseMs: number };
  /** Show the typing indicator and send nothing. */
  typingOnly?: boolean;
  /** Skip this beat unless the condition holds. */
  when?: Condition;
  set?: Effects;
  startChat?: { chatId: string; delayMs?: number };
  call?: CallSpec;
};

/* ───────────── Extra fields for Option / Step ─────────────
 * Intersect these with your existing types in chat.types.ts:
 *   export type Option = (existing Option) & OptionExtras;
 *   export type Step   = (existing Step)   & StepExtras;
 * and change the existing `next` to NextRef, make `reply` optional.
 */

export type LockedHint = string | { when?: Condition; text: string }[];

export type OptionExtras = {
  /** What actually gets sent as the player's bubble. Default: `text`. `false` = send nothing. */
  sends?: string | false;
  /** Everything that happens after the player picks this option. */
  say?: Beat[];
  set?: Effects;
  /** Hidden unless the condition holds. */
  when?: Condition;
  /** Shown greyed-out (with `lockedHint`) unless the condition holds. */
  requires?: Condition;
  lockedHint?: LockedHint;
};

export type StepExtras = {
  /** Played every time the step is entered, before options appear. */
  intro?: Beat[];
  /** For steps with `options: []`: where to go after `intro`. */
  then?: NextRef;
};
