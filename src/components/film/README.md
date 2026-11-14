# Shotbook

The private filmmaking notebook at `/film`, linked from the admin dashboard.
It uses the existing Firebase login and the backend's `checkAdmin` middleware.
No Shotbook action submits activity, scores, or XP.

## Working model

Each film contains a story, ordered sequences, scenes, and shots. Technical
fields live in expandable sections. Sequence membership is explicit; scenes
and shots are numbered from their current order. Arrow controls provide a
touch and keyboard alternative to dragging.

The gallery starts empty. Production never inserts the sample projects used
for local visual testing. Covers use the original 24 SVG studies in
`ShotArt.jsx`, with four palettes. Shot references can also use compressed
image uploads, an image URL, or a canvas sketch.

Story, Scenes, Shots, Storyboard, Shoot day, and Checklist views share the
same document. Equipment, reusable shot templates, coverage suggestions,
bulk statuses, scene transfers, and production checklists work within a film.
Free writing supports bold, italic, and lists; rendered HTML is restricted
to those formatting elements.

## Saving

Requests use `VITE_API_URL/film` and a fresh Firebase ID token. The backend
stores projects in the `film_projects` Firestore collection, with owner UID
and revision checks. The first film creation must reach the server.

Later edits autosave after a short pause. Pending edits have a device draft
under a user- and project-specific key. Errors are visible, with retry and
draft download controls. Revision conflicts stop saving rather than
overwriting another tab's work. A local draft can be restored after reload.
Images and total document size are bounded to fit Firestore documents.

The backend intentionally requires Firestore for film records. It does not
silently fall back to a deployment's temporary filesystem.

## Export

CSV, JSON, and Markdown download directly. Print styles provide shooting
plans, shot lists, storyboard sheets, scene breakdowns, equipment lists,
location schedules, and daily call sheets. PDF uses the browser's Save as PDF
option. Daily call sheets use the date selected in Shoot day.

## Verification

Frontend: `npm run build` and ESLint scoped to this directory's JS/JSX.
Backend: `npm run test:film`; use `npm run test:film -- --firestore` for an
integration test with a disposable, automatically cleaned-up film record.
