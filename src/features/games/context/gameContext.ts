import { createContext, useContext } from "react";
import type { GameConfig } from "../../chat/types/chat.types";

export const GameContext = createContext<GameConfig | null>(null);

export const useGame = (): GameConfig => {
  const game = useContext(GameContext);
  if (!game) throw new Error("useGame must be used inside <GameLoader />");
  return game;
};
