import type { GameConfig } from "../../chat/types/chat.types";
import { sevenLamps } from "../sevenLamps";
import { dinnerDate } from "../dinnerDate";

export const GAMES: Record<string, GameConfig> = {
  [sevenLamps.id]: sevenLamps,
  [dinnerDate.id]: dinnerDate,
};
