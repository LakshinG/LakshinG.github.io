# Personal website

Plain HTML, CSS, and JavaScript. There is no build step.

## Edit your content
Everything lives in `content.js`: name, intro, projects, experience, education, skills, and links.
Replace every `TODO`, then put your resume in this folder as `resume.pdf`.

## Preview locally
    python -m http.server 5173
Then open http://localhost:5173.

## Publishing
Live at https://lakshing.github.io (repo: LakshinG/LakshinG.github.io, served by GitHub Pages from `main`).
To update the live site, commit and push:

    git add -A
    git commit -m "Update content"
    git push

It goes live about a minute later.

## Live demos
Give a project `links.demo` and `embed: true` in `content.js` to get a "Try it here" button that opens the demo in a window on the page. Add `demoNote` to show a line of setup help. Some sites refuse to load inside other pages. If that happens, remove `embed` and the demo stays as a normal link.

## Project demos (`demos/`)
- `quant/`: the real Quant Stock Evaluation Engine front end, built as a static site that reads a saved snapshot. To refresh it, clone that repo, copy in the files from `demo-src/quant/` (apply `page.tsx.diff`), run `capture_snapshot.py snapshot` then `patch_snapshot.py`, copy `snapshot/` to `frontend/public/snapshot`, and build with `NEXT_PUBLIC_SNAPSHOT=1 NEXT_PUBLIC_BASE_PATH=/demos/quant next build`. Copy `frontend/out` here.
- `research/`: replay of the Research Agent. `demo-src/research/capture_snapshot.py` runs the real pipeline with a local Ollama model and writes `snapshot.json`.
- `novakv/`, `concurrency/`: hand-written JavaScript simulations. No build step.

## Design skills used
Installed in `.claude/skills/` so future Claude sessions in this folder use them too:
- `frontend-design` (Anthropic): visual direction and self-critique
- `web-design-guidelines` (Vercel): accessibility and UX audit. Ask Claude to "review my UI" to run it again.
