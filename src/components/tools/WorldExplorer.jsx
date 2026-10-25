import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { FiArrowLeft } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import { TOPO, DATA } from './worldExplorerData';
import './world-explorer.css';

const CONTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const BOX = {
  Africa: [-20, -36, 52, 38],
  Europe: [-25, 34, 45, 72],
  Asia: [25, -10, 150, 78],
  'North America': [-170, 6, -50, 75],
  'South America': [-84, -56, -33, 13],
  Oceania: [110, -48, 180, 3],
};

const W = 1000;
const H = 520;

const iso2 = (flag) => {
  if (!flag) return '';
  const c = [...flag].map((ch) => ch.codePointAt(0)).filter((n) => n >= 127462 && n <= 127487);
  return c.length >= 2
    ? c.slice(0, 2).map((n) => String.fromCharCode(n - 127397)).join('').toLowerCase()
    : '';
};

const Loader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
    <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">
      Verifying session
    </p>
  </div>
);

const WorldExplorerApp = () => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const svgEl = svgRef.current;
    if (!root || !svgEl) return;

    const $ = (s) => root.querySelector(s);
    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const dock = $('.we-dock');
    const qb = $('.we-qb');
    const tip = $('.we-tip');
    const toastEl = $('.we-toast');
    const listEl = $('.we-list');
    const legEl = $('.we-leg');
    const filterEl = $('[data-we-filter]');
    const sortEl = $('[data-we-sort]');
    const searchEl = $('.we-search');
    const namesEl = $('.we-names');
    const quizBtn = $('.we-quiz-btn');

    const listeners = [];
    const on = (el, ev, fn, opts) => {
      el.addEventListener(ev, fn, opts);
      listeners.push(() => el.removeEventListener(ev, fn, opts));
    };
    const timers = new Set();
    const later = (fn, ms) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };
    let resizeTimer = null;

    svg.attr('viewBox', `0 0 ${W} ${H}`);
    const g = svg.append('g');

    const proj = d3.geoNaturalEarth1().fitSize([W, H], { type: 'Sphere' });
    const path = d3.geoPath(proj);

    const idOf = (f) => String(f.id || '').padStart(3, '0');
    const R = (id) => DATA[id];

    const feats = feature(TOPO, TOPO.objects.countries).features;
    feats.forEach((f) => {
      const r = R(idOf(f));
      if (r) r.f = true;
    });

    const all = Object.values(DATA).filter((r) => r.f);
    const ranked = all.filter((r) => r.ind).sort((a, b) => b.area - a.area);
    ranked.forEach((r, i) => {
      r.rk = i + 1;
    });

    const paths = g.selectAll('path').data(feats).join('path').attr('d', path);
    g.attr('stroke-width', 0.6);

    const labelLayer = svg.append('g').attr('class', 'labels-layer').style('pointer-events', 'none');
    const labels = labelLayer
      .selectAll('text')
      .data(feats)
      .join('text')
      .attr('class', 'map-label')
      .attr('dy', '0.35em')
      .text((f) => {
        const r = R(idOf(f));
        return r ? r.n : '';
      });

    const measureCtx = document.createElement('canvas').getContext('2d');
    const FONT_PX = 11;

    const labelPoint = (f) => {
      if (f.geometry.type === 'Polygon') return path.centroid(f);
      let best = null;
      let m = -1;
      for (const c of f.geometry.coordinates) {
        const p = { type: 'Polygon', coordinates: c };
        const a = d3.geoArea(p);
        if (a > m) {
          m = a;
          best = p;
        }
      }
      return path.centroid(best);
    };

    const labelWidth = (n, size) => {
      measureCtx.font = '600 ' + size + 'px Inter,system-ui,sans-serif';
      return measureCtx.measureText(n).width;
    };

    feats.forEach((f) => {
      const r = R(idOf(f));
      if (!r) return;
      const c = labelPoint(f);
      if (!isFinite(c[0]) || !isFinite(c[1])) return;
      r._c = c;
      r._a = path.area(f);
    });

    let svgScale = 1;
    let labelRaf = null;
    const scheduleLabels = () => {
      if (labelRaf == null)
        labelRaf = requestAnimationFrame(() => {
          labelRaf = null;
          updateLabels();
        });
    };

    const relayoutLabels = () => {
      const b = svg.node().getBoundingClientRect();
      const cw = b.width || W;
      const ch = b.height || H;
      const s = Math.min(cw / W, ch / H) || 1;
      svgScale = s;
      g.attr('stroke-width', 0.6 / (d3.zoomTransform(svg.node()).k || 1) / s);
      const fs = FONT_PX / s;
      labels.style('font-size', fs + 'px');
      feats.forEach((f) => {
        const r = R(idOf(f));
        if (!r) return;
        r._fs = fs;
        r._w = labelWidth(r.n, fs);
      });
      updateLabels();
    };

    const updateLabels = () => {
      if (quiz && !quiz.locate) {
        labelLayer.style('display', 'none');
        return;
      }
      labelLayer.style('display', null);
      const t = d3.zoomTransform(svg.node());
      const cand = [];
      for (const f of feats) {
        const r = R(idOf(f));
        if (!r || !r._c || r._w == null) continue;
        if (cont !== 'All' && r.cont !== cont) continue;
        const x = t.x + t.k * r._c[0];
        const y = t.y + t.k * r._c[1];
        if (x < -70 || x > W + 70 || y < -24 || y > H + 24) continue;
        const a = r._a * t.k * t.k;
        const h = r._fs * 1.2;
        if (a < r._w * h * 1.6) continue;
        cand.push({ r, x, y, a, h });
      }
      cand.sort((A, B) => B.a - A.a);
      const placed = [];
      for (const c of cand) {
        if (placed.length >= 70) {
          c.show = false;
          continue;
        }
        const w = c.r._w + 4;
        const h = c.h;
        const bx0 = c.x - w / 2;
        const bx1 = c.x + w / 2;
        const by0 = c.y - h / 2;
        const by1 = c.y + h / 2;
        let hit = false;
        for (const b of placed) {
          if (bx0 < b[2] && bx1 > b[0] && by0 < b[3] && by1 > b[1]) {
            hit = true;
            break;
          }
        }
        if (hit) {
          c.show = false;
          continue;
        }
        placed.push([bx0, by0, bx1, by1]);
        c.show = true;
      }
      const pos = new Map();
      for (const c of cand) pos.set(c.r, c);
      labels
        .attr('x', (f) => {
          const c = pos.get(R(idOf(f)));
          return c ? c.x : 0;
        })
        .attr('y', (f) => {
          const c = pos.get(R(idOf(f)));
          return c ? c.y : 0;
        })
        .attr('display', (f) => {
          const c = pos.get(R(idOf(f)));
          return c && c.show ? null : 'none';
        });
      if (quiz && quiz.locate) {
        const r = R(quiz.locate);
        if (r && r._c) {
          labels
            .filter((f) => idOf(f) === quiz.locate)
            .attr('x', t.x + t.k * r._c[0])
            .attr('y', t.y + t.k * r._c[1])
            .attr('display', null);
        }
      }
    };

    /* geographic location (lon/lat) of each country's largest landmass */
    feats.forEach((f) => {
      const r = R(idOf(f));
      if (!r) return;
      let p = f;
      if (f.geometry.type === 'MultiPolygon') {
        let m = -1;
        for (const c of f.geometry.coordinates) {
          const q = { type: 'Polygon', coordinates: c };
          const a = d3.geoArea(q);
          if (a > m) {
            m = a;
            p = q;
          }
        }
      }
      const ga = d3.geoArea(p);
      if (r._ga == null || ga > r._ga) {
        r._ga = ga;
        r._ll = d3.geoCentroid(p);
      }
    });

    let cont = 'All';
    let sel = null;
    let quiz = null;
    let mode = 'map';
    let sortMode = 'az';
    const tourCache = {};

    const zoom = d3
      .zoom()
      .scaleExtent([1, 80])
      .extent([
        [0, 0],
        [W, H],
      ])
      .translateExtent([
        [-60, -40],
        [W + 60, H + 40],
      ])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
        g.attr('stroke-width', 0.6 / e.transform.k / (svgScale || 1));
        scheduleLabels();
      });

    svg.call(zoom).on('dblclick.zoom', null);

    const mainB = (f) => {
      if (f.geometry.type === 'Polygon') return path.bounds(f);
      let b;
      let m = -1;
      f.geometry.coordinates.forEach((c) => {
        const p = { type: 'Polygon', coordinates: c };
        const a = d3.geoArea(p);
        if (a > m) {
          m = a;
          b = p;
        }
      });
      return path.bounds(b);
    };

    function fly(b, maxK = 40) {
      const side = dock.classList.contains('open') && window.innerWidth > 640;
      const availW = side ? W - 330 : W;
      const availH = H;
      const cx = availW / 2;
      const cy = H / 2;
      const [[x0, y0], [x1, y1]] = b;
      const k = Math.max(
        1,
        Math.min(maxK, 0.78 * Math.min(availW / Math.max(1, x1 - x0), availH / Math.max(1, y1 - y0)))
      );
      svg
        .transition()
        .duration(400)
        .call(zoom.transform, d3.zoomIdentity.translate(cx - (k * (x0 + x1)) / 2, cy - (k * (y0 + y1)) / 2).scale(k));
    }

    function flyCont() {
      if (cont === 'All') return svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
      const [a, b, c, d] = BOX[cont];
      fly([proj([a, d]), proj([c, b])], 8);
    }

    function paint() {
      const nb = new Set(sel && !quiz ? R(sel).b : []);
      paths.attr('class', (f) => {
        const id = idOf(f);
        const r = R(id);
        if (!r) return 'c nodata';
        let c = 'c';
        if (cont !== 'All' && r.cont !== cont) c += ' dim';
        if (quiz) {
          const s = quiz.state[id];
          if (s) c += ' ' + s;
          if (quiz.flash === id) c += ' bad';
          if (quiz.locate === id) c += ' locate';
        } else {
          if (nb.has(id)) c += ' nb';
          if (id === sel) c += ' sel';
        }
        return c;
      });
      const focus = quiz ? quiz.locate : sel;
      paths.filter((f) => idOf(f) === focus).raise();
      scheduleLabels();
    }

    function geoOrder(rows) {
      const pts = rows.filter((r) => r._ll);
      const rest = rows.filter((r) => !r._ll).sort((a, b) => a.n.localeCompare(b.n));
      if (pts.length < 3) return pts.concat(rest);
      const n = pts.length;
      const D = pts.map((p) => Float64Array.from(pts, (q) => d3.geoDistance(p._ll, q._ll)));
      let s = 0;
      for (let i = 1; i < n; i++) if (pts[i]._ll[0] < pts[s]._ll[0]) s = i;
      const used = new Uint8Array(n);
      const t = [s];
      used[s] = 1;
      for (let k = 1; k < n; k++) {
        const c = t[t.length - 1];
        let b = -1;
        let bd = 1e9;
        for (let j = 0; j < n; j++)
          if (!used[j] && D[c][j] < bd) {
            bd = D[c][j];
            b = j;
          }
        used[b] = 1;
        t.push(b);
      }
      let imp = true;
      let guard = 0;
      while (imp && guard++ < 50) {
        imp = false;
        for (let i = 1; i < n - 1; i++)
          for (let j = i + 1; j < n; j++) {
            const a = t[i - 1];
            const b = t[i];
            const c = t[j];
            const d = j + 1 < n ? t[j + 1] : -1;
            const delta = D[a][c] + (d >= 0 ? D[b][d] : 0) - D[a][b] - (d >= 0 ? D[c][d] : 0);
            if (delta < -1e-9) {
              let x = i;
              let y = j;
              while (x < y) {
                const tmp = t[x];
                t[x] = t[y];
                t[y] = tmp;
                x++;
                y--;
              }
              imp = true;
            }
          }
      }
      return t.map((i) => pts[i]).concat(rest);
    }

    const orderedList = () => {
      const rows = all.filter((r) => cont === 'All' || r.cont === cont);
      if (sortMode === 'geo') return tourCache[cont] || (tourCache[cont] = geoOrder(rows));
      return rows.sort((a, b) => a.n.localeCompare(b.n));
    };

    function renderList() {
      const rows = orderedList();
      let html = '';
      let last = '';
      for (const r of rows) {
        const L = (r.n[0] || '').toUpperCase();
        if (sortMode === 'az' && L !== last) {
          html += `<div class="we-letter">${L}</div>`;
          last = L;
        }
        const code = iso2(r.flag);
        html += `<button class="we-row" data-id="${r.id}"><img class="we-flag" loading="lazy" src="https://flagcdn.com/w40/${code}.png" alt="" onerror="this.style.visibility='hidden'"><span class="we-row-name">${r.n}</span><span class="we-row-sub">${r.cont}</span></button>`;
      }
      listEl.innerHTML = html;
    }

    function showView(v) {
      mode = v;
      root.classList.toggle('we-listmode', v === 'list');
      $('[data-view="map"]').classList.toggle('on', v === 'map');
      $('[data-view="list"]').classList.toggle('on', v === 'list');
      if (v === 'list') {
        dock.classList.remove('open');
        renderList();
      } else scheduleLabels();
    }

    function setCont(c, quiet) {
      cont = c;
      filterEl.value = c;
      if (quiet) return;
      sel = null;
      dock.classList.remove('open');
      if (mode === 'list') {
        renderList();
        return;
      }
      paint();
      flyCont();
      if (quiz) startQuiz();
    }

    function pick(id) {
      const r = R(id);
      if (!r) return;
      if (cont !== 'All' && r.cont !== cont) setCont(r.cont, true);
      sel = id;
      render(r);
      dock.classList.add('open');
      paint();
      fly(mainB(feats.find((x) => idOf(x) === id)), 40);
      legEl.style.display = 'none';
    }

    function render(r) {
      const l = orderedList();
      const i = l.findIndex((x) => x.id === r.id);
      const nb = r.b.map(R).filter(Boolean);
      const n = [];
      n.push(
        r.b.length
          ? `Shares land borders with ${r.b.length} ${r.b.length > 1 ? 'countries' : 'country'}`
          : 'No land borders — an island or isolated territory'
      );
      if (r.ll) n.push('Landlocked: no sea coast');
      if (r.rk) n.push(`#${r.rk} of ${ranked.length} independent countries by area`);
      if (r.side) n.push(`Drives on the ${r.side} side of the road`);
      if (!r.ind) n.push('A dependent territory, not a fully independent country');
      else if (!r.un) n.push('Not a UN member state');

      const F = (k, v) => (v ? `<div class="we-fact"><span>${k}</span><b>${v}</b></div>` : '');
      dock.innerHTML = `<div class="we-dh"><div class="we-flagwrap"><img class="we-flag-lg" src="https://flagcdn.com/w80/${iso2(
        r.flag
      )}.png" alt="" onerror="this.style.visibility='hidden'"></div><div class="we-tt"><h2>${r.n}</h2><p>${
        r.off
      }</p></div><button class="we-xbtn" data-a="x" aria-label="Close">&times;</button></div>
<div class="we-nav"><button data-a="-1" aria-label="Previous country">&lsaquo;</button><span>${i + 1}/${
        l.length
      }</span><button data-a="1" aria-label="Next country">&rsaquo;</button></div>
<div class="we-facts">${F('Capital', r.cap)}${F('Region', r.sub || r.cont)}${F('Continent', r.cont)}${F(
        'Languages',
        r.lang
      )}${F('Currency', r.cur)}${F('Area', r.area ? Math.round(r.area).toLocaleString() + ' km²' : '')}${F(
        'Calling code',
        r.call
      )}${F('Internet domain', r.tld)}${F('People are called', r.dem)}</div>
<h3>Good to know</h3><ul>${n.map((x) => `<li>${x}</li>`).join('')}</ul>
<h3>Neighbours</h3><div class="we-nbs">${
        nb.length
          ? nb
              .map(
                (x) =>
                  `<button class="we-nbc" data-id="${x.id}"><img class="we-flag-sm" loading="lazy" src="https://flagcdn.com/w40/${iso2(
                    x.flag
                  )}.png" alt="">${x.n}</button>`
              )
              .join('')
          : '<em>None by land</em>'
      }</div>`;
    }

    function closeDock() {
      sel = null;
      dock.classList.remove('open');
      paint();
      flyCont();
    }

    function toast(t) {
      toastEl.textContent = t;
      toastEl.style.opacity = 1;
      if (toastEl._t) clearTimeout(toastEl._t);
      toastEl._t = later(() => {
        toastEl.style.opacity = 0;
      }, 1500);
    }

    function startQuiz(opts = {}) {
      const round = opts.round || 1;
      const incoming = opts.incoming || [];
      const pool = d3.shuffle(
        opts.pool
          ? opts.pool.slice()
          : all.filter((r) => r.ind && (cont === 'All' || r.cont === cont))
      );
      quiz = {
        pool,
        i: 0,
        ok: 0,
        first: 0,
        miss: 0,
        wrong: 0,
        tries: 0,
        hint: false,
        lock: false,
        state: {},
        results: {},
        flash: null,
        locate: null,
        startedAt: Date.now(),
        recorded: false,
        weakRows: [],
        round,
        incoming,
        sessionId:
          opts.sessionId || Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      };
      sel = null;
      labels.classed('lit', false);
      dock.classList.remove('open');
      dock.style.display = 'none';
      root.classList.add('we-quiz');
      quizBtn.textContent = 'Exit quiz';
      tip.style.display = 'none';
      paint();
      flyCont();
      qrender();
    }

    function exitQuiz() {
      quiz = null;
      labels.classed('lit', false);
      root.classList.remove('we-quiz');
      dock.style.display = '';
      quizBtn.textContent = 'Quiz';
      paint();
      flyCont();
    }

    function locateCountry(id) {
      if (!quiz) return;
      const r = R(id);
      const f = feats.find((x) => idOf(x) === id);
      if (!r || !f) return;
      quiz.locate = id;
      labels.classed('lit', (x) => idOf(x) === id);
      paint();
      fly(mainB(f), 12);
      toast(r.n);
    }

    function finishRound(q) {
      const total = q.pool.length;
      const wrongThenRight = q.pool.filter((r) => {
        const res = q.results[r.id];
        return res && res.correct && !res.firstTry;
      });
      const missed = q.pool.filter((r) => q.results[r.id]?.missed);
      const weak = q.pool.filter((r) => !q.results[r.id]?.firstTry);
      const fixed =
        q.round > 1
          ? q.incoming.map(R).filter(Boolean).filter((r) => q.results[r.id]?.firstTry)
          : [];
      q.weakRows = weak;
      q.locate = null;
      labels.classed('lit', false);

      if (!q.recorded) {
        q.recorded = true;
        logActivity('quiz', {
          region: cont,
          total,
          firstTry: q.first,
          missed: q.miss,
          wrongClicks: q.wrong,
          accuracy: total ? Math.round((q.first / total) * 100) : 0,
          missedCountries: missed.map((r) => r.n),
          wrongThenRightCountries: wrongThenRight.map((r) => r.n),
          reviewCountries: weak.map((r) => r.n),
          correctedCountries: fixed.map((r) => r.n),
          needsWorkCountries: weak.map((r) => r.n),
          corrected: fixed.length,
          needsWork: weak.length,
          priorTotal: q.incoming.length,
          retry: q.round > 1,
          round: q.round,
          sessionId: q.sessionId,
          durationSec: Math.round((Date.now() - q.startedAt) / 1000),
        });
      }

      const chip = (r, cls) => {
        const code = iso2(r.flag);
        return `<button class="we-chip${cls ? ` ${cls}` : ''}" data-locate="${r.id}" title="Show ${r.n} on the map">${
          code ? `<img src="https://flagcdn.com/w40/${code}.png" alt="" loading="lazy">` : ''
        }${r.n}</button>`;
      };
      const group = (title, rows, cls) =>
        rows.length
          ? `<div class="we-review-grp"><div class="we-review-h">${title}<span>${rows.length}</span></div><div class="we-chips">${rows
              .map((r) => chip(r, cls))
              .join('')}</div></div>`
          : '';
      const review =
        (q.round > 1 ? group('Fixed first try', fixed, 'good') : '') +
        group('Wrong, then right', wrongThenRight, 'good') +
        group('Missed / skipped', missed, 'miss');

      qb.innerHTML = `<div class="we-qt"><b>${
        q.round > 1 ? 'Retry finished!' : 'Finished!'
      }</b></div><div class="we-qs">First try: ${q.first}/${total} · Missed: ${q.miss} · Wrong clicks: ${
        q.wrong
      }</div>${
        review
          ? `<div class="we-review-note">Click a country to find it on the map.</div><div class="we-review">${review}</div>`
          : '<div class="we-review-empty">Perfect run — no missed countries.</div>'
      }<div class="we-qbtns">${
        weak.length ? `<button data-q="continue">Continue test (${weak.length})</button>` : ''
      }<button data-q="new">New test</button><button data-q="exit">Exit</button></div>`;
    }

    function qrender() {
      const q = quiz;
      const t = q.pool[q.i];
      if (!t) {
        finishRound(q);
        return;
      }
      if (!q.results[t.id]) {
        q.results[t.id] = { wrong: 0, correct: false, missed: false, firstTry: false };
      }
      qb.innerHTML = `<div class="we-qt">Find: <b>${t.n}</b></div><div class="we-qs">${q.i + 1}/${
        q.pool.length
      } · ok ${q.ok} · wrong ${q.wrong}${
        q.hint ? ` · Capital: ${t.cap || '—'} · ${t.sub || t.cont}` : ''
      }</div><button data-q="hint">Hint</button><button data-q="skip">Skip</button><button data-q="exit">Exit</button>`;
    }

    function advance() {
      if (!quiz) return;
      quiz.i++;
      quiz.tries = 0;
      quiz.hint = false;
      quiz.lock = false;
      quiz.flash = null;
      quiz.locate = null;
      labels.classed('lit', false);
      paint();
      qrender();
    }

    function reveal(force) {
      const q = quiz;
      if (!q || (!force && q.lock) || !q.pool[q.i]) return;
      const t = q.pool[q.i];
      q.lock = true;
      q.miss++;
      q.state[t.id] = 'miss';
      q.results[t.id] = { wrong: q.tries, correct: false, missed: true, firstTry: false };
      paint();
      toast(`It was ${t.n}`);
      fly(mainB(feats.find((x) => idOf(x) === t.id)), 12);
      later(() => {
        if (quiz !== q) return;
        flyCont();
        advance();
      }, 1900);
    }

    function guess(id) {
      const q = quiz;
      if (q.lock || !q.pool[q.i]) return;
      const t = q.pool[q.i];
      const r = R(id);
      if (id === t.id) {
        q.state[id] = 'found';
        q.ok++;
        q.results[t.id] = {
          wrong: q.tries,
          correct: true,
          missed: false,
          firstTry: q.tries === 0,
        };
        if (!q.tries) q.first++;
        advance();
        return;
      }
      if (q.state[id]) return;
      if (!q.pool.includes(r)) {
        toast(`${r.n} isn’t part of this quiz`);
        return;
      }
      q.wrong++;
      q.tries++;
      q.flash = id;
      paint();
      toast(`That’s ${r.n}`);
      later(() => {
        if (q.flash === id) {
          q.flash = null;
          paint();
        }
      }, 700);
      qrender();
      if (q.tries >= 3) {
        q.lock = true;
        later(() => {
          if (quiz === q) reveal(true);
        }, 700);
      }
    }

    /* ---------- events ---------- */
    on($('[data-view="map"]'), 'click', () => showView('map'));
    on($('[data-view="list"]'), 'click', () => showView('list'));

    on(listEl, 'click', (e) => {
      const b = e.target.closest('.we-row');
      if (!b) return;
      showView('map');
      pick(b.dataset.id);
    });

    on(filterEl, 'change', (e) => setCont(e.target.value));
    on(sortEl, 'change', (e) => {
      sortMode = e.target.value;
      if (mode === 'list') renderList();
      else if (sel) render(R(sel));
    });
    on(searchEl, 'change', (e) => {
      const r = all.find((x) => x.n.toLowerCase() === e.target.value.toLowerCase());
      if (r) {
        if (quiz) exitQuiz();
        showView('map');
        pick(r.id);
        e.target.blur();
      }
    });

    on($('.we-zi'), 'click', () => svg.transition().call(zoom.scaleBy, 1.6));
    on($('.we-zo'), 'click', () => svg.transition().call(zoom.scaleBy, 1 / 1.6));
    on($('.we-zr'), 'click', () => {
      sel = null;
      dock.classList.remove('open');
      paint();
      flyCont();
    });

    paths
      .on('click', (e, f) => {
        const id = idOf(f);
        if (!R(id)) return;
        quiz ? guess(id) : pick(id);
      })
      .on('mousemove', (e, f) => {
        const r = R(idOf(f));
        if (!r || quiz) {
          tip.style.display = 'none';
          return;
        }
        tip.textContent = r.n;
        tip.style.display = 'block';
        tip.style.left = e.clientX + 12 + 'px';
        tip.style.top = e.clientY + 12 + 'px';
      })
      .on('mouseleave', () => {
        tip.style.display = 'none';
      });

    on(dock, 'click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.id) return pick(b.dataset.id);
      const a = b.dataset.a;
      if (a === 'x') return closeDock();
      const l = orderedList();
      let i = l.findIndex((r) => r.id === sel);
      pick(l[(i + +a + l.length) % l.length].id);
    });

    on(quizBtn, 'click', () => (quiz ? exitQuiz() : startQuiz()));

    on(qb, 'click', (e) => {
      const loc = e.target.closest('[data-locate]');
      if (loc) return locateCountry(loc.dataset.locate);
      const btn = e.target.closest('[data-q]');
      if (!btn || !quiz || quiz.lock) return;
      const a = btn.dataset.q;
      if (a === 'hint') {
        quiz.hint = true;
        qrender();
      } else if (a === 'skip') reveal();
      else if (a === 'continue') {
        const q = quiz;
        const rows = q.weakRows || [];
        if (!rows.length) return;
        startQuiz({
          pool: rows,
          round: q.round + 1,
          incoming: rows.map((r) => r.id),
          sessionId: q.sessionId,
        });
      } else if (a === 'new' || a === 'again') startQuiz();
      else exitQuiz();
    });

    on(window, 'keydown', (e) => {
      if (quiz || !sel || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') dock.querySelector('[data-a="1"]').click();
      if (e.key === 'ArrowLeft') dock.querySelector('[data-a="-1"]').click();
      if (e.key === 'Escape') closeDock();
    });

    on(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = later(relayoutLabels, 150);
    });

    namesEl.innerHTML = all.map((r) => `<option value="${r.n}">`).join('');
    filterEl.value = cont;
    relayoutLabels();
    paint();

    return () => {
      listeners.forEach((fn) => fn());
      timers.forEach((id) => clearTimeout(id));
      if (resizeTimer) clearTimeout(resizeTimer);
      if (labelRaf) cancelAnimationFrame(labelRaf);
      svg.interrupt();
      svg.on('.zoom', null);
      svg.selectAll('*').interrupt();
      svg.selectAll('*').remove();
      root.classList.remove('we-quiz', 'we-listmode');
      dock.innerHTML = '';
      qb.innerHTML = '';
      listEl.innerHTML = '';
      namesEl.innerHTML = '';
      tip.style.display = 'none';
      toastEl.style.opacity = 0;
      legEl.style.display = '';
      dock.style.display = '';
      quizBtn.textContent = 'Quiz';
    };
  }, []);

  return (
    <div className="we-root" ref={rootRef}>
      <header className="we-header">
        <button
          className="we-back"
          onClick={() => navigate('/admin/dashboard')}
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <FiArrowLeft size={16} />
        </button>
        <h1 className="sr-only">World Explorer</h1>

        <div className="we-views">
          <button data-view="map" className="on">
            Map
          </button>
          <button data-view="list">Countries</button>
        </div>

        <Dropdown
          data-we-filter="true"
          className="we-filter-wrap"
          size="sm"
          defaultValue="All"
          ariaLabel="Filter by region"
          options={[
            { value: 'All', label: 'All regions' },
            ...CONTS.map((c) => ({ value: c, label: c })),
          ]}
        />

        <Dropdown
          data-we-sort="true"
          className="w-[190px] shrink-0"
          size="sm"
          defaultValue="az"
          ariaLabel="Sort order"
          options={[
            { value: 'az', label: 'A–Z' },
            { value: 'geo', label: 'Nearby (geographic)' },
          ]}
        />

        <input className="we-search" list="we-names" placeholder="Search country…" />
        <datalist className="we-names" id="we-names" />

        <button className="we-quiz-btn">Quiz</button>
      </header>

      <div className="we-stage">
        <svg className="we-map" ref={svgRef} />
        <div className="we-leg">
          <div className="we-lt">Tap any country to learn about it.</div>
          <div className="we-leg-row">
            <span className="we-leg-dot" /> Selected
            <span className="we-leg-dot nb" /> Neighbours
          </div>
        </div>
        <div className="we-zc">
          <button className="we-zi" aria-label="Zoom in">+</button>
          <button className="we-zo" aria-label="Zoom out">−</button>
          <button className="we-zr" title="Reset view">Reset</button>
        </div>
        <div className="we-qb" />
        <div className="we-toast" />
        <aside className="we-dock" />
        <div className="we-tip" />
      </div>

      <div className="we-list" />
    </div>
  );
};

const WorldExplorer = () => {
  const ready = useAdminAuth();
  if (!ready) return <Loader />;
  return <WorldExplorerApp />;
};

export default WorldExplorer;
