import { END } from "../types/chat.types";
import type { Option } from "../types/chat.types";
import type {
  Beat,
  CallSpec,
  Condition,
  Effects,
  Flags,
  Message,
  NextRef,
  StepExtras,
} from "../types/story.types";

/* ───────────── Flags ───────────── */

export const isMet = (c: Condition | undefined, f: Flags): boolean => {
  if (!c) return true;
  if ("all" in c) return c.all.every((x) => isMet(x, f));
  if ("any" in c) return c.any.some((x) => isMet(x, f));
  if ("not" in c) return !isMet(c.not, f);
  const v = f[c.flag];
  if (c.is !== undefined) return (v ?? false) === c.is;
  if (c.gte !== undefined) return Number(v ?? 0) >= c.gte;
  if (c.lt !== undefined) return Number(v ?? 0) < c.lt;
  return Boolean(v) && v !== "false";
};

export const applyEffects = (f: Flags, e?: Effects): Flags => {
  if (!e) return f;
  const next = { ...f };
  for (const [k, v] of Object.entries(e)) {
    next[k] = typeof v === "object" ? Number(next[k] ?? 0) + v.add : v;
  }
  return next;
};

export const resolveNext = (n: NextRef | undefined, f: Flags) =>
  n === undefined || typeof n === "string"
    ? n
    : n.find((b) => isMet(b.when, f))?.to;

/* ───────────── Option helpers (used by ChatWindow) ───────────── */

export const isLocked = (o: Option, f: Flags) => !isMet(o.requires, f);

export const lockedHintFor = (o: Option, f: Flags) => {
  const h = o.lockedHint;
  if (!h) return "";
  if (typeof h === "string") return h;
  return h.find((x) => isMet(x.when, f))?.text ?? "";
};

export const visibleOptions = (options: Option[], f: Flags) =>
  options.filter((o) => isMet(o.when, f));

/* ───────────── Display helpers ───────────── */

export const formatDuration = (sec: number) =>
  `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

/** Text for the chat-list preview line (ChatSidebar `preview`). */
export const messagePreview = (m: Message) => {
  switch (m.media?.kind) {
    case "image":
      return "📷 Photo";
    case "video":
      return "🎥 Video";
    case "audio":
      return "🎤 Voice message";
    case "location":
      return "📍 Live location";
    case "call":
      return m.media.status === "missed" ? "📞 Missed call" : "📞 Voice call";
    default:
      return m.text ?? "";
  }
};

/* ───────────── Beat player ─────────────
 * The host chat hook supplies a PlayCtx. IMPORTANT: back getFlags/setFlags with a
 * useRef, not just useState, so later beats in the same run see earlier `set`s.
 */

export type PlayCtx = {
  getFlags(): Flags;
  setFlags(f: Flags): void;
  push(m: Omit<Message, "id">): void;
  setTyping(on: boolean): void;
  // CHANGE: optional stepId. Continues an already-open chat at that step.
  startChat(s: { chatId: string; stepId?: string; delayMs?: number }): void;
  /** Open your call screen; resolve when the call ends. */
  runCall(c: CallSpec): Promise<{
    status: "ended" | "missed" | "declined";
    durationSec?: number;
  }>;
  signal?: AbortSignal;
};

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        resolve();
      },
      { once: true },
    );
  });

const typingFor = (b: Beat) => {
  if (b.typingMs !== undefined) return b.typingMs;
  if (b.media) return b.media.kind === "audio" ? 2200 : 1400;
  return Math.min(3200, 450 + (b.text?.length ?? 0) * 28);
};

export async function playBeats(beats: Beat[] | undefined, ctx: PlayCtx) {
  try {
    for (const beat of beats ?? []) {
      if (ctx.signal?.aborted) return;
      if (!isMet(beat.when, ctx.getFlags())) continue;

      const from = beat.from ?? "them";
      const hasBody = beat.text !== undefined || beat.media !== undefined;
      const showTyping =
        from === "them" &&
        (hasBody || beat.typingOnly) &&
        beat.media?.kind !== "transcript";

      if (beat.set) ctx.setFlags(applyEffects(ctx.getFlags(), beat.set));
      if (beat.startChat) ctx.startChat(beat.startChat);

      await sleep(beat.delayMs ?? (from === "system" ? 450 : 350), ctx.signal);

      if (showTyping) {
        if (beat.hesitate) {
          ctx.setTyping(true);
          await sleep(beat.hesitate.typingMs, ctx.signal);
          ctx.setTyping(false);
          await sleep(beat.hesitate.pauseMs, ctx.signal);
        }
        ctx.setTyping(true);
        await sleep(typingFor(beat), ctx.signal);
        ctx.setTyping(false);
      }
      if (ctx.signal?.aborted) return;

      if (hasBody) {
        ctx.push({
          from,
          text: beat.text,
          media: beat.media,
          speaker: beat.speaker,
          variant: beat.variant,
        });
      }

      if (beat.call) {
        const r = await ctx.runCall(beat.call);
        ctx.push({
          from: "system",
          media: {
            kind: "call",
            status: r.status,
            direction: beat.call.direction ?? "incoming",
            durationSec: r.durationSec,
          },
        });
      }
    }
  } finally {
    ctx.setTyping(false);
  }
}

/* ───────────── Step runner ───────────── */

type StepLike = { id: string; options: Option[] } & StepExtras;

/** Plays a step's intro; follows `then` through option-less steps.
 *  Returns the id of the step whose options should be shown, or END. */
export async function enterStep(
  steps: StepLike[],
  id: string | typeof END,
  ctx: PlayCtx,
): Promise<string | typeof END> {
  let target = id;
  while (target !== END) {
    const step = steps.find((s) => s.id === target);
    if (!step) return END;
    await playBeats(step.intro, ctx);
    if (ctx.signal?.aborted || step.options.length > 0 || !step.then)
      return target;
    target = resolveNext(step.then, ctx.getFlags()) ?? END;
  }
  return END;
}

/** Call this when the player picks an option. Returns the step to show next. */
export async function runChoice(
  steps: StepLike[],
  option: Option,
  ctx: PlayCtx,
): Promise<string | typeof END> {
  if (option.sends !== false) {
    ctx.push({ from: "me", text: option.sends ?? option.text });
  }
  ctx.setFlags(applyEffects(ctx.getFlags(), option.set));
  await playBeats(option.say, ctx);
  const target = resolveNext(option.next, ctx.getFlags()) ?? END;
  return enterStep(steps, target, ctx);
}
