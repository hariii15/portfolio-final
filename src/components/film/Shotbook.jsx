import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import useAdminAuth from "../tools/useAdminAuth";
import { FilmWorkspace, FilmLibrary } from "./FilmDashboard";
import "./shotbook.css";
import "./filmDashboard.css";

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
            <FilmWorkspace key={id} id={id} onBack={() => setParams({})} />
          ) : (
            <FilmLibrary onOpen={(id) => setParams({ project: id })} />
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
