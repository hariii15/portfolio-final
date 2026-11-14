import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FiPlus,
  FiArrowLeft,
  FiArrowUp,
  FiArrowDown,
  FiArrowUpRight,
  FiX,
  FiCheck,
  FiSearch,
  FiMoreHorizontal,
  FiCopy,
  FiTrash2,
  FiDownload,
  FiSun,
  FiMoon,
  FiEdit2,
  FiRefreshCw,
  FiChevronRight,
  FiMove,
  FiCornerUpLeft,
  FiCornerUpRight,
} from "react-icons/fi";
import { auth } from "../../firebase";
import useAdminAuth from "../tools/useAdminAuth";
import ShotArt from "./ShotArt";
import {
  ANGLES,
  ART,
  CHECKLISTS,
  EQUIPMENT,
  FORMATS,
  MOVEMENTS,
  PROJECT_GROUPS,
  SCENE_GROUPS,
  SEQUENCE_GROUPS,
  SHOT_GROUPS,
  SHOT_SIZES,
  SHOT_STATUS,
  STORY_FIELDS,
  TEMPLATES,
  allShots,
  coverage,
  localDate,
  newProject,
  newScene,
  newShot,
  reorder,
  uid,
} from "./filmModel";
import { exportFilm } from "./filmExport";
import "./shotbook.css";

const API =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api") + "/film";
async function request(path = "", options = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in again to open your films.");
  const token = await user.getIdToken();
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(45000),
  }).catch(() => {
    throw new Error(
      "Film storage is not responding. Check your connection and try again.",
    );
  });
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(
      new Error(
        result.error || "Could not reach film storage. Please try again.",
      ),
      { status: response.status },
    );
  return result;
}
const dateLabel = (value) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not scheduled";
const seconds = (value) =>
  `${Math.floor(value / 60)}m ${Math.round(value % 60)}s`;
const safeImage = (value) =>
  /^(https?:\/\/|data:image\/(png|jpeg|webp);base64,)/i.test(value || "")
    ? value
    : "";
const clone = (value) => JSON.parse(JSON.stringify(value));
const Button = ({ children, quiet = false, ...props }) => (
  <button
    type="button"
    className={`sb-button ${quiet ? "sb-quiet" : ""}`}
    {...props}
  >
    {children}
  </button>
);

function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  const headingId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const panel = ref.current;
    const tabbable = () =>
      [
        ...panel.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      ].filter((el) => el.offsetParent !== null);
    (tabbable()[1] || panel).focus();
    const keydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const items = tabbable(),
          first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="sb-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="sb-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        ref={ref}
      >
        <header>
          <div>
            <p className="sb-eyebrow">SHOTBOOK / WORKSPACE</p>
            <h2 id={headingId}>{title}</h2>
          </div>
          <button className="sb-icon" aria-label="Close" onClick={onClose}>
            <FiX />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function Field({ field, value, onChange }) {
  const id = useId();
  const { label, type = "text", options } = field;
  return (
    <label className={`sb-field ${type === "textarea" ? "sb-span" : ""}`}>
      <span>{label}</span>
      {type === "textarea" ? (
        <textarea
          name={field.key}
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <>
          <input
            name={field.key}
            id={id}
            type={options ? "text" : type}
            list={options ? `${id}-list` : undefined}
            value={value ?? ""}
            min={type === "number" ? 0 : undefined}
            step={type === "number" ? "any" : undefined}
            required={field.key === "title"}
            maxLength={field.key === "title" ? 180 : 12000}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => {
              if (type === "date" || type === "time")
                onChange(e.currentTarget.value);
            }}
          />
          {options && (
            <datalist id={`${id}-list`}>
              {options.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          )}
        </>
      )}
    </label>
  );
}

function ArtPicker({ value, palette, onChange }) {
  return (
    <details className="sb-disclosure sb-art-picker">
      <summary>
        Choose frame artwork{" "}
        <span>{ART.find((a) => a[0] === value)?.[1] || "Establishing"}</span>
      </summary>
      <p className="sb-muted">
        Original vector studies. Pick the frame that fits your idea.
      </p>
      <div className="sb-palette" aria-label="Artwork palette">
        {["ochre", "sage", "rust", "blue"].map((color) => (
          <button
            key={color}
            type="button"
            className={`sb-swatch ${color}`}
            aria-label={`${color} palette`}
            aria-pressed={(palette || "ochre") === color}
            onClick={() => onChange({ palette: color })}
          >
            {(palette || "ochre") === color && <FiCheck />}
          </button>
        ))}
      </div>
      <div className="sb-art-grid">
        {ART.map(([key, label, description]) => (
          <button
            type="button"
            key={key}
            aria-pressed={value === key}
            onClick={() => onChange({ art: key })}
          >
            <ShotArt type={key} palette={palette} />
            <span>
              {label} {value === key && <FiCheck />}
            </span>
            <small>{description}</small>
          </button>
        ))}
      </div>
    </details>
  );
}

function Sketch({ value, onChange }) {
  const canvas = useRef(null),
    drawing = useRef(false);
  useEffect(() => {
    const ctx = canvas.current.getContext("2d");
    ctx.fillStyle = "#e9e4d8";
    ctx.fillRect(0, 0, 720, 405);
    if (value) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, 720, 405);
      image.src = value;
    }
  }, [value]);
  const point = (e) => {
    const box = canvas.current.getBoundingClientRect();
    return [
      ((e.clientX - box.left) * 720) / box.width,
      ((e.clientY - box.top) * 405) / box.height,
    ];
  };
  return (
    <div className="sb-sketch">
      <p className="sb-muted">
        Draw with your finger or pointer. Save the sketch when you’re done.
      </p>
      <canvas
        aria-label="Storyboard sketch canvas"
        ref={canvas}
        width="720"
        height="405"
        onPointerDown={(e) => {
          drawing.current = true;
          canvas.current.setPointerCapture(e.pointerId);
          const ctx = canvas.current.getContext("2d");
          ctx.beginPath();
          ctx.moveTo(...point(e));
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = canvas.current.getContext("2d");
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.strokeStyle = "#30332e";
          ctx.lineTo(...point(e));
          ctx.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      <div className="sb-actions">
        <Button
          quiet
          onClick={() => {
            const ctx = canvas.current.getContext("2d");
            ctx.fillStyle = "#e9e4d8";
            ctx.fillRect(0, 0, 720, 405);
            onChange("");
          }}
        >
          Clear
        </Button>
        <Button onClick={() => onChange(canvas.current.toDataURL("image/png"))}>
          Keep sketch
        </Button>
      </div>
    </div>
  );
}

function EntityForm({ kind, initial, project, onSave, onClose, onDelete }) {
  const [values, setValues] = useState(clone(initial)),
    [error, setError] = useState("");
  const groups =
    kind === "project"
      ? PROJECT_GROUPS
      : kind === "sequence"
        ? SEQUENCE_GROUPS
        : kind === "scene"
          ? SCENE_GROUPS
          : SHOT_GROUPS;
  const set = (patch) => setValues((v) => ({ ...v, ...patch }));
  const templates = [...TEMPLATES, ...(project?.templates || [])];
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
      const bitmap = await createImageBitmap(file),
        canvas = document.createElement("canvas");
      const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      canvas
        .getContext("2d")
        .drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      set({ referenceImage: canvas.toDataURL("image/jpeg", 0.7) });
      setError("");
    } catch {
      setError("This image could not be opened. Try a different file.");
    }
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.title?.trim()) return setError("Please give this a title.");
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        onSave({
          ...values,
          ...fields,
          title: String(fields.title || values.title).trim(),
        });
      }}
    >
      {kind === "shot" && (
        <label className="sb-field sb-template">
          <span>Start with a template</span>
          <select
            defaultValue=""
            onChange={(e) => {
              const t = templates[Number(e.target.value)];
              if (t) {
                const { id: _id, ...fields } = t;
                set(fields);
              }
            }}
          >
            <option value="" disabled>
              Blank shot / choose a starting point
            </option>
            {templates.map((t, i) => (
              <option value={i} key={`${i}-${t.title}`}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {kind === "scene" && (
        <label className="sb-field sb-template">
          <span>Sequence</span>
          <select
            value={values.sequenceId || ""}
            onChange={(e) => set({ sequenceId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {project.sequences.map((s, i) => (
              <option key={s.id} value={s.id}>
                {i + 1}. {s.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {groups.map((group, i) => (
        <details key={group.title} className="sb-disclosure" open={i === 0}>
          <summary>
            {group.title}
            <span>{i ? "Optional details" : "Start here"}</span>
          </summary>
          <div className="sb-form-grid">
            {group.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={values[field.key]}
                onChange={(v) => set({ [field.key]: v })}
              />
            ))}
          </div>
        </details>
      ))}
      {(kind === "project" || kind === "shot") && (
        <ArtPicker value={values.art} palette={values.palette} onChange={set} />
      )}
      {kind === "shot" && (
        <details className="sb-disclosure">
          <summary>
            Storyboard reference <span>Image or sketch</span>
          </summary>
          <label className="sb-field">
            <span>Upload a reference</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={upload}
            />
          </label>
          {safeImage(values.referenceImage) && (
            <div className="sb-reference">
              <img src={values.referenceImage} alt="Shot reference" />
              <Button quiet onClick={() => set({ referenceImage: "" })}>
                Remove image
              </Button>
            </div>
          )}
          <Sketch
            value={values.sketch}
            onChange={(sketch) => set({ sketch })}
          />
        </details>
      )}
      {kind === "project" && onDelete && (
        <details className="sb-disclosure">
          <summary>Project actions</summary>
          <Button quiet onClick={onDelete}>
            <FiTrash2 /> Delete film
          </Button>
        </details>
      )}
      {error && (
        <p className="sb-error" role="alert">
          {error}
        </p>
      )}
      <footer className="sb-form-footer">
        <Button quiet onClick={onClose}>
          Cancel
        </Button>
        <button type="submit" className="sb-button">
          <FiCheck /> Keep {kind === "project" ? "film" : kind}
        </button>
      </footer>
    </form>
  );
}

const allowedTags = new Set([
  "P",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "UL",
  "OL",
  "LI",
  "DIV",
]);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const clean = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 1) {
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT"].includes(child.tagName)) {
          child.remove();
          continue;
        }
        clean(child);
        if (!allowedTags.has(child.tagName))
          child.replaceWith(...child.childNodes);
        else
          for (const attribute of [...child.attributes])
            child.removeAttribute(attribute.name);
      }
    }
  };
  clean(doc.body);
  return doc.body.innerHTML;
}
function StoryEditor({ value, onChange }) {
  const editor = useRef(null);
  useEffect(() => {
    if (editor.current && document.activeElement !== editor.current)
      editor.current.innerHTML = sanitize(value);
  }, [value]);
  return (
    <div className="sb-writing">
      <div
        className="sb-editor-tools"
        role="toolbar"
        aria-label="Writing format"
      >
        {[
          ["bold", "Bold"],
          ["italic", "Italic"],
          ["insertUnorderedList", "List"],
        ].map(([command, label]) => (
          <button
            type="button"
            key={command}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.current.focus();
              document.execCommand(command);
              onChange(sanitize(editor.current.innerHTML));
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        ref={editor}
        className="sb-richtext"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Free writing"
        aria-multiline="true"
        data-placeholder="Start with a moment, an image, a question…"
        onBlur={() => onChange(sanitize(editor.current.innerHTML))}
        onInput={() => onChange(sanitize(editor.current.innerHTML))}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand(
            "insertText",
            false,
            e.clipboardData.getData("text/plain"),
          );
        }}
      />
    </div>
  );
}

function Frame({ item, number, project = false, onClick }) {
  const image = safeImage(
    item.referenceImage || item.sketch || item.referenceUrl,
  );
  return (
    <button type="button" className="sb-frame" onClick={onClick}>
      <div className="sb-frame-art">
        {image && !project ? (
          <img
            src={image}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <ShotArt type={item.art} palette={item.palette} />
        <div className="sb-frame-top">
          <span>{number || item.format || "FILM"}</span>
          <time>{dateLabel(item.date || item.createdAt)}</time>
        </div>
        <div className="sb-frame-caption">
          <span className="sb-eyebrow">
            {project ? item.status : `${item.size || "Shot"} · ${item.status}`}
          </span>
          <h3>{item.title}</h3>
          <FiArrowUpRight />
        </div>
      </div>
      {project && (
        <div className="sb-frame-foot">
          <span>
            {item.scenes} scenes / {item.shots} shots
          </span>
          <span>
            Open film <FiChevronRight />
          </span>
        </div>
      )}
    </button>
  );
}

function useFilmDocument(id) {
  const [project, setProject] = useState(null),
    [state, setState] = useState("loading"),
    [error, setError] = useState(""),
    [tick, setTick] = useState(0),
    [recovery, setRecovery] = useState(null);
  const current = useRef(null),
    saved = useRef(""),
    revision = useRef(0),
    saving = useRef(false),
    blocked = useRef(false),
    active = useRef(true);
  const history = useRef([]),
    future = useRef([]);
  const key = `shotbook-draft:${auth.currentUser?.uid}:${id}`;
  useEffect(() => {
    active.current = true;
    request(`/${id}`)
      .then((data) => {
        if (!active.current) return;
        current.current = data;
        revision.current = data.revision;
        saved.current = JSON.stringify(data);
        setProject(data);
        setState("saved");
        try {
          const draft = JSON.parse(localStorage.getItem(key));
          if (
            draft?.project?.id === id &&
            JSON.stringify(draft.project) !== JSON.stringify(data)
          )
            setRecovery(draft.project);
        } catch {
          /* No local draft */
        }
      })
      .catch((err) => {
        if (active.current) {
          setError(err.message);
          setState("error");
        }
      });
    return () => {
      active.current = false;
    };
  }, [id, key]);
  const change = useCallback(
    (update) => {
      const before = current.current;
      if (!before) return;
      const next =
        typeof update === "function" ? update(clone(before)) : update;
      if (JSON.stringify(next) === JSON.stringify(before)) return;
      history.current = [...history.current.slice(-19), before];
      future.current = [];
      current.current = next;
      setProject(next);
      setState("pending");
      setTick((t) => t + 1);
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ project: next, baseRevision: revision.current }),
        );
      } catch {
        setError(
          "Device backup is full. Keep this page open until the server saves your work.",
        );
      }
    },
    [key],
  );
  useEffect(() => {
    if (
      !project ||
      saved.current === JSON.stringify(project) ||
      blocked.current
    )
      return;
    const timer = setTimeout(async () => {
      if (saving.current) {
        setTick((t) => t + 1);
        return;
      }
      saving.current = true;
      const snapshot = current.current;
      setState("saving");
      try {
        const data = await request(`/${id}`, {
          method: "PUT",
          body: JSON.stringify({ ...snapshot, revision: revision.current }),
        });
        revision.current = data.revision;
        if (!active.current) return;
        saved.current = JSON.stringify(data);
        if (current.current === snapshot) {
          current.current = data;
          setProject(data);
          setState("saved");
          setError("");
          try {
            localStorage.removeItem(key);
          } catch {
            /* The server has saved this film. */
          }
        } else {
          current.current = {
            ...current.current,
            revision: data.revision,
            updatedAt: data.updatedAt,
          };
          setProject(current.current);
          setTick((t) => t + 1);
          try {
            localStorage.setItem(
              key,
              JSON.stringify({
                project: current.current,
                baseRevision: data.revision,
              }),
            );
          } catch {
            /* Server save still available */
          }
        }
      } catch (err) {
        if (active.current) {
          blocked.current = true;
          setError(err.message);
          setState("error");
        }
      } finally {
        saving.current = false;
      }
    }, 850);
    return () => clearTimeout(timer);
  }, [project, id, tick, key]);
  useEffect(() => {
    const warn = (event) => {
      if (
        current.current &&
        saved.current !== JSON.stringify(current.current)
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  const travel = (direction) => {
    const source = direction === "undo" ? history : future,
      dest = direction === "undo" ? future : history;
    if (!source.current.length) return;
    dest.current.push(current.current);
    const next = source.current.pop();
    current.current = next;
    setProject(next);
    setState("pending");
    setTick((t) => t + 1);
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ project: next, baseRevision: revision.current }),
      );
    } catch {
      /* Server save still available */
    }
  };
  return {
    project,
    change,
    state,
    error,
    recovery,
    dismissRecovery: () => setRecovery(null),
    canUndo: !!history.current.length,
    canRedo: !!future.current.length,
    travel,
    retry: () => {
      if (!project) {
        window.location.reload();
        return;
      }
      blocked.current = false;
      setError("");
      setState("pending");
      setTick((t) => t + 1);
    },
  };
}

function FilmEditor({ id, onBack }) {
  const {
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
  } = useFilmDocument(id);
  const [view, setView] = useState("Overview"),
    [modal, setModal] = useState(null),
    [sceneId, setSceneId] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState({
      status: "",
      size: "",
      location: "",
      date: "",
      priority: "",
      equipment: "",
      subject: "",
      audio: "",
    }),
    [sort, setSort] = useState("order"),
    [selection, setSelection] = useState([]),
    [day, setDay] = useState(localDate()),
    [checkScope, setCheckScope] = useState("project"),
    [exportMode, setExportMode] = useState("Shooting plan");
  const drag = useRef(null);
  const close = useCallback(() => setModal(null), []);
  useEffect(() => {
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  if (!p)
    return (
      <div className="sb-loading">
        {error ? (
          <>
            <h1>Couldn’t open this film.</h1>
            <p>{error}</p>
            <Button onClick={retry}>Try again</Button>
            <Button quiet onClick={onBack}>
              Back to films
            </Button>
          </>
        ) : (
          <p>Opening your notebook…</p>
        )}
      </div>
    );
  const shots = allShots(p),
    filmed = shots.filter((s) =>
      ["Filmed", "Selected", "Edited"].includes(s.status),
    ).length;
  const selectedScene = p.scenes.find((s) => s.id === sceneId) || p.scenes[0];
  const updateScene = (id, update) =>
    change((d) => {
      d.scenes = d.scenes.map((s) => (s.id === id ? { ...s, ...update } : s));
      return d;
    });
  const updateShot = (sceneId, shotId, patch) =>
    change((d) => {
      const s = d.scenes.find((s) => s.id === sceneId);
      s.shots = s.shots.map((shot) =>
        shot.id === shotId ? { ...shot, ...patch } : shot,
      );
      return d;
    });
  const addShot = (scene, values = {}) => {
    if (!scene) {
      setNotice("Add a scene first, then plan its shots.");
      setView("Scenes");
      return;
    }
    const shot = newShot(values);
    setModal({ kind: "shot", initial: shot, sceneId: scene.id, isNew: true });
  };
  const applyModal = (values) => {
    if (modal.kind === "project") change((d) => ({ ...d, ...values }));
    if (modal.kind === "sequence")
      change((d) => {
        d.sequences = modal.isNew
          ? [...d.sequences, values]
          : d.sequences.map((s) => (s.id === values.id ? values : s));
        return d;
      });
    if (modal.kind === "scene") {
      change((d) => {
        d.scenes = modal.isNew
          ? [...d.scenes, values]
          : d.scenes.map((s) => (s.id === values.id ? values : s));
        return d;
      });
      setSceneId(values.id);
    }
    if (modal.kind === "shot")
      change((d) => {
        const scene = d.scenes.find((s) => s.id === modal.sceneId);
        scene.shots = modal.isNew
          ? [...scene.shots, values]
          : scene.shots.map((s) => (s.id === values.id ? values : s));
        return d;
      });
    close();
  };
  const remove = (kind, entity, sceneId) =>
    setModal({
      confirm: `Delete “${entity.title}”?`,
      text:
        kind === "scene"
          ? "Its shots and scene checklist will also be removed."
          : "You can undo this while the film stays open.",
      action: () => {
        change((d) => {
          if (kind === "scene")
            d.scenes = d.scenes.filter((s) => s.id !== entity.id);
          else if (kind === "sequence") {
            d.sequences = d.sequences.filter((s) => s.id !== entity.id);
            d.scenes = d.scenes.map((s) =>
              s.sequenceId === entity.id ? { ...s, sequenceId: "" } : s,
            );
          } else {
            const scene = d.scenes.find((s) => s.id === sceneId);
            scene.shots = scene.shots.filter((s) => s.id !== entity.id);
          }
          return d;
        });
        close();
      },
    });
  const move = (kind, from, to, sceneId) =>
    change((d) => {
      if (kind === "scene") d.scenes = reorder(d.scenes, from, to);
      else if (kind === "sequence")
        d.sequences = reorder(d.sequences, from, to);
      else {
        const scene = d.scenes.find((s) => s.id === sceneId);
        scene.shots = reorder(scene.shots, from, to);
      }
      return d;
    });
  const orderControls = (kind, index, count, sceneId) => (
    <div className="sb-order">
      <button
        className="sb-icon"
        disabled={index === 0}
        aria-label={`Move ${kind} up`}
        onClick={() => move(kind, index, index - 1, sceneId)}
      >
        <FiArrowUp />
      </button>
      <button
        className="sb-icon"
        disabled={index === count - 1}
        aria-label={`Move ${kind} down`}
        onClick={() => move(kind, index, index + 1, sceneId)}
      >
        <FiArrowDown />
      </button>
    </div>
  );
  const dragProps = (kind, index, sceneId) => ({
    draggable: true,
    onDragStart: (e) => {
      if (e.target.closest("button,input,select,textarea"))
        return e.preventDefault();
      drag.current = { kind, index, sceneId };
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    onDragOver: (e) => e.preventDefault(),
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (drag.current?.kind === kind && drag.current.sceneId === sceneId)
        move(kind, drag.current.index, index, sceneId);
      drag.current = null;
    },
  });
  const filtered = shots.filter(
    (s) =>
      (!query ||
        [
          s.title,
          s.description,
          s.subject,
          s.props,
          s.continuity,
          s.editorNotes,
          s.scene.title,
          s.scene.location,
          p.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!filter.status || s.status === filter.status) &&
      (!filter.size || s.size === filter.size) &&
      (!filter.location || s.scene.location === filter.location) &&
      (!filter.date || s.scene.date === filter.date) &&
      (!filter.priority || s.priority === filter.priority) &&
      (!filter.equipment ||
        `${s.equipment || ""},${s.scene.equipment || ""}`
          .toLowerCase()
          .includes(filter.equipment.toLowerCase())) &&
      (!filter.subject ||
        `${s.subject || ""},${s.scene.subjects || ""}`
          .toLowerCase()
          .includes(filter.subject.toLowerCase())) &&
      (!filter.audio || s.audio === filter.audio),
  );
  if (sort === "duration")
    filtered.sort((a, b) => Number(b.duration || 0) - Number(a.duration || 0));
  if (sort === "priority")
    filtered.sort(
      (a, b) =>
        ["Must have", "Useful", "If time allows"].indexOf(a.priority) -
        ["Must have", "Useful", "If time allows"].indexOf(b.priority),
    );
  const editShot = (s) =>
    setModal({
      kind: "shot",
      initial: s.scene.shots[s.index],
      sceneId: s.scene.id,
    });
  const unsaved = state !== "saved";
  const back = () => {
    if (unsaved)
      setModal({
        confirm: "Leave this film?",
        text: "Your latest changes have not reached the server. You can stay here to save, or leave with a device draft.",
        action: onBack,
      });
    else onBack();
  };
  const checklistTarget =
    checkScope === "project"
      ? p
      : p.scenes.find((s) => s.id === checkScope) || p;
  const toggleCheck = (key) =>
    change((d) => {
      const target =
        checkScope === "project"
          ? d
          : d.scenes.find((s) => s.id === checkScope) || d;
      target.checklist = {
        ...target.checklist,
        [key]: !target.checklist?.[key],
      };
      return d;
    });
  const usedEquipment = [
    ...new Set(
      [
        p.scenes.map((s) => s.equipment || "").join(","),
        ...shots.map(
          (s) =>
            `${s.equipment || ""},${s.lightingEquipment || ""},${s.camera || ""},${s.microphone || ""}`,
        ),
      ]
        .join(",")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const equipmentNames = new Set(p.equipment.map((e) => e.name.toLowerCase()));
  const missingEquipment = usedEquipment.filter(
    (name) => !equipmentNames.has(name.toLowerCase()),
  );
  const scheduled = p.scenes.filter((s) => s.date === day);
  const renderSceneShots = (scene) => (
    <>
      <div className="sb-shot-rows">
        {scene.shots.map((shot, i) => (
          <article
            key={shot.id}
            className="sb-shot-row"
            {...dragProps("shot", i, scene.id)}
          >
            <span className="sb-row-number">
              {p.scenes.indexOf(scene) + 1}.{i + 1}
            </span>
            <button
              className="sb-mini-frame"
              aria-label={`Edit ${shot.title}`}
              onClick={() =>
                setModal({ kind: "shot", initial: shot, sceneId: scene.id })
              }
            >
              <ShotArt type={shot.art} palette={shot.palette} />
            </button>
            <button
              className="sb-shot-title"
              onClick={() =>
                setModal({ kind: "shot", initial: shot, sceneId: scene.id })
              }
            >
              <strong>{shot.title}</strong>
              <small>
                {shot.size} · {shot.movement} · {shot.lens}
              </small>
            </button>
            <label className="sb-status">
              <span className="sb-sr">Status for {shot.title}</span>
              <select
                value={shot.status}
                onChange={(e) =>
                  updateShot(scene.id, shot.id, { status: e.target.value })
                }
              >
                {SHOT_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {orderControls("shot", i, scene.shots.length, scene.id)}
            <button
              className="sb-icon"
              aria-label={`Duplicate ${shot.title}`}
              onClick={() => {
                updateScene(scene.id, {
                  shots: [
                    ...scene.shots.slice(0, i + 1),
                    {
                      ...clone(shot),
                      id: uid(),
                      title: `${shot.title} (copy)`,
                    },
                    ...scene.shots.slice(i + 1),
                  ],
                });
              }}
            >
              <FiCopy />
            </button>
            <button
              className="sb-icon"
              aria-label={`Delete ${shot.title}`}
              onClick={() => remove("shot", shot, scene.id)}
            >
              <FiTrash2 />
            </button>
          </article>
        ))}
      </div>
      <Button quiet onClick={() => addShot(scene)}>
        <FiPlus /> Add shot
      </Button>
    </>
  );
  const renderScene = (scene, i) => (
    <details
      className="sb-scene sb-disclosure"
      key={scene.id}
      open={scene.id === selectedScene?.id}
      {...dragProps("scene", i)}
    >
      <summary onClick={() => setSceneId(scene.id)}>
        <span className="sb-row-number">
          SC {String(i + 1).padStart(2, "0")}
        </span>
        <span className="sb-scene-title">
          {scene.title}
          <small>
            {[scene.location, scene.timeOfDay, dateLabel(scene.date)]
              .filter(Boolean)
              .join(" / ")}
          </small>
        </span>
        <span>{scene.shots.length} shots</span>
      </summary>
      <div className="sb-scene-body">
        <div className="sb-actions">
          <span className="sb-tag">{scene.status}</span>
          <Button
            quiet
            onClick={() => setModal({ kind: "scene", initial: scene })}
          >
            <FiEdit2 /> Scene details
          </Button>
          {orderControls("scene", i, p.scenes.length)}
          <button
            className="sb-icon"
            aria-label={`Delete scene ${scene.title}`}
            onClick={() => remove("scene", scene)}
          >
            <FiTrash2 />
          </button>
        </div>
        {scene.description && <p className="sb-prose">{scene.description}</p>}
        {renderSceneShots(scene)}
        <details className="sb-disclosure sb-coverage">
          <summary>
            Coverage notes <span>Optional</span>
          </summary>
          <p className="sb-muted">
            A useful starting point, not a rule. Keep what your scene needs.
          </p>
          {coverage(scene)
            .filter((c) => !scene.dismissedCoverage?.includes(c.title))
            .map((c) => (
              <div key={c.title} className="sb-coverage-row">
                <span>{c.title}</span>
                <Button quiet onClick={() => addShot(scene, c.template)}>
                  <FiPlus /> Add
                </Button>
                <button
                  className="sb-icon"
                  aria-label={`Dismiss ${c.title}`}
                  onClick={() =>
                    updateScene(scene.id, {
                      dismissedCoverage: [
                        ...(scene.dismissedCoverage || []),
                        c.title,
                      ],
                    })
                  }
                >
                  <FiX />
                </button>
              </div>
            ))}
          <p className="sb-muted">
            Record room tone and natural location sound before leaving. Consider
            an entrance, reaction, reverse angle, and transition where the story
            needs them.
          </p>
        </details>
      </div>
    </details>
  );
  return (
    <>
      <div className="sb-workspace-heading">
        <button className="sb-back" onClick={back}>
          <FiArrowLeft /> Films
        </button>
        <div className="sb-save" role="status">
          <i className={state} />
          {state === "saved"
            ? "Saved"
            : state === "saving"
              ? "Saving…"
              : state === "pending"
                ? "Unsaved changes"
                : "Not synced"}
        </div>
        <div className="sb-history">
          <button
            className="sb-icon"
            disabled={!canUndo}
            onClick={() => travel("undo")}
            aria-label="Undo"
          >
            <FiCornerUpLeft />
          </button>
          <button
            className="sb-icon"
            disabled={!canRedo}
            onClick={() => travel("redo")}
            aria-label="Redo"
          >
            <FiCornerUpRight />
          </button>
        </div>
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
      <header className="sb-film-title">
        <div>
          <p className="sb-eyebrow">
            {p.format} / {p.status}
          </p>
          <h1>{p.title}</h1>
          {p.logline && <p className="sb-prose">{p.logline}</p>}
        </div>
        <div className="sb-actions">
          <Button
            quiet
            onClick={() => setModal({ kind: "project", initial: p })}
          >
            <FiEdit2 /> Film details
          </Button>
          <Button quiet onClick={() => setModal({ export: true })}>
            <FiDownload /> Export
          </Button>
        </div>
      </header>
      <nav className="sb-tabs" aria-label="Film views">
        {[
          "Overview",
          "Story",
          "Scenes",
          "Shots",
          "Storyboard",
          "Shoot day",
          "Checklist",
        ].map((tab) => (
          <button
            key={tab}
            aria-current={view === tab ? "page" : undefined}
            onClick={() => {
              setView(tab);
              setSelection([]);
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
      <div className="sb-view" key={view}>
        {view === "Overview" && (
          <>
            <div className="sb-overview">
              <div className="sb-cover">
                <ShotArt type={p.art} palette={p.palette} />
                <span>
                  {p.aspectRatio} / {p.frameRate} FPS
                </span>
              </div>
              <div>
                <p className="sb-eyebrow">THE FILM AT A GLANCE</p>
                <h2>One frame at a time.</h2>
                <p className="sb-prose">
                  {p.concept ||
                    "Start with the story. Break it into scenes. Find the frames that make it yours."}
                </p>
                <div className="sb-counts">
                  <span>
                    <strong>{p.sequences.length}</strong> sequences
                  </span>
                  <span>
                    <strong>{p.scenes.length}</strong> scenes
                  </span>
                  <span>
                    <strong>{shots.length}</strong> shots
                  </span>
                </div>
                <div className="sb-progress">
                  <div
                    style={{
                      width: `${shots.length ? (filmed / shots.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="sb-muted">
                  {filmed} of {shots.length} shots filmed ·{" "}
                  {seconds(
                    shots.reduce((n, s) => n + Number(s.duration || 0), 0),
                  )}{" "}
                  planned screen time ·{" "}
                  {shots.reduce((n, s) => n + Number(s.shootMinutes || 0), 0)}{" "}
                  min shooting
                </p>
                <Button
                  onClick={() => setView(p.scenes.length ? "Scenes" : "Story")}
                >
                  {p.scenes.length ? "Open scene plan" : "Start with the story"}{" "}
                  <FiArrowUpRight />
                </Button>
              </div>
            </div>
            <div className="sb-two-columns">
              <section>
                <div className="sb-section-title">
                  <h2>Next on set</h2>
                  <button onClick={() => setView("Shoot day")}>
                    Schedule <FiArrowUpRight />
                  </button>
                </div>
                {p.scenes
                  .filter((s) => s.date && s.date >= localDate())
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 4)
                  .map((scene) => (
                    <button
                      className="sb-line-item"
                      key={scene.id}
                      onClick={() => {
                        setSceneId(scene.id);
                        setView("Scenes");
                      }}
                    >
                      <time>{dateLabel(scene.date)}</time>
                      <span>
                        {scene.title}
                        <small>
                          {scene.location || "Location to be decided"}
                        </small>
                      </span>
                      <FiChevronRight />
                    </button>
                  ))}
                {!p.scenes.some((s) => s.date && s.date >= localDate()) && (
                  <p className="sb-muted">
                    No upcoming shoots. Add a date to a scene when you’re ready.
                  </p>
                )}
              </section>
              <section>
                <div className="sb-section-title">
                  <h2>Planning notes</h2>
                </div>
                {p.scenes
                  .filter((s) => coverage(s).length)
                  .slice(0, 3)
                  .map((scene) => (
                    <button
                      className="sb-line-item"
                      key={scene.id}
                      onClick={() => {
                        setSceneId(scene.id);
                        setView("Scenes");
                      }}
                    >
                      <span>
                        {scene.title}
                        <small>
                          {coverage(scene)
                            .map((c) => c.title)
                            .join(" · ")}
                        </small>
                      </span>
                      <FiChevronRight />
                    </button>
                  ))}
                {!p.scenes.length && (
                  <p className="sb-muted">
                    Coverage suggestions appear as you build your scene list.
                  </p>
                )}
                {p.notes && <p className="sb-prose">{p.notes}</p>}
              </section>
            </div>
          </>
        )}
        {view === "Story" && (
          <section className="sb-story">
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">01 / FIND THE STORY</p>
                <h2>A place for the idea.</h2>
              </div>
            </div>
            <StoryEditor
              value={p.story.freewriting || ""}
              onChange={(html) =>
                change((d) => {
                  d.story.freewriting = html;
                  return d;
                })
              }
            />
            <details className="sb-disclosure">
              <summary>
                Shape the story <span>Prompts, when you need them</span>
              </summary>
              <div className="sb-form-grid">
                {STORY_FIELDS.map((field) => (
                  <Field
                    key={field.key}
                    field={field}
                    value={p.story[field.key]}
                    onChange={(v) =>
                      change((d) => {
                        d.story[field.key] = v;
                        return d;
                      })
                    }
                  />
                ))}
              </div>
            </details>
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">02 / GIVE IT MOVEMENT</p>
                <h2>Sequences</h2>
              </div>
              <Button
                quiet
                onClick={() =>
                  setModal({
                    kind: "sequence",
                    initial: { id: uid(), title: "", status: "Idea" },
                    isNew: true,
                  })
                }
              >
                <FiPlus /> Sequence
              </Button>
            </div>
            <p className="sb-muted">
              A sequence is a group of scenes with one purpose: leaving home, a
              journey, a quiet moment, a return.
            </p>
            {p.sequences.map((seq, i) => (
              <article
                className="sb-sequence"
                key={seq.id}
                {...dragProps("sequence", i)}
              >
                <span className="sb-row-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  className="sb-shot-title"
                  onClick={() => setModal({ kind: "sequence", initial: seq })}
                >
                  <strong>{seq.title}</strong>
                  <small>
                    {seq.purpose ||
                      `${p.scenes.filter((s) => s.sequenceId === seq.id).length} scenes`}
                  </small>
                </button>
                {orderControls("sequence", i, p.sequences.length)}
                <button
                  className="sb-icon"
                  aria-label={`Delete sequence ${seq.title}`}
                  onClick={() => remove("sequence", seq)}
                >
                  <FiTrash2 />
                </button>
              </article>
            ))}
          </section>
        )}
        {view === "Scenes" && (
          <>
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">03 / BUILD THE SCENE</p>
                <h2>The scene plan.</h2>
              </div>
              <Button
                onClick={() =>
                  setModal({
                    kind: "scene",
                    initial: { ...newScene(p.sequences[0]?.id), title: "" },
                    isNew: true,
                  })
                }
              >
                <FiPlus /> Scene
              </Button>
            </div>
            {!p.scenes.length && (
              <div className="sb-empty">
                <h3>Where does the story begin?</h3>
                <p>
                  Add a scene, choose a place, then plan what the camera sees.
                </p>
              </div>
            )}
            {[
              ...p.sequences.map((seq) => ({ id: seq.id, title: seq.title })),
              { id: "", title: p.sequences.length ? "Unassigned scenes" : "" },
            ].map((seq) => (
              <section key={seq.id} className="sb-sequence-group">
                {p.scenes.some((s) => (s.sequenceId || "") === seq.id) &&
                  seq.title && <p className="sb-eyebrow">{seq.title}</p>}
                {p.scenes.map((s, i) =>
                  (s.sequenceId || "") === seq.id ? renderScene(s, i) : null,
                )}
              </section>
            ))}
          </>
        )}
        {(view === "Shots" || view === "Storyboard") && (
          <>
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">04 / FIND THE FRAME</p>
                <h2>
                  {view === "Shots" ? "The shot list." : "The storyboard."}
                </h2>
              </div>
              <div className="sb-actions">
                <select
                  className="sb-scene-select"
                  aria-label="Scene for new shot"
                  value={selectedScene?.id || ""}
                  onChange={(e) => setSceneId(e.target.value)}
                >
                  {!p.scenes.length && (
                    <option value="">Add a scene first</option>
                  )}
                  {p.scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
                <Button onClick={() => addShot(selectedScene)}>
                  <FiPlus /> Shot
                </Button>
              </div>
            </div>
            <div className="sb-search-row">
              <label className="sb-search">
                <FiSearch />
                <input
                  placeholder="Find a shot, place, person or note"
                  aria-label="Search shots"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Filter shot status"
                value={filter.status}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">All statuses</option>
                {SHOT_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                aria-label="Sort shots"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="order">Shooting order</option>
                <option value="priority">Priority</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            <details className="sb-disclosure sb-filters">
              <summary>
                More filters{" "}
                <span>
                  {Object.values(filter).filter(Boolean).length} active
                </span>
              </summary>
              <div className="sb-form-grid">
                {[
                  ["size", "Shot size", SHOT_SIZES],
                  [
                    "location",
                    "Location",
                    [
                      ...new Set(
                        p.scenes.map((s) => s.location).filter(Boolean),
                      ),
                    ],
                  ],
                  [
                    "priority",
                    "Priority",
                    ["Must have", "Useful", "If time allows"],
                  ],
                  ["date", "Shoot date", null, "date"],
                  ["equipment", "Equipment"],
                  ["subject", "Character / subject"],
                  [
                    "audio",
                    "Audio requirement",
                    [
                      "Sync sound",
                      "Ambient only",
                      "Voiceover",
                      "Music only",
                      "Silent",
                    ],
                  ],
                ].map(([key, label, options, type]) => (
                  <Field
                    key={key}
                    field={{ key, label, options, type }}
                    value={filter[key]}
                    onChange={(v) => setFilter((f) => ({ ...f, [key]: v }))}
                  />
                ))}
              </div>
              <Button
                quiet
                onClick={() => {
                  setFilter({});
                  setQuery("");
                }}
              >
                Clear filters
              </Button>
            </details>
            <p className="sb-muted">
              {filtered.length} of {shots.length} shots
            </p>
            {view === "Storyboard" ? (
              <div className="sb-gallery">
                {filtered.map((s) => (
                  <Frame
                    key={s.id}
                    item={{ ...s, date: s.scene.date || s.date }}
                    number={`SC ${s.sceneIndex + 1} / SH ${s.index + 1}`}
                    onClick={() => editShot(s)}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="sb-bulk">
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        !!filtered.length &&
                        filtered.every((s) => selection.includes(s.id))
                      }
                      onChange={(e) =>
                        setSelection(
                          e.target.checked ? filtered.map((s) => s.id) : [],
                        )
                      }
                    />{" "}
                    Select visible
                  </label>
                  {selection.length > 0 && (
                    <label>
                      {selection.length} selected{" "}
                      <select
                        defaultValue=""
                        aria-label="Update selected shots"
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const status = e.target.value;
                          change((d) => {
                            d.scenes.forEach((s) =>
                              s.shots.forEach((shot) => {
                                if (selection.includes(shot.id))
                                  shot.status = status;
                              }),
                            );
                            return d;
                          });
                          setSelection([]);
                        }}
                      >
                        <option value="">Set status…</option>
                        {SHOT_STATUS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <div className="sb-table-wrap">
                  <table className="sb-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>No.</th>
                        <th>Shot / scene</th>
                        <th>Size</th>
                        <th>Angle</th>
                        <th>Movement</th>
                        <th>Lens</th>
                        <th>Audio</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <input
                              aria-label={`Select ${s.title}`}
                              type="checkbox"
                              checked={selection.includes(s.id)}
                              onChange={(e) =>
                                setSelection((v) =>
                                  e.target.checked
                                    ? [...v, s.id]
                                    : v.filter((id) => id !== s.id),
                                )
                              }
                            />
                          </td>
                          <td>{s.number}</td>
                          <td>
                            <button onClick={() => editShot(s)}>
                              <strong>{s.title}</strong>
                              <small>{s.scene.title}</small>
                            </button>
                          </td>
                          <td>{s.size}</td>
                          <td>{s.angle}</td>
                          <td>{s.movement}</td>
                          <td>{s.lens}</td>
                          <td>{s.audio || "—"}</td>
                          <td>{s.priority}</td>
                          <td>
                            <select
                              aria-label={`Status for ${s.title}`}
                              value={s.status}
                              onChange={(e) =>
                                updateShot(s.scene.id, s.id, {
                                  status: e.target.value,
                                })
                              }
                            >
                              {SHOT_STATUS.map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              className="sb-icon"
                              aria-label={`More actions for ${s.title}`}
                              onClick={() => setModal({ shotActions: s })}
                            >
                              <FiMoreHorizontal />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {!filtered.length && (
              <div className="sb-empty">
                <h3>
                  {shots.length
                    ? "No matching frames."
                    : "The first frame is yours."}
                </h3>
                <p>
                  {shots.length
                    ? "Try changing your search or filters."
                    : "Add a scene and a shot to begin your visual plan."}
                </p>
              </div>
            )}
          </>
        )}
        {view === "Shoot day" && (
          <>
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">05 / TAKE IT ON SET</p>
                <h2>Today, on location.</h2>
              </div>
              <label className="sb-field">
                <span>Shooting date</span>
                <input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </label>
            </div>
            <div className="sb-schedule">
              {scheduled.map((scene) => (
                <section key={scene.id}>
                  <div className="sb-section-title">
                    <h3>{scene.title}</h3>
                    <span className="sb-muted">
                      {scene.callTime || "Call time TBD"} /{" "}
                      {scene.location || "Location TBD"}
                    </span>
                  </div>
                  {scene.subjects && (
                    <p className="sb-muted">Cast: {scene.subjects}</p>
                  )}
                  {renderSceneShots(scene)}
                </section>
              ))}
              {!scheduled.length && (
                <p className="sb-empty">
                  No scenes on this date. Assign dates below to build your
                  shooting day.
                </p>
              )}
            </div>
            <details className="sb-disclosure" open>
              <summary>
                Schedule scenes <span>{p.scenes.length} scenes</span>
              </summary>
              {p.scenes.map((scene) => (
                <div className="sb-line-item" key={scene.id}>
                  <span>
                    {scene.title}
                    <small>{scene.location || "No location yet"}</small>
                  </span>
                  <input
                    aria-label={`Shoot date for ${scene.title}`}
                    type="date"
                    value={scene.date || ""}
                    onChange={(e) =>
                      updateScene(scene.id, { date: e.target.value })
                    }
                    onBlur={(e) =>
                      updateScene(scene.id, { date: e.currentTarget.value })
                    }
                  />
                </div>
              ))}
            </details>
            <details className="sb-disclosure">
              <summary>
                By location <span>Group the day</span>
              </summary>
              {[
                ...new Set(
                  p.scenes.map((s) => s.location || "Location undecided"),
                ),
              ].map((location) => {
                const scenes = p.scenes.filter(
                  (s) => (s.location || "Location undecided") === location,
                );
                const days = new Set(scenes.map((s) => s.date).filter(Boolean));
                return (
                  <section className="sb-location" key={location}>
                    <h3>{location}</h3>
                    {days.size > 1 && (
                      <p className="sb-warning">
                        This location is scheduled on {days.size} different
                        days. Combine them if it saves travel.
                      </p>
                    )}
                    {scenes.map((scene) => (
                      <button
                        className="sb-line-item"
                        key={scene.id}
                        onClick={() => {
                          setSceneId(scene.id);
                          setView("Scenes");
                        }}
                      >
                        <span>
                          {scene.title}
                          <small>
                            {scene.shots.length} shots /{" "}
                            {scene.subjects || "No cast listed"} /{" "}
                            {scene.props || "No props listed"}
                          </small>
                        </span>
                        <time>{dateLabel(scene.date)}</time>
                      </button>
                    ))}
                  </section>
                );
              })}
            </details>
            <details className="sb-disclosure">
              <summary>
                Equipment & requirements <span>Pack for the frame</span>
              </summary>
              <p className="sb-muted">
                Assign equipment in scene or shot details. This list collects
                those requirements.
              </p>
              {missingEquipment.length > 0 && (
                <p className="sb-warning">
                  Not yet in your equipment list: {missingEquipment.join(", ")}.
                </p>
              )}
              <div className="sb-equipment">
                {p.equipment.map((item) => (
                  <div className="sb-equipment-row" key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={item.packed}
                        onChange={() =>
                          change((d) => {
                            d.equipment = d.equipment.map((e) =>
                              e.id === item.id
                                ? { ...e, packed: !e.packed }
                                : e,
                            );
                            return d;
                          })
                        }
                      />
                      <span>{item.name}</span>
                    </label>
                    <button
                      className="sb-icon"
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        change((d) => {
                          d.equipment = d.equipment.filter(
                            (e) => e.id !== item.id,
                          );
                          return d;
                        })
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
                  if (name && !equipmentNames.has(name.toLowerCase()))
                    change((d) => {
                      d.equipment.push({ id: uid(), name, packed: false });
                      return d;
                    });
                  e.currentTarget.reset();
                }}
              >
                <input
                  aria-label="Equipment name"
                  list="sb-equipment-options"
                  name="equipment"
                  placeholder="Add equipment…"
                  required
                  maxLength={120}
                />
                <datalist id="sb-equipment-options">
                  {EQUIPMENT.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </datalist>
                <button className="sb-button" type="submit">
                  <FiPlus /> Add
                </button>
              </form>
            </details>
          </>
        )}
        {view === "Checklist" && (
          <>
            <div className="sb-section-title">
              <div>
                <p className="sb-eyebrow">06 / NOTHING LEFT BEHIND</p>
                <h2>The production checklist.</h2>
              </div>
              <select
                aria-label="Checklist scope"
                value={checkScope}
                onChange={(e) => setCheckScope(e.target.value)}
              >
                <option value="project">Whole film</option>
                {p.scenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
            <p className="sb-muted">
              {
                Object.values(checklistTarget.checklist || {}).filter(Boolean)
                  .length
              }{" "}
              tasks complete. Keep room tone and location sounds on your list.
            </p>
            <div className="sb-checklists">
              {Object.entries(CHECKLISTS).map(([stage, items], i) => (
                <details className="sb-disclosure" key={stage} open={i === 0}>
                  <summary>
                    {stage}
                    <span>
                      {
                        items.filter(
                          (item) =>
                            checklistTarget.checklist?.[`${stage}: ${item}`],
                        ).length
                      }{" "}
                      / {items.length}
                    </span>
                  </summary>
                  {items.map((item) => (
                    <label className="sb-check" key={item}>
                      <input
                        type="checkbox"
                        checked={
                          !!checklistTarget.checklist?.[`${stage}: ${item}`]
                        }
                        onChange={() => toggleCheck(`${stage}: ${item}`)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </details>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="sb-print">
        <h1>{p.title}</h1>
        <p>{p.logline}</p>
        <p>
          {p.format} / {p.aspectRatio} / {p.frameRate} fps /{" "}
          {dateLabel(new Date().toISOString())}
        </p>
        <h2>{exportMode}</h2>
        {exportMode === "Equipment checklist" ? (
          p.equipment.map((e) => <p key={e.id}>□ {e.name}</p>)
        ) : exportMode === "Daily call sheet" ? (
          <>
            <h3>{dateLabel(day)}</h3>
            {scheduled.map((scene) => (
              <section key={scene.id}>
                <h3>
                  {scene.callTime || "Time TBD"} · {scene.title}
                </h3>
                <p>
                  {scene.location} / {scene.subjects} / {scene.props}
                </p>
                {scene.shots.map((s) => (
                  <p key={s.id}>
                    {s.title} · {s.size} · {s.status}
                  </p>
                ))}
              </section>
            ))}
          </>
        ) : (
          <>
            {exportMode === "Shooting plan" && (
              <>
                <p>{p.concept}</p>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(p.story.freewriting),
                  }}
                />
                {Object.entries(p.story)
                  .filter(([k]) => k !== "freewriting")
                  .map(([k, v]) => (
                    <p key={k}>
                      <strong>{k}:</strong> {v}
                    </p>
                  ))}
              </>
            )}
            {(exportMode === "Location schedule"
              ? [...p.scenes].sort(
                  (a, b) =>
                    (a.location || "").localeCompare(b.location || "") ||
                    (a.date || "").localeCompare(b.date || ""),
                )
              : p.scenes
            ).map((scene) => (
              <section key={scene.id}>
                <h3>
                  Scene {p.scenes.indexOf(scene) + 1}: {scene.title}
                </h3>
                <p>
                  {scene.location} / {scene.timeOfDay} / {dateLabel(scene.date)}{" "}
                  / {scene.callTime}
                </p>
                {exportMode === "Scene breakdown" && (
                  <>
                    {SCENE_GROUPS.flatMap((g) => g.fields)
                      .filter((f) => scene[f.key])
                      .map((f) => (
                        <p key={f.key}>
                          {f.label}: {scene[f.key]}
                        </p>
                      ))}
                  </>
                )}
                {exportMode === "Location schedule" ? (
                  <p>
                    {scene.shots.length} shots · {scene.subjects} ·{" "}
                    {scene.props}
                  </p>
                ) : (
                  scene.shots.map((shot, j) => (
                    <article
                      key={shot.id}
                      className={
                        exportMode === "Storyboard" ? "sb-print-frame" : ""
                      }
                    >
                      {exportMode === "Storyboard" &&
                        (safeImage(
                          shot.referenceImage ||
                            shot.sketch ||
                            shot.referenceUrl,
                        ) ? (
                          <img
                            src={safeImage(
                              shot.referenceImage ||
                                shot.sketch ||
                                shot.referenceUrl,
                            )}
                            alt={shot.title}
                          />
                        ) : (
                          <ShotArt type={shot.art} palette={shot.palette} />
                        ))}
                      <h4>
                        {p.scenes.indexOf(scene) + 1}.{j + 1} / {shot.title}
                      </h4>
                      <p>
                        {shot.size} / {shot.angle} / {shot.movement} /{" "}
                        {shot.lens} / {shot.status}
                      </p>
                      <p>{shot.description}</p>
                      <p>
                        {shot.audio && `Audio: ${shot.audio}. `}
                        {shot.continuity && `Continuity: ${shot.continuity}. `}
                        {shot.notes}
                      </p>
                      {exportMode === "Shooting plan" &&
                        SHOT_GROUPS.slice(1)
                          .flatMap((group) => group.fields)
                          .filter(
                            (field) =>
                              shot[field.key] &&
                              ![
                                "referenceUrl",
                                "referenceLink",
                                "continuity",
                                "audio",
                              ].includes(field.key),
                          )
                          .map((field) => (
                            <p key={field.key}>
                              <strong>{field.label}:</strong> {shot[field.key]}
                            </p>
                          ))}
                    </article>
                  ))
                )}
              </section>
            ))}
          </>
        )}
      </div>
      {notice && (
        <div className="sb-toast" role="status">
          {notice}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal.confirm ||
            (modal.export
              ? "Take your plan with you."
              : modal.shotActions
                ? modal.shotActions.title
                : `${modal.isNew ? "New" : "Edit"} ${modal.kind === "project" ? "film" : modal.kind}`)
          }
          onClose={close}
        >
          {modal.confirm ? (
            <div className="sb-confirm">
              <p>{modal.text}</p>
              <div className="sb-actions">
                <Button quiet onClick={close}>
                  Cancel
                </Button>
                <Button onClick={modal.action}>Confirm</Button>
              </div>
            </div>
          ) : modal.export ? (
            <div className="sb-export">
              <p className="sb-muted">
                Print a clean production document, or choose “Save as PDF” in
                your browser’s print options.
              </p>
              <label className="sb-field">
                <span>Document</span>
                <select
                  value={exportMode}
                  onChange={(e) => setExportMode(e.target.value)}
                >
                  {[
                    "Shooting plan",
                    "Shot list",
                    "Storyboard",
                    "Scene breakdown",
                    "Equipment checklist",
                    "Location schedule",
                    "Daily call sheet",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <Button
                onClick={() => {
                  close();
                  setTimeout(() => window.print(), 100);
                }}
              >
                <FiDownload /> Print / Save as PDF
              </Button>
              <div className="sb-actions">
                {["csv", "json", "md"].map((format) => (
                  <Button
                    quiet
                    key={format}
                    onClick={() => exportFilm(p, format)}
                  >
                    Download {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          ) : modal.shotActions ? (
            <div className="sb-shot-actions">
              <Button quiet onClick={() => editShot(modal.shotActions)}>
                <FiEdit2 /> Edit shot
              </Button>
              <Button
                quiet
                onClick={() => {
                  const {
                    scene: _scene,
                    sceneIndex: _si,
                    index: _i,
                    number: _n,
                    id: _id,
                    referenceImage: _img,
                    sketch: _sketch,
                    ...template
                  } = modal.shotActions;
                  change((d) => {
                    d.templates.push(template);
                    return d;
                  });
                  setNotice("Saved as a reusable template in this film.");
                  close();
                }}
              >
                <FiCopy /> Save as template
              </Button>
              <label className="sb-field">
                <span>Move to another scene</span>
                <select
                  value={modal.shotActions.scene.id}
                  onChange={(e) => {
                    const targetId = e.target.value,
                      s = modal.shotActions;
                    change((d) => {
                      const source = d.scenes.find(
                          (scene) => scene.id === s.scene.id,
                        ),
                        target = d.scenes.find(
                          (scene) => scene.id === targetId,
                        );
                      const item = source.shots.find(
                        (shot) => shot.id === s.id,
                      );
                      source.shots = source.shots.filter(
                        (shot) => shot.id !== s.id,
                      );
                      target.shots.push(item);
                      return d;
                    });
                    close();
                  }}
                >
                  {p.scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                quiet
                onClick={() => {
                  const s = modal.shotActions;
                  updateScene(s.scene.id, {
                    shots: [
                      ...s.scene.shots,
                      {
                        ...clone(s.scene.shots[s.index]),
                        id: uid(),
                        title: `${s.title} (copy)`,
                      },
                    ],
                  });
                  close();
                }}
              >
                <FiCopy /> Duplicate shot
              </Button>
              <Button
                quiet
                onClick={() =>
                  remove("shot", modal.shotActions, modal.shotActions.scene.id)
                }
              >
                <FiTrash2 /> Delete shot
              </Button>
            </div>
          ) : (
            <EntityForm
              kind={modal.kind}
              initial={modal.initial}
              project={p}
              onSave={applyModal}
              onClose={close}
              onDelete={() =>
                setModal({
                  confirm: `Delete “${p.title}”?`,
                  text: "This permanently removes the film and its entire shooting plan. Download an export first if you want to keep a copy.",
                  action: async () => {
                    try {
                      await request(`/${id}?revision=${p.revision}`, {
                        method: "DELETE",
                      });
                      try {
                        localStorage.removeItem(
                          `shotbook-draft:${auth.currentUser.uid}:${id}`,
                        );
                      } catch {
                        /* Deleted from server */
                      }
                      onBack();
                    } catch (err) {
                      setNotice(err.message);
                      close();
                    }
                  },
                })
              }
            />
          )}
        </Modal>
      )}
    </>
  );
}

function FilmGallery({ onOpen }) {
  const [films, setFilms] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [modal, setModal] = useState(false),
    [creating, setCreating] = useState(false),
    [query, setQuery] = useState(""),
    [format, setFormat] = useState("");
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    request()
      .then(setFilms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);
  const close = useCallback(() => {
    if (!creating) setModal(false);
  }, [creating]);
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
  const filtered = films.filter(
    (f) =>
      (!format || f.format === format) &&
      (!query ||
        `${f.title} ${f.logline}`.toLowerCase().includes(query.toLowerCase())),
  );
  return (
    <>
      <header className="sb-gallery-heading">
        <div>
          <p className="sb-eyebrow">A PRIVATE NOTEBOOK FOR MOVING IMAGES</p>
          <h1>
            Your films<span className="sb-red">.</span>
          </h1>
          <p>From the first idea to the final frame.</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <FiPlus /> New film
        </Button>
      </header>
      <div className="sb-gallery-toolbar">
        <span className="sb-eyebrow">
          {String(films.length).padStart(2, "0")} / PROJECTS
        </span>
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
          aria-label="Filter film format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="">All formats</option>
          {FORMATS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className="sb-error" role="alert">
          {error}
          <Button quiet onClick={load}>
            <FiRefreshCw /> Try again
          </Button>
        </div>
      )}
      {loading ? (
        <div className="sb-loading">Opening the film shelf…</div>
      ) : films.length ? (
        <div className="sb-gallery">
          {filtered.map((film) => (
            <Frame
              item={film}
              key={film.id}
              project
              onClick={() => onOpen(film.id)}
            />
          ))}
          {!filtered.length && (
            <p className="sb-muted">No films match this search.</p>
          )}
        </div>
      ) : (
        !error && (
          <div className="sb-empty-start">
            <div className="sb-contact-sheet" aria-hidden="true">
              <ShotArt type="window" palette="sage" />
              <ShotArt type="portrait" palette="rust" />
              <ShotArt type="street" palette="ochre" />
            </div>
            <div>
              <p className="sb-eyebrow">AN EMPTY SHELF. AN OPEN FRAME.</p>
              <h2>What are you making?</h2>
              <p>
                A short film, a journey, a story worth keeping.
                <br />
                Give it a name. The rest can follow.
              </p>
              <Button onClick={() => setModal(true)}>
                <FiPlus /> Start your first film
              </Button>
            </div>
          </div>
        )
      )}
      <footer className="sb-footer">
        <span>SHOTBOOK / HARI</span>
        <span>STORY. SCENE. SHOT.</span>
      </footer>
      {modal && (
        <Modal title="A film starts with an idea." onClose={close}>
          {error && (
            <p className="sb-error" role="alert">
              {error}
            </p>
          )}
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
              onClose={close}
            />
          )}
        </Modal>
      )}
    </>
  );
}

export default function Shotbook() {
  const ready = useAdminAuth();
  const [params, setParams] = useSearchParams();
  const id = params.get("project");
  const [light, setLight] = useState(() => {
    try {
      return localStorage.getItem("shotbook-theme") === "light";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.title = "Shotbook · Film notebook";
    return () => {
      document.title = "Hariharpradeep";
    };
  }, []);
  const toggleTheme = () => {
    setLight((v) => !v);
    try {
      localStorage.setItem("shotbook-theme", light ? "dark" : "light");
    } catch {
      /* Theme still works */
    }
  };
  return (
    <div className={`shotbook ${light ? "sb-light" : ""}`}>
      <div className="sb-shell">
        <header className="sb-topbar">
          <Link
            to="/admin/dashboard"
            aria-label="Back to admin dashboard"
            className="sb-brand"
          >
            <span className="sb-brand-mark" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <i key={i} />
              ))}
            </span>
            SHOTBOOK<span className="sb-brand-index">01 / FILM</span>
          </Link>
          <div className="sb-topbar-right">
            <span className="sb-eyebrow">PRIVATE WORKSPACE</span>
            <button
              className="sb-icon"
              aria-label={`Switch to ${light ? "dark" : "light"} mode`}
              onClick={toggleTheme}
            >
              {light ? <FiMoon /> : <FiSun />}
            </button>
          </div>
        </header>
        {ready ? (
          id ? (
            <FilmEditor key={id} id={id} onBack={() => setParams({})} />
          ) : (
            <FilmGallery onOpen={(id) => setParams({ project: id })} />
          )
        ) : (
          <div className="sb-loading" role="status">
            Checking your admin session…
          </div>
        )}
      </div>
    </div>
  );
}
