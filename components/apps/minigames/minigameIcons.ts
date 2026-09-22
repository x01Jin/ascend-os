import { Brain, Egg, Gamepad2, Grid3x3, Worm, type LucideIcon } from 'lucide-react';
import { MINIGAMES, type MinigameId } from '../../../services/gate';

export const MINIGAME_ICONS: Record<MinigameId, LucideIcon> = {
  pong: Gamepad2,
  dino: Egg,
  tictactoe: Grid3x3,
  snake: Worm,
  memory: Brain,
};

export const MINIGAME_ICON_COLORS: Record<MinigameId, string> = {
  pong: 'text-pink-400',
  dino: 'text-amber-400',
  tictactoe: 'text-cyan-400',
  snake: 'text-green-400',
  memory: 'text-violet-400',
};

export const minigameIdForExe = (nodeId: string, iteration: number): MinigameId | null => {
  const game = MINIGAMES.find(g => nodeId === `${g.id}_${iteration}`);
  return game?.id ?? null;
};
