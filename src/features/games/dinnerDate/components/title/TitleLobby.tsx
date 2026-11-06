import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import "./TitleLobby.css";
import { useNavigate } from "react-router-dom";

type LampState = "off" | "on" | "lean";

interface Size {
  w: number;
  h: number;
}

interface Smoke {
  id: number;
  lamp: number;
}

interface Drop {
  x: number;
  y: number;
  z: number;
  l: number;
  v: number;
}

interface Splash {
  x: number;
  y: number;
  r: number;
  a: number;
}

interface Flash {
  v: number;
  big: boolean;
  d: number; // transition duration (seconds) used to fade the flash
}

const IW = 1672;
const IH = 941;
const BASE = 358;
const XS = [659, 719, 778, 838, 897, 957, 1016];
const TITLE = "SEVEN LAMPS".split("");

// Timeline (seconds) of the opening sequence
const LIGHT_START = 1.0; // first candle lights
const LIGHT_STEP = 0.4; // gap between candles
const THE_AT = 3.2;
const TITLE_AT = 3.9;
const LETTER_STEP = 0.13;
const SUB_AT = 6.3;
const BTN_AT = 7.2;

const flamePath = "M10 0C13 12 20 24 20 37A10 13 0 0 1 0 37C0 24 7 12 10 0Z";

const flameVariants = {
  off: { scale: 0, rotate: 0, scaleX: 0, scaleY: 0 },
  on: {
    scale: 1,
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 12 },
  },
  lean: {
    scale: 1,
    rotate: 22,
    scaleX: 0.82,
    scaleY: 0.62,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

const SevenLampsTitleLobby = () => {
  const still = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const acRef = useRef<AudioContext | null>(null);
  const noiseRef = useRef<AudioBuffer | null>(null);
  const soundRef = useRef(false);
  const windRef = useRef({ cur: 0.22, target: 0.22 });
  const timersRef = useRef<number[]>([]);
  const smokeId = useRef(0);
  const ambientGainRef = useRef<GainNode | null>(null);
  const strikeRef = useRef<(loop: boolean) => void>(() => {});
  const leavingRef = useRef(false);
  const navigate = useNavigate();

  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  const [lamps, setLamps] = useState<LampState[]>(() => XS.map(() => "off"));
  // a candle only becomes visible once its flame has been lit for the first time
  const [born, setBorn] = useState<boolean[]>(() => XS.map(() => false));
  const [smokes, setSmokes] = useState<Smoke[]>([]);
  const [flash, setFlash] = useState<Flash>({ v: 0, big: false, d: 0.03 });
  const [soundOn, setSoundOn] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const sc = size.w ? Math.max(size.w / IW, size.h / IH) : 1;

  // delays collapse to ~0 when the user prefers reduced motion
  const dl = (s: number) => (still ? 0 : s);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  const setLamp = useCallback((i: number, state: LampState) => {
    if (leavingRef.current && state === "on") return;
    setLamps((prev) => prev.map((s, j) => (j === i ? state : s)));
    if (state === "on") {
      setBorn((prev) =>
        prev[i] ? prev : prev.map((b, j) => (j === i ? true : b)),
      );
    }
  }, []);

  const leanLamp = useCallback((i: number) => {
    setLamps((prev) =>
      prev.map((s, j) => (j === i && s === "on" ? "lean" : s)),
    );
  }, []);

  const snuff = useCallback(
    (i: number) => {
      setLamp(i, "off");
      smokeId.current += 1;
      setSmokes((prev) => [...prev, { id: smokeId.current, lamp: i }]);
    },
    [setLamp],
  );

  const ensureAudio = useCallback(() => {
    if (acRef.current) return acRef.current;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ac = new Ctor();
    const noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    acRef.current = ac;
    noiseRef.current = noise;
    const src = ac.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = 1800;
    f.Q.value = 0.5;
    const g = ac.createGain();
    g.gain.value = 0.12;
    ambientGainRef.current = g;
    src.connect(f).connect(g).connect(ac.destination);
    src.start();
    return ac;
  }, []);

  const boom = useCallback((delay: number, power: number) => {
    const ac = acRef.current;
    if (!soundRef.current || !ac) return;
    const t = ac.currentTime + delay;
    const len = ac.sampleRate * 3.2;
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const a = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i += 1) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      a[i] = last * 3.5 * Math.pow(1 - i / len, 2.2);
    }
    const s = ac.createBufferSource();
    s.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(420, t);
    f.frequency.exponentialRampToValueAtTime(70, t + 2.8);
    const g = ac.createGain();
    g.gain.value = power;
    s.connect(f).connect(g).connect(ac.destination);
    s.start(t);
  }, []);

  // sharp "crack" that leads the thunder rumble
  const crack = useCallback(() => {
    const ac = acRef.current;
    const noise = noiseRef.current;
    if (!soundRef.current || !ac || !noise) return;
    const t = ac.currentTime;
    const s = ac.createBufferSource();
    s.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 900;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    s.connect(f).connect(g).connect(ac.destination);
    s.start(t);
    s.stop(t + 0.8);
  }, []);

  const whoosh = useCallback(() => {
    const ac = acRef.current;
    const noise = noiseRef.current;
    if (!soundRef.current || !ac || !noise) return;
    const t = ac.currentTime;
    const s = ac.createBufferSource();
    s.buffer = noise;
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(1300, t + 1);
    f.frequency.exponentialRampToValueAtTime(350, t + 2.2);
    const g = ac.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.35, t + 0.9);
    g.gain.linearRampToValueAtTime(0, t + 2.3);
    s.connect(f).connect(g).connect(ac.destination);
    s.start(t);
    s.stop(t + 2.4);
  }, []);

  const toggleSound = useCallback(() => {
    try {
      const ac = ensureAudio();
      const next = !soundRef.current;
      soundRef.current = next;
      if (next) void ac.resume();
      else void ac.suspend();
      setSoundOn(next);
    } catch {
      soundRef.current = false;
      setSoundOn(false);
    }
  }, [ensureAudio]);

  const strike = useCallback(
    (loop: boolean) => {
      if (leavingRef.current) return;
      const big = Math.random() < 0.4;
      const pattern = big ? [1, 0.15, 0.8, 0.1, 0.55] : [0.7, 0.1, 0.4];
      let t = 0;
      pattern.forEach((v) => {
        later(() => setFlash({ v, big, d: 0.03 }), t);
        t += 50 + Math.random() * 60;
        later(() => setFlash({ v: 0, big, d: 0.03 }), t);
        t += 40 + Math.random() * 90;
      });
      boom(0.5 + Math.random() * 1.8, big ? 1 : 0.55);
      if (loop && !still)
        later(() => strikeRef.current(true), 5000 + Math.random() * 9000);
    },
    [boom, later, still],
  );

  // Keep strikeRef in sync with the latest strike
  useEffect(() => {
    strikeRef.current = strike;
  }, [strike]);

  // The big one: violent flicker, long fade-out, crack + rumble
  const thunder = useCallback(() => {
    const seq: [number, number][] = [
      [1, 0],
      [0.15, 110],
      [0.9, 200],
      [0.25, 300],
      [1, 380],
    ];
    seq.forEach(([v, t]) =>
      later(() => setFlash({ v, big: true, d: 0.03 }), t),
    );
    // slow fade back to dark
    later(() => setFlash({ v: 0, big: true, d: 1.8 }), 520);
    crack();
    boom(0.05, 1.5);
    boom(1.1, 1);
  }, [boom, crack, later]);

  const handleStart = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);

    if (!soundRef.current) toggleSound();
    thunder();

    // the thunder-wind blows every candle out
    XS.forEach((_, i) => {
      later(() => leanLamp(i), 60 + i * 40);
      later(() => snuff(i), 320 + i * 45);
    });

    // fade the rain bed out
    const ac = acRef.current;
    const gain = ambientGainRef.current;
    const fadeMs = 2200;
    if (ac && gain && soundRef.current) {
      const now = ac.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
    }

    // after the flash fades and the screen goes black, leave
    later(() => navigate("../intro", { replace: true }), 2900);
  }, [thunder, toggleSound, leanLamp, snuff, later, navigate]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const wind = windRef.current;
    if (still) {
      // Defer so we don't call setState synchronously inside the effect body
      later(() => {
        setLamps(XS.map(() => "on"));
        setBorn(XS.map(() => true));
      }, 0);
    } else {
      XS.forEach((_, i) =>
        later(() => setLamp(i, "on"), (LIGHT_START + i * LIGHT_STEP) * 1000),
      );
    }

    const gust = () => {
      if (leavingRef.current) return;
      wind.target = 0.9;
      whoosh();
      XS.forEach((_, i) => {
        later(() => leanLamp(i), 250 + i * 70);
        later(() => snuff(i), 900 + i * 85);
      });
      const relight = 900 + 6 * 85 + 4000;
      XS.forEach((_, i) => later(() => setLamp(i, "on"), relight + i * 55));
      later(() => {
        wind.target = 0.22;
      }, 2300);
      later(gust, relight + 9000 + Math.random() * 6000);
    };

    if (!still) later(gust, 11000);
    later(() => strike(true), 2500);

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, [still, later, setLamp, leanLamp, snuff, whoosh, strike]);

  useEffect(() => {
    const canvas = rainRef.current;
    if (!canvas || !size.w) return;
    const { w, h } = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mk = (): Drop => {
      const z = Math.random();
      return {
        x: Math.random() * w * 1.4 - w * 0.2,
        y: Math.random() * h,
        z,
        l: 10 + z * 28,
        v: 9 + z * 20,
      };
    };

    const drops = Array.from({ length: Math.round((w * h) / 2600) }, mk);
    const splash: Splash[] = [];
    const wind = windRef.current;
    let raf = 0;

    const frame = () => {
      wind.cur += (wind.target - wind.cur) * 0.05;
      const g = Math.max(0, Math.min(1, (wind.cur - 0.22) / 0.68));
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const d of drops) {
        ctx.strokeStyle = `rgba(185,205,235,${0.14 + d.z * 0.42})`;
        ctx.lineWidth = 0.5 + d.z * 1.1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * wind.cur, d.y + d.l * (1 - g * 0.25));
        ctx.stroke();
        if (!still) {
          d.y += d.v * (1 + g * 0.4);
          d.x += d.v * wind.cur * (1 + g * 0.4);
        }
        if (d.y > h) {
          if (d.y > h * 0.78 && Math.random() < 0.35 && splash.length < 160) {
            splash.push({
              x: d.x,
              y: h * (0.8 + Math.random() * 0.2),
              r: 1,
              a: 0.5,
            });
          }
          d.y = -d.l;
          d.x = Math.random() * w * 1.4 - w * 0.2;
        }
      }
      for (let i = splash.length - 1; i >= 0; i -= 1) {
        const s = splash[i];
        ctx.strokeStyle = `rgba(200,215,240,${s.a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r * 2.2, s.r * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        s.r += 0.5;
        s.a -= 0.03;
        if (s.a <= 0) splash.splice(i, 1);
      }
      raf = requestAnimationFrame(frame);
    };

    frame();
    return () => cancelAnimationFrame(raf);
  }, [size, still]);

  const brightness = 1 + flash.v * (flash.big ? 0.9 : 0.5);

  // how much candlelight is currently on the title (dims when the wind blows)
  const litRatio =
    lamps.reduce((n, s) => n + (s === "on" ? 1 : s === "lean" ? 0.5 : 0), 0) /
    XS.length;

  const letterVariants: Variants = {
    hidden: { opacity: 0, filter: "blur(14px)", y: 18, scale: 1.15 },
    show: (i: number) => ({
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      scale: 1,
      transition: {
        delay: dl(TITLE_AT + i * LETTER_STEP),
        duration: dl(1.5),
        ease: "easeOut" as const,
      },
    }),
  };

  return (
    <div ref={stageRef} className="fixed inset-0 overflow-hidden bg-[#04070a]">
      <motion.div
        className="absolute"
        style={
          {
            width: IW * sc,
            height: IH * sc,
            left: (size.w - IW * sc) / 2,
            top: (size.h - IH * sc) / 2,
            transformOrigin: "50% 40%",
            ["--s" as string]: sc,
          } as CSSProperties
        }
        initial={{ scale: 1 }}
        animate={still ? { scale: 1 } : { scale: 1.05 }}
        transition={{
          duration: 26,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${"/games/theSevenLamps/seven-lamps.avif"})`,
            backgroundSize: "100% 100%",
          }}
          animate={{ filter: `brightness(${brightness})` }}
          transition={{ duration: flash.d }}
        />

        {/* ---------- Candles + flames ---------- */}
        <div>
          {XS.map((x, i) => (
            <div
              key={x}
              className="lamp"
              style={
                {
                  left: `${(x / IW) * 100}%`,
                  top: `${(BASE / IH) * 100}%`,
                  ["--d" as string]: `${(0.7 + ((i * 37) % 50) / 100).toFixed(2)}s`,
                } as CSSProperties
              }
            >
              {/* Candle body: invisible until its flame is first lit */}
              <motion.div
                className="candle"
                aria-hidden="true"
                initial={{ opacity: 0, y: 10 * sc, filter: "brightness(0.3)" }}
                animate={{
                  opacity: born[i] ? 1 : 0,
                  y: born[i] ? 0 : 10 * sc,
                  filter: `brightness(${
                    lamps[i] === "on" ? 1 : lamps[i] === "lean" ? 0.8 : 0.3
                  })`,
                }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              >
                <div className="candle-wick" />
                <div className="candle-top" />
                <div className="candle-drip" />
                {/* warm light spilling over the wax while the flame burns */}
                <motion.div
                  className="candle-lit"
                  initial={false}
                  animate={{
                    opacity:
                      lamps[i] === "on" ? 1 : lamps[i] === "lean" ? 0.5 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>

              <motion.div
                className="glow"
                initial={false}
                animate={{
                  opacity:
                    lamps[i] === "on" ? 1 : lamps[i] === "lean" ? 0.45 : 0,
                }}
                transition={{ duration: lamps[i] === "off" ? 0.2 : 0.5 }}
              >
                <div className="glow-core" />
              </motion.div>
              <motion.div
                className="flame"
                style={{ originX: 0.5, originY: 1 }}
                initial={false}
                variants={flameVariants}
                animate={lamps[i]}
              >
                <svg viewBox="0 0 20 50">
                  <defs>
                    <radialGradient id={`fg${i}`} cx="50%" cy="78%" r="65%">
                      <stop offset="0" stopColor="#fffbe6" />
                      <stop offset=".3" stopColor="#ffd270" />
                      <stop offset=".65" stopColor="#ff8a1f" />
                      <stop offset="1" stopColor="#ff5a00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <path d={flamePath} fill={`url(#fg${i})`} />
                </svg>
              </motion.div>
              <AnimatePresence>
                {smokes
                  .filter((s) => s.lamp === i)
                  .map((s) => (
                    <motion.div
                      key={s.id}
                      className="smoke"
                      initial={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }}
                      animate={{
                        x: 60 * sc,
                        y: -34 * sc,
                        scaleX: 2.6,
                        scaleY: 3.2,
                        opacity: 0,
                      }}
                      transition={{ duration: 1.6, ease: "easeOut" }}
                      onAnimationComplete={() =>
                        setSmokes((prev) => prev.filter((p) => p.id !== s.id))
                      }
                    />
                  ))}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* ---------- Title ---------- */}
        <motion.div
          className="title-wrap"
          initial={false}
          animate={{ filter: `brightness(${0.55 + 0.45 * litRatio})` }}
          transition={{ duration: 0.6 }}
        >
          {/* soft warm bloom that fades in behind the title */}
          <motion.div
            className="title-bloom"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: dl(THE_AT), duration: dl(4), ease: "easeOut" }}
          />

          <motion.span
            className="title-the"
            initial={{ opacity: 0, letterSpacing: "1em", filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              letterSpacing: "0.55em",
              filter: "blur(0px)",
            }}
            transition={{
              delay: dl(THE_AT),
              duration: dl(2.6),
              ease: "easeOut",
            }}
          >
            THE
          </motion.span>

          <motion.h1
            className="title-main"
            aria-label="SEVEN LAMPS"
            initial={{ letterSpacing: "0.2em" }}
            animate={{ letterSpacing: "0.07em" }}
            transition={{
              delay: dl(TITLE_AT),
              duration: dl(5),
              ease: "easeOut",
            }}
          >
            {TITLE.map((ch, i) =>
              ch === " " ? (
                <span key={i} className="title-gap" aria-hidden="true" />
              ) : (
                <motion.span
                  key={i}
                  className="title-letter"
                  aria-hidden="true"
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="show"
                >
                  {ch}
                </motion.span>
              ),
            )}
          </motion.h1>

          <motion.p
            className="title-sub"
            initial={{
              opacity: 0,
              letterSpacing: "0.65em",
              filter: "blur(6px)",
            }}
            animate={{
              opacity: 1,
              letterSpacing: "0.3em",
              filter: "blur(0px)",
            }}
            transition={{
              delay: dl(SUB_AT),
              duration: dl(2.8),
              ease: "easeOut",
            }}
          >
            A CHAT-BASED HORROR MYSTERY
          </motion.p>
        </motion.div>
      </motion.div>

      <canvas
        ref={rainRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <motion.div
        className="flash-layer pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: flash.v * (flash.big ? 0.9 : 0.6) }}
        transition={{ duration: flash.d }}
      />

      <div className="vig pointer-events-none absolute inset-0" />

      {/* black curtain: fades in from black on load, back to black on exit */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        initial={{ opacity: 1 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={
          leaving
            ? { delay: 1.0, duration: 1.6, ease: "easeIn" }
            : { duration: still ? 0.3 : 2.8, ease: "easeOut" }
        }
      />

      <motion.button
        type="button"
        className="snd-btn absolute"
        aria-pressed={soundOn}
        onClick={toggleSound}
        whileTap={{ scale: 0.94 }}
      >
        {`Sound: ${soundOn ? "on" : "off"}`}
      </motion.button>

      <div className="absolute inset-x-0 bottom-[9%] flex justify-center">
        <motion.button
          type="button"
          className="start-btn"
          onClick={handleStart}
          disabled={leaving}
          initial={{ opacity: 0, y: 24 }}
          animate={leaving ? { opacity: 0, y: 0 } : { opacity: 1, y: 0 }}
          transition={
            leaving
              ? { duration: 0.3 }
              : { delay: dl(BTN_AT), duration: dl(1.4), ease: "easeOut" }
          }
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Enter the Lobby
        </motion.button>
      </div>
    </div>
  );
};

export default SevenLampsTitleLobby;
