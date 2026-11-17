import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUp,
  FiArrowDown,
  FiCheck,
  FiChevronRight,
  FiCopy,
  FiDownload,
  FiEdit2,
  FiFilm,
  FiGrid,
  FiList,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiVideo,
  FiX,
  FiCalendar,
  FiFileText,
  FiCheckSquare,
  FiPackage,
  FiCornerUpLeft,
  FiCornerUpRight,
} from "react-icons/fi";
import { auth } from "../../firebase";
import ShotArt from "./ShotArt";
import {
  ART,
  ANGLES,
  CHECKLISTS,
  COMPOSITIONS,
  EQUIPMENT,
  FORMATS,
  PROJECT_GROUPS,
  SCENE_COVERAGE,
  SCENE_GROUPS,
  SEQUENCE_GROUPS,
  SHOT_GROUPS,
  SHOT_STATUS,
  STORY_FIELDS,
  TEMPLATES,
  addShot,
  allShots,
  assignScene,
  deleteShot,
  findShot,
  localDate,
  newProject,
  newScene,
  newShot,
  reorder,
  setShotPosition,
  shotRecord,
  uid,
  updateShot,
} from "./filmModel";
import {
  request,
  dateLabel,
  seconds,
  safeImage,
  Button,
  Field,
  ArtPicker,
  Sketch,
  EntityForm,
  StoryEditor,
  sanitize,
  useFilmDocument,
} from "./filmShared";
import { exportFilm } from "./filmExport";

const NAV = [
  ["Overview", FiGrid],
  ["Gallery", FiVideo],
  ["Shot list", FiList],
  ["Scenes", FiFilm],
  ["Story", FiFileText],
  ["Shoot day", FiCalendar],
  ["Checklist", FiCheckSquare],
  ["Equipment", FiPackage],
  ["Settings", FiSettings],
];
const DONE = ["Filmed", "Selected", "Edited"];
const isFilmed = (shot) => DONE.includes(shot.status);

function Sidebar({
  title = "Your workspace",
  items,
  active,
  onSelect,
  onBack,
  footer,
}) {
  return (
    <>
      <aside className="fd-sidebar">
        <div className="fd-side-heading">
          {onBack && (
            <button className="sb-back" onClick={onBack}>
              <FiArrowLeft /> All films
            </button>
          )}
          <p className="sb-eyebrow">{onBack ? "CURRENT FILM" : "SHOTBOOK"}</p>
          <strong>{title}</strong>
        </div>
        <nav aria-label={onBack ? "Film workspace" : "Film library"}>
          {items.map(([name, icon, count]) => (
            <button
              key={name}
              aria-current={active === name ? "page" : undefined}
              onClick={() => onSelect(name)}
            >
              {React.createElement(icon)}
              <span>{name}</span>
              {count !== undefined && <small>{count}</small>}
            </button>
          ))}
        </nav>
        <div className="fd-side-footer">
          {footer || (
            <>
              <p>Keep the plan close.</p>
              <span>Story. Scene. Shot.</span>
            </>
          )}
        </div>
      </aside>
      <nav className="fd-mobile-nav" aria-label="Mobile workspace">
        <div>
          {items.slice(0, 4).map(([name, icon]) => (
            <button
              key={name}
              aria-current={active === name ? "page" : undefined}
              onClick={() => onSelect(name)}
            >
              {React.createElement(icon)}
              <span>{name}</span>
            </button>
          ))}
        </div>
        {items.length > 4 && (
          <label>
            <span className="sb-sr">More workspace views</span>
            <select
              value={
                items.slice(4).some(([name]) => name === active) ? active : ""
              }
              onChange={(e) => onSelect(e.target.value)}
            >
              <option value="" disabled>
                More
              </option>
              {items.slice(4).map(([name]) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        )}
      </nav>
    </>
  );
}

function TileArt({ item }) {
  const image = safeImage(
    item.referenceImage || item.sketch || item.referenceUrl,
  );
  return (
    <div className="fd-tile-art">
      <ShotArt type={item.art} palette={item.palette} />
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}

function Stats({ items }) {
  return (
    <div className="fd-stats">
      {items.map(([label, value, detail]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          {detail && <small>{detail}</small>}
        </div>
      ))}
    </div>
  );
}

function Empty({ title, children, action }) {
  return (
    <div className="fd-empty">
      <FiFilm />
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

function InlineConfirm({ title, description, onConfirm, onCancel, pending }) {
  return (
    <div className="fd-confirm" role="alert">
      <strong>{title}</strong>
      <p>{description}</p>
      <div className="sb-actions">
        <Button quiet onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onConfirm} disabled={pending}>
          {pending ? "Working…" : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

export function FilmLibrary({ onOpen }) {
  const [films, setFilms] = useState([]),
    [view, setView] = useState("Dashboard"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [creating, setCreating] = useState(false),
    [query, setQuery] = useState(""),
    [format, setFormat] = useState(""),
    [sort, setSort] = useState("recent");
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    request()
      .then(setFilms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  const create = async (values) => {
    setCreating(true);
    setError("");
    try {
      const film = await request("", {
        method: "POST",
        body: JSON.stringify(newProject(values)),
      });
      onOpen(film.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };
  const visible = films
    .filter(
      (f) =>
        (!format || f.format === format) &&
        `${f.title} ${f.logline}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  return (
    <div className="fd-layout">
      <Sidebar
        items={[
          ["Dashboard", FiGrid],
          ["All films", FiFilm],
          ["New film", FiPlus],
        ]}
        active={view}
        onSelect={setView}
      />
      <main className="fd-main">
        <header className="fd-page-heading">
          <div>
            <p className="sb-eyebrow">YOUR PRIVATE FILM WORKSPACE</p>
            <h1>
              {view === "New film"
                ? "Start a film."
                : view === "All films"
                  ? "Your films."
                  : "The big picture."}
            </h1>
            <p className="sb-muted">
              {view === "New film"
                ? "Give the idea a name. Add the rest when you need it."
                : "Every film and every frame, within reach."}
            </p>
          </div>
          {view !== "New film" && (
            <Button onClick={() => setView("New film")}>
              <FiPlus /> New film
            </Button>
          )}
        </header>
        {error && (
          <div className="sb-error" role="alert">
            {error}
            <Button quiet onClick={load}>
              Try again
            </Button>
          </div>
        )}
        {view === "New film" ? (
          <section className="fd-editor-panel">
            {creating ? (
              <p className="sb-loading">Creating your film…</p>
            ) : (
              <EntityForm
                kind="project"
                initial={{
                  title: "",
                  format: "Short film",
                  status: "Idea",
                  art: "landscape",
                  aspectRatio: "16:9",
                  frameRate: "24",
                  resolution: "4K",
                }}
                onSave={create}
                onClose={() => setView("Dashboard")}
              />
            )}
          </section>
        ) : (
          <>
            {view === "Dashboard" && (
              <Stats
                items={[
                  ["Films", films.length],
                  ["Scenes", films.reduce((n, f) => n + f.scenes, 0)],
                  ["Shots planned", films.reduce((n, f) => n + f.shots, 0)],
                  [
                    "Shots filmed",
                    films.reduce((n, f) => n + (f.filmed || 0), 0),
                  ],
                ]}
              />
            )}
            <div className="fd-section-heading">
              <h2>{view === "Dashboard" ? "Your film shelf" : "All films"}</h2>
              <span className="sb-muted">{films.length} stored films</span>
            </div>
            <div className="fd-filters">
              <label className="sb-search">
                <FiSearch />
                <input
                  aria-label="Search films"
                  placeholder="Find a film"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Film format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="">All formats</option>
                {FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <select
                aria-label="Sort films"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="recent">Recently edited</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
            {loading ? (
              <p className="sb-loading" role="status">
                Opening your film shelf…
              </p>
            ) : films.length ? (
              <div className="fd-film-grid">
                {visible.map((film) => (
                  <button
                    className="fd-film-card"
                    key={film.id}
                    onClick={() => onOpen(film.id)}
                  >
                    <div className="fd-cover">
                      <ShotArt type={film.art} palette={film.palette} />
                      <time>{dateLabel(film.createdAt)}</time>
                      <span>{film.format}</span>
                    </div>
                    <div>
                      <h3>{film.title}</h3>
                      <p>
                        {film.scenes} scenes · {film.shots} shots ·{" "}
                        {film.status}
                      </p>
                      <small>Edited {dateLabel(film.updatedAt)}</small>
                    </div>
                  </button>
                ))}
                {!visible.length && (
                  <p className="sb-muted">No films match your search.</p>
                )}
              </div>
            ) : (
              !error && (
                <Empty
                  title="What are you making?"
                  action={
                    <Button onClick={() => setView("New film")}>
                      <FiPlus /> Start your first film
                    </Button>
                  }
                >
                  Create a film, or start with a few shots once you’ve named it.
                </Empty>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SceneSelect({
  project,
  value = "",
  onChange,
  label = "Assign scene",
  empty = "Unassigned",
}) {
  return (
    <select
      className="fd-scene-select"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{empty}</option>
      {project.scenes.map((scene, i) => (
        <option key={scene.id} value={scene.id}>
          {i + 1}. {scene.title}
        </option>
      ))}
    </select>
  );
}

function CoverageDropdown({ title, values, checked, onToggle }) {
  const complete = values.filter((value) => checked?.[value]).length;
  return (
    <details className="fd-coverage-dropdown">
      <summary>
        <span>{title}</span>
        <small>
          {complete}/{values.length}
        </small>
      </summary>
      <div>
        {values.map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              checked={!!checked?.[value]}
              onChange={() => onToggle(value)}
            />
            <span>{value}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function RecordFields({ groups, value, onChange }) {
  return (
    <div className="fd-record-fields">
      {groups.map((group, i) => (
        <details className="sb-disclosure" key={group.title} open={i === 0}>
          <summary>
            {group.title}
            <span>{i ? "Optional details" : "Edit directly · autosaved"}</span>
          </summary>
          <div className="sb-form-grid">
            {group.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={value[field.key]}
                onChange={(next) => {
                  if (field.key === "title" && !next.trim()) return;
                  onChange({ [field.key]: next });
                }}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function ShotReference({ shot, onChange }) {
  const [error, setError] = useState("");
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 12 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image under 12 MB.");
      return;
    }
    try {
      const image = await createImageBitmap(file),
        canvas = document.createElement("canvas"),
        scale = Math.min(1, 720 / Math.max(image.width, image.height));
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      canvas
        .getContext("2d")
        .drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      onChange({ referenceImage: canvas.toDataURL("image/jpeg", 0.7) });
      setError("");
    } catch {
      setError("This image could not be opened. Try another one.");
    }
  };
  return (
    <details className="sb-disclosure">
      <summary>
        Reference & sketch <span>Optional</span>
      </summary>
      <label className="sb-field">
        <span>Upload a reference</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={upload}
        />
      </label>
      {safeImage(shot.referenceImage) && (
        <div className="sb-reference">
          <img src={shot.referenceImage} alt="Shot reference" />
          <Button quiet onClick={() => onChange({ referenceImage: "" })}>
            Remove image
          </Button>
        </div>
      )}
      <Sketch value={shot.sketch} onChange={(sketch) => onChange({ sketch })} />
      {error && (
        <p className="sb-error" role="alert">
          {error}
        </p>
      )}
    </details>
  );
}

function ShotTile({
  shot,
  project,
  selected,
  onSelect,
  onEdit,
  onStatus,
  onAssign,
}) {
  return (
    <article className="fd-shot-tile">
      <div className="fd-thumbnail">
        <button
          aria-label={`Open shot ${shot.number}: ${shot.title}`}
          onClick={onEdit}
        >
          <TileArt item={shot} />
        </button>
        <span className="fd-shot-number">SHOT {shot.number}</span>
        <time>
          {dateLabel(shot.scene?.date || shot.shootDate || shot.date)}
        </time>
        <label className="fd-tile-select">
          <input
            aria-label={`Select ${shot.title}`}
            type="checkbox"
            checked={selected}
            onChange={onSelect}
          />
        </label>
        <span className={`fd-status-stamp ${isFilmed(shot) ? "done" : ""}`}>
          {isFilmed(shot) && <FiCheck />}
          {shot.status}
        </span>
      </div>
      <div className="fd-shot-info">
        <button className="fd-shot-name" onClick={onEdit}>
          <h3>{shot.title}</h3>
        </button>
        <p>
          {shot.size} · {shot.movement}
        </p>
        <SceneSelect
          project={project}
          value={shot.scene?.id || ""}
          label={`Scene for ${shot.title}`}
          onChange={onAssign}
        />
        <button
          className={`fd-film-toggle ${isFilmed(shot) ? "done" : ""}`}
          onClick={() => onStatus(isFilmed(shot) ? "Planned" : "Filmed")}
        >
          <FiCheck />
          {isFilmed(shot) ? "Filmed · undo" : "Mark filmed"}
        </button>
      </div>
    </article>
  );
}

function PrintPlan({ project, mode, day }) {
  const shots = allShots(project),
    shown =
      mode === "Daily call sheet"
        ? shots.filter((shot) => (shot.scene?.date || shot.shootDate) === day)
        : shots;
  return (
    <div className="fd-print">
      <h1>{project.title}</h1>
      <p>{project.logline}</p>
      <h2>{mode}</h2>
      {mode === "Daily call sheet" && <p>{dateLabel(day)}</p>}
      {mode === "Equipment checklist" ? (
        project.equipment.map((item) => <p key={item.id}>□ {item.name}</p>)
      ) : mode === "Scene breakdown" || mode === "Location schedule" ? (
        [...project.scenes]
          .sort((a, b) =>
            mode === "Location schedule"
              ? (a.location || "").localeCompare(b.location || "")
              : 0,
          )
          .map((scene) => (
            <section key={scene.id}>
              <h3>{scene.title}</h3>
              <p>
                {scene.location} / {dateLabel(scene.date)} / {scene.callTime}
              </p>
              {SCENE_GROUPS.flatMap((group) => group.fields)
                .filter((field) => scene[field.key])
                .map((field) => (
                  <p key={field.key}>
                    <strong>{field.label}:</strong> {scene[field.key]}
                  </p>
                ))}
            </section>
          ))
      ) : (
        <>
          {mode === "Shooting plan" && (
            <>
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitize(project.story.freewriting),
                }}
              />
              {Object.entries(project.story)
                .filter(([key]) => key !== "freewriting")
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {value}
                  </p>
                ))}
            </>
          )}
          {shown.map((shot) => (
            <article
              className={mode === "Storyboard" ? "fd-print-frame" : ""}
              key={shot.id}
            >
              {mode === "Storyboard" && <TileArt item={shot} />}
              <h3>
                {shot.number}. {shot.title}
              </h3>
              <p>
                {shot.scene?.title || "Unassigned"} / {shot.size} / {shot.angle}{" "}
                / {shot.movement} / {shot.lens} / {shot.status}
              </p>
              <p>{shot.description}</p>
              <p>{shot.takes}</p>
              {mode === "Shooting plan" &&
                SHOT_GROUPS.slice(1)
                  .flatMap((group) => group.fields)
                  .filter((field) => shot[field.key])
                  .map((field) => (
                    <p key={field.key}>
                      <strong>{field.label}:</strong> {shot[field.key]}
                    </p>
                  ))}
            </article>
          ))}
        </>
      )}
    </div>
  );
}

export function FilmWorkspace({ id, onBack }) {
  const document = useFilmDocument(id),
    {
      project: p,
      change,
      state,
      error,
      retry,
      recovery,
      dismissRecovery,
      canUndo,
      canRedo,
      travel,
    } = document;
  const [params, setParams] = useSearchParams(),
    [query, setQuery] = useState(""),
    [sceneFilter, setSceneFilter] = useState(params.get("scene") || "all"),
    [statusFilter, setStatusFilter] = useState(""),
    [selection, setSelection] = useState([]),
    [confirm, setConfirm] = useState(null),
    [notice, setNotice] = useState(""),
    [day, setDay] = useState(localDate()),
    [printMode, setPrintMode] = useState("Shooting plan"),
    [busy, setBusy] = useState(false),
    [newShotScene, setNewShotScene] = useState(""),
    [newSequence, setNewSequence] = useState(false);
  const drag = useRef(null),
    content = useRef(null),
    statusRef = useRef(state);
  statusRef.current = state;
  const requestedView = params.get("view") || "Overview",
    view = [
      ...NAV.map(([name]) => name),
      "New shot",
      "New scene",
      "Shot",
    ].includes(requestedView)
      ? requestedView
      : "Overview";
  const shotId = params.get("shot"),
    sceneId = params.get("scene");
  const go = (next, extra = {}) => {
    setSelection([]);
    setConfirm(null);
    const scene =
      ["Gallery", "Shot list"].includes(next) && sceneFilter !== "all"
        ? { scene: sceneFilter }
        : {};
    setParams({ project: id, view: next, ...scene, ...extra });
    if (content.current)
      content.current.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const startShot = (scene) => {
    setNewShotScene(scene || "");
    go("New shot");
  };
  const patch = (shot, values) => change((d) => updateShot(d, shot.id, values));
  const group = (ids, target) => {
    change((d) => assignScene(d, ids, target));
    setSelection([]);
  };
  const back = () => {
    if (state !== "saved")
      setConfirm({
        title: "Leave with unsaved changes?",
        description:
          "Stay here until Saved appears, or download a draft before leaving.",
        action: onBack,
      });
    else onBack();
  };
  useEffect(() => {
    const handle = (event) => {
      if (statusRef.current !== "saved") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, []);
  if (!p)
    return (
      <div className="sb-loading">
        {error ? (
          <>
            <h1>Couldn’t open this film.</h1>
            <p>{error}</p>
            <Button onClick={retry}>Try again</Button>
            <Button quiet onClick={onBack}>
              All films
            </Button>
          </>
        ) : (
          <p>Opening your film workspace…</p>
        )}
      </div>
    );
  const shots = allShots(p),
    filmed = shots.filter(isFilmed).length,
    currentShot = findShot(p, shotId),
    currentScene = p.scenes.find((scene) => scene.id === sceneId);
  const sceneShots = (scene) =>
    shots.filter((shot) => shot.scene?.id === scene.id);
  const visible = shots.filter(
    (shot) =>
      (sceneFilter === "all" ||
        (sceneFilter === "unassigned"
          ? !shot.scene
          : shot.scene?.id === sceneFilter)) &&
      (!statusFilter || shot.status === statusFilter) &&
      `${shot.title} ${shot.description || ""} ${shot.subject || ""} ${shot.scene?.title || ""} ${shot.scene?.location || ""} ${shot.takes || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const nextShot = (sceneFilter === "all" ? shots : visible).find(
    (shot) => !isFilmed(shot),
  );
  const saveNewShot = (values) => {
    change((d) => addShot(d, values, newShotScene));
    go("Shot", { shot: values.id });
  };
  const updateScene = (scene, values) =>
    change((d) => {
      d.scenes = d.scenes.map((s) =>
        s.id === scene.id ? { ...s, ...values } : s,
      );
      return d;
    });
  const shotOptions = (
    <>
      <option value="all">All scenes</option>
      <option value="unassigned">Unassigned shots</option>
      {p.scenes.map((scene, i) => (
        <option key={scene.id} value={scene.id}>
          {i + 1}. {scene.title}
        </option>
      ))}
    </>
  );
  const filters = (
    <div className="fd-filters">
      <label className="sb-search">
        <FiSearch />
        <input
          aria-label="Search shots"
          placeholder="Find a shot, scene, place or note"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <select
        aria-label="Filter shots by scene"
        value={sceneFilter}
        onChange={(e) => {
          setSceneFilter(e.target.value);
          setSelection([]);
          const next = new URLSearchParams(params);
          if (e.target.value === "all") next.delete("scene");
          else next.set("scene", e.target.value);
          setParams(next, { replace: true });
        }}
      >
        {shotOptions}
      </select>
      <select
        aria-label="Filter shots by status"
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setSelection([]);
        }}
      >
        <option value="">All statuses</option>
        {SHOT_STATUS.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </div>
  );
  const bulk = (
    <div className="fd-bulk">
      <label>
        <input
          type="checkbox"
          aria-label="Select visible shots"
          checked={
            !!visible.length &&
            visible.every((shot) => selection.includes(shot.id))
          }
          onChange={(e) =>
            setSelection(e.target.checked ? visible.map((shot) => shot.id) : [])
          }
        />
        Select visible
      </label>
      <span>
        {visible.length} of {shots.length} shots
      </span>
      {selection.length > 0 && (
        <>
          <SceneSelect
            project={p}
            value=""
            empty={`Group ${selection.length} selected shots…`}
            label="Group selected shots into scene"
            onChange={(target) => group(selection, target)}
          />
          <Button quiet onClick={() => group(selection, "")}>
            Ungroup
          </Button>
          <Button
            quiet
            onClick={() => {
              change((d) => {
                selection.forEach((id) =>
                  updateShot(d, id, { status: "Filmed" }),
                );
                return d;
              });
              setSelection([]);
            }}
          >
            <FiCheck /> Mark filmed
          </Button>
        </>
      )}
    </div>
  );
  const shotStatus = (shot) => (
    <select
      aria-label={`Status for ${shot.title}`}
      value={shot.status}
      onChange={(e) => patch(shot, { status: e.target.value })}
    >
      {SHOT_STATUS.map((status) => (
        <option key={status}>{status}</option>
      ))}
    </select>
  );
  const sceneCoverage = (scene) => (
    <div className="fd-scene-coverage">
      {Object.entries(SCENE_COVERAGE)
        .filter(([title]) => title !== "Shot list")
        .map(([title, values]) => (
          <CoverageDropdown
            key={title}
            title={title}
            values={values}
            checked={scene.coverageChecklist?.[title]}
            onToggle={(value) =>
              updateScene(scene, {
                coverageChecklist: {
                  ...scene.coverageChecklist,
                  [title]: {
                    ...scene.coverageChecklist?.[title],
                    [value]: !scene.coverageChecklist?.[title]?.[value],
                  },
                },
              })
            }
          />
        ))}
      <details className="fd-coverage-dropdown">
        <summary>
          <span>Shot list</span>
          <small>
            {sceneShots(scene).filter(isFilmed).length}/{scene.shots.length}
          </small>
        </summary>
        <div>
          {sceneShots(scene).map((shot) => (
            <label key={shot.id}>
              <input
                type="checkbox"
                checked={isFilmed(shot)}
                onChange={() =>
                  patch(shot, { status: isFilmed(shot) ? "Planned" : "Filmed" })
                }
              />
              <span>
                {shot.number}. {shot.title}
              </span>
            </label>
          ))}
          {!scene.shots.length && (
            <p className="sb-muted">No shots assigned.</p>
          )}
        </div>
      </details>
    </div>
  );
  const deleteScene = (scene) =>
    setConfirm({
      title: `Remove “${scene.title}”?`,
      description:
        "Its shots will stay in the film as unassigned shots. You can group them again later.",
      action: () => {
        change((d) => {
          assignScene(
            d,
            scene.shots.map((shot) => shot.id),
            "",
          );
          d.scenes = d.scenes.filter((s) => s.id !== scene.id);
          return d;
        });
        setConfirm(null);
        setSceneFilter("all");
        go("Scenes");
      },
    });
  const selectedChecklist = currentScene || p;
  const checklist = (target) => (
    <div className="fd-checklist-groups">
      {Object.entries(CHECKLISTS).map(([stage, values], i) => (
        <details className="sb-disclosure" key={stage} open={i === 0}>
          <summary>
            {stage}
            <span>
              {
                values.filter(
                  (value) => target.checklist?.[`${stage}: ${value}`],
                ).length
              }
              /{values.length}
            </span>
          </summary>
          {values.map((value) => (
            <label className="sb-check" key={value}>
              <input
                type="checkbox"
                checked={!!target.checklist?.[`${stage}: ${value}`]}
                onChange={() => {
                  const next = {
                    ...target.checklist,
                    [`${stage}: ${value}`]:
                      !target.checklist?.[`${stage}: ${value}`],
                  };
                  if (target.id && target.id !== p.id)
                    updateScene(target, { checklist: next });
                  else change((d) => ({ ...d, checklist: next }));
                }}
              />
              <span>{value}</span>
            </label>
          ))}
        </details>
      ))}
    </div>
  );
  const takeNotes = (shot) => (
    <label className="sb-field">
      <span>Take notes / best take</span>
      <textarea
        rows={2}
        value={shot.takes || ""}
        placeholder="Take 3 is the keeper. Watch the cup position."
        onChange={(e) => patch(shot, { takes: e.target.value })}
      />
    </label>
  );
  const showShotList = (list) => (
    <div className="fd-shot-list">
      {list.map((shot) => (
        <article
          className="fd-list-row"
          key={shot.id}
          draggable
          onDragStart={(e) => {
            if (
              ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(
                e.target.tagName,
              )
            ) {
              e.preventDefault();
              return;
            }
            drag.current = shot.id;
            e.dataTransfer.setData("text/plain", shot.id);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const from = drag.current;
            if (from)
              change((d) =>
                setShotPosition(
                  d,
                  from,
                  shots.findIndex((s) => s.id === shot.id),
                ),
              );
            drag.current = null;
          }}
        >
          <label>
            <input
              aria-label={`Select ${shot.title}`}
              type="checkbox"
              checked={selection.includes(shot.id)}
              onChange={(e) =>
                setSelection((ids) =>
                  e.target.checked
                    ? [...ids, shot.id]
                    : ids.filter((id) => id !== shot.id),
                )
              }
            />
          </label>
          <span className="fd-row-number">{shot.number}</span>
          <button
            className="fd-list-thumbnail"
            aria-label={`Open ${shot.title}`}
            onClick={() => go("Shot", { shot: shot.id })}
          >
            <TileArt item={shot} />
          </button>
          <button
            className="fd-list-title"
            onClick={() => go("Shot", { shot: shot.id })}
          >
            <strong>{shot.title}</strong>
            <small>
              {shot.size} · {shot.movement} · {shot.lens}
            </small>
          </button>
          <SceneSelect
            project={p}
            value={shot.scene?.id || ""}
            label={`Scene for ${shot.title}`}
            onChange={(target) => group([shot.id], target)}
          />
          {shotStatus(shot)}
          <div className="fd-order-controls">
            <label>
              <span className="sb-sr">{`Order for ${shot.title}`}</span>
              <input
                type="number"
                aria-label={`Order for ${shot.title}`}
                min="1"
                max={shots.length}
                key={`${shot.id}:${shot.number}`}
                defaultValue={Number(shot.number)}
                onBlur={(e) => {
                  const number = Number(e.target.value);
                  if (Number.isFinite(number) && number >= 1)
                    change((d) => setShotPosition(d, shot.id, number - 1));
                }}
              />
            </label>
            <button
              className="sb-icon"
              disabled={Number(shot.number) === 1}
              aria-label={`Move ${shot.title} earlier`}
              onClick={() =>
                change((d) =>
                  setShotPosition(d, shot.id, Number(shot.number) - 2),
                )
              }
            >
              <FiArrowUp />
            </button>
            <button
              className="sb-icon"
              disabled={Number(shot.number) === shots.length}
              aria-label={`Move ${shot.title} later`}
              onClick={() =>
                change((d) => setShotPosition(d, shot.id, Number(shot.number)))
              }
            >
              <FiArrowDown />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
  return (
    <div className="fd-layout">
      <Sidebar
        title={p.title}
        active={
          view === "Shot" || view === "New shot"
            ? "Shot list"
            : view === "New scene"
              ? "Scenes"
              : view
        }
        onSelect={go}
        onBack={back}
        items={NAV.map(([name, icon]) => [
          name,
          icon,
          name === "Shot list"
            ? shots.length
            : name === "Scenes"
              ? p.scenes.length
              : undefined,
        ])}
        footer={
          <>
            <span className="sb-eyebrow">FILM PROGRESS</span>
            <strong>
              {filmed} / {shots.length} filmed
            </strong>
            <div className="sb-progress">
              <div
                style={{
                  width: `${shots.length ? (filmed / shots.length) * 100 : 0}%`,
                }}
              />
            </div>
            <Button quiet onClick={() => go("Shoot day")}>
              <FiVideo /> On set
            </Button>
          </>
        }
      />
      <main className="fd-main" ref={content}>
        <div className="fd-document-bar">
          <button className="sb-back" onClick={back}>
            <FiArrowLeft /> Films
          </button>
          <span className="sb-save" role="status">
            <i className={state} />
            {state === "saved"
              ? "Saved"
              : state === "saving"
                ? "Saving…"
                : state === "error"
                  ? "Not synced"
                  : "Unsaved changes"}
          </span>
          <button
            className="sb-icon"
            aria-label="Undo"
            disabled={!canUndo}
            onClick={() => travel("undo")}
          >
            <FiCornerUpLeft />
          </button>
          <button
            className="sb-icon"
            aria-label="Redo"
            disabled={!canRedo}
            onClick={() => travel("redo")}
          >
            <FiCornerUpRight />
          </button>
        </div>
        {error && (
          <div className="sb-error" role="alert">
            <span>{error}</span>
            <Button quiet onClick={retry}>
              Retry save
            </Button>
            <Button quiet onClick={() => exportFilm(p, "json")}>
              Download draft
            </Button>
          </div>
        )}
        {recovery && (
          <div className="sb-recovery">
            <p>A device draft from your last visit is available.</p>
            <Button
              onClick={() => {
                change(recovery);
                dismissRecovery();
              }}
            >
              Restore draft
            </Button>
            <Button quiet onClick={dismissRecovery}>
              Keep server version
            </Button>
          </div>
        )}
        <header className="fd-page-heading">
          <div>
            <p className="sb-eyebrow">
              {p.title} / {view}
            </p>
            <h1>
              {view === "Overview"
                ? p.title
                : view === "Shot"
                  ? currentShot?.title || "Shot not found"
                  : view === "Gallery"
                    ? "Every frame, in view."
                    : view === "Scenes"
                      ? "Group the story."
                      : view === "Shoot day"
                        ? "Ready for the next frame."
                        : view}
            </h1>
            {view === "Overview" && p.logline && (
              <p className="sb-muted">{p.logline}</p>
            )}
          </div>
          <div className="sb-actions">
            {view !== "New shot" && (
              <Button
                onClick={() =>
                  startShot(
                    view === "Scenes"
                      ? sceneId
                      : ["Gallery", "Shot list"].includes(view) &&
                          !["all", "unassigned"].includes(sceneFilter)
                        ? sceneFilter
                        : "",
                  )
                }
              >
                <FiPlus /> New shot
              </Button>
            )}
            {view === "Scenes" && (
              <Button quiet onClick={() => go("New scene")}>
                <FiPlus /> Scene
              </Button>
            )}
          </div>
        </header>
        {confirm && (
          <InlineConfirm
            title={confirm.title}
            description={confirm.description}
            onCancel={() => setConfirm(null)}
            pending={busy}
            onConfirm={confirm.action}
          />
        )}
        {notice && (
          <div className="fd-notice" role="status">
            <p>{notice}</p>
            <button
              className="sb-icon"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <FiX />
            </button>
          </div>
        )}
        {view === "Overview" && (
          <>
            <Stats
              items={[
                ["Scenes", p.scenes.length],
                ["Shots", shots.length],
                ["Filmed", filmed],
                ["Unassigned", shots.filter((shot) => !shot.scene).length],
              ]}
            />
            <p className="fd-runtime sb-muted">
              {seconds(
                shots.reduce(
                  (sum, shot) => sum + Number(shot.duration || 0),
                  0,
                ),
              )}{" "}
              planned screen time ·{" "}
              {shots.reduce(
                (sum, shot) => sum + Number(shot.shootMinutes || 0),
                0,
              )}{" "}
              min estimated shooting time
            </p>
            <div className="fd-overview-columns">
              <section className="fd-next-shot">
                <div className="fd-section-heading">
                  <h2>Next on camera</h2>
                  <span className="sb-eyebrow">SHOOTING ORDER</span>
                </div>
                {nextShot ? (
                  <>
                    <button
                      className="fd-next-art"
                      onClick={() => go("Shot", { shot: nextShot.id })}
                    >
                      <TileArt item={nextShot} />
                    </button>
                    <p className="sb-eyebrow">
                      SHOT {nextShot.number} /{" "}
                      {nextShot.scene?.title || "Unassigned"}
                    </p>
                    <h3>{nextShot.title}</h3>
                    <p className="sb-muted">
                      {nextShot.size} · {nextShot.angle} · {nextShot.lens}
                    </p>
                    <div className="sb-actions">
                      <Button
                        onClick={() => {
                          patch(nextShot, { status: "Filmed" });
                        }}
                      >
                        <FiCheck /> Mark filmed
                      </Button>
                      <Button quiet onClick={() => go("Gallery")}>
                        Open gallery
                      </Button>
                    </div>
                  </>
                ) : (
                  <Empty
                    title={
                      shots.length
                        ? "All planned shots are filmed."
                        : "Start with a shot."
                    }
                    action={
                      <Button onClick={() => startShot("")}>
                        <FiPlus /> New shot
                      </Button>
                    }
                  >
                    A scene is optional. Add your first frame whenever the idea
                    arrives.
                  </Empty>
                )}
              </section>
              <section>
                <div className="fd-section-heading">
                  <h2>Scenes at a glance</h2>
                  <Button quiet onClick={() => go("Scenes")}>
                    View all <FiChevronRight />
                  </Button>
                </div>
                {p.scenes.slice(0, 5).map((scene) => (
                  <div className="fd-overview-scene" key={scene.id}>
                    <button onClick={() => go("Scenes", { scene: scene.id })}>
                      <strong>{scene.title}</strong>
                      <small>
                        {scene.location || "Location undecided"} ·{" "}
                        {sceneShots(scene).filter(isFilmed).length}/
                        {scene.shots.length} filmed
                      </small>
                    </button>
                    {sceneCoverage(scene)}
                  </div>
                ))}
                {!p.scenes.length && (
                  <p className="sb-muted">
                    No scenes yet. Create shots freely, then group them when the
                    story takes shape.
                  </p>
                )}
                <div className="fd-section-heading">
                  <h2>Recent frames</h2>
                  <Button quiet onClick={() => go("Gallery")}>
                    Gallery <FiArrowRight />
                  </Button>
                </div>
                <div className="fd-mini-gallery">
                  {shots.slice(-4).map((shot) => (
                    <button
                      key={shot.id}
                      onClick={() => go("Shot", { shot: shot.id })}
                    >
                      <TileArt item={shot} />
                      <span>
                        {shot.number}. {shot.title}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
        {(view === "Gallery" || view === "Shot list") && (
          <>
            {filters}
            {bulk}
            {view === "Gallery" ? (
              <div className="fd-shot-grid">
                {visible.map((shot) => (
                  <ShotTile
                    key={shot.id}
                    shot={shot}
                    project={p}
                    selected={selection.includes(shot.id)}
                    onSelect={(e) =>
                      setSelection((ids) =>
                        e.target.checked
                          ? [...ids, shot.id]
                          : ids.filter((id) => id !== shot.id),
                      )
                    }
                    onEdit={() => go("Shot", { shot: shot.id })}
                    onAssign={(target) => group([shot.id], target)}
                    onStatus={(status) => patch(shot, { status })}
                  />
                ))}
              </div>
            ) : (
              showShotList(visible)
            )}
            {!visible.length && (
              <Empty
                title={
                  shots.length
                    ? "No frames match this filter."
                    : "The first frame is yours."
                }
                action={
                  shots.length ? (
                    <Button
                      quiet
                      onClick={() => {
                        setQuery("");
                        setSceneFilter("all");
                        setStatusFilter("");
                        const next = new URLSearchParams(params);
                        next.delete("scene");
                        setParams(next, { replace: true });
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={() => startShot("")}>
                      <FiPlus /> Create a shot
                    </Button>
                  )
                }
              >
                Create shots now and assign a scene whenever you’re ready.
              </Empty>
            )}
          </>
        )}
        {view === "New shot" && (
          <section className="fd-editor-panel">
            <label className="sb-field fd-assignment">
              <span>Scene (optional)</span>
              <SceneSelect
                project={p}
                value={newShotScene}
                onChange={setNewShotScene}
                label="Scene for new shot"
                empty="No scene yet · keep unassigned"
              />
            </label>
            <EntityForm
              key="new-shot"
              kind="shot"
              initial={newShot({ title: "" })}
              project={p}
              onSave={saveNewShot}
              onClose={() => go("Gallery")}
            />
          </section>
        )}
        {view === "Shot" &&
          (currentShot ? (
            <>
              <div className="fd-shot-detail">
                <section className="fd-shot-monitor">
                  <TileArt item={currentShot} />
                  <div className="fd-monitor-controls">
                    <span className="sb-eyebrow">
                      SHOT {currentShot.number} OF {shots.length}
                    </span>
                    {shotStatus(currentShot)}
                  </div>
                  <p className="sb-muted">
                    {currentShot.description ||
                      "Add the action in the frame in the details alongside."}
                  </p>
                  <Button
                    onClick={() => {
                      patch(currentShot, { status: "Filmed" });
                      const next = shots
                        .slice(Number(currentShot.number))
                        .find((shot) => !isFilmed(shot));
                      if (next) go("Shot", { shot: next.id });
                      else setNotice("No more unfilmed shots after this one.");
                    }}
                  >
                    <FiCheck /> Filmed · next shot <FiArrowRight />
                  </Button>
                  <label className="sb-field">
                    <span>Group into a scene</span>
                    <SceneSelect
                      project={p}
                      value={currentShot.scene?.id || ""}
                      label="Scene for this shot"
                      onChange={(target) => group([currentShot.id], target)}
                    />
                  </label>
                  <label className="sb-field">
                    <span>Shooting order</span>
                    <select
                      aria-label="Shooting order"
                      value={Number(currentShot.number)}
                      onChange={(e) =>
                        change((d) =>
                          setShotPosition(
                            d,
                            currentShot.id,
                            Number(e.target.value) - 1,
                          ),
                        )
                      }
                    >
                      {shots.map((shot, i) => (
                        <option key={shot.id} value={i + 1}>
                          {i + 1} of {shots.length}
                        </option>
                      ))}
                    </select>
                  </label>
                  {takeNotes(currentShot)}
                  <div className="sb-actions">
                    <Button
                      quiet
                      onClick={() => {
                        const copy = newShot({
                          ...shotRecord(currentShot),
                          id: uid(),
                          title: `${currentShot.title} (copy)`,
                        });
                        change((d) => addShot(d, copy, currentShot.scene?.id));
                        go("Shot", { shot: copy.id });
                      }}
                    >
                      <FiCopy /> Duplicate
                    </Button>
                    <Button
                      quiet
                      onClick={() => {
                        const template = shotRecord(currentShot);
                        delete template.id;
                        delete template.referenceImage;
                        delete template.sketch;
                        change((d) => ({
                          ...d,
                          templates: [...d.templates, template],
                        }));
                        setNotice("Saved as a template in this film.");
                      }}
                    >
                      Save template
                    </Button>
                    <Button
                      quiet
                      onClick={() =>
                        setConfirm({
                          title: `Delete “${currentShot.title}”?`,
                          description:
                            "You can undo this while the film stays open.",
                          action: () => {
                            change((d) => deleteShot(d, currentShot.id));
                            go("Gallery");
                          },
                        })
                      }
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                </section>
                <section className="fd-editor-panel">
                  <RecordFields
                    groups={SHOT_GROUPS}
                    value={currentShot}
                    onChange={(values) => patch(currentShot, values)}
                  />
                  <ArtPicker
                    value={currentShot.art}
                    palette={currentShot.palette}
                    onChange={(values) => patch(currentShot, values)}
                  />
                  <ShotReference
                    shot={currentShot}
                    onChange={(values) => patch(currentShot, values)}
                  />
                </section>
              </div>
            </>
          ) : (
            <Empty
              title="That shot is no longer here."
              action={
                <Button onClick={() => go("Gallery")}>Back to gallery</Button>
              }
            >
              Open the gallery to choose another frame.
            </Empty>
          ))}
        {view === "New scene" && (
          <section className="fd-editor-panel">
            <EntityForm
              key="new-scene"
              kind="scene"
              initial={{ ...newScene(), title: "" }}
              project={p}
              onSave={(scene) => {
                change((d) => ({ ...d, scenes: [...d.scenes, scene] }));
                go("Scenes", { scene: scene.id });
              }}
              onClose={() => go("Scenes")}
            />
          </section>
        )}
        {view === "Scenes" && (
          <>
            <div className="fd-scene-browser">
              <nav aria-label="Scene list">
                {p.scenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    aria-current={scene.id === sceneId ? "page" : undefined}
                    onClick={() => go("Scenes", { scene: scene.id })}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{scene.title}</strong>
                    <small>{scene.shots.length} shots</small>
                  </button>
                ))}
                <button onClick={() => go("New scene")}>
                  <FiPlus />
                  <strong>New scene</strong>
                </button>
              </nav>
              <section>
                {currentScene ? (
                  <>
                    <div className="fd-section-heading">
                      <div>
                        <h2>{currentScene.title}</h2>
                        <p className="sb-muted">
                          {currentScene.location || "Location undecided"} ·{" "}
                          {dateLabel(currentScene.date)}
                        </p>
                      </div>
                      <Button onClick={() => startShot(currentScene.id)}>
                        <FiPlus /> Shot in this scene
                      </Button>
                    </div>
                    {sceneCoverage(currentScene)}
                    <div className="fd-section-heading">
                      <h3>Shots in this scene</h3>
                      <Button
                        quiet
                        onClick={() => {
                          setSceneFilter(currentScene.id);
                          go("Gallery", { scene: currentScene.id });
                        }}
                      >
                        Open scene gallery
                      </Button>
                    </div>
                    {showShotList(sceneShots(currentScene))}
                    {!currentScene.shots.length && (
                      <p className="sb-muted">
                        Assign existing shots from the gallery, or add a shot
                        here.
                      </p>
                    )}
                    <details className="sb-disclosure">
                      <summary>
                        Scene details<span>Edit in place</span>
                      </summary>
                      <label className="sb-field">
                        <span>Sequence</span>
                        <select
                          aria-label="Scene sequence"
                          value={currentScene.sequenceId || ""}
                          onChange={(e) =>
                            updateScene(currentScene, {
                              sequenceId: e.target.value,
                            })
                          }
                        >
                          <option value="">Unassigned</option>
                          {p.sequences.map((seq) => (
                            <option key={seq.id} value={seq.id}>
                              {seq.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <RecordFields
                        groups={SCENE_GROUPS}
                        value={currentScene}
                        onChange={(values) => updateScene(currentScene, values)}
                      />
                      <div className="sb-actions">
                        <Button
                          quiet
                          disabled={p.scenes.indexOf(currentScene) === 0}
                          onClick={() =>
                            change((d) => ({
                              ...d,
                              scenes: reorder(
                                d.scenes,
                                d.scenes.findIndex(
                                  (s) => s.id === currentScene.id,
                                ),
                                d.scenes.findIndex(
                                  (s) => s.id === currentScene.id,
                                ) - 1,
                              ),
                            }))
                          }
                        >
                          <FiArrowUp /> Move scene earlier
                        </Button>
                        <Button
                          quiet
                          disabled={
                            p.scenes.indexOf(currentScene) ===
                            p.scenes.length - 1
                          }
                          onClick={() =>
                            change((d) => ({
                              ...d,
                              scenes: reorder(
                                d.scenes,
                                d.scenes.findIndex(
                                  (s) => s.id === currentScene.id,
                                ),
                                d.scenes.findIndex(
                                  (s) => s.id === currentScene.id,
                                ) + 1,
                              ),
                            }))
                          }
                        >
                          <FiArrowDown /> Move scene later
                        </Button>
                        <Button quiet onClick={() => deleteScene(currentScene)}>
                          <FiTrash2 /> Remove scene
                        </Button>
                      </div>
                    </details>
                    <details className="sb-disclosure">
                      <summary>
                        Scene production checklist
                        <span>
                          {
                            Object.values(currentScene.checklist || {}).filter(
                              Boolean,
                            ).length
                          }{" "}
                          complete
                        </span>
                      </summary>
                      {checklist(currentScene)}
                    </details>
                  </>
                ) : (
                  <>
                    {p.scenes.map((scene, i) => (
                      <article className="fd-scene-summary" key={scene.id}>
                        <button
                          onClick={() => go("Scenes", { scene: scene.id })}
                        >
                          <span className="sb-eyebrow">SCENE {i + 1}</span>
                          <h3>{scene.title}</h3>
                          <p>
                            {scene.location || "Location undecided"} ·{" "}
                            {scene.shots.length} shots
                          </p>
                        </button>
                        {sceneCoverage(scene)}
                        <Button
                          quiet
                          onClick={() => {
                            setSceneFilter(scene.id);
                            go("Gallery", { scene: scene.id });
                          }}
                        >
                          Show shots <FiArrowRight />
                        </Button>
                      </article>
                    ))}
                    {!p.scenes.length && (
                      <Empty
                        title="Group shots when you’re ready."
                        action={
                          <Button onClick={() => go("New scene")}>
                            <FiPlus /> Create a scene
                          </Button>
                        }
                      >
                        Scenes are optional. Your unassigned shots stay in the
                        gallery.
                      </Empty>
                    )}
                  </>
                )}
              </section>
            </div>
          </>
        )}
        {view === "Story" && (
          <section className="fd-story">
            <StoryEditor
              value={p.story.freewriting || ""}
              onChange={(html) =>
                change((d) => ({
                  ...d,
                  story: { ...d.story, freewriting: html },
                }))
              }
            />
            <details className="sb-disclosure">
              <summary>
                Story prompts<span>Optional</span>
              </summary>
              <div className="sb-form-grid">
                {STORY_FIELDS.map((field) => (
                  <Field
                    key={field.key}
                    field={field}
                    value={p.story[field.key]}
                    onChange={(value) =>
                      change((d) => ({
                        ...d,
                        story: { ...d.story, [field.key]: value },
                      }))
                    }
                  />
                ))}
              </div>
            </details>
            <div className="fd-section-heading">
              <h2>Sequences</h2>
              <Button quiet onClick={() => setNewSequence((value) => !value)}>
                <FiPlus /> Sequence
              </Button>
            </div>
            {newSequence && (
              <EntityForm
                kind="sequence"
                initial={{ id: uid(), title: "", status: "Idea" }}
                project={p}
                onSave={(sequence) => {
                  change((d) => ({
                    ...d,
                    sequences: [...d.sequences, sequence],
                  }));
                  setNewSequence(false);
                }}
                onClose={() => setNewSequence(false)}
              />
            )}
            {p.sequences.map((sequence, i) => (
              <details className="sb-disclosure" key={sequence.id}>
                <summary>
                  {i + 1}. {sequence.title}
                  <span>
                    {
                      p.scenes.filter((s) => s.sequenceId === sequence.id)
                        .length
                    }{" "}
                    scenes
                  </span>
                </summary>
                <RecordFields
                  groups={SEQUENCE_GROUPS}
                  value={sequence}
                  onChange={(values) =>
                    change((d) => ({
                      ...d,
                      sequences: d.sequences.map((s) =>
                        s.id === sequence.id ? { ...s, ...values } : s,
                      ),
                    }))
                  }
                />
                <div className="sb-actions">
                  <Button
                    quiet
                    disabled={!i}
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        sequences: reorder(d.sequences, i, i - 1),
                      }))
                    }
                  >
                    <FiArrowUp /> Earlier
                  </Button>
                  <Button
                    quiet
                    disabled={i === p.sequences.length - 1}
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        sequences: reorder(d.sequences, i, i + 1),
                      }))
                    }
                  >
                    <FiArrowDown /> Later
                  </Button>
                  <Button
                    quiet
                    onClick={() =>
                      setConfirm({
                        title: `Remove “${sequence.title}”?`,
                        description: "Its scenes and shots will be kept.",
                        action: () => {
                          change((d) => ({
                            ...d,
                            sequences: d.sequences.filter(
                              (s) => s.id !== sequence.id,
                            ),
                            scenes: d.scenes.map((s) =>
                              s.sequenceId === sequence.id
                                ? { ...s, sequenceId: "" }
                                : s,
                            ),
                          }));
                          setConfirm(null);
                        },
                      })
                    }
                  >
                    <FiTrash2 /> Remove sequence
                  </Button>
                </div>
              </details>
            ))}
          </section>
        )}
        {view === "Shoot day" && (
          <>
            <div className="fd-shoot-toolbar">
              <label className="sb-field">
                <span>Shooting date</span>
                <input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  onBlur={(e) => setDay(e.target.value)}
                />
              </label>
              <Button quiet onClick={() => go("Gallery")}>
                All frames <FiGrid />
              </Button>
            </div>
            {p.scenes
              .filter((scene) => scene.date === day)
              .map((scene) => (
                <section className="fd-day-scene" key={scene.id}>
                  <div className="fd-section-heading">
                    <div>
                      <h2>{scene.title}</h2>
                      <p className="sb-muted">
                        {scene.callTime || "Call time undecided"} ·{" "}
                        {scene.location || "Location undecided"}
                      </p>
                    </div>
                    <Button
                      quiet
                      onClick={() => go("Scenes", { scene: scene.id })}
                    >
                      Scene plan
                    </Button>
                  </div>
                  {sceneCoverage(scene)}
                  {sceneShots(scene).map((shot) => (
                    <article className="fd-onset-shot" key={shot.id}>
                      <button onClick={() => go("Shot", { shot: shot.id })}>
                        <TileArt item={shot} />
                      </button>
                      <div>
                        <p className="sb-eyebrow">SHOT {shot.number}</p>
                        <h3>{shot.title}</h3>
                        <p className="sb-muted">
                          {shot.size} · {shot.angle} · {shot.lens}
                        </p>
                        {shotStatus(shot)}
                        {takeNotes(shot)}
                      </div>
                      <Button
                        quiet
                        onClick={() =>
                          patch(shot, {
                            status: isFilmed(shot) ? "Planned" : "Filmed",
                          })
                        }
                      >
                        <FiCheck />
                        {isFilmed(shot) ? "Filmed · undo" : "Mark filmed"}
                      </Button>
                    </article>
                  ))}
                </section>
              ))}
            {!p.scenes.some((scene) => scene.date === day) && (
              <Empty
                title="No scenes scheduled for this date."
                action={
                  <Button onClick={() => go("Gallery")}>Open every shot</Button>
                }
              >
                Your full shot gallery is always available, including unassigned
                shots.
              </Empty>
            )}
            <details className="sb-disclosure">
              <summary>
                Schedule scenes<span>Set a date directly</span>
              </summary>
              {p.scenes.map((scene) => (
                <div className="fd-schedule-row" key={scene.id}>
                  <span>{scene.title}</span>
                  <input
                    type="date"
                    aria-label={`Shoot date for ${scene.title}`}
                    value={scene.date || ""}
                    onChange={(e) =>
                      updateScene(scene, { date: e.target.value })
                    }
                    onBlur={(e) => updateScene(scene, { date: e.target.value })}
                  />
                </div>
              ))}
            </details>
          </>
        )}
        {view === "Checklist" && (
          <>
            <div className="fd-section-heading">
              <h2>{currentScene ? currentScene.title : "Whole film"}</h2>
              <SceneSelect
                project={p}
                value={sceneId || ""}
                label="Checklist scene"
                empty="Whole film"
                onChange={(target) =>
                  go("Checklist", target ? { scene: target } : {})
                }
              />
            </div>
            {currentScene && sceneCoverage(currentScene)}
            {checklist(selectedChecklist)}
          </>
        )}
        {view === "Equipment" && (
          <>
            <p className="sb-muted">
              Keep the essentials ready before you leave. Check off packed items
              here.
            </p>
            <div className="fd-equipment-list">
              {p.equipment.map((item) => (
                <div className="sb-equipment-row" key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() =>
                        change((d) => ({
                          ...d,
                          equipment: d.equipment.map((e) =>
                            e.id === item.id ? { ...e, packed: !e.packed } : e,
                          ),
                        }))
                      }
                    />
                    <span>{item.name}</span>
                  </label>
                  <button
                    className="sb-icon"
                    aria-label={`Remove ${item.name}`}
                    onClick={() =>
                      change((d) => ({
                        ...d,
                        equipment: d.equipment.filter((e) => e.id !== item.id),
                      }))
                    }
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
            <form
              className="sb-inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                const name = new FormData(e.currentTarget)
                  .get("equipment")
                  .trim();
                if (
                  name &&
                  !p.equipment.some(
                    (item) => item.name.toLowerCase() === name.toLowerCase(),
                  )
                )
                  change((d) => ({
                    ...d,
                    equipment: [
                      ...d.equipment,
                      { id: uid(), name, packed: false },
                    ],
                  }));
                e.currentTarget.reset();
              }}
            >
              <input
                name="equipment"
                list="fd-equipment-options"
                aria-label="Equipment name"
                placeholder="Add equipment"
                required
                maxLength={120}
              />
              <datalist id="fd-equipment-options">
                {EQUIPMENT.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </datalist>
              <button className="sb-button" type="submit">
                <FiPlus /> Add
              </button>
            </form>
            <details className="sb-disclosure">
              <summary>
                Requirements from your shots<span>Camera, light & sound</span>
              </summary>
              {[
                ...new Set(
                  shots.flatMap((shot) =>
                    `${shot.equipment || ""},${shot.camera || ""},${shot.microphone || ""},${shot.lightingEquipment || ""},${shot.scene?.equipment || ""}`
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  ),
                ),
              ].map((name) => (
                <p className="sb-muted" key={name}>
                  {p.equipment.some(
                    (item) => item.name.toLowerCase() === name.toLowerCase(),
                  )
                    ? "✓"
                    : "□"}{" "}
                  {name}
                </p>
              ))}
            </details>
          </>
        )}
        {view === "Settings" && (
          <section className="fd-editor-panel">
            <details className="sb-disclosure" open>
              <summary>
                Export your plan<span>PDF or download</span>
              </summary>
              <label className="sb-field">
                <span>Print document</span>
                <select
                  aria-label="Print document"
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value)}
                >
                  {[
                    "Shooting plan",
                    "Shot list",
                    "Storyboard",
                    "Scene breakdown",
                    "Location schedule",
                    "Equipment checklist",
                    "Daily call sheet",
                  ].map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </label>
              <div className="sb-actions fd-export-actions">
                <Button onClick={() => window.print()}>
                  <FiDownload /> Print / Save as PDF
                </Button>
                {["csv", "json", "md"].map((format) => (
                  <Button
                    quiet
                    key={format}
                    onClick={() => exportFilm(p, format)}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
              <p className="sb-muted">
                Daily call sheet uses {dateLabel(day)}. Change the date in Shoot
                day.
              </p>
            </details>
            <RecordFields
              groups={PROJECT_GROUPS}
              value={p}
              onChange={(values) => change((d) => ({ ...d, ...values }))}
            />
            <ArtPicker
              value={p.art}
              palette={p.palette}
              onChange={(values) => change((d) => ({ ...d, ...values }))}
            />
            <details className="sb-disclosure">
              <summary>Delete this film</summary>
              <p className="sb-muted">
                Download an export first if you want to keep a copy.
              </p>
              <Button
                quiet
                disabled={state !== "saved"}
                onClick={() =>
                  setConfirm({
                    title: `Delete “${p.title}”?`,
                    description:
                      "This permanently removes the film and all its shots. Export it first if you want to keep a copy.",
                    action: async () => {
                      setBusy(true);
                      try {
                        await request(`/${id}?revision=${p.revision}`, {
                          method: "DELETE",
                        });
                        try {
                          localStorage.removeItem(
                            `shotbook-draft:${auth.currentUser.uid}:${id}`,
                          );
                        } catch {
                          /* Server deletion succeeded */
                        }
                        onBack();
                      } catch (err) {
                        setNotice(err.message);
                        setConfirm(null);
                      } finally {
                        setBusy(false);
                      }
                    },
                  })
                }
              >
                <FiTrash2 /> Delete film
              </Button>
            </details>
          </section>
        )}
        <PrintPlan project={p} mode={printMode} day={day} />
      </main>
    </div>
  );
}
