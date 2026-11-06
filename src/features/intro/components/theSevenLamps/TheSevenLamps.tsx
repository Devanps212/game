import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type TargetAndTransition,
} from "framer-motion";
import "./TheSevenLamps.css";

type Tone = "mist" | "desk" | "road" | "dark" | "ember" | "none";
type SceneKind = "voice" | "dateline";
type Phase = "pre" | "title" | "post" | "end";
type RunMode = "full" | "title" | "end";

interface TextLine {
  t: string;
  e?: boolean;
}

interface DraftLine {
  draft: string;
  label: string;
}

type SceneItem = string | TextLine | DraftLine;

interface Scene {
  tone: Tone;
  kind: SceneKind;
  lines: SceneItem[];
}

interface TitleState {
  shown: boolean;
  lit: number;
  the: boolean;
  w0: boolean;
  w1: boolean;
  tag: boolean;
  alive: boolean;
  gone: boolean;
}

interface LineState {
  id: number;
  text: string;
  hard: boolean;
}

interface TypedBlock {
  id: number;
  kind: "draft" | "dateline";
  label?: string;
  rows: string[];
  caret: number;
}

interface OpeningView {
  tone: Tone;
  line: LineState | null;
  typed: TypedBlock | null;
  title: TitleState;
  blackout: boolean;
  controls: boolean;
  done: boolean;
}

interface TypeRowsOptions {
  speed: number;
  label?: string;
  lead?: number;
  between?: number;
  tail: number;
}

type AmbientLevel = readonly [number, number, number];

interface AudioEngine {
  start: () => void;
  setAmbient: (name: Tone) => void;
  tick: () => void;
  hit: () => void;
  ignite: () => void;
  boom: () => void;
  fadeOut: () => void;
  suspend: () => void;
  setMuted: (value: boolean) => void;
  dispose: () => void;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const TITLE = {
  the: "The",
  words: ["Seven", "Lamps"],
  tag: "A chat-based horror mystery",
} as const;

const BEFORE_TITLE: Scene[] = [
  {
    tone: "mist",
    kind: "voice",
    lines: [
      "Munnar sleeps beneath the mist.",
      "But something in these hills is awake.",
      "A series of murders has shaken the town.",
      "No witnesses. No motive. No answers.",
      "Only whispers.",
      "Whispers that a secret cult is behind it all.",
    ],
  },
  {
    tone: "dark",
    kind: "voice",
    lines: [
      "Some doors are better left closed.",
      { t: "Some lamps are better left unlit.", e: true },
    ],
  },
];

const AFTER_TITLE: Scene[] = [
  {
    tone: "desk",
    kind: "dateline",
    lines: ["KOCHI, KERALA", "10:15 PM"],
  },
  {
    tone: "desk",
    kind: "voice",
    lines: [
      "At your news company office, you work late into the night.",
      "You are working on the article about the killings in Munnar.",
      {
        draft: "THE MUNNAR CULT: WHO IS BEHIND THE KILLINGS?",
        label: "News desk · unfiled draft",
      },
    ],
  },
  {
    tone: "road",
    kind: "voice",
    lines: [
      "Your best friend and colleague, Vishnu, has travelled to Munnar.",
      "A fellow journalist, he went alone to uncover the truth about the cult.",
      "Miles apart, all that connects you is a chat window.",
      { t: "Every message you send will matter.", e: true },
    ],
  },
];

const T = { in: 1250, out: 950, gap: 420 } as const;

const hold = (text: string): number =>
  Math.max(1600, 650 + text.trim().split(/\s+/).length * 290);

const AMBIENT: Record<Tone, AmbientLevel> = {
  mist: [0.22, 520, 0.05],
  desk: [0.05, 320, 0.03],
  road: [0.3, 950, 0.05],
  dark: [0.03, 260, 0.08],
  ember: [0.04, 260, 0.1],
  none: [0, 300, 0],
};

/* ------------------------------------------------------------------ */
/* Audio engine                                                        */
/* ------------------------------------------------------------------ */

const createAudioEngine = (
  onLocked: (locked: boolean) => void,
): AudioEngine => {
  let ac: AudioContext | null = null;
  let master: GainNode | null = null;
  let brown: AudioBuffer | null = null;
  let white: AudioBuffer | null = null;
  let windGain: GainNode | null = null;
  let windFilter: BiquadFilterNode | null = null;
  let droneGain: GainNode | null = null;
  let muted = false;
  let currentAmbient: Tone = "none";

  const running = (): boolean => Boolean(ac) && ac!.state === "running";
  const notify = (): void => onLocked(Boolean(ac) && ac!.state !== "running");

  const setAmbient = (name: Tone): void => {
    currentAmbient = name;
    if (!ac || !windGain || !windFilter || !droneGain) return;
    const level = AMBIENT[name] || AMBIENT.none;
    const t = ac.currentTime;
    windGain.gain.setTargetAtTime(level[0], t, 1.2);
    windFilter.frequency.setTargetAtTime(level[1], t, 1.2);
    droneGain.gain.setTargetAtTime(level[2], t, 1.5);
  };

  const resume = (): void => {
    if (ac && ac.state !== "running") {
      const result = ac.resume();
      if (result && result.then) {
        result.then(
          () => {
            setAmbient(currentAmbient);
            notify();
          },
          () => {},
        );
      }
    }
    notify();
  };

  const build = (): void => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const ctx = new Context();
    ac = ctx;

    const masterNode = ctx.createGain();
    masterNode.gain.value = muted ? 0 : 0.9;
    masterNode.connect(ctx.destination);
    master = masterNode;
    ctx.onstatechange = notify;

    const length = ctx.sampleRate * 4;
    const brownBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const brownData = brownBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      brownData[i] = last * 3.5;
    }
    brown = brownBuffer;

    const whiteBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const whiteData = whiteBuffer.getChannelData(0);
    for (let i = 0; i < whiteData.length; i += 1)
      whiteData[i] = Math.random() * 2 - 1;
    white = whiteBuffer;

    const wind = ctx.createBufferSource();
    wind.buffer = brownBuffer;
    wind.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    windFilter = filter;
    const wGain = ctx.createGain();
    wGain.gain.value = 0;
    windGain = wGain;
    wind.connect(filter);
    filter.connect(wGain);
    wGain.connect(masterNode);
    wind.start();

    const dGain = ctx.createGain();
    dGain.gain.value = 0;
    dGain.connect(masterNode);
    droneGain = dGain;
    const pitches = [55, 55.8, 82.4];
    pitches.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 2 ? "triangle" : "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = index === 2 ? 0.3 : 1;
      osc.connect(gain);
      gain.connect(dGain);
      osc.start();
    });
  };

  const start = (): void => {
    if (!ac) {
      if (!(window.AudioContext || window.webkitAudioContext)) return;
      try {
        build();
      } catch {
        ac = null;
      }
    }
    resume();
  };

  const burst = (
    buffer: AudioBuffer | null,
    duration: number,
    type: BiquadFilterType,
    frequency: number,
    volume: number,
  ): void => {
    if (!ac || !master || !running() || !buffer) return;
    const source = ac.createBufferSource();
    source.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = ac.createGain();
    const t = ac.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(
      t,
      Math.random() * (buffer.duration - duration - 0.1),
      duration + 0.05,
    );
  };

  const thump = (frequency: number, duration: number, volume: number): void => {
    if (!ac || !master || !running()) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const t = ac.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.5, t + duration);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  };

  return {
    start,
    setAmbient,
    tick: () => burst(white, 0.03, "highpass", 2400, 0.22),
    hit: () => thump(70, 1.1, 0.45),
    ignite: () => {
      burst(white, 0.6, "bandpass", 1400, 0.12);
      thump(90, 0.4, 0.25);
    },
    boom: () => {
      thump(48, 2.6, 0.9);
      burst(brown, 1.8, "lowpass", 220, 0.7);
    },
    fadeOut: () => {
      if (!ac || !master) return;
      const t = ac.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.setTargetAtTime(0, t, 1.1);
    },
    suspend: () => {
      if (ac && running()) ac.suspend().catch(() => {});
    },
    setMuted: (value) => {
      muted = value;
      if (ac && master)
        master.gain.setTargetAtTime(value ? 0 : 0.9, ac.currentTime, 0.1);
    },
    dispose: () => {
      if (!ac) return;
      ac.onstatechange = null;
      ac.close().catch(() => {});
      ac = null;
    },
  };
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const makeGrain = (): string | null => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const image = ctx.createImageData(128, 128);
    for (let i = 0; i < image.data.length; i += 4) {
      const value = Math.random() * 255;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = Math.random() * 90;
    }
    ctx.putImageData(image, 0, 0);
    return canvas.toDataURL();
  } catch {
    return null;
  }
};

const ABORT = Symbol("abort");

const TITLE_IDLE: TitleState = {
  shown: false,
  lit: 0,
  the: false,
  w0: false,
  w1: false,
  tag: false,
  alive: false,
  gone: false,
};

const IDLE: OpeningView = {
  tone: "none",
  line: null,
  typed: null,
  title: TITLE_IDLE,
  blackout: false,
  controls: true,
  done: false,
};

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(ABORT);
      return;
    }
    const onAbort = (): void => {
      clearTimeout(id);
      reject(ABORT);
    };
    const id = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });

const isDraft = (item: SceneItem): item is DraftLine =>
  typeof item !== "string" && "draft" in item;

/* ------------------------------------------------------------------ */
/* Opening sequence hook                                               */
/* ------------------------------------------------------------------ */

const useOpening = (
  engine: AudioEngine,
  onComplete?: () => void,
): { view: OpeningView; skip: () => void } => {
  const [view, setView] = useState<OpeningView>(IDLE);
  const abortRef = useRef<AbortController | null>(null);
  const phaseRef = useRef<Phase>("pre");
  const idRef = useRef(0);
  const completeRef = useRef<(() => void) | undefined>(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  const run = useCallback(
    async (mode: RunMode): Promise<void> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const wait = (ms: number): Promise<void> => sleep(ms, controller.signal);
      const patch = (p: Partial<OpeningView>): void =>
        setView((v) => ({ ...v, ...p }));
      const patchTitle = (p: Partial<TitleState>): void =>
        setView((v) => ({ ...v, title: { ...v.title, ...p } }));
      const nextId = (): number => {
        idRef.current += 1;
        return idRef.current;
      };

      const typeRows = async (
        kind: TypedBlock["kind"],
        rows: string[],
        { speed, label, lead = 0, between = 0, tail }: TypeRowsOptions,
      ): Promise<void> => {
        let block: TypedBlock = {
          id: nextId(),
          kind,
          label,
          rows: rows.map(() => ""),
          caret: 0,
        };
        patch({ typed: block });
        if (lead) await wait(lead);
        for (let i = 0; i < rows.length; i += 1) {
          for (const ch of rows[i]) {
            block = {
              ...block,
              caret: i,
              rows: block.rows.map((row, j) => (j === i ? row + ch : row)),
            };
            patch({ typed: block });
            if (ch !== " ") engine.tick();
            await wait(speed + Math.random() * 45);
          }
          if (i === 0 && between) await wait(between);
        }
        await wait(tail);
        patch({ typed: null });
        await wait(T.out + T.gap);
      };

      const showItem = async (item: SceneItem): Promise<void> => {
        if (isDraft(item)) {
          await typeRows("draft", [item.draft], {
            speed: 60,
            label: item.label,
            lead: 700,
            tail: 2200,
          });
          return;
        }
        const o: TextLine = typeof item === "string" ? { t: item } : item;
        patch({ line: { id: nextId(), text: o.t, hard: Boolean(o.e) } });
        if (o.e) engine.hit();
        await wait(T.in);
        await wait(hold(o.t));
        patch({ line: null });
        await wait(T.out + T.gap);
      };

      const runScene = async (scene: Scene): Promise<void> => {
        patch({ tone: scene.tone });
        engine.setAmbient(scene.tone);
        await wait(900);
        if (scene.kind === "dateline") {
          await typeRows("dateline", scene.lines as string[], {
            speed: 80,
            between: 500,
            tail: 2000,
          });
        } else {
          for (const item of scene.lines) await showItem(item);
        }
        await wait(600);
      };

      const runTitle = async (): Promise<void> => {
        patch({ tone: "dark" });
        engine.setAmbient("dark");
        await wait(1400);
        patchTitle({ shown: true });
        for (let i = 0; i < 7; i += 1) {
          await wait(i ? 760 : 900);
          patchTitle({ lit: i + 1 });
          engine.ignite();
        }
        patch({ tone: "ember" });
        engine.setAmbient("ember");
        await wait(1700);
        engine.boom();
        patchTitle({ the: true });
        await wait(900);
        patchTitle({ w0: true });
        await wait(700);
        patchTitle({ w1: true });
        await wait(2600);
        patchTitle({ alive: true, tag: true });
        await wait(3200);
        patchTitle({ gone: true });
        await wait(1800);
        patchTitle({ shown: false });
      };

      const runEnd = async (): Promise<void> => {
        patch({ done: true });
        await wait(1200);
        patch({ controls: false, blackout: true });
        await wait(1000);
        engine.fadeOut();
        await wait(3500);
        engine.suspend();
        window.dispatchEvent(new CustomEvent("opening:complete"));
        completeRef.current?.();
      };

      engine.start();
      try {
        if (mode === "end") {
          phaseRef.current = "end";
          setView({ ...IDLE, tone: "road" });
          engine.setAmbient("road");
          await runEnd();
          return;
        }
        setView(IDLE);
        engine.setAmbient("none");
        if (mode !== "title") {
          phaseRef.current = "pre";
          for (const scene of BEFORE_TITLE) await runScene(scene);
        }
        phaseRef.current = "title";
        await runTitle();
        phaseRef.current = "post";
        for (const scene of AFTER_TITLE) await runScene(scene);
        phaseRef.current = "end";
        await runEnd();
      } catch (error) {
        if (error !== ABORT) throw error;
      }
    },
    [engine],
  );

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fonts: Promise<unknown> =
      document.fonts && document.fonts.ready
        ? document.fonts.ready
        : Promise.resolve();
    Promise.race([
      fonts,
      new Promise<void>((resolve) => setTimeout(resolve, 2500)),
    ]).then(() => {
      if (cancelled) return;
      timer = setTimeout(() => {
        void run("full");
      }, 500);
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [run]);

  const skip = useCallback((): void => {
    void run(phaseRef.current === "pre" ? "title" : "end");
  }, [run]);

  return { view, skip };
};

/* ------------------------------------------------------------------ */
/* Presentational components                                           */
/* ------------------------------------------------------------------ */

const TONES: Tone[] = ["mist", "desk", "road", "ember"];

const Backdrop: FC<{ tone: Tone }> = ({ tone }) => (
  <>
    {TONES.map((name) => (
      <motion.div
        key={name}
        className={`sl-tone-${name} absolute inset-0`}
        initial={false}
        animate={{ opacity: tone === name ? 1 : 0 }}
        transition={{ duration: 2.2, ease: "easeInOut" }}
      />
    ))}
    <div className="sl-fog-a" />
    <div className="sl-fog-b" />
  </>
);

const FilmFrame: FC = () => {
  const grain = useMemo(() => makeGrain(), []);
  return (
    <>
      <div
        className="sl-grain"
        style={{ backgroundImage: grain ? `url(${grain})` : undefined }}
      />
      <div className="sl-vignette" />
      <div className="sl-bar top-0" />
      <div className="sl-bar bottom-0" />
    </>
  );
};

const hidden: TargetAndTransition = { opacity: 0, y: 10, filter: "blur(3px)" };
const shown: TargetAndTransition = { opacity: 1, y: 0, filter: "blur(0px)" };
const leaving: TargetAndTransition = {
  opacity: 0,
  y: -8,
  filter: "blur(2px)",
  transition: { duration: T.out / 1000, ease: "easeInOut" },
};

const Line: FC<{ line: LineState | null }> = ({ line }) => (
  <AnimatePresence>
    {line && (
      <motion.p
        key={line.id}
        className={`sl-narration col-start-1 row-start-1 ${
          line.hard ? "sl-line-hard" : "sl-line"
        }`}
        initial={hidden}
        animate={shown}
        exit={leaving}
        transition={{ duration: T.in / 1000, ease: "easeOut" }}
      >
        {line.text}
      </motion.p>
    )}
  </AnimatePresence>
);

const Typed: FC<{ typed: TypedBlock | null }> = ({ typed }) => (
  <AnimatePresence>
    {typed && (
      <motion.div
        key={typed.id}
        className="sl-narration sl-line-type col-start-1 row-start-1"
        initial={false}
        animate={{ opacity: 1 }}
        exit={leaving}
      >
        {typed.label && <span className="sl-label">{typed.label}</span>}
        {typed.rows.slice(0, typed.caret + 1).map((text, index) => (
          <span key={index} className={index ? "sl-row-alt" : "sl-row"}>
            {text}
            {index === typed.caret && <span className="sl-cursor" />}
          </span>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

const veiled: TargetAndTransition = {
  opacity: 0,
  scale: 1.12,
  filter: "blur(10px)",
};
const clear: TargetAndTransition = {
  opacity: 1,
  scale: 1,
  filter: "blur(0px)",
};

interface RevealProps {
  show: boolean;
  className?: string;
  children: ReactNode;
}

const Reveal: FC<RevealProps> = ({ show, className, children }) => (
  <motion.span
    className={className}
    initial={veiled}
    animate={show ? clear : veiled}
    transition={{ duration: 2.6, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

interface LampProps {
  lit: boolean;
  delay: string;
}

const Lamp: FC<LampProps> = ({ lit, delay }) => (
  <div className="sl-lamp">
    <motion.span
      className="sl-lamp-glow"
      style={{ x: "-50%", y: "30%" }}
      initial={false}
      animate={{ opacity: lit ? 1 : 0 }}
      transition={{ duration: 0.9 }}
    />
    <span className="sl-lamp-bowl" />
    <span className="sl-wick" />
    <motion.span
      className="sl-flame-wrap"
      style={{ x: "-50%", originY: 1 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={lit ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <span className="sl-flame" style={{ animationDelay: `${delay}s` }} />
    </motion.span>
  </div>
);

const TitleCard: FC<{ title: TitleState }> = ({ title }) => {
  if (!title.shown) return null;

  return (
    <motion.div
      className="sl-pad absolute inset-0 z-[3] flex flex-col items-center justify-center text-center"
      initial={false}
      animate={{ opacity: title.gone ? 0 : 1 }}
      transition={{ duration: 1.6, ease: "easeInOut" }}
    >
      <div className="sl-lamps">
        {Array.from({ length: 7 }, (_, index) => (
          <Lamp
            key={index}
            lit={title.lit > index}
            delay={(index * 0.23).toFixed(2)}
          />
        ))}
      </div>
      <h1 className="sl-mark">
        <Reveal show={title.the} className="sl-the">
          {TITLE.the}
        </Reveal>
        <span className={`sl-main ${title.alive ? "sl-main-alive" : ""}`}>
          <Reveal show={title.w0} className="sl-word">
            {TITLE.words[0]}
          </Reveal>
          <Reveal show={title.w1} className="sl-word">
            {TITLE.words[1]}
          </Reveal>
        </span>
      </h1>
      <motion.p
        className="sl-tag"
        initial={false}
        animate={{ opacity: title.tag ? 1 : 0 }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      >
        {TITLE.tag}
      </motion.p>
    </motion.div>
  );
};

interface ControlsProps {
  visible: boolean;
  canSkip: boolean;
  muted: boolean;
  onToggleSound: () => void;
  onSkip: () => void;
}

const Controls: FC<ControlsProps> = ({
  visible,
  canSkip,
  muted,
  onToggleSound,
  onSkip,
}) => {
  if (!visible) return null;

  return (
    <div className="sl-ctl">
      <button type="button" className="sl-btn" onClick={onToggleSound}>
        {muted ? "Sound off" : "Sound on"}
      </button>
      {canSkip && (
        <button type="button" className="sl-btn" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Root                                                                */
/* ------------------------------------------------------------------ */

interface SevenLampsOpeningProps {
  onComplete?: () => void;
}

const SevenLampsOpening: FC<SevenLampsOpeningProps> = ({ onComplete }) => {
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const engine = useMemo(() => createAudioEngine(setLocked), []);
  const { view, skip } = useOpening(engine, onComplete);

  useEffect(() => {
    const unlock = (): void => engine.start();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((name) =>
      window.addEventListener(name, unlock, { passive: true }),
    );
    return () => {
      events.forEach((name) => window.removeEventListener(name, unlock));
    };
  }, [engine]);

  useEffect(() => () => engine.dispose(), [engine]);

  const toggleSound = (): void => {
    const next = !muted;
    setMuted(next);
    engine.setMuted(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="sl-root"
        role="region"
        aria-label="The Seven Lamps opening"
      >
        <Backdrop tone={view.tone} />
        <div
          className="sl-pad absolute inset-0 z-[3] grid place-items-center"
          role="status"
          aria-live="polite"
        >
          <Line line={view.line} />
          <Typed typed={view.typed} />
        </div>
        <TitleCard title={view.title} />
        <FilmFrame />
        <motion.div
          className="sl-blackout"
          initial={false}
          animate={{ opacity: view.blackout ? 1 : 0 }}
          transition={{ duration: 2.8, ease: "easeInOut" }}
        />
        <Controls
          visible={view.controls}
          canSkip={!view.done}
          muted={muted}
          onToggleSound={toggleSound}
          onSkip={skip}
        />
        {locked && !view.done && (
          <p className="sl-hint">Tap anywhere for sound</p>
        )}
      </div>
    </MotionConfig>
  );
};

export default SevenLampsOpening;
