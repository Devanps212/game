import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff, User, Volume2 } from "lucide-react";

const RINGTONE_SRC = "/sounds/mobile/ringtone.opus";

type Phase = "ringing" | "connected" | "exiting" | "gone";
type Anim = "in" | "bump" | "idle" | "out";

const formatTime = (total: number) => {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const animClass: Record<Anim, string> = {
  in: "call-card-in",
  bump: "call-card-bump",
  idle: "",
  out: "call-card-out",
};

const styles = `
  @keyframes call-in {
    0% { transform: translateY(-150%) scale(0.9); opacity: 0; }
    55% { transform: translateY(8%) scale(1.03); opacity: 1; }
    75% { transform: translateY(-3%) scale(0.99); }
    90% { transform: translateY(1%) scale(1.005); }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes call-out {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-150%) scale(0.94); opacity: 0; }
  }
  @keyframes call-ripple {
    0% { transform: scale(1); opacity: 0.45; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  @keyframes call-shake {
    0%, 55%, 100% { transform: rotate(0deg); }
    10% { transform: rotate(-16deg); }
    20% { transform: rotate(16deg); }
    30% { transform: rotate(-12deg); }
    40% { transform: rotate(12deg); }
    48% { transform: rotate(-6deg); }
  }
  @keyframes call-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(48, 209, 88, 0.55); }
    50% { box-shadow: 0 0 0 9px rgba(48, 209, 88, 0); }
  }
  @keyframes call-breathe {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }
  @keyframes call-bump {
    0% { transform: scale(1); }
    40% { transform: scale(1.035); }
    100% { transform: scale(1); }
  }
  @keyframes btn-pop {
    0% { opacity: 0; transform: scale(0.4); }
    70% { transform: scale(1.12); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes text-swap {
    0% { opacity: 0; transform: translateY(6px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(0.35); }
    50% { transform: scaleY(1); }
  }
  .call-card-in { animation: call-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .call-card-out { animation: call-out 0.38s cubic-bezier(0.55, 0, 0.7, 0.2) both; }
  .call-card-bump { animation: call-bump 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
  .call-ripple { animation: call-ripple 1.8s ease-out infinite; }
  .call-ripple-2 { animation: call-ripple 1.8s ease-out 0.9s infinite; }
  .call-shake { animation: call-shake 1.6s ease-in-out 0.8s infinite; transform-origin: center; }
  .call-glow { animation: call-glow 1.6s ease-out 0.8s infinite; }
  .call-breathe { animation: call-breathe 1.8s ease-in-out infinite; }
  .btn-pop { animation: btn-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .btn-pop-2 { animation: btn-pop 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both; }
  .text-swap { animation: text-swap 0.35s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .wave-bar { transform-origin: center; animation: wave 0.9s ease-in-out infinite; }
  .wave-bar:nth-child(2) { animation-delay: 0.15s; }
  .wave-bar:nth-child(3) { animation-delay: 0.3s; }
  .wave-bar:nth-child(4) { animation-delay: 0.45s; }
  @media (prefers-reduced-motion: reduce) {
    .call-ripple, .call-ripple-2, .call-shake, .call-glow, .call-breathe, .wave-bar { animation: none; }
  }
`;

type CallProps = {
  /** Caller name shown on the card */
  caller?: string;
  /** Voice recording played once the player answers */
  voiceSrc?: string;
  onEnd?: () => void;
};

const Call = ({ caller = "UNKNOWN", voiceSrc, onEnd }: CallProps) => {
  const [phase, setPhase] = useState<Phase>("ringing");
  const [anim, setAnim] = useState<Anim>("in");
  const [answered, setAnswered] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setAnim((a) => (a === "in" ? "idle" : a)), 800);
    return () => clearTimeout(id);
  }, []);

  // Ringtone
  useEffect(() => {
    const audio = new Audio(RINGTONE_SRC);
    audio.volume = 0.5;
    audio.loop = true;
    audioRef.current = audio;

    let started = false;

    const events = ["pointerdown", "keydown", "touchstart", "click"] as const;

    const removeListeners = () => {
      events.forEach((e) => window.removeEventListener(e, unlock));
    };

    const start = () => {
      audio
        .play()
        .then(() => {
          started = true;
          removeListeners();
        })
        .catch(() => {});
    };

    function unlock() {
      if (!started) start();
    }

    start();
    events.forEach((e) => window.addEventListener(e, unlock));

    return () => {
      removeListeners();
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  // Stop the voice recording if the component unmounts mid-call
  useEffect(() => {
    return () => {
      const voice = voiceRef.current;
      if (voice) {
        voice.onended = null;
        voice.pause();
      }
      voiceRef.current = null;
    };
  }, []);

  // Mute and speaker buttons control the recording
  useEffect(() => {
    if (voiceRef.current) voiceRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (voiceRef.current) voiceRef.current.volume = speaker ? 1 : 0.6;
  }, [speaker]);

  useEffect(() => {
    if (phase !== "connected") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "gone") onEnd?.();
  }, [phase, onEnd]);

  const stopSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const stopVoice = () => {
    const voice = voiceRef.current;
    if (!voice) return;
    voice.onended = null;
    voice.pause();
    voice.currentTime = 0;
  };

  const hangUp = () => {
    if (phase === "exiting" || phase === "gone") return;
    stopSound();
    stopVoice();
    setPhase("exiting");
    setAnim("out");
    setTimeout(() => setPhase("gone"), 380);
  };

  const accept = () => {
    if (phase !== "ringing") return;
    stopSound(); // stops the ringtone

    if (voiceSrc) {
      const voice = new Audio(voiceSrc);
      voice.muted = muted;
      voice.volume = speaker ? 1 : 0.6;
      voice.onended = hangUp; // call ends when the recording finishes
      voiceRef.current = voice;
      voice.play().catch(() => {});
    }

    setAnswered(true);
    setPhase("connected");
    setAnim("bump");
    setTimeout(() => setAnim((a) => (a === "bump" ? "idle" : a)), 420);
  };

  if (phase === "gone") return null;

  return (
    <div className="w-full flex justify-center pointer-events-none">
      <style>{styles}</style>

      <div
        className={`w-full max-w-sm rounded-2xl overflow-hidden bg-black/60 backdrop-blur-2xl border border-white/20 shadow-lg p-3 ${animClass[anim]}`}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 shrink-0">
            {!answered && (
              <>
                <span className="call-ripple absolute inset-0 rounded-full bg-white/30" />
                <span className="call-ripple-2 absolute inset-0 rounded-full bg-white/20" />
              </>
            )}
            <div className="relative w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="m-0 truncate text-gray-200 text-base">{caller}</h2>
            {answered ? (
              <div key="timer" className="text-swap flex items-center gap-2">
                <p className="m-0 text-[#30D158] text-xs tabular-nums">
                  {phase === "exiting" ? "Call ended" : formatTime(seconds)}
                </p>
                {phase === "connected" && (
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="wave-bar w-0.5 h-3 rounded-full bg-[#30D158]" />
                    <span className="wave-bar w-0.5 h-3 rounded-full bg-[#30D158]" />
                    <span className="wave-bar w-0.5 h-3 rounded-full bg-[#30D158]" />
                    <span className="wave-bar w-0.5 h-3 rounded-full bg-[#30D158]" />
                  </div>
                )}
              </div>
            ) : (
              <p
                key="ringing"
                className="call-breathe m-0 text-gray-400 text-xs"
              >
                Incoming call
              </p>
            )}
          </div>

          {answered ? (
            <div
              key="connected-actions"
              className="flex items-center gap-2 pointer-events-auto"
            >
              <button
                aria-label="Mute"
                aria-pressed={muted}
                onClick={() => setMuted((v) => !v)}
                className={`btn-pop w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  muted ? "bg-white text-black" : "bg-white/15 text-white"
                }`}
              >
                {muted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                aria-label="Speaker"
                aria-pressed={speaker}
                onClick={() => setSpeaker((v) => !v)}
                className={`btn-pop-2 w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  speaker ? "bg-white text-black" : "bg-white/15 text-white"
                }`}
              >
                <Volume2 size={18} />
              </button>

              <button
                aria-label="End call"
                onClick={hangUp}
                className="btn-pop-2 w-10 h-10 shrink-0 rounded-full bg-[#FF453A] text-white flex items-center justify-center transition-transform duration-150 active:scale-90"
              >
                <PhoneOff size={18} />
              </button>
            </div>
          ) : (
            <div
              key="ringing-actions"
              className="flex items-center gap-2 pointer-events-auto"
            >
              <button
                aria-label="Decline call"
                onClick={hangUp}
                className="w-10 h-10 shrink-0 rounded-full bg-[#FF453A] text-white flex items-center justify-center transition-transform duration-150 active:scale-90"
              >
                <PhoneOff size={18} />
              </button>

              <button
                aria-label="Accept call"
                onClick={accept}
                className="call-glow w-10 h-10 shrink-0 rounded-full bg-[#30D158] text-white flex items-center justify-center transition-transform duration-150 active:scale-90"
              >
                <span className="call-shake flex items-center justify-center">
                  <Phone size={18} />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Call;
