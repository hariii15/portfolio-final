import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import ScrollFloat from './ScrollFloat';

gsap.registerPlugin(ScrollTrigger);

// ── Data ──────────────────────────────────────────────────────────────────────

const categories = [
  { name: 'AI & Machine Learning', level: 88 },
  { name: 'Backend Development',   level: 85 },
  { name: 'Frontend Development',  level: 80 },
  { name: 'Data Analytics',        level: 80 },
  { name: 'Problem Solving',       level: 78 },
  { name: 'Cloud & DevOps',        level: 76 },
  { name: 'Databases',             level: 75 },
  { name: 'Mobile Development',    level: 72 },
];

const skills = [
  // AI / ML
  { name: 'Machine Learning',  category: 'AI & ML' },
  { name: 'LangGraph',         category: 'AI & ML' },
  { name: 'Hugging Face',      category: 'AI & ML' },
  { name: 'Scikit-Learn',      category: 'AI & ML' },
  { name: 'TensorFlow',        category: 'AI & ML' },
  { name: 'OpenRouter',        category: 'AI & ML' },
  // Backend
  { name: 'FastAPI',           category: 'Backend' },
  { name: 'Node.js',           category: 'Backend' },
  { name: 'Express.js',        category: 'Backend' },
  { name: 'Python',            category: 'Backend' },
  { name: 'Flask',             category: 'Backend' },
  { name: 'REST APIs',         category: 'Backend' },
  // Frontend
  { name: 'React',             category: 'Frontend' },
  { name: 'Next.js',           category: 'Frontend' },
  { name: 'TypeScript',        category: 'Frontend' },
  { name: 'JavaScript',        category: 'Frontend' },
  { name: 'HTML / CSS',        category: 'Frontend' },
  // Cloud & DevOps
  { name: 'Kubernetes',        category: 'Cloud & DevOps' },
  { name: 'Docker',            category: 'Cloud & DevOps' },
  { name: 'Prometheus',        category: 'Cloud & DevOps' },
  { name: 'Grafana',           category: 'Cloud & DevOps' },
  { name: 'GCP',               category: 'Cloud & DevOps' },
  // Databases
  { name: 'Firebase Firestore',category: 'Databases' },
  { name: 'MongoDB',           category: 'Databases' },
  { name: 'SQL',               category: 'Databases' },
  { name: 'Supabase',          category: 'Databases' },
  // Mobile
  { name: 'React Native',      category: 'Mobile' },
  { name: 'NodeMCU',           category: 'Mobile' },
  // Data
  { name: 'Pandas',            category: 'Data' },
  { name: 'NumPy',             category: 'Data' },
];

// ── Radar chart ───────────────────────────────────────────────────────────────

const SkillRadar = () => {
  const data = {
    labels: categories.map(c => c.name),
    datasets: [{
      label: 'Proficiency',
      data: categories.map(c => c.level),
      backgroundColor: 'rgba(245, 158, 11, 0.10)',
      borderColor:     'rgba(245, 158, 11, 0.70)',
      borderWidth: 1.5,
      pointBackgroundColor: 'rgba(245, 158, 11, 0.9)',
      pointBorderColor: 'transparent',
      pointRadius: 3,
    }],
  };
  const options = {
    scales: {
      r: {
        min: 60,
        max: 100,
        angleLines: { color: 'rgba(255,255,255,0.07)' },
        grid:       { color: 'rgba(255,255,255,0.07)' },
        pointLabels:{ color: 'rgba(255,255,255,0.55)', font: { size: 10 } },
        ticks:      { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  return <Radar data={data} options={options} />;
};

// ── Component ─────────────────────────────────────────────────────────────────

const About = () => {
  const cardsRef  = useRef([]);
  const tagsRef   = useRef(null);

  useEffect(() => {
    const triggers = [];

    // category cards parallax
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const xFrom = i % 2 === 0 ? -14 : 14;
      const st = gsap.fromTo(
        card,
        { opacity: 0, y: 90, x: xFrom, scale: 0.95, rotateX: 5, transformPerspective: 1200 },
        {
          opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0,
          ease: 'power2.inOut',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 35%', scrub: 2 },
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    });

    // tags section fade
    if (tagsRef.current) {
      const st = gsap.fromTo(
        tagsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          ease: 'power2.out',
          scrollTrigger: { trigger: tagsRef.current, start: 'top bottom-=60px', end: 'top 60%', scrub: 1.5 },
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    }

    return () => triggers.forEach(t => t.kill());
  }, []);

  return (
    <div className="relative min-h-screen text-white" style={{ paddingBottom: '8rem' }}>
      <style>{`
        @keyframes silverShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .silver-shimmer {
          background: linear-gradient(90deg, #9ca3af 0%, #e5e7eb 30%, #f9fafb 50%, #e5e7eb 70%, #9ca3af 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: silverShimmer 3.5s linear infinite;
        }
      `}</style>

      {/* ── Fixed background blobs — stay static as cards scroll ── */}
      <div
        className="pointer-events-none"
        style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}
      >
        {/* LARGE warm amber blob — top left */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-120px', left: '-160px',
            width: '900px', height: '900px',
            background: 'radial-gradient(circle, #f59e0b 0%, #d97706 35%, transparent 68%)',
            filter: 'blur(110px)',
            opacity: 0.10,
          }}
        />
        {/* LARGE warm white glow — top right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-80px', right: '-180px',
            width: '800px', height: '800px',
            background: 'radial-gradient(circle, #fef3c7 0%, #fbbf24 35%, transparent 68%)',
            filter: 'blur(130px)',
            opacity: 0.08,
          }}
        />
        {/* Mid depth amber blob */}
        <div
          className="absolute rounded-full"
          style={{
            top: '40%', left: '-100px',
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, #b45309 0%, #78350f 50%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.06,
          }}
        />
        {/* Small warm accent — mid right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '35%', right: '5%',
            width: '250px', height: '250px',
            background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)',
            filter: 'blur(70px)',
            opacity: 0.04,
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative p-6 md:p-10 flex flex-col items-center" style={{ zIndex: 10 }}>

        {/* Heading */}
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.01}
          containerClassName="text-4xl font-extrabold tracking-tight text-white mb-1"
        >
          My Skills
        </ScrollFloat>
        <p className="silver-shimmer text-sm mb-12 tracking-widest uppercase font-medium">
          Expertise &amp; Proficiency
        </p>

        {/* ── Dashboard grid ── */}
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — category cards (2 cols on lg) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat, i) => {
              const pct = cat.level;
              // arc fill using conic-gradient
              return (
                <div
                  key={cat.name}
                  ref={el => { cardsRef.current[i] = el; }}
                  className="relative p-5 rounded-2xl overflow-hidden"
                  style={{
                    background: 'rgba(10, 9, 9, 0.60)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(245,158,11,0.22)',
                    boxShadow: '0 0 0 1px rgba(245,158,11,0.12), 0 0 20px rgba(245,158,11,0.05)',
                  }}
                >
                  {/* top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.30), transparent)' }} />

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white/90">{cat.name}</span>
                    <span className="text-xs font-bold text-white/50">{pct}%</span>
                  </div>

                  {/* thin progress bar — sunlight theme */}
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #d97706, #fbbf24)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — radar chart */}
          <div
            className="relative p-6 rounded-2xl flex flex-col"
            style={{
              background: 'rgba(10, 9, 9, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(245,158,11,0.22)',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.12), 0 0 20px rgba(245,158,11,0.05)',
              minHeight: '340px',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.30), transparent)' }} />
            <p className="silver-shimmer text-xs font-semibold tracking-widest uppercase mb-4">Radar View</p>
            <div className="flex-1" style={{ minHeight: '280px' }}>
              <SkillRadar />
            </div>
          </div>
        </div>

        {/* ── Individual skill tags ── */}
        <div ref={tagsRef} className="w-full max-w-6xl mt-8">
          <div
            className="relative p-6 rounded-2xl"
            style={{
              background: 'rgba(10, 9, 9, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(245,158,11,0.22)',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.12), 0 0 20px rgba(245,158,11,0.05)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.30), transparent)' }} />
            <p className="silver-shimmer text-xs font-semibold tracking-widest uppercase mb-4">
              Technologies &amp; Tools
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span
                  key={s.name}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: 'rgba(0,0,0,0.50)',
                    border: '1px solid rgba(255,255,255,0.28)',
                    color: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Competitive coding stats ── */}
        <div className="w-full max-w-6xl mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'LeetCode Problems', value: '250+', sub: 'Solved' },
            { label: 'Contest Rating',    value: '1,462', sub: 'LeetCode' },
            { label: 'SkillRack Problems',value: '400+',  sub: 'Solved' },
          ].map((stat, i) => (
            <div
              key={i}
              className="relative p-5 rounded-2xl text-center"
              style={{
                background: 'rgba(10, 9, 9, 0.60)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(245,158,11,0.22)',
                boxShadow: '0 0 0 1px rgba(245,158,11,0.12)',
              }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.30), transparent)' }} />
              <div className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default About;
