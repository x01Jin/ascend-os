import { ACH_TOTAL } from './achievements';
import { SECRET_TOTAL } from './secrets';
import { LORE_TOTAL } from './lore';

export const WEIGHT_ACH = 70;
export const WEIGHT_SEC = 20;
export const WEIGHT_LORE = 10;

export const computeProgress = (achCount: number, secCount: number, loreCount: number): number => {
  const ach = Math.round((Math.min(achCount, ACH_TOTAL) / ACH_TOTAL) * WEIGHT_ACH);
  const sec = Math.round((Math.min(secCount, SECRET_TOTAL) / SECRET_TOTAL) * WEIGHT_SEC);
  const lore = Math.round((Math.min(loreCount, LORE_TOTAL) / LORE_TOTAL) * WEIGHT_LORE);
  const total = ach + sec + lore;
  if (achCount >= ACH_TOTAL && secCount >= SECRET_TOTAL && loreCount >= LORE_TOTAL) return 100;
  return Math.max(1, Math.min(99, total));
};

export const isZipEarned = (achievements: Record<string, number>, ids: string[]): boolean =>
  ids.every(id => achievements[id] !== undefined);
