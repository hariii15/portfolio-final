# Shotbook

The private filmmaking notebook at `/film`, linked from the admin dashboard.
It uses the existing Firebase login and the backend's `checkAdmin` middleware.
No Shotbook action submits activity, scores, or XP.

## Working model

Each film contains a story, ordered sequences, scenes, and shots. Technical
fields live in expandable sections. Sequence membership is explicit; scenes
and shots are numbered from their current order. Arrow controls provide a
touch and keyboard alternative to dragging.

The library is a dashboard with totals and every stored film. Inside a film,
a persistent sidebar opens Overview, Gallery, Shot list, Scenes, Story,
Shoot day, Checklist, Equipment, and Settings. On phones, quick navigation
and a section selector provide access to the same pages. Creating and editing
take place in the workspace; normal workflows do not open modal dialogs.

Shots can be created without a scene. Assign one shot through its scene
dropdown, or select several in the gallery and group them together. Filter
by scene (including Unassigned), status, or search. Scene filters are included
in the gallery URL for bookmarking. Shooting order is independent of scene
membership and can be changed through numbers, arrows, or dragging.

Scene cards provide small Angles, Frames, and Shot list checklists. The Shot
list is the actual assigned shots: checking one marks it filmed everywhere.
The gallery also has one-tap filmed controls. The shot workspace includes
take notes and Filmed / next shot. Removing a scene keeps its shots unassigned.

Legacy records keep their nested `scene.shots` arrays. Standalone shots are
stored in `project.shots`; `project.shotOrder` tracks the global shooting order.
Older documents remain readable without a destructive migration.

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
Model regression checks: `node --test scripts/test-film-model.mjs`.
Backend: `npm run test:film`; use `npm run test:film -- --firestore` for an
integration test with a disposable, automatically cleaned-up film record.
