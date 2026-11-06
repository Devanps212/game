import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { NotificationItem } from "../../types/Notification.types";
import { CARD_H, GAP, PEEK } from "../../constants/Notification.constants";
import NotificationCard from "./NotificationCard";
import { spring } from "../../config/animations";

type StackProps = {
  items: NotificationItem[];
  onDismiss: (id: number) => void;
  onOpen: (item: NotificationItem) => void;
};

const ding = new Audio("/sounds/mobile/notification.mp3");

const NotificationStack = ({ items, onDismiss, onOpen }: StackProps) => {
  const [expanded, setExpanded] = useState(false);
  const count = items.length;
  const isExpanded = expanded && count > 1;
  const seenIds = useRef(new Set<number>(items.map((i) => i.id)));

  useEffect(() => {
    items.forEach((item) => {
      if (seenIds.current.has(item.id)) return;
      seenIds.current.add(item.id);
      const sound = ding.cloneNode() as HTMLAudioElement;
      sound.play().catch((e) => console.error("notification sound blocked", e));
    });
  }, [items]);

  const height =
    count === 0
      ? 0
      : isExpanded
        ? count * CARD_H + (count - 1) * GAP
        : CARD_H + Math.min(count - 1, 2) * PEEK;

  const handleTap = (item: NotificationItem) => {
    // first tap on a pile expands it; tapping a card in the open list opens it
    if (count > 1 && !isExpanded) {
      setExpanded(true);
      return;
    }
    setExpanded(false);
    onOpen(item);
  };

  const handleDismiss = (id: number) => {
    if (count <= 2) setExpanded(false);
    onDismiss(id);
  };

  return (
    <motion.div
      layout="position"
      transition={spring}
      className="flex w-full max-w-sm flex-col items-center gap-2"
    >
      <motion.div
        className="pointer-events-none relative w-full"
        animate={{ height }}
        transition={spring}
      >
        <AnimatePresence initial={false}>
          {items.map((item, index) => (
            <NotificationCard
              key={item.id}
              item={item}
              index={index}
              count={count}
              expanded={isExpanded}
              onTap={handleTap}
              onDismiss={handleDismiss}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.button
            key="show-less"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onClick={() => setExpanded(false)}
            className="pointer-events-auto rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs text-gray-200 backdrop-blur-2xl"
          >
            Show less
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationStack;
