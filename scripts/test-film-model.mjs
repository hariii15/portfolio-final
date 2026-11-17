import assert from "node:assert/strict";
import test from "node:test";
import {
  addShot,
  allShots,
  assignScene,
  deleteShot,
  findShot,
  newProject,
  newScene,
  newShot,
  setShotPosition,
  updateShot,
} from "../src/components/film/filmModel.js";

test("a film can start with a standalone shot and no scene", () => {
  const film = newProject({ title: "Test film" }),
    shot = newShot({ title: "A frame first" });
  addShot(film, shot);
  assert.equal(film.scenes.length, 0);
  assert.equal(allShots(film)[0].scene, null);
  assert.equal(allShots(film)[0].number, "01");
  updateShot(film, shot.id, { status: "Filmed" });
  assert.equal(findShot(film, shot.id).status, "Filmed");
});

test("legacy scene shots survive grouping, ungrouping and reordering without duplicates", () => {
  const a = newShot({ title: "A" }),
    b = newShot({ title: "B" }),
    c = newShot({ title: "C" });
  const first = { ...newScene(), shots: [a, b] },
    second = newScene();
  const film = {
    ...newProject({ title: "Legacy film", scenes: [first, second] }),
  };
  delete film.shots;
  delete film.shotOrder;
  assert.deepEqual(
    allShots(film).map((s) => s.id),
    [a.id, b.id],
  );
  addShot(film, c);
  setShotPosition(film, c.id, 0);
  assignScene(film, [a.id, c.id], second.id);
  assert.deepEqual(
    allShots(film).map((s) => s.id),
    [c.id, a.id, b.id],
  );
  assert.equal(second.shots.length, 2);
  assignScene(film, [a.id, c.id], second.id);
  assert.equal(allShots(film).length, 3);
  assignScene(film, [c.id], "");
  assert.equal(findShot(film, c.id).scene, null);
  assert.equal(findShot(film, a.id).scene.id, second.id);
  updateShot(film, a.id, { takes: "Take 3" });
  assert.equal(second.shots[0].takes, "Take 3");
  assert.ok(!Object.hasOwn(second.shots[0], "scene"));
  deleteShot(film, b.id);
  assert.deepEqual(
    allShots(film).map((s) => s.id),
    [c.id, a.id],
  );
  assert.deepEqual(film.shotOrder, [c.id, a.id]);
});

test("removing a scene can preserve every frame as unassigned", () => {
  const scene = { ...newScene(), shots: [newShot(), newShot()] };
  const film = newProject({ scenes: [scene] });
  const ids = allShots(film).map((s) => s.id);
  assignScene(film, ids, "");
  film.scenes = [];
  assert.deepEqual(
    allShots(film).map((s) => s.id),
    ids,
  );
  assert.ok(allShots(film).every((s) => s.scene === null));
});
