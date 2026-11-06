import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Dock from "../../features/mobile/components/Dock";
import MobileLeftScreen from "../../features/mobile/components/MobileLeftScreen";
import MobileStatusBar from "../../features/mobile/components/MobileStatusBar";
import FirstRow from "../../features/mobile/components/appIcons/FirstRowIcons";
import FourthRow from "../../features/mobile/components/appIcons/FourthRow";
import SecondRow from "../../features/mobile/components/appIcons/SecondRow";
import ThirdRow from "../../features/mobile/components/appIcons/ThirdRow";
import Call from "../../features/mobile/components/Call";
import type { NotificationItem } from "../../features/mobile/types/Notification.types";
import NotificationStack from "../../features/mobile/components/Notifications/NotificationStack";
import {
  CHAT_OPEN_KEY,
  EASE,
  MAX_NOTIFICATIONS,
} from "../../features/mobile/constants/Notification.constants";
import MessagesApp from "../../features/mobile/components/MessageApp";
import { appVariants } from "../../features/mobile";
import { useGame } from "../../features/games/context/gameContext";
import {
  useChatProgress,
  type CallResult,
} from "../../features/chat/hooks/useChatProgress";
import type { CallInfo } from "../../features/chat/types/chat.types";
import Gallery from "./Gallery";
import CallUI from "../../features/call/components/CallUI";

const readChatOpen = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

type NewNotification = Omit<NotificationItem, "id" | "time">;

const Mobile = () => {
  const game = useGame();
  const chatOpenKey = `${CHAT_OPEN_KEY}:${game.id}`;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeCall, setActiveCall] = useState<CallInfo | null>(
    game.call?.atStart ? game.call : null,
  );
  const [isChatOpen, setIsChatOpen] = useState(() => readChatOpen(chatOpenKey));
  const [isHomeMounted, setIsHomeMounted] = useState(
    () => !readChatOpen(chatOpenKey),
  );
  const [restoredOnLoad] = useState(() => readChatOpen(chatOpenKey));
  const [hasOpened, setHasOpened] = useState(false);
  const [originX, setOriginX] = useState(0.5);
  const [openChatId, setOpenChatId] = useState<string | undefined>();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const idRef = useRef(0);
  const sampleRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const callDoneRef = useRef<((r: CallResult) => void) | null>(null);
  const callStartRef = useRef(0);

  // outgoing = the player is calling someone -> full CallUI
  // incoming = someone calls the player      -> banner Call at the top
  const isOutgoing = activeCall?.direction === "outgoing";

  useEffect(() => {
    try {
      sessionStorage.setItem(chatOpenKey, isChatOpen ? "1" : "0");
    } catch {
      return;
    }
  }, [isChatOpen, chatOpenKey]);

  useEffect(() => {
    if (activeCall) callStartRef.current = Date.now();
  }, [activeCall]);

  const pushNotification = useCallback((n: NewNotification) => {
    idRef.current += 1;
    const id = idRef.current;
    setNotifications((prev) =>
      [{ ...n, id, time: "now" }, ...prev].slice(0, MAX_NOTIFICATIONS),
    );
  }, []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const finishCall = useCallback((outcome?: Partial<CallResult>) => {
    const done = callDoneRef.current;
    callDoneRef.current = null;
    setActiveCall(null);
    done?.({
      status: outcome?.status ?? "ended",
      durationSec:
        outcome?.durationSec ??
        (callStartRef.current
          ? Math.round((Date.now() - callStartRef.current) / 1000)
          : undefined),
    });
  }, []);

  const startCall = useCallback(
    (call?: CallInfo) =>
      new Promise<CallResult>((resolve) => {
        const info = call ?? game.call;
        if (!info) {
          resolve({ status: "missed" });
          return;
        }
        callDoneRef.current?.({ status: "ended" });
        callDoneRef.current = resolve;
        setActiveCall(info);
      }),
    [game.call],
  );

  // Player taps call on a chat header: outgoing call to that person
  const callPerson = useCallback(
    (name: string, voiceSrc?: string) => {
      void startCall({
        name,
        voiceSrc: voiceSrc ?? "",
        direction: "outgoing",
      } as CallInfo);
    },
    [startCall],
  );

  const chats = useChatProgress(game, {
    onIncoming: (chatId, text) => {
      if (isChatOpen) return;
      const chat = game.chats.find((c) => c.id === chatId);
      if (!chat) return;
      pushNotification({
        app: "messages",
        title: chat.name,
        body: text,
        chatId,
      });
    },
    onCall: startCall,
  });

  const addSampleNotification = useCallback(() => {
    if (isChatOpen) return;
    const pool = game.notifications;
    if (pool.length === 0) return;
    const sample = pool[sampleRef.current % pool.length];
    sampleRef.current += 1;
    pushNotification(sample);
  }, [game.notifications, isChatOpen, pushNotification]);

  const setOriginFromEvent = useCallback((e?: ReactMouseEvent<HTMLElement>) => {
    const frame = frameRef.current;
    const target = e?.currentTarget;
    if (frame && target) {
      const f = frame.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setOriginX((t.left + t.width / 2 - f.left) / f.width);
    } else {
      setOriginX(0.5);
    }
  }, []);

  const openGallery = useCallback(
    (e?: ReactMouseEvent<HTMLElement>) => {
      if (isGalleryOpen) return;
      setOriginFromEvent(e);
      setIsGalleryOpen(true);
    },
    [isGalleryOpen, setOriginFromEvent],
  );

  const closeGallery = useCallback(() => setIsGalleryOpen(false), []);

  const openChat = useCallback(
    (e?: ReactMouseEvent<HTMLElement>, chatId?: string) => {
      if (isChatOpen) return;
      setOpenChatId(chatId);
      setOriginFromEvent(e);
      setHasOpened(true);
      setIsChatOpen(true);
    },
    [isChatOpen, setOriginFromEvent],
  );

  const closeChat = useCallback(() => {
    setHasOpened(true);
    setIsHomeMounted(true);
    setIsChatOpen(false);
  }, []);

  const handleNotificationOpen = useCallback(
    (item: NotificationItem) => {
      dismissNotification(item.id);
      switch (item.app) {
        case "messages":
          openChat(undefined, item.chatId);
          break;
        default:
          break;
      }
    },
    [dismissNotification, openChat],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (key === "n") addSampleNotification();
      if (key === "c" && game.call) void startCall(game.call);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addSampleNotification, game.call, startCall]);

  return (
    <div className="iphone-ui flex h-dvh w-full select-none items-center justify-center bg-gray-800">
      <div
        ref={frameRef}
        className="relative aspect-4/3 max-h-full w-full max-w-5xl overflow-clip rounded-2xl border-8 border-black bg-red-400 bg-cover bg-center"
        style={{ backgroundImage: `url(${game.wallpaper})` }}
      >
        <div
          className={`absolute inset-x-0 top-0 z-40 transition-[filter] duration-300 ${
            isChatOpen ? "invert" : ""
          }`}
        >
          <MobileStatusBar />
        </div>

        <div className="pointer-events-none absolute left-3 right-3 top-10 z-50 flex flex-col items-center gap-2">
          {/* INCOMING call: banner at the top */}
          {activeCall && !isOutgoing && (
            <Call
              key={activeCall.name}
              caller={activeCall.name}
              voiceSrc={activeCall.voiceSrc}
              onEnd={() => finishCall()}
            />
          )}
          {!isChatOpen && (
            <NotificationStack
              items={notifications}
              onDismiss={dismissNotification}
              onOpen={handleNotificationOpen}
            />
          )}
        </div>

        {isHomeMounted && (
          <motion.div
            className="absolute inset-0 pt-10"
            style={{ originX, originY: 1 }}
            initial={hasOpened ? { scale: 0.94, opacity: 0.5 } : false}
            animate={
              isChatOpen || isGalleryOpen
                ? { scale: 0.94, opacity: 0.5 }
                : { scale: 1, opacity: 1 }
            }
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex items-start justify-center gap-25 px-10">
              <MobileLeftScreen />

              <div className="flex flex-1 flex-col items-stretch justify-start gap-10">
                <FirstRow />
                <SecondRow />
                <ThirdRow />
                <FourthRow />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white" />
              <div className="h-2 w-2 rounded-full bg-gray-400" />
            </div>

            <Dock onOpenMessages={openChat} onOpenGallery={openGallery} />
          </motion.div>
        )}

        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              key="messages-app"
              className="absolute inset-0 z-10 flex overflow-hidden bg-white pt-10"
              style={{ originX, originY: 1 }}
              variants={appVariants}
              initial={restoredOnLoad && !hasOpened ? false : "hidden"}
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: EASE }}
              onAnimationComplete={(definition) => {
                if (definition === "visible") setIsHomeMounted(false);
              }}
            >
              <div className="absolute inset-x-0 top-0 h-10 bg-zinc-100" />
              <div className="absolute left-0 top-0 h-10 w-65 bg-white" />

              <MessagesApp
                onBack={closeChat}
                chats={chats}
                initialChatId={openChatId}
                onCallThread={(name) => callPerson(name)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGalleryOpen && (
            <motion.div
              key="gallery-app"
              className="absolute inset-0 z-20 overflow-hidden bg-white"
              style={{ originX, originY: 1 }}
              variants={appVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: EASE }}
            >
              <Gallery onClose={closeGallery} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* OUTGOING call: full CallUI with the person's name */}
        <AnimatePresence>
          {activeCall && isOutgoing && (
            <motion.div
              key={`call-${activeCall.name}`}
              className="absolute inset-0 z-[60] overflow-hidden bg-black"
              style={{ originX, originY: 1 }}
              variants={appVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4, ease: EASE }}
            >
              <CallUI
                name={activeCall.name}
                voiceSrc={activeCall.voiceSrc || undefined}
                ringMs={(activeCall as { ringMs?: number }).ringMs}
                close={(outcome) => finishCall(outcome)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Mobile;
