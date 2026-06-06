import React from 'react';
import Profile from '../profile.jpeg';
import { motion } from 'framer-motion';
import SideRays from './SideRays';
import { FiCode, FiFileText, FiLayers, FiLayout, FiDatabase, FiBriefcase, FiServer, FiPieChart } from "react-icons/fi";

const Hero = () => {
  // Custom carousel items
  const carouselItems = [
    {
        title: "Steve Jobs",
        description: "Innovation distinguishes between a leader and a follower.",
        id: 1,
        icon: <FiCode className="h-[16px] w-[16px] text-white" />,
    },
    {
        title: "Satya Nadella",
        description: "Our industry does not respect tradition. It only respects innovation.",
        id: 2,
        icon: <FiServer className="h-[16px] w-[16px] text-white" />,
    },
    {
        title: "Sundar Pichai",
        description: "Wear your failure as a badge of honor.",
        id: 3,
        icon: <FiDatabase className="h-[16px] w-[16px] text-white" />,
    },
    {
        title: "Elon Musk",
        description: "When something is important enough, you do it even if the odds are not in your favor.",
        id: 4,
        icon: <FiLayout className="h-[16px] w-[16px] text-white" />,
    },
    {
        title: "Jeff Bezos",
        description: "If you double the number of experiments you do per year, you’re going to double your inventiveness.",
        id: 5,
        icon: <FiPieChart className="h-[16px] w-[16px] text-white" />,
    },
    {
        title: "Mark Zuckerberg",
        description: "The biggest risk is not taking any risk.",
        id: 6,
        icon: <FiBriefcase className="h-[16px] w-[16px] text-white" />,
    },
  ];  return (
    <div className='relative h-screen bg-black text-white px-8 flex flex-col justify-center items-center overflow-hidden'>
      {/* SideRays background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <SideRays
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          origin="top-left"
          speed={1.7}
          intensity={2}
          spread={2}
          tilt={47}
          saturation={1.5}
          blend={0.75}
          falloff={1.4}
          opacity={0.35}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Top Section with Profile and Introduction */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full'>
          {/* Left column - Profile image with orb effect */}
          <motion.div
            className='relative w-full h-80 md:h-96 mx-auto max-w-md flex items-center justify-center'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Subtle background sunlight blob behind the profile picture */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, #f59e0b 0%, #fbbf24 35%, transparent 70%)',
                filter: 'blur(70px)',
                opacity: 0.16,
                zIndex: 0,
              }}
            />

            {/* Profile image with feathered/fading edges */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative z-10"
              style={{
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                overflow: 'hidden',
                WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
                maskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
              }}
            >
              <img
                src={Profile}
                alt='Profile'
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            </motion.div>
          </motion.div>

          {/* Right column - Text introduction */}
          <motion.div
            className='space-y-6 text-left'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-4xl md:text-5xl font-extrabold'
            >
              Im <span className='text-pink-600'>Hariharpradeep J</span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='text-lg text-gray-300'
            >
              AI & Full-Stack Developer passionate about building intelligent, scalable applications that solve real-world problems. Experienced in Machine Learning, Generative AI, FastAPI, React, and cloud-native technologies.
            </motion.p>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className='text-lg text-gray-300'
            >
              Built AI-powered platforms across infrastructure intelligence, agriculture, and financial risk prediction, with hands-on industry experience as a Software Engineering Intern at Evalio AI. Strong believer in turning innovative ideas into impactful products through engineering excellence and data-driven solutions.
            </motion.p>

            {/* Expertise Section - Moved directly below intro text with reduced spacing */}
            <motion.div
              className='pt-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.h2
                className='text-xl font-bold mb-3'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                My Expertise
              </motion.h2>

              <motion.div
                className='flex flex-wrap gap-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Generative AI</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Machine Learning</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Infrastructure AI</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>FastAPI</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>React & Next.js</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Python</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Node.js</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Kubernetes</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>Docker</span>
                <span className='px-3 py-1 bg-black/50 text-white/95 border border-white/35 backdrop-blur-xl shadow-lg rounded-full text-sm font-semibold'>System Design</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
