# THE INVITATION — Prototype 03 / Street Entry

First-person 3D exploration portfolio built with React, TypeScript, Vite, Three.js and React Three Fiber.

## What's new

- **Home screen:** Uses the original first image extracted from the supplied START.pdf, with no blue placement rectangles. The START button is an interactive star; the illustrated woman is a clickable red-outlined About Me button.
- **3D street:** The second PDF image is mapped onto the exterior entry wall. The third PDF image is used as a road-surface reference texture, with added lane markings, curbs and street lighting.
- First-person WASD movement, mouse look, Shift sprint, collisions, red cable, interactive artwork, terminal breach and five portfolio placeholders remain.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. Run `npm run build` to verify the production bundle.

## Deploy

Upload the files inside this `the-invitation-prototype` folder to the same folder in your GitHub `PORTFOLIO` repository. Your existing Vercel Root Directory remains `the-invitation-prototype`, framework Vite. Vercel will redeploy when you commit.

## Controls

- Start star: enter game; outlined woman: About Me
- WASD: walk; Mouse: look; Shift: sprint
- E: inspect nearby artwork, terminal, model or door
- Tab: signal network; Esc: pause/release pointer lock
- Clicking the canvas after closing a panel resumes mouse capture.

## Image sources

`public/scene/home-original.jpg`, `entry-wall.jpg`, `street-reference.jpg` are images extracted directly from the user-supplied START.pdf. They are not AI replacements. The home artwork has no blue placement rectangles in its underlying original image.

## Notes

The road reference is used as a ground texture, so it will be seen in perspective in 3D. This is a first-pass street environment, not an exact photogrammetric reconstruction. The red silhouette outline on the home screen is a hand-positioned SVG overlay; adjust `home-about` in `src/style.css` for precise alignment after checking your display.
