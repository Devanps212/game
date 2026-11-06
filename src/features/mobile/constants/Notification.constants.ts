import type { NotificationItem } from "../types/Notification.types";

const CARD_H = 68;
const GAP = 8;
const PEEK = 9;
const AUTO_DISMISS_MS = 6000;
const SAMPLES: Omit<NotificationItem, "id" | "time">[] = [
  { app: "messages", title: "Alex", body: "Are you free tonight?" },
  {
    app: "mail",
    title: "Weekly Digest",
    body: "Your summary for this week is ready",
  },
  {
    app: "calendar",
    title: "Calendar",
    body: "Design review starts in 10 minutes",
  },
  {
    app: "general",
    title: "Reminder",
    body: "Don't forget to ship the update",
  },
];

const MAX_NOTIFICATIONS = 8;

const EASE = [0.32, 0.72, 0, 1] as const;

const CHAT_OPEN_KEY = "mobile:isChatOpen";

export {
  CARD_H,
  GAP,
  PEEK,
  AUTO_DISMISS_MS,
  SAMPLES,
  MAX_NOTIFICATIONS,
  EASE,
  CHAT_OPEN_KEY,
};
