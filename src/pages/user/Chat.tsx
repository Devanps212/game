import { useNavigate } from "react-router-dom";
import MessagesApp from "../../features/mobile/components/MessageApp";
import { useGame } from "../../features/games/context/gameContext";
import { useChatProgress } from "../../features/chat/hooks/useChatProgress";

const Chat = () => {
  const navigate = useNavigate();
  const game = useGame();

  const chats = useChatProgress(game, {
    onCall: () => navigate("../mobile"),
  });

  return (
    <div className="iphone-ui flex h-dvh w-full bg-gray-800">
      <MessagesApp onBack={() => navigate("../mobile")} chats={chats} />
    </div>
  );
};

export default Chat;
