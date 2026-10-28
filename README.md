# MySudoku

A web-based Sudoku game for learning and improving solving techniques. Every puzzle is generated with a **unique solution**. The UI is currently in Chinese (multi-language support is planned).

## Features (v1)

- Three difficulty levels: Easy, Medium, Hard
- Unique-solution 9×9 puzzle generation
- Two input modes:
  - **Value** – one confirmed number per cell (clears the cell's candidates)
  - **Candidate** – multiple pencil-mark numbers per cell
- Undo, clear cell, restart, and submit
- Result screen showing the full answer, correctness (wrong cells highlighted), retry, and back to home
- Keyboard support: `1-9` to fill, `Backspace`/`Delete` to clear, `Ctrl+Z` to undo, arrow keys to move

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
| `sudoku.js` | Puzzle generator and unique-solution solver |
| `app.js` | UI logic and game state |
