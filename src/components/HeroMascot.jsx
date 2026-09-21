import React, { useEffect, useRef, useState, useCallback } from 'react';

const MASCOT_W = 64;
const MASCOT_H = 64;

const SIT_PHRASES = ['boing!', 'pick me!', "let's go!", 'hi hi!', 'jump!'];
const IDLE_PHRASES = ['hehe', '*bounce*', 'wheee'];

function rand(min, max) {
  return min + Math.random() * (max - min);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Free-floating mascot. Lives in a transparent runway (NOT a card box).
 * Roams left/right, bobs up & down, twinkles, and is button-aware:
 * it measures the sibling buttons and parabolically jumps on top of them,
 * squashes on landing, presses the button down, sits/bounces, then hops off.
 */
const HeroMascot = ({ runwayRef, primaryRef, secondaryRef }) => {
  const botRef = useRef(null);
  const shadowRef = useRef(null);
  const posRef = useRef({ x: 20, y: 0 });
  const facingRef = useRef(1);
  const jumpingRef = useRef(false);
  const aliveRef = useRef(true);
  const floorYRef = useRef(0);
  const [bubble, setBubble] = useState(null);
  const [bubblePos, setBubblePos] = useState({ x: 20, y: 8 });
  const [excited, setExcited] = useState(false);
  const [sittingOn, setSittingOn] = useState(null);
  const [puff, setPuff] = useState(null);
  const bubbleTimer = useRef(null);
  const puffTimer = useRef(null);

  const showBubble = useCallback((text, ms = 1400) => {
    setBubblePos({ ...posRef.current });
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), ms);
  }, []);

  const triggerPuff = useCallback((x) => {
    setPuff({ x, id: Date.now() + Math.random() });
    if (puffTimer.current) clearTimeout(puffTimer.current);
    puffTimer.current = setTimeout(() => setPuff(null), 600);
  }, []);

  const applyTransform = useCallback((x, y, opts = {}) => {
    const el = botRef.current;
    if (!el) return;
    const { squashX = 1, squashY = 1, rotate = 0, flip = facingRef.current } = opts;
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${flip * squashX}, ${squashY}) rotate(${rotate}deg)`;
  }, []);

  // Idle bob loop (runs always, offset added unless jumping overrides y)
  useEffect(() => {
    let raf;
    const t0 = performance.now();
    const loop = (t) => {
      if (!aliveRef.current) return;
      if (!jumpingRef.current && botRef.current) {
        const time = (t - t0) / 1000;
        const bob = Math.sin(time * 3.2) * 5;
        const { x, y } = posRef.current;
        applyTransform(x, y + bob);
        if (shadowRef.current) {
          const h = Math.abs(bob);
          shadowRef.current.style.transform = `translateX(${x + MASCOT_W / 2 - 29}px) scaleX(${1 - h / 120})`;
          shadowRef.current.style.opacity = `${0.95 - h / 120}`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [applyTransform]);

  // Parabolic jump helper — button-aware landing with squash + button press
  const jumpTo = useCallback(
    async (toX, toY, peak = 70, duration = 620) => {
      const el = botRef.current;
      if (!el) return;
      jumpingRef.current = true;
      const from = { ...posRef.current };
      facingRef.current = toX >= from.x ? 1 : -1;
      const start = performance.now();

      await new Promise((resolve) => {
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const easeX = t; // linear x feels like running
          const x = from.x + (toX - from.x) * easeX;
          const yLinear = from.y + (toY - from.y) * t;
          const arc = Math.sin(Math.PI * t) * peak;
          const y = yLinear - arc;
          // stretch while flying, based on arc velocity
          const vy = Math.cos(Math.PI * t);
          const stretch = 1 + Math.abs(vy) * 0.12;
          applyTransform(x, y, { squashX: 2 - stretch > 1 ? 1 / stretch : 1, squashY: stretch });
          if (shadowRef.current && runwayRef.current) {
            const heightAboveFloor = Math.max(0, floorYRef.current - y);
            shadowRef.current.style.transform = `translateX(${x + MASCOT_W / 2 - 29}px) scaleX(${Math.max(0.55, 1 - heightAboveFloor / 280)})`;
            shadowRef.current.style.opacity = `${Math.max(0.35, 0.95 - heightAboveFloor / 380)}`;
          }
          posRef.current = { x, y };
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

      // squash on landing + subtle cloud puff
      applyTransform(toX, toY, { squashX: 1.25, squashY: 0.72 });
      triggerPuff(toX + MASCOT_W / 2);
      await wait(140);
      applyTransform(toX, toY, { squashX: 0.92, squashY: 1.1 });
      await wait(120);
      applyTransform(toX, toY);
      posRef.current = { x: toX, y: toY };
      jumpingRef.current = false;
    },
    [applyTransform, runwayRef, triggerPuff]
  );

  const pressButton = useCallback(async (btnEl) => {
    if (!btnEl) return;
    const origTransition = btnEl.style.transition;
    btnEl.style.transition = 'transform 0.15s ease';
    btnEl.style.transform = 'scale(0.93) translateY(2px)';
    await wait(160);
    btnEl.style.transform = 'scale(1.04) translateY(-1px)';
    await wait(160);
    btnEl.style.transform = 'scale(1)';
    await wait(150);
    btnEl.style.transition = origTransition;
    btnEl.style.transform = '';
  }, []);

  const buttonAnchor = useCallback(
    (btnRef) => {
      const runway = runwayRef.current;
      const btn = btnRef.current;
      if (!runway || !btn) return null;
      const r = runway.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      // sit ON TOP edge of the button: mascot bottom ~= button top + 6 overlap
      const x = b.left - r.left + b.width / 2 - MASCOT_W / 2;
      // runway bottom is above buttons row by a small gap; compute y so mascot visually sits on button
      const y = b.top - r.top - MASCOT_H + 8;
      return { x: Math.max(0, Math.min(x, r.width - MASCOT_W)), y, el: btn };
    },
    [runwayRef]
  );

  // Main behaviour scheduler
  useEffect(() => {
    aliveRef.current = true;
    let cancelled = false;

    const run = async () => {
      // initial placement: start middle-left of runway
      await wait(400);
      const runway = runwayRef.current;
      if (runway) {
        const w = runway.clientWidth;
        posRef.current = { x: Math.max(8, w * 0.2), y: 8 };
        floorYRef.current = 8;
      }
      showBubble('hi! ★', 1600);

      while (!cancelled) {
        await wait(rand(1400, 2600));
        if (cancelled) break;
        const runwayEl = runwayRef.current;
        if (!runwayEl) continue;
        const runwayW = runwayEl.clientWidth;
        const maxX = Math.max(10, runwayW - MASCOT_W - 4);
        const roll = Math.random();

        try {
          if (roll < 0.42) {
            // ── wander hop to random spot on the runway ──
            const toX = rand(4, maxX);
            const toY = rand(0, 16);
            setSittingOn(null);
            await jumpTo(toX, toY, rand(34, 60), rand(420, 600));
            if (Math.random() < 0.25) showBubble(pick(IDLE_PHRASES), 1100);
          } else if (roll < 0.78) {
            // ── button-aware jump: hop ONTO a button, sit, press it, hop off ──
            const choices = [
              { ref: primaryRef, name: 'primary' },
              { ref: secondaryRef, name: 'secondary' },
            ].filter((c) => c.ref.current);
            if (!choices.length) continue;
            const target = pick(choices);
            const anchor = buttonAnchor(target.ref);
            if (!anchor) continue;
            setSittingOn(target.name);
            await jumpTo(anchor.x, anchor.y, rand(70, 110), rand(560, 750));
            if (cancelled) break;
            // sit + bounce on the button, press it
            showBubble(pick(SIT_PHRASES), 1500);
            pressButton(anchor.el);
            // little happy bounces while sitting (3 mini hops in place)
            for (let i = 0; i < 3; i++) {
              if (cancelled) break;
              await jumpTo(anchor.x, anchor.y - 14, 16, 220);
              await jumpTo(anchor.x, anchor.y, 8, 200);
            }
            await wait(rand(500, 1100));
            if (cancelled) break;
            // hop back up to runway
            setSittingOn(null);
            await jumpTo(rand(4, maxX), rand(0, 12), rand(70, 100), rand(550, 700));
          } else {
            // ── twinkle spin in place ──
            setExcited(true);
            showBubble('✦ whee ✦', 1200);
            const { x, y } = posRef.current;
            const el = botRef.current;
            if (el) {
              const start = performance.now();
              const dur = 600;
              jumpingRef.current = true;
              await new Promise((res) => {
                const step = (now) => {
                  const t = Math.min(1, (now - start) / dur);
                  const hop = Math.sin(Math.PI * t) * 26;
                  applyTransform(x, y - hop, { rotate: t * 360 });
                  if (t < 1) requestAnimationFrame(step);
                  else res();
                };
                requestAnimationFrame(step);
              });
              jumpingRef.current = false;
              applyTransform(x, y);
            }
            setExcited(false);
          }
        } catch {
          jumpingRef.current = false;
        }
      }
    };
    run();
    return () => {
      cancelled = true;
      aliveRef.current = false;
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (puffTimer.current) clearTimeout(puffTimer.current);
    };
  }, [runwayRef, primaryRef, secondaryRef, jumpTo, pressButton, showBubble, applyTransform]);

  const handleClick = async () => {
    if (jumpingRef.current) return;
    const { x, y } = posRef.current;
    showBubble(pick(['boing!!', '★ yay ★', 'again!']), 1200);
    await jumpTo(x, y - 6, 90, 480);
  };

  const handleHover = () => {
    if (!jumpingRef.current && !bubble) showBubble('hee! ♡', 900);
  };

  return (
    <>
      <style>{`
        .hm-tw { animation: hmTw 1.8s ease-in-out infinite; }
        @keyframes hmTw { 0%,100% { opacity:.15; transform:scale(.7) rotate(0deg);} 50% { opacity:1; transform:scale(1.15) rotate(20deg);} }
        .hm-blink { transform-box: fill-box; transform-origin: center; animation: hmBlink 4.2s ease-in-out infinite; }
        @keyframes hmBlink { 0%,93%,100% { transform: scaleY(1);} 96% { transform: scaleY(.08);} }
        .hm-wave { transform-box: fill-box; transform-origin: 12% 70%; animation: hmWave 1.6s ease-in-out infinite; }
        @keyframes hmWave { 0%,100% { transform: rotate(-10deg);} 50% { transform: rotate(24deg);} }
        .hm-bubble { animation: hmPop .25s ease-out; }
        @keyframes hmPop { 0% { opacity:0; transform: translateY(6px) scale(.8);} 100% { opacity:1; transform: translateY(0) scale(1);} }
        .hm-ant { animation: hmAnt 1.7s ease-in-out infinite; }
        @keyframes hmAnt { 0%,100% { opacity:.6;} 50% { opacity:1;} }
        .hm-puff-dot { animation: hmPuff .55s ease-out forwards; }
        @keyframes hmPuff {
          0% { opacity: .7; transform: translate(0,0) scale(.5); }
          100% { opacity: 0; transform: translate(var(--dx,0px), var(--dy,-10px)) scale(1.4); }
        }
        .hm-cloud-drift { animation: hmCloud 3.4s ease-in-out infinite; }
        @keyframes hmCloud { 0%,100% { transform: translateX(0);} 50% { transform: translateX(3px);} }
      `}</style>

      {/* subtle cloud floor that follows the mascot */}
      <div
        ref={shadowRef}
        className="pointer-events-none absolute left-0 top-0 h-[16px] w-[58px]"
        style={{ top: 'auto', bottom: 0 }}
      >
        <div className="hm-cloud-drift relative h-full w-full">
          <div className="absolute bottom-0 left-1/2 h-[10px] w-[44px] -translate-x-1/2 rounded-full bg-[#E7E5E0]/90 blur-[1px] dark:bg-[#262626]/90" />
          <div className="absolute bottom-[5px] left-[10px] h-[10px] w-[16px] rounded-full bg-white blur-[1px] dark:bg-[#333]" />
          <div className="absolute bottom-[6px] left-[24px] h-[12px] w-[16px] rounded-full bg-white blur-[1px] dark:bg-[#333]" />
          <div className="absolute bottom-[5px] left-[36px] h-[9px] w-[12px] rounded-full bg-white/90 blur-[1px] dark:bg-[#2b2b2b]" />
        </div>
      </div>

      {/* landing dust puff — appears briefly where the mascot touches down */}
      {puff && (
        <div
          key={puff.id}
          className="pointer-events-none absolute z-0"
          style={{ left: puff.x - 28, bottom: 6, width: 56, height: 18 }}
          aria-hidden="true"
        >
          <span className="hm-puff-dot absolute bottom-0 rounded-full bg-white shadow-sm dark:bg-[#333]" style={{ left: 4, width: 14, height: 10, '--dx': '-14px', '--dy': '-8px' }} />
          <span className="hm-puff-dot absolute bottom-0 rounded-full bg-white shadow-sm dark:bg-[#333]" style={{ left: 20, width: 17, height: 12, '--dx': '0px', '--dy': '-12px', animationDelay: '.03s' }} />
          <span className="hm-puff-dot absolute bottom-0 rounded-full bg-white shadow-sm dark:bg-[#333]" style={{ left: 38, width: 13, height: 9, '--dx': '14px', '--dy': '-7px', animationDelay: '.06s' }} />
        </div>
      )}

      {/* sparkles that twinkle around the mascot */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="hm-tw absolute text-[13px] text-[#EC4899]" style={{ left: '6%', top: '8%' }}>✦</span>
        <span className="hm-tw absolute text-[11px]" style={{ left: '88%', top: '12%', animationDelay: '.6s' }}>✦</span>
        <span className="hm-tw absolute text-[10px] text-[#EC4899]" style={{ left: '72%', top: '62%', animationDelay: '1.1s' }}>✦</span>
        <span className="hm-tw absolute text-[12px]" style={{ left: '14%', top: '66%', animationDelay: '1.4s' }}>✦</span>
        <span className="hm-tw absolute text-[9px] text-[#EC4899]" style={{ left: '46%', top: '2%', animationDelay: '.3s' }}>✦</span>
      </div>

      {/* speech bubble */}
      {bubble && (
        <div
          className="hm-bubble mono pointer-events-none absolute z-10 whitespace-nowrap rounded-full border border-[#E9E9E6] bg-white px-2.5 py-1 text-[11px] font-semibold shadow-apple dark:border-[#2E2E2E] dark:bg-[#161616]"
          style={{ left: Math.max(0, bubblePos.x + MASCOT_W / 2 - 24), top: Math.max(0, bubblePos.y - 26) }}
        >
          {bubble}
        </div>
      )}

      {/* the bot — plain, NOT inside any card/box */}
      <div
        ref={botRef}
        onClick={handleClick}
        onMouseEnter={handleHover}
        className="absolute left-0 top-0 cursor-pointer"
        style={{ width: MASCOT_W, height: MASCOT_H, willChange: 'transform' }}
        title="boop me!"
      >
        <svg viewBox="0 0 120 100" className="block h-full w-full" aria-label="mascot">
          <g className={excited || sittingOn ? '' : ''}>
            {/* legs */}
            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M48 78v10M72 78v10" />
            </g>
            {/* body — clean, no dots inside */}
            <rect x="30" y="28" width="60" height="50" rx="17" fill="var(--bg,#fff)" stroke="currentColor" strokeWidth="3" />
            {/* eyes */}
            {sittingOn ? (
              <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M44 50l6 4 6-4M64 50l6 4 6-4" fill="none" />
              </g>
            ) : (
              <g fill="currentColor" className="hm-blink">
                <rect x="43" y="42" width="10" height="15" rx="5" />
                <rect x="67" y="42" width="10" height="15" rx="5" />
              </g>
            )}
            {/* smile */}
            <path d="M52 60 Q60 66 68 60" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            {/* antenna */}
            <path d="M60 28v-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="14" r="4" fill="#EC4899" className="hm-ant" style={{ filter: 'drop-shadow(0 0 5px rgba(236,72,153,.9))' }} />
            {/* waving arm */}
            <g className="hm-wave">
              <path d="M90 48 C98 46 102 40 103 31" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="103" cy="29" r="3.4" fill="currentColor" />
            </g>
            {/* other arm */}
            <path d="M30 50 C24 52 21 56 20 61" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>
    </>
  );
};

export default HeroMascot;
