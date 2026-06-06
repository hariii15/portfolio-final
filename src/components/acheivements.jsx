import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollFloat from './ScrollFloat';
import Merncertificate from './merncertficate.jpg';
import KPR_cert from './kpr-hack-25.png';
import InternalHack from './internal.png';
import DjangoCert from './django.png';
import SQLCert from './sql.png';

gsap.registerPlugin(ScrollTrigger);

const certificateItems = [
  {
    id: 1,
    title: "MERN-Stack Internship",
    issuer: "G-Zoft",
    date: "January 2023",
    image: Merncertificate,
  },
  {
    id: 2,
    title: "KPR-Horizon'25",
    issuer: "KPR",
    date: "March 2025",
    image: KPR_cert,
  },
  {
    id: 3,
    title: "Internal Hackathon",
    issuer: "Sri Eshwar College of Engineering",
    date: "April 2025",
    image: InternalHack,
  },
  {
    id: 4,
    title: "Django Masterclass",
    issuer: "Knowledge Nest",
    date: "May 2025",
    image: DjangoCert,
  },
  {
    id: 5,
    title: "Learn SQL in 3 Hours",
    issuer: "OCSALY Academy",
    date: "May 2025",
    image: SQLCert,
  },
];

const Acheivements = () => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const triggers = [];

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

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
            start: 'top bottom',
            end: 'top 30%',
            scrub: 2,
          },
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    });

    return () => triggers.forEach(t => t.kill());
  }, []);

  const handleViewCertificate = (cert) => {
    window.open(cert.image, '_blank');
  };

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
          My Achievements
        </ScrollFloat>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="silver-shimmer text-sm mb-12 tracking-widest uppercase font-medium"
        >
          Continuous Learning &amp; Credentials
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
          {certificateItems.map((cert, index) => (
            <div
              key={cert.id}
              ref={el => { cardsRef.current[index] = el; }}
              className="group relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 9, 9, 0.60)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px 0px rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.22)',
              }}
            >
              {/* Per-card inner top highlight */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.35), transparent)' }}
              />

              <div className="relative overflow-hidden h-48">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <button
                    onClick={() => handleViewCertificate(cert)}
                    className="text-white text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white/20"
                    style={{
                      background: 'rgba(30, 30, 30, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                    }}
                  >
                    View Certificate
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3
                  className="text-lg font-bold tracking-tight text-white mb-2"
                  style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
                >
                  {cert.title}
                </h3>
                <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span>{cert.issuer}</span>
                  <span className="silver-shimmer">{cert.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Acheivements;
