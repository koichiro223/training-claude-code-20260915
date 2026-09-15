# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A Breakout ("ブロック崩し") game built with vanilla JavaScript and the HTML5 Canvas API. No build step, no framework, no bundler. UI text and comments are in Japanese.

## Running

Open `index.html` directly in a browser, or serve the directory statically (e.g. `npx serve` / `python3 -m http.server`). `main.js` is loaded as a plain `<script>` — there is nothing to compile.

## Formatting

Prettier is the only dev dependency. Format manually with `npx prettier --write <file>`.

A `PostToolUse` hook (`.claude/hooks/format.sh`, wired in `.claude/settings.json`) auto-runs Prettier on every `.html`/`.css`/`.js`/`.ts` file after it is written or edited, so edits are formatted for you.

## Architecture

Everything lives in `main.js`, driven by a single `requestAnimationFrame` loop (`loop()`):

- **State machine**: a `state` variable (`"start" | "playing" | "gameover" | "win"`) gates both updates and which overlay message is drawn. `update()` only runs while `"playing"`.
- **Game objects**: `paddle`, `ball`, and `brick` (grid config) are module-level object literals; `bricks[]` holds the live brick instances built by `buildBricks()`.
- **Ball/brick collision** (`update()`) uses circle-vs-rectangle nearest-point detection, with a separate branch for when the ball center is inside a brick (penetration case) — edit this carefully, it is the most subtle logic in the file.
- **Input**: keyboard (arrows + space) plus mouse/touch move the paddle; click/touch/space call `startOrRestart()`.

Canvas dimensions (`W`, `H`) come from the `<canvas>` element in `index.html` — keep the two in sync if resizing.

## Note

`.env` is gitignored but present locally; it is not used by the game code.
