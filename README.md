# TFCC Circuit Tracker

A static, private-by-default exercise tracker suitable for GitHub Pages.

## Workout flow

1. On the home page, select **1, 2, or 3 rounds per circuit**.
2. Press **Start workout**.
3. Complete every exercise in Circuit 1 in order, repeating Circuit 1 for the selected number of rounds. Then do the same for Circuit 2 and Circuit 3.
4. Use **Previous exercise** and **Next exercise**. Previous is hidden for the first exercise; on the final exercise, Next becomes **Finish workout**.
5. Weight/setup and comment are **saved immediately**, and persist as the prefilled fields for that exercise in future workouts. They are shared across rounds; edits made in round 2 remain visible in round 3.
6. Going **Home** saves the current position. **Resume workout** restores it. **Start workout** creates a fresh run after confirmation.

No past-session list is retained; only the most recent value for each exercise and an unfinished workout position. Data is stored in browser `localStorage` under `tfcc-circuit-tracker-v2`. Existing v1 training logs (if present on the same device) are read once to seed latest values. Browser privacy modes or clearing site data may remove the information.

## Deploy on GitHub Pages

Upload `index.html`, `style.css`, `app.js`, `exercises.json` into a repository root. In **Settings → Pages**, choose **Deploy from a branch**, `main`, `/(root)`. The page will be published at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

To test locally, run `python -m http.server 8000` from this directory and visit `http://localhost:8000` (double-clicking `index.html` may block JSON loading).

## Storage

GitHub Pages only hosts code; your most recently entered weight and comment for each exercise stay in the local browser. Each browser/device starts separately. Clearing browser data may erase the values. The home page deliberately has no backup/transfer/reset controls.
