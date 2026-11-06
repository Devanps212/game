import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  AudioLines,
  Film,
  Image as ImageIcon,
  MapPin,
  Pause,
  Play,
  X,
} from "lucide-react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import type { Media } from "../types/story.types";
import { formatDuration } from "../utils/storyEngine";

type Of<K extends Media["kind"]> = Extract<Media, { kind: K }>;

/* ───────── Download helpers ───────── */

/* Remembers what was already downloaded, so it survives switching chats
   (ChatWindow is re-mounted per chat) and re-renders. */
const downloaded = new Set<string>();

const hashOf = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

type DownloadState = "idle" | "loading" | "done";

/* Simulated download: idle → loading (progress 0..1) → done. */
const useDownload = (key: string) => {
  const [state, setState] = useState<DownloadState>(
    downloaded.has(key) ? "done" : "idle",
  );
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = () => {
    if (state !== "idle") return;
    setState("loading");
    setProgress(0);
    const t0 = performance.now();
    const duration = 900 + (hashOf(key) % 900); // 0.9s – 1.8s
    clear();
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / duration);
      setProgress(p);
      if (p >= 1) {
        clear();
        downloaded.add(key);
        setState("done");
      }
    }, 60);
  };

  const cancel = () => {
    clear();
    setState("idle");
    setProgress(0);
  };

  useEffect(() => clear, []);

  return { state, progress, start, cancel };
};

/* Round button: arrow when idle, progress ring + X while downloading. */
const DownloadButton = ({
  loading,
  progress,
  onClick,
  size = 48,
  dark = true,
}: {
  loading: boolean;
  progress: number;
  onClick: () => void;
  size?: number;
  dark?: boolean;
}) => {
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <button
      type="button"
      aria-label={loading ? "Cancel download" : "Download"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ width: size, height: size }}
      className={`relative flex shrink-0 items-center justify-center rounded-full text-white ${
        dark ? "bg-black/45 backdrop-blur" : "bg-[#0a84ff]"
      }`}
    >
      {loading && (
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90"
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2.5}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="white"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.max(0.08, progress))}
          />
        </svg>
      )}
      {loading ? (
        <X size={size * 0.38} strokeWidth={2.5} />
      ) : (
        <ArrowDown size={size * 0.45} strokeWidth={2.5} />
      )}
    </button>
  );
};

/* Blurred "not downloaded yet" tile used by image + video. */
const DownloadTile = ({
  icon,
  sizeLabel,
  state,
  progress,
  onStart,
  onCancel,
  tall,
}: {
  icon: ReactNode;
  sizeLabel: string;
  state: DownloadState;
  progress: number;
  onStart: () => void;
  onCancel: () => void;
  tall?: boolean;
}) => {
  const loading = state === "loading";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={loading ? onCancel : onStart}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          (loading ? onCancel : onStart)();
      }}
      className={`relative flex w-full cursor-pointer flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-400 ${
        tall ? "h-56" : "h-44"
      }`}
    >
      <span className="absolute left-3 top-3 text-zinc-500/70">{icon}</span>
      <DownloadButton
        loading={loading}
        progress={progress}
        onClick={loading ? onCancel : onStart}
      />
      <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[12px] font-medium text-white backdrop-blur">
        {loading ? `${Math.round(progress * 100)}%` : `Download · ${sizeLabel}`}
      </span>
    </div>
  );
};

/* Shown when an asset file is missing, so the story still reads. */
const Placeholder = ({
  icon,
  label,
  tall,
}: {
  icon: ReactNode;
  label: string;
  tall?: boolean;
}) => (
  <div
    className={`flex w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-300 to-zinc-400 px-4 text-center text-zinc-600 ${
      tall ? "h-56" : "h-44"
    }`}
  >
    {icon}
    <span className="text-xs leading-snug">{label}</span>
  </div>
);

/* ───────── Image ───────── */

const ImageBubble = ({
  media,
  onOpen,
}: {
  media: Of<"image">;
  onOpen?: (img: { src: string; alt: string }) => void;
}) => {
  const [failed, setFailed] = useState(false);
  const dl = useDownload(media.src);
  const size = formatSize(180 * 1024 + (hashOf(media.src) % (900 * 1024)));

  if (dl.state !== "done") {
    return (
      <div className="block w-64 max-w-[70%] overflow-hidden rounded-[18px] bg-zinc-200">
        <DownloadTile
          icon={<ImageIcon size={18} />}
          sizeLabel={size}
          state={dl.state}
          progress={dl.progress}
          onStart={dl.start}
          onCancel={dl.cancel}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={failed}
      onClick={() => onOpen?.({ src: media.src, alt: media.alt })}
      className="block w-64 max-w-[70%] overflow-hidden rounded-[18px] bg-zinc-200 text-left"
    >
      {failed ? (
        <Placeholder icon={<ImageIcon size={26} />} label={media.alt} />
      ) : (
        <img
          src={media.src}
          alt={media.alt}
          onError={() => setFailed(true)}
          className="block max-h-80 w-full animate-[fadeIn_.35s_ease-out] object-cover"
        />
      )}
    </button>
  );
};

/* ───────── Video ───────── */

const VideoBubble = ({ media }: { media: Of<"video"> }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const dl = useDownload(media.src);
  const size = formatSize(media.durationSec * 380 * 1024);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setFailed(true));
    else v.pause();
  };

  if (dl.state !== "done") {
    return (
      <div className="relative w-64 max-w-[70%] overflow-hidden rounded-[18px] bg-zinc-300">
        <DownloadTile
          icon={<Film size={18} />}
          sizeLabel={size}
          state={dl.state}
          progress={dl.progress}
          onStart={dl.start}
          onCancel={dl.cancel}
          tall
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
          {formatDuration(media.durationSec)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-64 max-w-[70%] overflow-hidden rounded-[18px] bg-black">
      {failed ? (
        <Placeholder icon={<Film size={26} />} label={media.alt} tall />
      ) : (
        <video
          ref={ref}
          src={media.src}
          poster={media.poster}
          playsInline
          preload="metadata"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => setFailed(true)}
          className="block max-h-80 w-full object-cover"
        />
      )}
      {!failed && !playing && (
        <button
          type="button"
          aria-label="Play video"
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
            <Play size={22} fill="currentColor" />
          </span>
        </button>
      )}
      <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">
        {formatDuration(media.durationSec)}
      </span>
    </div>
  );
};

/* ───────── Voice message ───────── */

let stopActiveAudio: (() => void) | null = null; // only one voice message plays at a time

/* m:ss, or h:mm:ss for long files. Always floors, so it never runs ahead. */
const clock = (seconds: number) => {
  const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};

/* Reads the REAL length from the audio file. `fallback` (the durationSec in
   the story) is only shown until the browser has read the file. */
const useAudioDuration = (src: string, fallback: number) => {
  const [duration, setDuration] = useState(fallback);

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";

    const apply = () => {
      if (Number.isFinite(a.duration) && a.duration > 0)
        setDuration(a.duration);
    };
    const onMeta = () => {
      if (a.duration === Infinity) {
        // Some Ogg/Opus/WebM files report Infinity until scanned to the end.
        // Seeking far past the end makes the browser work out the length.
        const onFix = () => {
          a.removeEventListener("timeupdate", onFix);
          a.currentTime = 0;
          apply();
        };
        a.addEventListener("timeupdate", onFix);
        a.currentTime = 1e101;
      } else {
        apply();
      }
    };

    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", apply);
    a.src = src;

    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", apply);
      a.removeAttribute("src");
      a.load();
    };
  }, [src]);

  return duration;
};

const AudioBubble = ({ media }: { media: Of<"audio"> }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const raf = useRef(0);
  const simulated = useRef(false); // file missing/blocked → fake the playback so the UI still works
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0); // seconds played
  const dl = useDownload(media.src);
  const duration = useAudioDuration(media.src, media.durationSec);
  const progress = duration > 0 ? Math.min(1, current / duration) : 0;

  const bars = useMemo(() => {
    // Plain loop (no closure reassigning a variable) so React Compiler is happy
    let h = 0;
    for (const c of media.src) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const out: number[] = [];
    for (let i = 0; i < 28; i++) {
      h = (h * 1664525 + 1013904223) >>> 0;
      out.push(20 + (h % 80));
    }
    return out;
  }, [media.src]);

  const clear = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    clear();
    setPlaying(false);
  };

  /* Fake playback (missing file): fills the bar over at most 6 seconds. */
  const simulate = (fromRatio: number) => {
    const total = Math.max(1, Math.min(duration, 6)) * 1000;
    const t0 = performance.now() - fromRatio * total;
    clear();
    timer.current = window.setInterval(() => {
      const p = (performance.now() - t0) / total;
      if (p >= 1) {
        stop();
        setCurrent(0);
      } else setCurrent(p * duration);
    }, 100);
  };

  const toggle = () => {
    if (playing) return stop();
    stopActiveAudio?.();
    stopActiveAudio = stop;
    setPlaying(true);
    const a = audioRef.current;
    if (!a || simulated.current) return simulate(progress);
    a.play().catch(() => {
      simulated.current = true;
      simulate(progress);
    });
  };

  /* Smooth progress: `timeupdate` only fires ~4x a second, so read the real
     playback position every animation frame while playing. */
  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      const a = audioRef.current;
      if (!a || simulated.current) return;
      setCurrent(a.currentTime);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  useEffect(
    () => () => {
      clear();
      audioRef.current?.pause();
    },
    [],
  );

  const seekTo = (ratio: number) => {
    if (!duration) return;
    const r = Math.min(1, Math.max(0, ratio));
    const a = audioRef.current;
    if (a && !simulated.current) a.currentTime = r * duration;
    setCurrent(r * duration);
    if (playing && (!a || simulated.current)) simulate(r);
  };

  const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = waveRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return;
    if (e.key === "ArrowRight") seekTo((current + 5) / duration);
    else if (e.key === "ArrowLeft") seekTo((current - 5) / duration);
    else return;
    e.preventDefault();
  };

  /* Not downloaded yet */
  if (dl.state !== "done") {
    const loading = dl.state === "loading";
    const size = formatSize(duration * 16 * 1024);
    return (
      <div className="flex w-64 max-w-[70%] items-center gap-2.5 rounded-[18px] bg-[#e9e9eb] px-3 py-2.5">
        <DownloadButton
          loading={loading}
          progress={dl.progress}
          onClick={loading ? dl.cancel : dl.start}
          size={36}
          dark={false}
        />
        <div className="min-w-0 flex-1">
          <div className="flex h-7 items-center gap-[2px] opacity-60">
            {bars.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className="min-w-0 flex-1 rounded-full bg-zinc-400/70"
              />
            ))}
          </div>
          <div className="mt-0.5 flex justify-between text-[11px] tabular-nums text-zinc-500">
            <span>{clock(duration)}</span>
            <span>{loading ? `${Math.round(dl.progress * 100)}%` : size}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-64 max-w-[70%] items-center gap-2.5 rounded-[18px] bg-[#e9e9eb] px-3 py-2.5">
      <audio
        ref={audioRef}
        src={media.src}
        preload="metadata"
        onEnded={() => {
          stop();
          setCurrent(0);
        }}
        onError={() => {
          simulated.current = true;
        }}
      />
      <button
        type="button"
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        onClick={toggle}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white"
      >
        {playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          ref={waveRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          aria-valuetext={`${clock(current)} of ${clock(duration)}`}
          onKeyDown={onKeyDown}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            seekFromPointer(e);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) seekFromPointer(e);
          }}
          className="flex h-7 cursor-pointer touch-none items-center gap-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/50"
        >
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={`min-w-0 flex-1 rounded-full ${i / bars.length < progress ? "bg-[#0a84ff]" : "bg-zinc-400/70"}`}
            />
          ))}
        </div>
        <div className="mt-0.5 flex justify-between text-[11px] font-medium tabular-nums text-zinc-500">
          <span>{clock(current)}</span>
          <span>{clock(duration)}</span>
        </div>
      </div>
    </div>
  );
};

/* ───────── Transcript card ───────── */

const TranscriptCard = ({ media }: { media: Of<"transcript"> }) => (
  <div className="w-72 max-w-[88%] rounded-2xl border border-black/10 bg-zinc-50 p-3">
    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
      <AudioLines size={13} />
      {media.title}
    </div>
    <div className="space-y-1.5">
      {media.lines.map((l, i) =>
        l.note ? (
          <p key={i} className="text-[13px] italic leading-snug text-zinc-500">
            {l.text}
          </p>
        ) : (
          <p key={i} className="text-[15px] leading-snug text-zinc-900">
            {l.speaker && (
              <span className="mr-1.5 text-[12px] font-semibold text-zinc-500">
                {l.speaker}
              </span>
            )}
            {l.text}
          </p>
        ),
      )}
    </div>
  </div>
);

/* ───────── Live location ───────── */

const LocationBubble = ({ media }: { media: Of<"location"> }) => (
  <div className="w-64 max-w-[70%] overflow-hidden rounded-[18px] bg-[#e9e9eb]">
    <div
      className="relative flex h-28 items-center justify-center bg-[#dbe9dd]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <span className="absolute h-8 w-8 animate-ping rounded-full bg-[#0a84ff]/40" />
      <span className="relative h-4 w-4 rounded-full border-2 border-white bg-[#0a84ff] shadow" />
    </div>
    <div className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-zinc-700">
      <MapPin size={14} className="text-[#0a84ff]" />
      {media.label}
    </div>
  </div>
);

/* ───────── Clipping / sticky note / screen ───────── */

const ClippingCard = ({ media }: { media: Of<"clipping"> }) => {
  if (media.tone === "sticky") {
    return (
      <div className="w-60 max-w-[80%] rotate-1 bg-sky-200 px-3 py-3 font-mono text-[14px] leading-snug text-sky-950 shadow">
        <p>{media.heading}</p>
        {media.body && (
          <p className="mt-2 text-[12px] opacity-70">{media.body}</p>
        )}
      </div>
    );
  }
  if (media.tone === "screen") {
    return (
      <div className="w-72 max-w-[88%] rounded-lg bg-zinc-900 px-3 py-2.5 font-mono text-[12px] leading-snug text-emerald-300">
        <p className="font-semibold">{media.heading}</p>
        {media.body && <p className="mt-1 opacity-80">{media.body}</p>}
      </div>
    );
  }
  return (
    <div className="w-72 max-w-[88%] -rotate-1 border border-zinc-300 bg-[#f1ecdc] px-3 py-2.5 font-serif text-zinc-900 shadow-sm">
      <p className="text-[16px] font-bold leading-tight">{media.heading}</p>
      {media.byline && (
        <p className="mt-1 text-[12px] italic">{media.byline}</p>
      )}
      {media.body && (
        <p className="mt-1 text-[12px] text-zinc-700">{media.body}</p>
      )}
    </div>
  );
};

/* ───────── Switch ───────── */

type Props = {
  media: Media;
  onOpenImage?: (img: { src: string; alt: string }) => void;
};

const MediaBubble = ({ media, onOpenImage }: Props) => {
  switch (media.kind) {
    case "image":
      return <ImageBubble media={media} onOpen={onOpenImage} />;
    case "video":
      return <VideoBubble media={media} />;
    case "audio":
      return <AudioBubble media={media} />;
    case "transcript":
      return <TranscriptCard media={media} />;
    case "location":
      return <LocationBubble media={media} />;
    case "clipping":
      return <ClippingCard media={media} />;
    default:
      return null; // "call" is rendered by SystemMessage
  }
};

export default MediaBubble;
