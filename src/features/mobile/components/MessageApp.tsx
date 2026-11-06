import { useEffect, useState } from "react";
import { useGame } from "../../games/context/gameContext";
import ChatWindow from "../../chat/components/ChatWindow";
import ChatSidebar, { type ChatItem } from "../../chat/components/ChatSidebar";
import type { ChatController } from "../../chat/hooks/useChatProgress";
import { messagePreview } from "../../chat/utils/storyEngine";

type Props = {
  onBack: () => void;
  chats: ChatController;
  initialChatId?: string;
  onCallThread?: (name: string) => void;
};

const MessagesApp = ({ onBack, chats, initialChatId, onCallThread }: Props) => {
  const game = useGame();
  const {
    progress,
    order,
    unread,
    typingId,
    flags,
    choose,
    getOptions,
    setViewing,
  } = chats;
  const [activeId, setActiveId] = useState(initialChatId ?? order[0] ?? "");

  // Tell the hook which chat is on screen (no notification / unread for it)
  useEffect(() => {
    setViewing(activeId);
    return () => setViewing(null);
  }, [activeId, setViewing]);

  const thread = game.chats.find((c) => c.id === activeId);

  const items: ChatItem[] = order.flatMap((id) => {
    const chat = game.chats.find((c) => c.id === id);
    if (!chat) return [];
    const messages = progress[id]?.messages ?? [];

    const last =
      [...messages].reverse().find((m) => m.from !== "system") ??
      messages[messages.length - 1];
    return [
      {
        id,
        initials: chat.initials,
        name: chat.name,
        avatarClass: chat.avatarClass,
        time: chat.time,
        preview: last ? messagePreview(last) : "",
        unread: unread[id] ?? 0,
        typing: typingId === id,
      },
    ];
  });

  const unreadElsewhere = Object.entries(unread).reduce(
    (sum, [id, n]) => (id === activeId ? sum : sum + n),
    0,
  );

  return (
    <>
      <ChatSidebar items={items} activeId={activeId} onSelect={setActiveId} />
      {thread && (
        <ChatWindow
          key={thread.id}
          thread={thread}
          messages={progress[thread.id]?.messages ?? []}
          options={getOptions(thread.id)}
          typing={typingId === thread.id}
          unreadCount={unreadElsewhere}
          flags={flags}
          onChoose={(option) => choose(thread.id, option)}
          onBack={onBack}
          onCall={() => onCallThread?.(thread.name)}
        />
      )}
    </>
  );
};

export default MessagesApp;
