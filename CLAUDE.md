# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server on port 3000 (auto-opens browser)
npm run build    # Production build to build/ directory
npm run server   # Start Express API server on port 3001
npm run dev:all  # Start both frontend and backend concurrently
```

No test runner or linter is configured.

## Architecture

This project has a **React + TypeScript frontend** (Vite) and an **Express.js backend** with SQLite authentication.

**Entry point:** `src/main.tsx` → `src/App.tsx`

**App.tsx** is the core of the game — all game state and logic lives here:

- `boxes`: array of `{ id, isOpen, hasTreasure }` objects (3 boxes, one randomly has treasure)
- `score`: running score (+100 treasure, -50 skeleton)
- `gameEnded`: boolean that stops interaction when the treasure is found or all boxes are opened
- `user`: current logged-in username (null for guest)
- `showAuth`: controls visibility of the auth modal
- Audio assets are imported but playback must be triggered manually on open events

**Backend (`server.js`)** — Express server on port 3001:

- SQLite database (`game.db`) with a `users` table (id, username, password_hash, created_at)
- Session management via express-session
- Endpoints: `POST /api/register`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
- Vite proxies `/api` requests to `http://localhost:3001` in development

**`src/components/AuthModal.tsx`** — Login/register modal dialog, posts to the API endpoints above.

**Component library:** `src/components/ui/` contains ~60 pre-built Shadcn/ui components backed by Radix UI primitives. Use these for any new UI elements rather than building from scratch.

**`src/components/figma/ImageWithFallback.tsx`** — use this wrapper whenever adding images; it handles load errors with an SVG placeholder.

**Styling:** Tailwind CSS utility classes throughout. Theme variables (colors, spacing, dark mode) are defined in `src/styles/globals.css`. The `@` alias resolves to `src/`.

**Animation:** The `motion` package (Framer Motion API) is used for transitions on box open events.

**Assets:**

- Images: `src/assets/` — `treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`
- Audio: `src/audios/` — `chest_open.mp3`, `chest_open_with_evil_laugh.mp3`

## Guidelines

`src/guidelines/Guidelines.md` is a placeholder for project-specific AI coding rules. Add rules there to guide Claude Code on design constraints or component usage conventions for this project.

我們這專案溝通過程中都使用繁體中文
