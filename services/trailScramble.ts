import { locateCostFor } from '../constants';

export const TRAIL_WORD_SETS: [string, string, string][] = [
  ['river', 'meadow', 'lantern'],
  ['copper', 'sparrow', 'harbor'],
  ['willow', 'ember', 'compass'],
  ['marble', 'falcon', 'tunnel'],
  ['thunder', 'pillow', 'garden'],
  ['silver', 'badger', 'candle'],
  ['velvet', 'otter', 'bridge'],
  ['pepper', 'canyon', 'drum'],
  ['maple', 'violin', 'storm'],
  ['cedar', 'rocket', 'pocket'],
  ['amber', 'ladder', 'forest'],
  ['blanket', 'tiger', 'mango'],
  ['honey', 'cliff', 'piano'],
  ['zebra', 'quilt', 'frost'],
  ['globe', 'dwarf', 'pinch'],
  ['ivory', 'camp', 'brook'],
  ['flute', 'grove', 'pebble'],
  ['helmet', 'daisy', 'wrench'],
  ['jelly', 'orchard', 'brick'],
  ['kite', 'saddle', 'plum'],
  ['lemon', 'tractor', 'whisper'],
  ['magnet', 'owl', 'carpet'],
  ['needle', 'prairie', 'toast'],
  ['ocean', 'branch', 'fever'],
  ['paint', 'whistle', 'cactus'],
  ['quartz', 'elm', 'banjo'],
  ['rabbit', 'indigo', 'shelf'],
  ['salmon', 'trumpet', 'ivy'],
  ['timber', 'uncle', 'wagon'],
  ['umbrella', 'vase', 'juggle'],
  ['violet', 'yacht', 'zipper'],
  ['walnut', 'yarn', 'kettle'],
  ['window', 'anchor', 'beetle'],
  ['xylophone', 'apron', 'cobalt'],
  ['yogurt', 'blimp', 'crater'],
  ['zenith', 'dune', 'ember'],
  ['acorn', 'brisk', 'coral'],
  ['beacon', 'drizzle', 'flint'],
  ['cobble', 'ember', 'grove'],
  ['drift', 'elm', 'harbor'],
];

const hashSeed = (runSeed: number, iteration: number, salt: number): number => {
  let h = (Math.abs(Math.floor(runSeed)) + iteration * 7919 + salt * 104729) | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  return (h ^ (h >>> 16)) >>> 0;
};

export const trailSetIndexFor = (runSeed: number, iteration: number): number =>
  hashSeed(runSeed, iteration, 7) % TRAIL_WORD_SETS.length;

export const trailSetFor = (runSeed: number, iteration: number): [string, string, string] =>
  TRAIL_WORD_SETS[trailSetIndexFor(runSeed, iteration)]!;

const shuffleLetters = (word: string, seed: number): string => {
  const chars = word.split('');
  let state = seed === 0 ? 0x9e3779b9 : seed;
  const next = (): number => {
    state = Math.imul(state ^ (state >>> 15), 2246822519) >>> 0 || 0x9e3779b9;
    state = Math.imul(state ^ (state >>> 12), 3266489917) >>> 0;
    return (state ^ (state >>> 14)) >>> 0;
  };
  for (let i = chars.length - 1; i > 0; i--) {
    const j = next() % (i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join('');
};

export const scrambleWord = (word: string, seed: number): string => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const shuffled = shuffleLetters(word, (seed + attempt * 131) >>> 0);
    if (shuffled !== word) return shuffled;
  }
  return word.length > 1 ? word.slice(1) + word[0] : word;
};

export const scrambledTrailWords = (
  runSeed: number,
  iteration: number
): [string, string, string] => {
  const answers = trailSetFor(runSeed, iteration);
  return [
    scrambleWord(answers[0]!, hashSeed(runSeed, iteration, 11)),
    scrambleWord(answers[1]!, hashSeed(runSeed, iteration, 13)),
    scrambleWord(answers[2]!, hashSeed(runSeed, iteration, 17)),
  ];
};

export const trailAnswersMatch = (answers: [string, string, string], attempt: string[]): boolean =>
  attempt.length === answers.length &&
  answers.every((word, i) => (attempt[i] ?? '').trim().toLowerCase() === word);

export const trailLocateCostFor = (iteration: number): number => locateCostFor(iteration) * 2;

export const archivistFileIdFor = (iteration: number): string => {
  if (iteration <= 1) return 'archivist_1_1';
  if (iteration <= 4) return `archivist_${iteration}_${iteration}`;
  return `archivist_5_${iteration}`;
};

export const trailLocateFileIdFor = (iteration: number): string => `locate_trail_${iteration}`;

export const isTrailLocateFileId = (id: string): boolean => id.startsWith('locate_trail_');

export const trailIterationOf = (id: string): number => {
  const parsed = Number.parseInt(id.slice('locate_trail_'.length), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
