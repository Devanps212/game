import type { ComponentType } from "react";
import type { NotificationItem } from "../../mobile/types/Notification.types";
import type {
  CallSpec,
  Message as StoryMessage,
  NextRef,
  OptionExtras,
  StepExtras,
} from "./story.types";

/** Text, image, video, voice note, location, call log, narration. See story.types.ts */
export type Message = StoryMessage;

/** Use as `next: END` to finish a chat's story */
export const END = "end";

export type Hesitate = { typingMs: number; pauseMs: number };

// Controls how a reply "arrives"
export type Timing = {
  delayMs?: number; // wait before dots appear (default 800)
  typingMs?: number; // how long the dots show (default scales with text length)
  hesitate?: Hesitate; // types, stops, then types again for the real message
};

export type CallInfo = CallSpec & {
  /** Ring immediately when the phone opens */
  atStart?: boolean;
};

export type CallTrigger = {
  delayMs?: number;
  /** Overrides the game's default caller for this call */
  call?: CallInfo;
};

export type Option = {
  text: string;
  /** Legacy single reply. Story options use `say` instead (see OptionExtras). */
  reply?: string;
  replyTiming?: Timing;
  /** Extra message after the reply (overrides the step's followUp) */
  followUp?: string;
  followUpTiming?: Timing;
  /** Step id, END, or conditional branches. Omit = next step in array (legacy only) */
  next?: NextRef;
  /** Ring the phone after this option's messages finish (overrides step's callAfter) */
  callAfter?: CallTrigger;
  /** Make a hidden chat message the player after this delay */
  startChat?: { chatId: string; delayMs?: number };
} & OptionExtras;

export type Step = {
  id: string;
  options: Option[];
  /** Default follow-up if the chosen option has none */
  followUp?: string;
  followUpTiming?: Timing;
  /** Default call if the chosen option has none */
  callAfter?: CallTrigger;
} & StepExtras;

export type ChatThread = {
  id: string;
  name: string;
  initials: string;
  avatarClass: string;
  /** Shown in the sidebar and under "Today" in the chat header */
  time: string;
  /** Number shown in the back-button badge */
  unread?: number;
  /** Hidden until this person messages first, after this delay (timer based) */
  appearAfterMs?: number;
  /** Hidden until another option triggers it with startChat (choice based) */
  startHidden?: boolean;
  initialMessages: Message[];
  /** First step id. Defaults to steps[0] */
  start?: string;
  steps: Step[];
  /** Used when steps run out ("end"). */
  fallbackOptions?: Option[];
};

export type GameConfig = {
  id: string;
  title: string;
  lobby: ComponentType<{ onComplete?: () => void }>;
  /** Phone wallpaper */
  wallpaper: string;
  /** Optional full-screen intro played before the phone */
  Intro?: ComponentType<{ onComplete?: () => void }>;
  /** Same shape as the objects in SAMPLES (without id and time) */
  notifications: Omit<NotificationItem, "id" | "time">[];
  /** Default caller */
  call?: CallInfo;
  chats: ChatThread[];
};
