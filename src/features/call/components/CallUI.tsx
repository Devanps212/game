import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Mic,
  MicOff,
  Grid3x3,
  Volume2,
  Video,
  CircleUser,
  Phone,
  Plus,
} from "lucide-react";

const RING_SOUND = "/sounds/mobile/ringtone.mp3"; // <- put your ring file here
const DEFAULT_RING_MS = 4000; // ring time before the voice audio "picks up"
const DEFAULT_MAX_RING_MS = 15000; // no audio: ring this long, then cut

export type CallOutcome = {
  status: "ended" | "missed";
  durationSec: number;
};

type CallUIProps = {
  /** Called once when the call is over (button, audio finished, or timeout) */
  close: (outcome: CallOutcome) => void;
  name?: string;
  subtitle?: string;
  /** If set, the other person picks up after `ringMs` and this audio plays */
  voiceSrc?: string;
  ringMs?: number;
  /** Used only when there is no voiceSrc: ring this long, then hang up */
  maxRingMs?: number;
};

type ControlProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

const Control = ({ label, icon, active = false, onClick }: ControlProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={onClick ? active : undefined}
    className="group flex flex-col items-center gap-2 outline-none"
  >
    <span
      className={`flex h-[68px] w-[68px] items-center justify-center rounded-full backdrop-blur-2xl transition-all duration-200 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-white/70 ${
        active
          ? "bg-white text-black"
          : "bg-white/20 text-white group-active:bg-white/30"
      }`}
    >
      {icon}
    </span>
    <span className="text-[13px] font-normal tracking-tight text-white">
      {label}
    </span>
  </button>
);

const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const CallUI = ({
  close,
  name = "Name",
  subtitle = "calling mobile…",
  voiceSrc,
  ringMs = DEFAULT_RING_MS,
  maxRingMs = DEFAULT_MAX_RING_MS,
}: CallUIProps) => {
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [connected, setConnected] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  const ringRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const connectedAtRef = useRef(0);
  const doneRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const stopAudio = () => {
    ringRef.current?.pause();
    voiceRef.current?.pause();
    ringRef.current = null;
    voiceRef.current = null;
  };

  const finish = useCallback((status: CallOutcome["status"]) => {
    if (doneRef.current) return;
    doneRef.current = true;
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    stopAudio();
    const durationSec = connectedAtRef.current
      ? Math.round((Date.now() - connectedAtRef.current) / 1000)
      : 0;
    closeRef.current({ status, durationSec });
  }, []);

  useEffect(() => {
    doneRef.current = false;

    const ring = new Audio(RING_SOUND);
    ring.loop = true;
    ringRef.current = ring;
    ring.play().catch(() => {});

    if (voiceSrc) {
      // the other person picks up after ringMs
      timersRef.current.push(
        window.setTimeout(() => {
          if (doneRef.current) return;
          ring.pause();
          ringRef.current = null;
          connectedAtRef.current = Date.now();
          setConnected(true);

          const voice = new Audio(voiceSrc);
          voiceRef.current = voice;
          voice.onended = () => finish("ended");
          voice.onerror = () => finish("ended");
          voice.play().catch(() => finish("ended"));
        }, ringMs),
      );
    } else {
      // nobody answers: ring, then cut
      timersRef.current.push(
        window.setTimeout(() => finish("missed"), maxRingMs),
      );
    }

    return () => {
      doneRef.current = true;
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
      stopAudio();
    };
  }, [voiceSrc, ringMs, maxRingMs, finish]);

  // call timer once connected
  useEffect(() => {
    if (!connected) return;
    const id = window.setInterval(() => {
      setElapsed(Math.round((Date.now() - connectedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [connected]);

  // mute silences the voice audio
  useEffect(() => {
    if (voiceRef.current) voiceRef.current.muted = muted;
  }, [muted, connected]);

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className="relative flex h-full w-full justify-center overflow-hidden text-white"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", system-ui, sans-serif',
      }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-[#3a3f4b] via-[#262a33] to-[#101216]" />
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#5a6275]/40 blur-3xl" />
      <div className="absolute inset-0 bg-black/20 backdrop-blur-3xl" />

      <div className="relative z-10 flex h-full w-full max-w-xl flex-col items-center justify-between px-6 pb-10 pt-14">
        <div className="flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-b from-[#a7acb8] to-[#7b8090] text-[44px] font-medium text-white">
            {initial}
          </div>

          <h1 className="mt-4 text-[34px] font-normal leading-tight tracking-tight">
            {name}
          </h1>
          <span className="mt-1 text-[17px] text-white/60">
            {connected ? formatTime(elapsed) : subtitle}
          </span>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="grid grid-cols-3 gap-x-10 gap-y-5">
            <Control
              label="mute"
              active={muted}
              onClick={() => setMuted((v) => !v)}
              icon={muted ? <MicOff size={28} /> : <Mic size={28} />}
            />
            <Control label="keypad" icon={<Grid3x3 size={28} />} />
            <Control
              label="speaker"
              active={speaker}
              onClick={() => setSpeaker((v) => !v)}
              icon={<Volume2 size={28} />}
            />
            <Control label="add call" icon={<Plus size={30} />} />
            <Control label="FaceTime" icon={<Video size={28} />} />
            <Control label="contacts" icon={<CircleUser size={28} />} />
          </div>

          <button
            type="button"
            onClick={() => finish(connected ? "ended" : "missed")}
            aria-label="End call"
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#ff3b30] outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Phone size={32} className="rotate-[135deg] fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallUI;
