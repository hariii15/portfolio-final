import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollFloat from './ScrollFloat';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    title: "KubeMind Industrial",
    subtitle: "AI-Powered Infrastructure Intelligence Platform",
    description:
      "KubeMind Industrial is a cloud-native observability and predictive intelligence platform designed for Kubernetes-based industrial environments. It simulates smart manufacturing systems through interconnected microservices and leverages AI agents to monitor infrastructure health, detect anomalies, predict failures, and provide actionable recommendations. The platform includes an Infrastructure Copilot that enables engineers to interact with complex systems using natural language.",
    techStack: [
      "Next.js", "React", "TypeScript", "Node.js", "Express.js",
      "FastAPI", "Python", "LangGraph", "Kubernetes", "Docker",
      "Prometheus", "Grafana", "Scikit-Learn", "OpenRouter"
    ],
    githubLink: "https://github.com/hariii15/abb",
    liveDemoLink: "",
  },
  {
    title: "Mannmathi",
    subtitle: "AI-Powered Smart Farming Assistant",
    description:
      "Mannmathi is a multilingual mobile application built to empower small-scale farmers through AI-driven agricultural insights. The platform detects plant diseases using machine learning, analyzes soil health through IoT-enabled sensors, and delivers personalized recommendations to improve crop productivity. An intelligent multilingual chatbot makes advanced agricultural support accessible to farmers regardless of language barriers.",
    techStack: ["React Native", "Python", "Google Cloud Platform (GCP)", "Docker", "Hugging Face", "NodeMCU"],
    githubLink: "https://github.com/hariii15/mannmathi",
    liveDemoLink: "",
  },
  {
    title: "Safra",
    subtitle: "AI-Powered Parametric Insurance Platform",
    description:
      "Safra is an intelligent risk prediction and parametric insurance platform designed for gig economy workers. By analyzing environmental, operational, and market factors such as weather, pollution, demand fluctuations, and platform outages, the system predicts income disruption risks and automatically calculates dynamic insurance premiums. A zero-touch claims engine enables automated payouts.",
    techStack: ["React", "Node.js", "FastAPI", "Python", "Firebase Firestore", "Machine Learning", "Open-Meteo APIs", "Docker"],
    githubLink: "https://github.com/hariii15/dev-trial",
    liveDemoLink: "",
  },
  {
    title: "Evalio AI",
    subtitle: "Internship — AI-Powered Personalized Learning Platform",
    description:
      "During my Software Engineering internship at Evalio AI, I contributed to an AI-driven educational platform focused on personalized learning experiences. I developed backend services and workflow pipelines that streamlined communication between users and platform services while optimizing data retrieval systems for administrative operations.",
    techStack: ["Python", "FastAPI", "REST APIs", "Database Systems", "Cloud Services"],
    githubLink: "",
    liveDemoLink: "https://evalioai.com/",
  },
  {
    title: "Noter",
    subtitle: "AI-Powered Note Taking System",
    description:
      "An AI intelligent note taking system which helps users take notes easily and uses AI agents for summarizing tasks, reviewing notes, and generating actionable insights from written content.",
    techStack: ["Node.js", "React", "Tailwind", "Deepseek", "Firebase"],
    githubLink: "https://github.com/hariii15/Noter_v.02",
    liveDemoLink: "https://noter-7d803.web.app/",
  },
  {
    title: "Buis-bot",
    subtitle: "AI Business Assistant Chatbot",
    description:
      "An AI-based assistant chatbot built for business owners to simplify tasks, storing past user data to leverage business growth and offer contextual help when needed.",
    techStack: ["Flask", "React", "Tailwind", "Deepseek", "Supabase"],
    githubLink: "https://github.com/hariii15/buiss_bot",
    liveDemoLink: "https://buiss-bot.vercel.app/",
  },
  {
    title: "StockMarket Tracker",
    subtitle: "Real-Time Market Intelligence & Portfolio Tool",
    description:
      "Real-time stock market monitoring application with price alerts, portfolio management, and predictive analytics using machine learning algorithms.",
    techStack: ["React", "Node.js", "MongoDB", "Python"],
    githubLink: "https://github.com/hariii15/stock-pro-frontend",
    liveDemoLink: "",
  },
  {
    title: "WATCH 2.0",
    subtitle: "Enhanced Women's Safety & Wellness Platform",
    description:
      "An upgraded version of the WATCH app with features like one-on-one consultations with doctors and enhanced safety and wellness tools for real-time protection.",
    techStack: ["React", "Flask", "PostgreSQL", "WebRTC"],
    githubLink: "https://github.com/hariii15/watch2.0",
    liveDemoLink: "",
  },
  {
    title: "WATCH",
    subtitle: "Women's Emergency Safety Application",
    description:
      "A women's safety app with features like automatic SOS alerts, unusual behavior detection, and real-time updates during emergencies.",
    techStack: ["React", "Node.js", "MongoDB", "Twilio"],
    githubLink: "https://github.com/hariii15/watch",
    liveDemoLink: "",
  },
];

const Projects = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const triggers = [];

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // Alternate cards drift in from slightly left or right for layered depth
      const xFrom = i % 2 === 0 ? -12 : 12;

      const st = gsap.fromTo(
        card,
        {
          opacity: 0,
          y: 120,
          x: xFrom,
          scale: 0.94,
          rotateX: 6,
          transformOrigin: 'top center',
          transformPerspective: 1200,
          willChange: 'transform, opacity',
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotateX: 0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',        // start when top of card hits bottom of viewport
            end: 'top 30%',             // finish when top of card is 30% from top
            scrub: 2,                   // very slow, buttery smooth scrub
          },
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    });

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
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #e5e7eb 30%,
            #f9fafb 50%,
            #e5e7eb 70%,
            #9ca3af 100%
          );
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
      <div className="relative p-8 flex flex-col items-center" style={{ zIndex: 10 }}>
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.01}
          containerClassName="text-4xl font-extrabold tracking-tight text-white mb-2"
        >
          My Projects
        </ScrollFloat>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="silver-shimmer text-sm mb-12 tracking-widest uppercase font-medium"
        >
          Things I've built
        </motion.p>

        <div className="space-y-8 w-full max-w-4xl">
          {projects.map((project, index) => (
            <div
              key={index}
              ref={el => { cardsRef.current[index] = el; }}
              className="group relative p-8 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 9, 9, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px 0px rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.22)',
              }}
            >
              {/* Per-card top highlight line */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.35), transparent)' }}
              />

              {/* Heading block */}
              <div className="mb-4">
                <h2
                  className="text-2xl font-bold tracking-tight text-white mb-1"
                  style={{ fontFamily: "'Outfit', 'Inter', sans-serif", letterSpacing: '-0.01em' }}
                >
                  {project.title}
                </h2>
                <p className="silver-shimmer text-xs font-semibold tracking-widest uppercase">
                  {project.subtitle}
                </p>
              </div>

              <p className="text-gray-400 mb-6 leading-relaxed text-[0.92rem]">
                {project.description}
              </p>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      color: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links — glass style, no pink */}
              {(project.githubLink || project.liveDemoLink) && (
                <div className="flex gap-4 mt-2">
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(30,30,30,0.8)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      GitHub Repo
                    </a>
                  )}
                  {project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: 'rgba(30,30,30,0.8)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {project.title.includes('Evalio') ? 'Visit Website' : 'Live Demo'}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
