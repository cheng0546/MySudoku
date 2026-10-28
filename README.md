# MySudoku

A web-based Sudoku game for learning and improving solving techniques. Every puzzle is generated with a **unique solution**. The UI is currently in Chinese (multi-language support is planned).

## Features (v1)

- Four difficulty levels: Easy, Medium, Hard, Expert
- Unique-solution 9×9 puzzle generation
- Two input modes:
  - **Value** – one confirmed number per cell (clears the cell's candidates)
  - **Candidate** – multiple pencil-mark numbers per cell
- Undo, clear cell, restart, and submit
- Result screen showing the full answer, correctness (wrong cells highlighted), retry, and back to home
- Keyboard support: `1-9` to fill, `Backspace`/`Delete` to clear, `Ctrl+Z` to undo, arrow keys to move

## Install as an app (PWA)

MySudoku is a Progressive Web App and works offline after the first visit. Over HTTPS (e.g. on Render) or `localhost`:

- **Desktop Chrome/Edge**: click the install icon in the address bar.
- **Android Chrome**: menu → *Install app* / *Add to Home screen*.
- **iOS Safari**: Share → *Add to Home Screen*.

When you change cached files, bump `CACHE` in `sw.js` so clients pick up the update.

## Difficulty system

Difficulty is determined by a logic solver (`solver.js`), not by the number of clues. Backtracking is only used to build solved grids and check uniqueness; the solver never guesses.

| Tier | Techniques | Result |
| --- | --- | --- |
| 1 | Naked Single (1), Hidden Single (2) | Easy |
| 2 | Locked Candidates (4), Naked Pair (4), Hidden Pair (5), Naked Triple (8) | Medium |
| 3 | X-Wing (12), Skyscraper (13), Two-String Kite (13), XY-Wing (14), Finned X-Wing (15), Unique Rectangle type 1 (16) | Hard |
| 4 | XYZ-Wing (18), Swordfish (20), XY-Chain (22), Jellyfish (25) | Expert |

The classification uses the highest tier actually used plus the total score (see `TECHNIQUE_CONFIG` and `DIFFICULTY_CONFIG` in `solver.js`). Puzzles the solver cannot finish are discarded. Generation retries until the target level is met, with attempt and time limits.

Test the generator: `node tools/test-difficulty.js 50`

## Roadmap

- Solving-technique algorithms (e.g. naked/hidden pairs, X-Wing)
- Generate puzzles that require specific techniques
- Show the techniques used on the result screen
- Multi-language UI

## Run locally

It is a static site with no dependencies and no build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deploy on Render (Free)

1. Push this repository to GitHub.
2. In the [Render dashboard](https://dashboard.render.com), click **New +** → **Static Site** and connect the repository.
3. Configure:
   - **Branch**: `main`
   - **Build Command**: leave empty (or `echo "no build"`)
   - **Publish Directory**: `.`
4. Click **Create Static Site**. Render will publish it at `https://<your-service>.onrender.com`; later pushes to `main` redeploy automatically.

Static sites on Render's free plan are not spun down, so there are no cold starts.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Page structure (home, game, result screens) |
| `style.css` | Styles |
| `solver.js` | Logic solver, technique/difficulty config, difficulty classification |
| `sudoku.js` | Puzzle generator and unique-solution backtracking solver |
| `tools/test-difficulty.js` | Node script to test difficulty generation |
| `app.js` | UI logic and game state |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA manifest, service worker (offline cache), app icons |
