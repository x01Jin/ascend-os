# Ascend OS

Ascend OS is an experimental incremental exploration game that lets you tinker with a desktop environment as you mine Data, trace signals, and find the way to ascend on a procedurally generated file explorer.

## Overview

You are dropped into a procedurally generated operating system. Your goal is to find the w way to ascend hidden deep within the directory structure.

## Features

- **Procedural Generation**: Every iteration creates a unique folder structure.
- **Incremental Difficulty**: As you ascend, the file system becomes deeper and more cluttered with distractors.
- **Persistent State**: Your iteration count and high score are saved to local storage.
- **Desktop UI**: A simulated desktop environment with fully draggable windows, cascading window management, a taskbar, and a start menu.
- **Retro Atmosphere**: Includes a BIOS-style boot sequence, CRT scanline effects, and animated backgrounds.
- **Data Miner**: A built-in clicker minigame to manually mine data (KB).
- **Personalization**: Upload your own wallpaper to customize the desktop environment.
- **Lore**: Discover fragmented log files that hint at the nature of the system.
- **Core Settings**: A hidden developer menu for manipulating game state and seeds.

## Mechanics

See [Documentation Index](docs/mechanics.md) for detailed logic.

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Vite

## Running

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
