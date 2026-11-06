import type { GameConfig } from "../../chat/types/chat.types";
import { sevenLamps } from "../sevenLamps";

export const GAMES: Record<string, GameConfig> = {
  [sevenLamps.id]: sevenLamps,
};
