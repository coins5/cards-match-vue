# Cards Match (Vue 3 + TS + Vite)

A responsive memory game with multiple difficulties, live preview countdown, custom image sources (built‑in emojis or Giphy), and persistent scores. Built with Vue 3, TypeScript, and Vite.

## Features
- Difficulty modes: Easy (4 imgs × match 2), Medium (8 × match 2), Hard (16 × match 2), Dark Souls (32 × match 3).
- Scoring: 100 points per correct set + up to 1000 bonus based on time between first and last pick in the set.
- Preview: Before each round, all cards are revealed for a difficulty‑based duration with a live countdown.
- Image sources: Offline emoji SVGs by default; optional Giphy search (API key + term) with emoji fallback.
- Mobile-friendly: Grid sizes adjust by difficulty; Dark Souls uses compact tiles.
- Persistence: Settings and recent scores stored in localStorage.

## Getting Started
- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`

Open the app, hit “Start Game” to begin with a preview, then play normally. Use “Settings” to switch difficulty or image source.

## Gameplay
- Goal: Find sets of identical images. In Easy/Medium/Hard match 2-of-a-kind; in Dark Souls match 3-of-a-kind.
- Score: 100 per correct set + `max(0, 1000 - elapsed_ms)` where `elapsed_ms` is time between the first and last card in the set.
- Preview countdown per difficulty:
  - Easy: 2s
  - Medium: 4s
  - Hard: 8s
  - Dark Souls: 16s
- End: When all cards are matched, the run is saved to the recent scores list.

## Settings and Images
- Source: `Emoji` (no network, instant) or `Giphy`.
- Giphy: Provide an API key and a search term. The app fetches exactly as many unique images as the chosen difficulty requires. If the request fails or returns too few results, the app falls back to emojis.

## Project Structure
- App shell and UI:
  - `src/App.vue:1` – Lightweight UI wrapper; uses the composable for logic. Renders grid, header, preview start, and footer.
  - `src/components/CardItem.vue:1` – Single card component with flip/matched visuals.
  - `src/components/SettingsModal.vue:1` – Settings dialog for difficulty and image source (Giphy/Emoji).
  - `src/components/ScoresList.vue:1` – Recent scores list.
- Composables and services:
  - `src/composables/useGame.ts:1` – Core game state and logic (deal, preview countdown, clicks, matches, scoring, finish, apply settings).
  - `src/composables/useSettings.ts:1` – Reactive settings with localStorage persistence.
  - `src/composables/useScores.ts:1` – Recent scores with localStorage persistence.
  - `src/composables/constants.ts:1` – Difficulties, preview durations, emoji set.
  - `src/composables/imageService.ts:1` – Fetches images based on current settings (Giphy or emoji fallback).
  - `src/composables/utils.ts:1` – Helpers (`shuffle`, `emojiToDataUrl`).
- Entrypoint and styles:
  - `src/main.ts:1` – App bootstrap.
  - `src/style.css:1` – Global styles, grid sizing per difficulty, modal.

## Development Notes
- TypeScript: Shared types in `src/composables/types.ts:1`.
- State management: Kept simple with Vue reactivity + composables; no external store.
- Accessibility: Each card is a button with ARIA pressed state; preview countdown is also shown as a header chip.
- Network: Only needed for Giphy; otherwise fully offline.

## Ideas & Extensions
- Overlay countdown centered on the board during preview.
- Zoom control and pagination for Dark Souls on very small screens.
- Best scores per difficulty and leaderboard view.

## License
This project is provided as-is for personal/educational use.
