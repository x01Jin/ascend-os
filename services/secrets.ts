export interface SecretDef {
  id: string;
  title: string;
  instructions: string;
}

export const SECRETS: SecretDef[] = [
  {
    id: 'ghost',
    title: 'Ghost Frequency',
    instructions:
      'A ghost_ file broadcasts a 4-digit password each iteration and names the folder where a dead_drop.zip vault sleeps. The password opens the vault; inside is a minigame pass that clears one minigame of your choice.',
  },
  {
    id: 'trail',
    title: 'Archivist Cache',
    instructions:
      'Read archivist_1 through archivist_5 in order across iterations 1-5. Each part names an exact folder in its shell: ghost file, sealed vault, two terminals, buried cache. Part 5 names the buried cache folder. Open it.',
  },
  {
    id: 'offering',
    title: 'Offering',
    instructions:
      'Rename any folder to "archivist", mark it with a star, then press TRACE inside it.',
  },
  {
    id: 'core',
    title: 'Core Word',
    instructions: 'Open System Help and type the word c-o-r-e.',
  },
  {
    id: 'idol',
    title: 'Cracked Egg',
    instructions:
      'Rename any .txt file to egg (it displays as egg.txt), open it, and click the egg 7 times. It pays 10-50 MB.',
  },
  {
    id: 'properties',
    title: 'Respect the Ferry',
    instructions: 'Right-click ascend.exe in Explorer and open Properties.',
  },
];

export const SECRET_TOTAL = SECRETS.length;

export const SECRETS_ZIP_TEXT = `secrets.zip — ARCHIVIST INSTRUCTIONS
=====================================
You earned this by finishing the checklist. What remains is hidden, not gated.

1. GHOST FREQUENCY — a ghost_ file broadcasts a 4-digit password each iteration and names the folder where a dead_drop.zip vault sleeps. The password opens the vault. Inside is a minigame pass: it clears one minigame of your choice from inside that game's window.
2. ARCHIVIST CACHE — read archivist_1/2/3/4/5 in order (iterations 1-5). Each part names an exact folder: ghost file, vault, two terminals, buried cache. Part 5 names the buried cache folder. Open it.
3. OFFERING — rename a folder to "archivist", mark it, TRACE inside it.
4. CORE WORD — System Help listens for a 4-letter word.
5. CRACKED EGG — rename any .txt to egg (it displays as egg.txt), open it, click 7 times. It pays data.
6. RESPECT THE FERRY — ascend.exe has a Properties page. Read it.

Find all six. The letter waits at 100%.`;
