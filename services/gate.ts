import { GameState } from '../types';

export interface GateItem {
  id: string;
  label: string;
  done: boolean;
  minigameId?: MinigameId;
}

export const MINIGAMES = [
  { id: 'pong', title: 'Pong', goal: 'First to 5 vs the machine.' },
  { id: 'dino', title: 'Dino Run', goal: 'Survive 20 seconds.' },
  { id: 'tictactoe', title: 'Tic-Tac-Toe', goal: 'Beat the machine once.' },
  { id: 'snake', title: 'Snake', goal: 'Eat 10 pellets.' },
  { id: 'memory', title: 'Memory', goal: 'Clear all 6 pairs.' },
] as const;

export type MinigameId = (typeof MINIGAMES)[number]['id'];

export const fuelFeeKB = (iteration: number): number => 25 * 1024 * iteration;

export const gatePartFor = (iteration: number): number => Math.min(iteration, 5);

export const gateMinigames = (state: GameState): MinigameId[] => {
  const start = (state.runSeed + state.currentIteration * 7919) % MINIGAMES.length;
  return [0, 1, 2].map(i => MINIGAMES[(start + i) % MINIGAMES.length].id);
};

export const getGateStatus = (state: GameState): { items: GateItem[]; complete: boolean } => {
  const part = gatePartFor(state.currentIteration);
  const picked = gateMinigames(state);
  const trailDone =
    state.trailProof[state.currentIteration] === state.currentIteration ||
    state.unscrambledTrail.includes(state.currentIteration);
  const items: GateItem[] = [
    {
      id: 'trail',
      label: `Read archivist_${part} this run of the trail`,
      done: trailDone,
    },
    ...picked.map(id => {
      const game = MINIGAMES.find(g => g.id === id);
      return {
        id: `minigame_${id}`,
        label: `Beat ${game?.title ?? id} on this layer`,
        done: state.arcadeWins[id] === state.currentIteration,
        minigameId: id,
      };
    }),
    {
      id: 'fuel',
      label: `Pay ${25 * state.currentIteration} MB handoff fuel`,
      done: state.fuelPaidIter === state.currentIteration,
    },
  ];
  return { items, complete: items.every(i => i.done) };
};
