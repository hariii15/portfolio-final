import React from 'react';
import Profile from './profile.jpg';
import { motion } from 'framer-motion';
import Orb from './Orb';
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
  ];

  return (
    <div className='min-h-screen bg-black text-white py-12 px-8 flex flex-col space-y-10'>
      {/* Top Section with Profile and Introduction */}
      <div className='mt-36 grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto w-full'>
        {/* Left column - Profile image with orb effect */}
        <motion.div
          className='relative w-full h-80 md:h-96 mx-auto max-w-md'
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Orb background effect */}
          <div className="absolute inset-0 w-full h-full">
            <Orb
              hoverIntensity={0.5}
              rotateOnHover={true}
              hue={300}
              forceHoverState={false}
            />
          </div>

          {/* Profile image - removed background styling */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-transparent"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden" style={{ background: 'transparent' }}>
              <img
                src={Profile}
                alt='Profile'
                className='w-full h-full object-cover'
              />
            </div>
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
            I'm a versatile developer with expertise across multiple domains. From crafting responsive front-end interfaces with React and Tailwind CSS to building robust back-end systems with Node.js and SQL databases, I thrive in full-stack environments.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className='text-lg text-gray-300'
          >
            My passion extends to AI and Machine Learning, where I apply Python and data science techniques to create intelligent solutions.
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
              <a href="https://www.tensorflow.org/learn" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-pink-700/20 text-pink-500 rounded-full text-sm font-semibold hover:bg-pink-700/40 transition-colors'>Machine Learning</a>
              <a href="https://reactjs.org/docs/getting-started.html" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-blue-700/20 text-blue-500 rounded-full text-sm font-semibold hover:bg-blue-700/40 transition-colors'>React</a>
              <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-yellow-700/20 text-yellow-500 rounded-full text-sm font-semibold hover:bg-yellow-700/40 transition-colors'>JavaScript</a>
              <a href="https://nodejs.org/en/docs/" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-green-700/20 text-green-500 rounded-full text-sm font-semibold hover:bg-green-700/40 transition-colors'>Node.js</a>
              <a href="https://dev.mysql.com/doc/" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-cyan-700/20 text-cyan-500 rounded-full text-sm font-semibold hover:bg-cyan-700/40 transition-colors'>SQL</a>
              <a href="https://docs.python.org/3/" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-purple-700/20 text-purple-500 rounded-full text-sm font-semibold hover:bg-purple-700/40 transition-colors'>Python</a>
              <a href="https://pandas.pydata.org/docs/" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-orange-700/20 text-orange-500 rounded-full text-sm font-semibold hover:bg-orange-700/40 transition-colors'>Data Science</a>
              <a href="https://www.tensorflow.org/api_docs" target="_blank" rel="noopener noreferrer" className='px-3 py-1 bg-red-700/20 text-red-500 rounded-full text-sm font-semibold hover:bg-red-700/40 transition-colors'>TensorFlow</a>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

    </div>
  );
};

export default Hero;
