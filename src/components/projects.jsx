import React from 'react';
import { motion } from 'framer-motion';

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
    githubLink: "https://github.com/hariii15/nutrisense",
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
  return (
    <div className="relative min-h-screen text-white overflow-hidden" style={{ paddingBottom: '8rem' }}>
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

      {/* ── Background blobs with layered blur — extend below page ── */}
      <div className="pointer-events-none absolute overflow-hidden" style={{ inset: 0, bottom: '-250px' }}>
        {/* Large warm amber blob — top left */}
        <div
          className="absolute -top-32 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, #d97706 40%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
        {/* Softer warm white glow — centre right */}
        <div
          className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #fef3c7 0%, #fbbf24 40%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        {/* Deep amber blob — bottom, extended lower */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-12"
          style={{
            bottom: '-80px',
            left: '25%',
            background: 'radial-gradient(circle, #b45309 0%, #78350f 50%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        {/* Tiny warm accent — top right */}
        <div
          className="absolute top-16 right-20 w-[200px] h-[200px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Bottom-right seam filler */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            bottom: '-120px',
            right: '20%',
            background: 'radial-gradient(circle, #92400e 0%, #1c1002 60%, transparent 70%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 p-8 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-extrabold mb-2 tracking-tight text-white"
          style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
          My Projects
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="silver-shimmer text-sm mb-12 tracking-widest uppercase font-medium"
        >
          Things I’ve built
        </motion.p>

        <div className="space-y-8 w-full max-w-4xl">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ scale: 1.015 }}
              className="group relative p-8 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 9, 9, 0.6)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                /* Sunlight-toned border glow — very subtle */
                boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px 0px rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.22)',
              }}
            >
              {/* Per-card inner top highlight */}
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
                  <motion.span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      color: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(12px)',
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>

              {/* Links */}
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
                        border: '1px solid rgba(255,255,255,0.12)',
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
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, #be185d, #9d174d)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {project.title.includes("Evalio") ? "Visit Website" : "Live Demo"}
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
