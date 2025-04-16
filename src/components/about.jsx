import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import 'chart.js/auto';
import { FiX, FiExternalLink } from 'react-icons/fi';

// Individual skills with proficiency levels
const individualSkills = [
  { name: "JavaScript", level: 85, category: "Frontend", color: "#F0DB4F" },
  { name: "React", level: 90, category: "Frontend", color: "#61DAFB" },
  { name: "React Native", level: 75, category: "Mobile", color: "#61DAFB" },
  { name: "HTML/CSS", level: 95, category: "Frontend", color: "#E34C26" },
  { name: "Node.js", level: 80, category: "Backend", color: "#3C873A" },
  { name: "Express", level: 75, category: "Backend", color: "#000000" },
  { name: "Python", level: 70, category: "Backend", color: "#306998" },
  { name: "Django", level: 65, category: "Backend", color: "#092E20" },
  { name: "Flask", level: 60, category: "Backend", color: "#000000" },
  { name: "Java", level: 60, category: "Programming", color: "#007396" },
  { name: "C", level: 55, category: "Programming", color: "#A8B9CC" },
  { name: "MongoDB", level: 75, category: "Database", color: "#47A248" },
  { name: "SQL", level: 70, category: "Database", color: "#336791" },
  { name: "DSA", level: 65, category: "CS Fundamentals", color: "#F05033" },
  { name: "Machine Learning", level: 55, category: "AI/ML", color: "#FF6F00" },
  { name: "TensorFlow", level: 50, category: "AI/ML", color: "#FF6F00" },
  { name: "Git", level: 85, category: "Tools", color: "#F05033" },
  { name: "Firebase", level: 72, category: "Backend/Cloud", color: "#FFA611" },
  { name: "Supabase", level: 65, category: "Backend/Cloud", color: "#3ECF8E" },
  { name: "Appwrite", level: 60, category: "Backend/Cloud", color: "#F02E65" },
  { name: "Clerk", level: 68, category: "Authentication", color: "#6C47FF" },
];

// Group skills by category for the summary view
const groupedSkills = [
  { name: "Frontend Development", level: 90, color: "#61DAFB" },
  { name: "Backend Development", level: 75, color: "#3C873A" },
  { name: "Mobile Development", level: 75, color: "#61DAFB" },
  { name: "Database Management", level: 72, color: "#336791" },
  { name: "Machine Learning & AI", level: 52, color: "#FF6F00" },
  { name: "Data Structures & Algorithms", level: 65, color: "#F05033" },
  { name: "Full Stack Development", level: 82, color: "#764ABC" },
];

// Additional skills for the floating view
const allSkills = [
  ...individualSkills,
  { name: "Docker", level: 60, category: "DevOps", color: "#2496ED" },
  { name: "Pandas", level: 78, category: "Data Science", color: "#150458" },
  { name: "Next.js", level: 82, category: "Frontend", color: "#000000" },
  { name: "GraphQL", level: 68, category: "API", color: "#E10098" },
  { name: "AWS", level: 58, category: "Cloud", color: "#FF9900" },
  { name: "TypeScript", level: 75, category: "Programming", color: "#3178C6" },
  { name: "Redux", level: 80, category: "Frontend", color: "#764ABC" },
];

const SkillBar = ({ skill, animationDelay = 0 }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium">{skill.name}</span>
        <span className="text-sm text-gray-400">{skill.level}%</span>
      </div>
      <div className="h-2.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: skill.color }}
          initial={{ width: 0 }}
          animate={{ width: `${skill.level}%` }}
          transition={{
            duration: 1.2,
            delay: animationDelay,
            ease: "easeOut"
          }}
        />
      </div>
    </div>
  );
};

// Implement a proper RadarChart component using react-chartjs-2
const RadarChart = () => {
  const data = {
    labels: [
      'Frontend',
      'Backend',
      'Mobile Dev',
      'Databases',
      'ML/AI',
      'DSA',
      'DevOps'
    ],
    datasets: [
      {
        label: 'Skills',
        data: [90, 75, 75, 72, 52, 65, 70],
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(236, 72, 153, 1)',
      }
    ]
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12
          }
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.7)',
          z: 100
        },
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Proficiency: ${context.raw}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="border border-white/20 rounded-lg p-6 h-80 bg-transparent">
      <Radar data={data} options={options} />
    </div>
  );
};

const About = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [showAllSkills, setShowAllSkills] = useState(false);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 flex flex-col items-center">
      {/* Stats badges - changed from fixed to static positioning */}
      <div className="self-end flex flex-col items-end gap-1 md:gap-2 z-20 mb-6 md:mb-8">
        <motion.div
          className="border border-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-right">
            <div className="text-xs text-gray-400">LeetCode</div>
            <div className="font-bold text-xs md:text-sm">147 Problems</div>
          </div>
          <img src="https://leetcode.com/static/images/LeetCode_logo_rvs.png" alt="LeetCode" className="w-5 h-5 md:w-6 md:h-6" />
        </motion.div>

        <motion.div
          className="border border-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-right">
            <div className="text-xs text-gray-400">Contest Rating</div>
            <div className="font-bold text-xs md:text-sm">1,462</div>
          </div>
          <div className="w-5 h-5 md:w-6 md:h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">LC</div>
        </motion.div>

        <motion.div
          className="border border-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 md:px-4 md:py-2 flex items-center gap-2 md:gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-right">
            <div className="text-xs text-gray-400">SkillRack</div>
            <div className="font-bold text-xs md:text-sm">167 Problems</div>
          </div>
          <div className="w-5 h-5 md:w-6 md:h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">SR</div>
        </motion.div>
      </div>

      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-2 mt-12 md:mt-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Skills
      </motion.h1>

      <motion.p
        className="text-gray-400 mb-4 max-w-2xl text-center text-sm md:text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Explore my technical expertise across different domains of software development.
      </motion.p>

      {/* View All Skills button - Updated styling with pink border and no background */}
      <motion.button
        className="mb-6 md:mb-8 px-4 md:px-6 py-1.5 md:py-2 border-2 border-pink-500 text-pink-500 rounded-full flex items-center gap-2 hover:bg-pink-500/10 transition-colors bg-transparent"
        onClick={() => setShowAllSkills(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span className="text-sm md:text-base">View All Skills</span>
        <FiExternalLink size={16} />
      </motion.button>

      {/* Tab navigation */}
      <div className="flex space-x-2 md:space-x-4 mb-6 md:mb-8 text-sm md:text-base">
        <button
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors border ${activeTab === 'individual'
            ? 'border-pink-500 text-pink-500'
            : 'border-white/20 text-gray-300 hover:border-white/40'}`}
          onClick={() => setActiveTab('individual')}
        >
          Individual Skills
        </button>
        <button
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors border ${activeTab === 'grouped'
            ? 'border-pink-500 text-pink-500'
            : 'border-white/20 text-gray-300 hover:border-white/40'}`}
          onClick={() => setActiveTab('grouped')}
        >
          Skill Categories
        </button>
      </div>

      {/* Individual Skills View */}
      {activeTab === 'individual' && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-12 gap-y-1 md:gap-y-2 w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {individualSkills.map((skill, index) => (
            <SkillBar key={skill.name} skill={skill} animationDelay={index * 0.05} />
          ))}
        </motion.div>
      )}

      {/* Grouped Skills View */}
      {activeTab === 'grouped' && (
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="pb-4">
              {groupedSkills.map((skill, index) => (
                <SkillBar key={skill.name} skill={skill} animationDelay={index * 0.1} />
              ))}
            </div>

            <div>
              <motion.div
                className="border border-white/20 rounded-lg p-4 md:p-6 backdrop-blur-sm"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Skills Overview</h3>
                <p className="text-gray-400 mb-4 md:mb-6 text-sm md:text-base">
                  My strongest areas are in Frontend and Full Stack Development, with significant experience in React and JavaScript ecosystems.
                </p>
                <div className="mt-2 h-60 md:h-80">
                  <RadarChart />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full screen floating skills overlay */}
      <AnimatePresence>
        {showAllSkills && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Close button in top-right corner */}
            <motion.button
              className="absolute top-3 md:top-5 right-3 md:right-5 w-8 h-8 md:w-10 md:h-10 bg-transparent backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:border-white/50 transition-colors"
              onClick={() => setShowAllSkills(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={20} />
            </motion.button>

            {/* Quit button in top-left corner */}
            <motion.button
              className="absolute top-3 md:top-5 left-3 md:left-5 px-4 md:px-6 py-1.5 md:py-2 border-2 border-pink-500 text-white rounded-full flex items-center justify-center gap-1 md:gap-2 hover:bg-pink-500/10 transition-colors backdrop-blur-sm z-50"
              onClick={() => setShowAllSkills(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-medium text-sm md:text-base">Quit</span>
              <FiX size={14} className="md:size-16" />
            </motion.button>

            <div className="relative w-full h-full overflow-hidden">
              {allSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  className="absolute"
                  style={{
                    background: `radial-gradient(circle, ${skill.color}40 0%, ${skill.color}00 70%)`,
                  }}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 0
                  }}
                  animate={{
                    x: [
                      Math.random() * window.innerWidth,
                      Math.random() * window.innerWidth,
                      Math.random() * window.innerWidth
                    ],
                    y: [
                      Math.random() * window.innerHeight,
                      Math.random() * window.innerHeight,
                      Math.random() * window.innerHeight
                    ],
                    opacity: 1,
                    transition: {
                      x: {
                        duration: 60 + Math.random() * 40, // Increased duration to slow down movement
                        repeat: Infinity,
                        repeatType: 'reverse'
                      },
                      y: {
                        duration: 60 + Math.random() * 40, // Increased duration to slow down movement
                        repeat: Infinity,
                        repeatType: 'reverse'
                      },
                      opacity: { duration: 1.5, delay: index * 0.05 }
                    }
                  }}
                >
                  <motion.div
                    className="relative px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm whitespace-nowrap"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, backgroundColor: `${skill.color}20` }}
                  >
                    <div className="font-medium">{skill.name}</div>
                    <div className="text-xs text-center mt-1 text-gray-400">{skill.level}%</div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;
