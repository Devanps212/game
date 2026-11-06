import { Edit3Icon, Search } from "lucide-react";
import { motion } from "framer-motion";

export type ChatItem = {
  id: string;
  initials: string;
  name: string;
  preview: string;
  time: string;
  avatarClass: string;
  unread?: number;
  typing?: boolean;
};

type Props = {
  items: ChatItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

const ChatSidebar = ({ items, activeId, onSelect }: Props) => {
  return (
    <aside className="h-full w-[260px] shrink-0 overflow-x-hidden overflow-y-auto bg-white p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h1 className="truncate text-2xl font-bold text-black">Chats</h1>
        <div className="flex shrink-0 items-center gap-1.5">
          <button className="h-8 rounded-full bg-gray-100 px-3 text-sm font-medium text-blue-500">
            Edit
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white">
            <Edit3Icon size={16} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-zinc-200 px-3 py-2">
        <Search className="shrink-0 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {/* Chat list */}
      <div className="flex flex-col gap-1">
        {items.map((chat) => {
          const active = chat.id === activeId;
          return (
            <motion.button
              layout
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
              type="button"
              key={chat.id}
              onClick={() => onSelect(chat.id)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-2xl p-2.5 text-left ${
                active ? "bg-blue-500" : "bg-white"
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${chat.avatarClass}`}
              >
                {chat.initials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    className={`truncate text-sm font-semibold ${
                      active ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {chat.name}
                  </h2>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={`whitespace-nowrap text-[11px] ${
                        active ? "text-white/90" : "text-gray-500"
                      }`}
                    >
                      {chat.time}
                    </span>
                    {!active && Boolean(chat.unread) && (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
                <p
                  className={`truncate text-xs ${
                    active ? "text-white/90" : "text-gray-500"
                  }`}
                >
                  {chat.typing ? "typing…" : chat.preview}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </aside>
  );
};

export default ChatSidebar;
