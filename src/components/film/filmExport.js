import { allShots } from "./filmModel";
export const download = (name, content, type = "text/plain") => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
export function exportFilm(project, format) {
  const name =
    project.title.replace(/[^a-z0-9_-]/gi, "-").slice(0, 70) || "film";
  if (format === "json")
    return download(
      `${name}.json`,
      JSON.stringify(project, null, 2),
      "application/json",
    );
  const shots = allShots(project);
  if (format === "csv") {
    // Quote every cell, neutralise spreadsheet formulas, and retain multiline notes.
    const cell = (value) =>
      `"${String(value ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""')}"`;
    const keys = [
      "number",
      "title",
      "size",
      "angle",
      "movement",
      "lens",
      "audio",
      "priority",
      "status",
      "duration",
      "description",
    ];
    const rows = [
      ["Shot", "Scene", "Location", "Date", ...keys.slice(1)],
      ...shots.map((s) => [
        s.number,
        s.scene.title,
        s.scene.location,
        s.scene.date,
        ...keys.slice(1).map((k) => s[k]),
      ]),
    ];
    return download(
      `${name}-shots.csv`,
      "\ufeff" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  const lines = [
    `# ${project.title}`,
    "",
    project.logline || "",
    "",
    "## Project",
    ...Object.entries(project)
      .filter(
        ([key, value]) =>
          typeof value === "string" &&
          !["id", "title", "logline"].includes(key),
      )
      .map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Story",
    ...Object.entries(project.story).map(
      ([k, v]) => `\n### ${k}\n\n${String(v).replace(/<[^>]*>/g, "")}`,
    ),
  ];
  for (const seq of project.sequences)
    lines.push(
      `\n## Sequence: ${seq.title}`,
      ...Object.entries(seq)
        .filter(([k]) => !["id", "title"].includes(k))
        .map(([k, v]) => `- ${k}: ${v}`),
    );
  for (const [i, scene] of project.scenes.entries()) {
    lines.push(
      `\n## Scene ${i + 1}: ${scene.title}`,
      ...Object.entries(scene)
        .filter(
          ([k, v]) => !["id", "title", "shots", "checklist"].includes(k) && v,
        )
        .map(([k, v]) => `- ${k}: ${v}`),
    );
    for (const [j, shot] of scene.shots.entries())
      lines.push(
        `\n### Shot ${i + 1}.${j + 1}: ${shot.title}`,
        ...Object.entries(shot)
          .filter(
            ([k, v]) =>
              !["id", "title", "referenceImage", "sketch"].includes(k) && v,
          )
          .map(([k, v]) => `- ${k}: ${v}`),
      );
  }
  lines.push(
    "\n## Equipment",
    ...(project.equipment || []).map(
      (e) => `- [${e.packed ? "x" : " "}] ${e.name}`,
    ),
    "\n## Production checklist",
    ...Object.entries(project.checklist).map(
      ([k, v]) => `- [${v ? "x" : " "}] ${k}`,
    ),
  );
  download(`${name}.md`, lines.join("\n"), "text/markdown");
}
