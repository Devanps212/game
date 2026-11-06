import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import MessagesApp from "../../features/mobile/components/MessageApp";
import { useGame } from "../../features/games/context/gameContext";
import {
  useChatProgress,
  type CallResult,
} from "../../features/chat/hooks/useChatProgress";

const Chat = () => {
  const navigate = useNavigate();
  const game = useGame();
  const pendingCall = useRef<((result: CallResult) => void) | null>(null);

  const chats = useChatProgress(game, {
    onCall: (call) =>
      new Promise<CallResult>((resolve) => {
        pendingCall.current = resolve;
        navigate("../mobile", { state: { call } });
      }),
  });

  return (
    <div className="iphone-ui flex h-dvh w-full bg-gray-800">
      <MessagesApp onBack={() => navigate("../mobile")} chats={chats} />
    </div>
  );
};

export default Chat;
