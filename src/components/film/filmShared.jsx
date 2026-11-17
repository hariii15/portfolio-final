/* eslint-disable react-refresh/only-export-components -- Shared editor and persistence primitives. */
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import { auth } from "../../firebase";
import ShotArt from "./ShotArt";
import {
  ART,
  PROJECT_GROUPS,
  SEQUENCE_GROUPS,
  SCENE_GROUPS,
  SHOT_GROUPS,
  TEMPLATES,
} from "./filmModel";
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

export {
  request,
  dateLabel,
  seconds,
  safeImage,
  clone,
  Button,
  Field,
  ArtPicker,
  Sketch,
  EntityForm,
  StoryEditor,
  sanitize,
  useFilmDocument,
};
