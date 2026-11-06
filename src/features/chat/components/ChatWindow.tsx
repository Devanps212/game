import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Video, X } from "lucide-react";
import type { ChatThread, Message, Option } from "../types/chat.types";
import type { Flags } from "../types/story.types.ts";
import {
  isLocked,
  lockedHintFor,
  visibleOptions,
} from "../utils/storyEngine.ts";
import MediaBubble from "./MediaBubble.tsx";
import SystemMessage from "./SystemMessage.tsx";

const SEND_SOUND = "/sounds/mobile/send.mp3";

const sendAudio = new Audio(SEND_SOUND);
sendAudio.preload = "auto";
sendAudio.load();

const playSendSound = () => {
  sendAudio.currentTime = 0;
  sendAudio.play().catch(() => {});
};

const NO_FLAGS: Flags = {};

type Props = {
  thread: ChatThread;
  messages: Message[];
  options: Option[];
  typing: boolean;
  unreadCount?: number;
  /** Story flags, used to hide/lock options (`when` / `requires`). */
  flags?: Flags;
  onChoose: (option: Option) => void;
  onBack: () => void;
  onCall?: () => void;
};

const sameRun = (a?: Message, b?: Message) =>
  !!a && !!b && a.from === b.from && a.speaker === b.speaker;

const FADE = "transition-colors duration-[2000ms]";

const ChatWindow = ({
  thread,
  messages,
  options,
  typing,
  unreadCount = 0,
  flags = NO_FLAGS,
  onChoose,
  onBack,
  onCall,
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const shown = visibleOptions(options, flags);
  const stacked = shown.length > 2 || shown.some((o) => o.text.length > 28);

  const selectOption = (option: Option) => {
    if (typing || isLocked(option, flags)) return;
    playSendSound();
    onChoose(option);
  };

  const lastMineId = [...messages].reverse().find((m) => m.from === "me")?.id;

  // Once an "era" message shows up (the "March 2046" cut), the whole chat
  // fades to black and stays that way.
  const dark = messages.some((m) => m.variant === "era");

  const themeVars = {
    "--imsg-bg": dark ? "#000" : "#fff",
    "--imsg-them": dark ? "#26262a" : "#e9e9eb",
  } as CSSProperties;

  return (
    <div
      className={`relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${FADE} ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
      style={themeVars}
    >
      <style>{`
        .imsg-bubble { position: relative; }
        .imsg-me.imsg-tail::before {
          content: "";
          position: absolute;
          bottom: 0;
          right: -7px;
          width: 20px;
          height: 18px;
          background: #0a84ff;
          border-bottom-left-radius: 16px 14px;
        }
        .imsg-me.imsg-tail::after {
          content: "";
          position: absolute;
          bottom: 0;
          right: -26px;
          width: 26px;
          height: 18px;
          background: var(--imsg-bg);
          border-bottom-left-radius: 10px;
        }
        .imsg-them.imsg-tail::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: -7px;
          width: 20px;
          height: 18px;
          background: var(--imsg-them);
          border-bottom-right-radius: 16px 14px;
        }
        .imsg-them.imsg-tail::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: -26px;
          width: 26px;
          height: 18px;
          background: var(--imsg-bg);
          border-bottom-right-radius: 10px;
        }
        .imsg-scroll::-webkit-scrollbar { width: 6px; }
        .imsg-scroll::-webkit-scrollbar-thumb { background: #c7c7cc; border-radius: 999px; }
      `}</style>

      {/* Header */}
      <div
        className={`flex items-center justify-between border-b px-4 pb-2 pt-3 backdrop-blur-xl ${FADE} ${
          dark
            ? "border-white/10 bg-zinc-900/80"
            : "border-black/10 bg-zinc-100/80"
        }`}
      >
        <button
          onClick={onBack}
          className="flex w-20 items-center text-[#0a84ff]"
        >
          <ChevronLeft size={30} strokeWidth={2.5} />
          {Boolean(unreadCount) && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0a84ff]/20 px-1.5 text-xs font-medium">
              {unreadCount}
            </span>
          )}
        </button>

        <button className="flex flex-col items-center">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-semibold text-white ${thread.avatarClass}`}
          >
            {thread.initials}
          </div>
          <span
            className={`mt-1 flex items-center text-xs ${FADE} ${
              dark ? "text-white" : "text-black"
            }`}
          >
            {thread.name}
            <ChevronRight size={12} className="text-zinc-500" />
          </span>
        </button>

        <div className="flex w-20 justify-end text-[#0a84ff]">
          <button
            type="button"
            onClick={onCall}
            aria-label={`Call ${thread.name}`}
          >
            <Video size={26} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="imsg-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3"
      >
        <p className="mb-3 text-center text-[11px] font-medium text-zinc-500">
          <span className="font-semibold">Today</span> {thread.time}
        </p>

        <div className="flex flex-col">
          {messages.map((m, i) => {
            if (m.from === "system")
              return <SystemMessage key={m.id} message={m} />;

            const prev = messages[i - 1];
            const next = messages[i + 1];
            const isFirst = !sameRun(prev, m);
            const isLast = !sameRun(m, next);
            const mine = m.from === "me";

            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"} ${
                  isFirst && i !== 0 ? "mt-2" : "mt-0.5"
                }`}
              >
                {!mine && m.speaker && isFirst && (
                  <span className="mb-0.5 ml-3.5 text-[11px] font-medium text-zinc-500">
                    {m.speaker}
                  </span>
                )}

                {m.media && (
                  <MediaBubble media={m.media} onOpenImage={setZoom} />
                )}

                {m.text && (
                  <div
                    className={`imsg-bubble max-w-[70%] break-words rounded-[18px] px-3.5 py-2 text-[17px] leading-[22px] ${
                      mine
                        ? "imsg-me bg-[#0a84ff] text-white"
                        : `imsg-them bg-[var(--imsg-them)] ${
                            dark ? "text-white" : "text-black"
                          }`
                    } ${isLast ? "imsg-tail" : ""} ${m.media ? "mt-0.5" : ""}`}
                  >
                    {m.text}
                  </div>
                )}

                {mine && m.id === lastMineId && (
                  <span className="mr-1 mt-0.5 text-[11px] font-medium text-zinc-500">
                    Delivered
                  </span>
                )}
              </div>
            );
          })}

          {typing && (
            <div className="mt-2 flex flex-col items-start">
              <div className="imsg-bubble imsg-them imsg-tail flex items-center gap-1 rounded-[18px] bg-[var(--imsg-them)] px-4 py-3.5">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div
        className={`min-h-16 gap-2 border-t px-3 pb-4 pt-3 ${FADE} ${
          dark ? "border-white/10 bg-black" : "border-black/10 bg-white"
        } ${stacked ? "flex max-h-[45%] flex-col overflow-y-auto" : "flex"}`}
      >
        {!typing &&
          shown.map((option) => {
            const locked = isLocked(option, flags);
            return (
              <button
                key={option.text}
                disabled={locked}
                onClick={() => selectOption(option)}
                className={`rounded-2xl border px-3 py-2.5 text-[15px] font-medium transition-colors ${
                  stacked ? "w-full shrink-0 text-left" : "flex-1"
                } ${
                  locked
                    ? dark
                      ? "cursor-not-allowed border-zinc-700 bg-zinc-900 text-zinc-500"
                      : "cursor-not-allowed border-zinc-300 bg-zinc-100 text-zinc-400"
                    : "border-[#0a84ff]/40 bg-[#0a84ff]/5 text-[#0a84ff] hover:bg-[#0a84ff]/15 active:bg-[#0a84ff]/25"
                }`}
              >
                {option.text}
                {locked && (
                  <span className="mt-0.5 block text-[12px] font-normal italic">
                    {lockedHintFor(option, flags)}
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Home indicator */}
      <div
        className={`mx-auto mb-2 h-1.5 w-36 rounded-full ${FADE} ${
          dark ? "bg-white" : "bg-black"
        }`}
      />

      {zoom && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(null)}
        >
          <button
            aria-label="Close"
            className="absolute right-4 top-4 text-white"
          >
            <X size={26} />
          </button>
          <img
            src={zoom.src}
            alt={zoom.alt}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
