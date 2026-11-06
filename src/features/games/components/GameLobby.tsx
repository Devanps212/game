import { useGame } from "../context/gameContext";
import { Navigate } from "react-router-dom";

const GameLobby = () => {
  const game = useGame();

  const { lobby: GameLobby } = game;

  if (!GameLobby) return <Navigate to="../mobile" replace />;

  return <GameLobby />;
};

export default GameLobby;
