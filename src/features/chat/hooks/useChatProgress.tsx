import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CallInfo,
  ChatThread,
  GameConfig,
  Message,
  Option,
  Step,
  Timing,
} from "../types/chat.types";
import { END } from "../types/chat.types";
import type { Beat, CallSpec, Flags } from "../types/story.types";
import {
  applyEffects,
  enterStep,
  messagePreview,
  playBeats,
  resolveNext,
  runChoice,
  type PlayCtx,
} from "../utils/storyEngine";

export type CallResult = {
  status: "ended" | "missed" | "declined";
  durationSec?: number;
};

type Handlers = {
  // a message arrived in a chat the user isn't currently viewing
  onIncoming?: (chatId: string, text: string) => void;
  /** Open the call screen. Resolve when the call finishes. */
  onCall?: (call?: CallInfo) => Promise<CallResult>;
};

const typingFor = (text: string) =>
  Math.min(3500, Math.max(900, text.length * 45));

const hiddenAtStart = (c: ChatThread) =>
  c.appearAfterMs !== undefined || Boolean(c.startHidden);

export const useChatProgress = (game: GameConfig, handlers: Handlers = {}) => {
  const [progress, setProgress] = useState<
    Record<string, { messages: Message[] }>
  >(() =>
    Object.fromEntries(
      game.chats.map((c) => [
        c.id,
        { messages: hiddenAtStart(c) ? [] : c.initialMessages },
      ]),
    ),
  );

  // Sidebar order. Hidden chats are not in this list until they message.
  const [order, setOrder] = useState<string[]>(() =>
    game.chats.filter((c) => !hiddenAtStart(c)).map((c) => c.id),
  );

  const [unread, setUnread] = useState<Record<string, number>>(() =>
    Object.fromEntries(game.chats.map((c) => [c.id, c.unread ?? 0])),
  );

  const [typingId, setTypingId] = useState<string | null>(null);

  // true while a chat is mid-reply (or hasn't appeared yet): hides reply buttons
  const [pending, setPending] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      game.chats.filter(hiddenAtStart).map((c) => [c.id, true]),
    ),
  );

  // Story flags. The ref is the source of truth during a run so later beats
  // see earlier `set`s immediately; the state copy exists to re-render.
  const [flags, setFlagsState] = useState<Flags>({});
  const flagsRef = useRef<Flags>({});

  // current step id per chat (or "end")
  const stepRef = useRef<Record<string, string>>({});
  const nextId = useRef<Record<string, number>>({});
  const busy = useRef(new Set<string>());
  const started = useRef(new Set<string>());
  const timers = useRef(new Set<number>());
  const viewing = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const handlersRef = useRef(handlers);

  // runIntro takes an optional stepId so a chat that is already
  // open (like Athul's merged thread) can continue at a given step.
  const runIntroRef = useRef<
    (chatId: string, delayMs: number, stepId?: string) => Promise<void>
  >(async () => {});

  useEffect(() => {
    handlersRef.current = handlers;
  });

  const setFlags = useCallback((f: Flags) => {
    flagsRef.current = f;
    setFlagsState(f);
  }, []);

  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const t = window.setTimeout(() => {
          timers.current.delete(t);
          resolve();
        }, ms);
        timers.current.add(t);
      }),
    [],
  );

  const setBusy = useCallback((chatId: string, value: boolean) => {
    if (value) busy.current.add(chatId);
    else busy.current.delete(chatId);
    setPending((p) => ({ ...p, [chatId]: value }));
  }, []);

  const currentStep = useCallback((chat: ChatThread): Step | undefined => {
    const id = stepRef.current[chat.id] ?? chat.start ?? chat.steps[0]?.id;
    return chat.steps.find((s) => s.id === id);
  }, []);

  // Add any message (me / them / system, text or media) to a chat
  const deliver = useCallback(
    (chatId: string, m: Omit<Message, "id">) => {
      const chat = game.chats.find((c) => c.id === chatId);
      const base =
        nextId.current[chatId] ??
        Math.max(0, ...(chat?.initialMessages.map((x) => x.id) ?? []));
      const id = base + 1;
      nextId.current[chatId] = id;

      setProgress((p) => ({
        ...p,
        [chatId]: {
          messages: [...(p[chatId]?.messages ?? []), { ...m, id }],
        },
      }));

      // newest activity goes to the top of the sidebar
      setOrder((o) => [chatId, ...o.filter((x) => x !== chatId)]);

      if (m.from === "them" && viewing.current !== chatId) {
        setUnread((u) => ({ ...u, [chatId]: (u[chatId] ?? 0) + 1 }));
        handlersRef.current.onIncoming?.(chatId, messagePreview({ ...m, id }));
      }
    },
    [game],
  );

  // The bridge the story engine plays beats through
  const makeCtx = useCallback(
    (chatId: string): PlayCtx => ({
      getFlags: () => flagsRef.current,
      setFlags,
      push: (m) => deliver(chatId, m),
      setTyping: (on) =>
        setTypingId((cur) => (on ? chatId : cur === chatId ? null : cur)),
      startChat: (s) =>
        void runIntroRef.current(s.chatId, s.delayMs ?? 3000, s.stepId),
      runCall: async (c: CallSpec) => {
        const r = await handlersRef.current.onCall?.(c);
        return r ?? { status: "missed" as const };
      },
      signal: abortRef.current?.signal,
    }),
    [deliver, setFlags],
  );

  // Legacy replies: dots -> (optional fake typing + pause) -> dots -> message
  const speak = useCallback(
    async (chatId: string, text: string, t: Timing = {}) => {
      await wait(t.delayMs ?? 800);
      if (t.hesitate) {
        setTypingId(chatId);
        await wait(t.hesitate.typingMs);
        setTypingId(null);
        await wait(t.hesitate.pauseMs);
      }
      setTypingId(chatId);
      await wait(t.typingMs ?? typingFor(text));
      setTypingId(null);
      deliver(chatId, { from: "them", text });
    },
    [wait, deliver],
  );

  // Visible chat whose first step has an intro (or is a pass-through step)
  const begin = useCallback(
    async (chatId: string) => {
      const chat = game.chats.find((c) => c.id === chatId);
      if (!chat) return;
      const startId = chat.start ?? chat.steps[0]?.id;
      const step = chat.steps.find((s) => s.id === startId);
      if (!step || (!step.intro?.length && step.options.length > 0)) return;

      const ctx = makeCtx(chatId);
      setBusy(chatId, true);
      const next = await enterStep(chat.steps, step.id, ctx);
      if (ctx.signal?.aborted) return;
      stepRef.current[chatId] = next;
      setBusy(chatId, false);
    },
    [game, makeCtx, setBusy],
  );

  // A chat messages the player.
  //  - First time on a hidden chat: plays its opening messages, then its
  //    start step.
  //  - A chat that is already visible (its initialMessages are already on
  //    screen, e.g. the merged Athul thread) NEVER replays them. It just
  //    continues the same conversation at `stepId`.
  //  - Plain re-trigger with no stepId: ignored.
  const runIntro = useCallback(
    async (chatId: string, delayMs: number, stepId?: string) => {
      const chat = game.chats.find((c) => c.id === chatId);
      if (!chat) return;

      const isFirst = !started.current.has(chatId);
      if (!isFirst && !stepId) return;
      started.current.add(chatId);

      const ctx = makeCtx(chatId);
      setBusy(chatId, true);
      await wait(delayMs);
      if (ctx.signal?.aborted) return;

      // Visible chats already show their initialMessages. Only hidden chats
      // that haven't delivered anything yet play them as an intro.
      const alreadyShown =
        !hiddenAtStart(chat) || nextId.current[chatId] !== undefined;
      if (isFirst && !alreadyShown) {
        const intro: Beat[] = chat.initialMessages.map((m) => ({
          ...m,
          delayMs: 600,
        }));
        await playBeats(intro, ctx);
        if (ctx.signal?.aborted) return;
      }

      const startId = stepId ?? chat.start ?? chat.steps[0]?.id;
      if (startId) {
        stepRef.current[chatId] = await enterStep(chat.steps, startId, ctx);
        if (ctx.signal?.aborted) return;
      }
      setBusy(chatId, false);
    },
    [game, makeCtx, wait, setBusy],
  );

  useEffect(() => {
    runIntroRef.current = runIntro;
  }, [runIntro]);

  // Start timer-based chats and any visible chat that opens with an intro
  useEffect(() => {
    const ac = new AbortController();
    abortRef.current = ac;

    game.chats.forEach((chat) => {
      if (chat.appearAfterMs !== undefined) {
        void runIntro(chat.id, chat.appearAfterMs);
      } else if (!chat.startHidden) {
        void begin(chat.id);
      }
    });

    const pendingTimers = timers.current;
    return () => {
      ac.abort();
      pendingTimers.forEach((t) => clearTimeout(t));
      pendingTimers.clear();
      busy.current.clear();
      started.current.clear();
    };
  }, [game, runIntro, begin]);

  const choose = useCallback(
    async (chatId: string, option: Option) => {
      if (busy.current.has(chatId)) return;
      const chat = game.chats.find((c) => c.id === chatId);
      if (!chat) return;

      const ctx = makeCtx(chatId);
      setBusy(chatId, true);
      const step = currentStep(chat);

      let next: string;

      if (option.say || option.reply === undefined) {
        // Story option: `say` beats, `set` effects, `next` / `then` routing
        next = await runChoice(chat.steps, option, ctx);
      } else {
        // Legacy option: reply + followUp, `next` falls back to the next step
        const fallback = step
          ? (chat.steps[chat.steps.indexOf(step) + 1]?.id ?? END)
          : END;
        const target = resolveNext(option.next, flagsRef.current) ?? fallback;

        if (option.sends !== false) {
          deliver(chatId, { from: "me", text: option.sends ?? option.text });
        }
        ctx.setFlags(applyEffects(ctx.getFlags(), option.set));
        await speak(chatId, option.reply, option.replyTiming);

        const followUp = option.followUp ?? step?.followUp;
        if (followUp) {
          await speak(
            chatId,
            followUp,
            option.followUpTiming ?? step?.followUpTiming ?? { delayMs: 1200 },
          );
        }

        next = await enterStep(chat.steps, target, ctx);
      }

      if (ctx.signal?.aborted) return;
      stepRef.current[chatId] = next;
      setBusy(chatId, false);

      // Side effect: another chat starts messaging (not awaited)
      if (option.startChat) {
        // Cast keeps this compiling even if Option.startChat has no stepId yet.
        // Once chat.types.ts allows stepId, this cast can be removed.
        const sc = option.startChat as {
          chatId: string;
          stepId?: string;
          delayMs?: number;
        };
        void runIntro(sc.chatId, sc.delayMs ?? 3000, sc.stepId);
      }

      // Phone rings after the messages finish
      const call = option.callAfter ?? step?.callAfter;
      if (call) {
        await wait(call.delayMs ?? 1500);
        if (ctx.signal?.aborted) return;
        void handlersRef.current.onCall?.(call.call);
      }
    },
    [game, currentStep, deliver, speak, wait, setBusy, runIntro, makeCtx],
  );

  // Raw options for the step. ChatWindow filters with `when` / `requires`
  // using the `flags` we expose.
  const getOptions = (chatId: string): Option[] => {
    if (pending[chatId]) return [];
    const chat = game.chats.find((c) => c.id === chatId);
    if (!chat) return [];
    const step = currentStep(chat);
    return step ? step.options : (chat.fallbackOptions ?? []);
  };

  // Called by MessagesApp so we know which chat is on screen
  const setViewing = useCallback((id: string | null) => {
    viewing.current = id;
    if (id) setUnread((u) => (u[id] ? { ...u, [id]: 0 } : u));
  }, []);

  return {
    progress,
    order,
    unread,
    typingId,
    flags,
    choose,
    getOptions,
    setViewing,
  };
};

export type ChatController = ReturnType<typeof useChatProgress>;
