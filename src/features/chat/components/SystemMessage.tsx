import { PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";
import type { Media, Message } from "../types/story.types.ts";
import { formatDuration } from "../utils/storyEngine.ts";
import MediaBubble from "./MediaBubble.tsx";

const CallLog = ({ media }: { media: Extract<Media, { kind: "call" }> }) => {
  const missed = media.status === "missed" || media.status === "declined";
  const Icon = missed
    ? PhoneMissed
    : media.direction === "outgoing"
      ? PhoneOutgoing
      : PhoneIncoming;
  const label =
    media.status === "missed"
      ? "Missed voice call"
      : media.status === "declined"
        ? "Declined voice call"
        : `${media.direction === "outgoing" ? "Outgoing" : "Incoming"} voice call${
            media.durationSec ? ` · ${formatDuration(media.durationSec)}` : ""
          }`;

  return (
    <div className="my-2 flex justify-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium ${
          missed ? "bg-red-50 text-red-500" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        <Icon size={13} />
        {label}
      </span>
    </div>
  );
};

const SystemMessage = ({ message: m }: { message: Message }) => {
  if (m.media?.kind === "call") return <CallLog media={m.media} />;
  if (m.media) {
    return (
      <div className="my-2 flex justify-center">
        <MediaBubble media={m.media} />
      </div>
    );
  }
  if (!m.text) return null;

  const variant = m.variant ?? (m.speaker ? "dialogue" : "narration");

  if (variant === "stamp") {
    return (
      <p className="my-3 text-center text-[11px] font-semibold text-zinc-400">
        {m.text}
      </p>
    );
  }
  if (variant === "title") {
    return (
      <p className="my-6 text-center text-base font-semibold tracking-[0.35em] text-zinc-800">
        {m.text}
      </p>
    );
  }
  if (variant === "dialogue") {
    return (
      <div className="mx-auto my-1.5 w-[88%] rounded-2xl border-l-4 border-amber-500 bg-amber-50 px-3 py-2">
        {m.speaker && (
          <p className="text-[12px] font-semibold text-amber-700">
            {m.speaker}
          </p>
        )}
        <p className="whitespace-pre-line text-[15px] leading-snug text-zinc-900">
          {m.text}
        </p>
      </div>
    );
  }
  return (
    <p className="mx-auto my-2 max-w-[88%] whitespace-pre-line text-center text-[13px] italic leading-snug text-zinc-500">
      {m.text}
    </p>
  );
};

export default SystemMessage;
