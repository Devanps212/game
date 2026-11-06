import { useEffect, type ReactNode } from "react";
import type {
  NotificationApp,
  NotificationItem,
} from "../../types/Notification.types";
import { Bell, Calendar, Mail, MessageCircle } from "lucide-react";
import { CARD_H, GAP, PEEK } from "../../constants/Notification.constants";
import { motion, type PanInfo } from "framer-motion";
import { spring } from "../../config/animations";

const AUTO_DISMISS_MS = 6000;

const appStyle: Record<NotificationApp, { bg: string; icon: ReactNode }> = {
  messages: { bg: "bg-[#30D158]", icon: <MessageCircle size={18} /> },
  mail: { bg: "bg-[#0A84FF]", icon: <Mail size={18} /> },
  calendar: { bg: "bg-[#FF453A]", icon: <Calendar size={18} /> },
  general: { bg: "bg-[#BF5AF2]", icon: <Bell size={18} /> },
};

type CardProps = {
  item: NotificationItem;
  index: number;
  count: number;
  expanded: boolean;
  onTap: (item: NotificationItem) => void;
  onDismiss: (id: number) => void;
};

const NotificationCard = ({
  item,
  index,
  count,
  expanded,
  onTap,
  onDismiss,
}: CardProps) => {
  useEffect(() => {
    if (expanded) return;
    const id = setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => clearTimeout(id);
  }, [expanded, item.id, onDismiss]);

  const depth = Math.min(index, 2);
  const y = expanded ? index * (CARD_H + GAP) : depth * PEEK;
  const scale = expanded ? 1 : 1 - depth * 0.05;
  const opacity = expanded ? 1 : index > 2 ? 0 : 1 - depth * 0.12;
  const interactive = expanded || index === 0;
  const style = appStyle[item.app];

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 600) {
      onDismiss(item.id);
    }
  };

  return (
    <motion.div
      drag={interactive ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      onClick={() => onTap(item)}
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ y, scale, opacity }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={spring}
      style={{
        zIndex: count - index,
        height: CARD_H,
        transformOrigin: "top center",
        pointerEvents: interactive ? "auto" : "none",
      }}
      className="absolute inset-x-0 top-0 cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-3 shadow-lg backdrop-blur-2xl"
    >
      <div className="flex h-full items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${style.bg}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="m-0 truncate text-sm font-medium text-gray-100">
              {item.title}
            </h3>
            <span className="shrink-0 text-[11px] text-gray-400">
              {item.time}
            </span>
          </div>
          <p className="m-0 truncate text-xs text-gray-300">{item.body}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
