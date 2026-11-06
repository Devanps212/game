import { Navigate, Outlet, useParams } from "react-router-dom";
import { GameContext } from "../../features/games/context/gameContext";
import { GAMES } from "../../features/games/constants/games.contants";

const GameLoader = () => {
  const { gameId = "" } = useParams();
  const game = GAMES[gameId];

  if (!game) return <Navigate to="/" replace />;

  return (
    <GameContext.Provider value={game} key={gameId}>
      <Outlet />
    </GameContext.Provider>
  );
};

export default GameLoader;
