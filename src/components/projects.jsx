import React from 'react';
import { motion } from 'framer-motion';

const projects = [
    {
      title: "WATCH",
      description:
        "A women's safety app with features like automatic SOS alerts, unusual behavior detection, and real-time updates during emergencies.",
      progress: 10,
      color: "#FF5733",
      techStack: ["React", "Node.js", "MongoDB", "Twilio"],
      githubLink: "https://github.com/hariii15/watch",
      liveDemoLink: "https://github.com/hariii15/watch",
    },
    {
      title: "WATCH 2.0",
      description:
        "An upgraded version of the WATCH app with features like one-on-one consultations with doctors and enhanced safety and wellness tools.",
      progress: 30,
      color: "#33B5FF",
      techStack: ["React", "Flask", "PostgreSQL", "WebRTC"],
      githubLink: "https://github.com/hariii15/watch2.0",
      liveDemoLink: "https://github.com/hariii15/watch2.0",
    },
    {
      title: "StockMarket Tracker",
      description:
        "Real-time stock market monitoring application with price alerts, portfolio management, and predictive analytics using machine learning algorithms.",
      progress: 98,
      color: "#6D28D9",
      techStack: ["React", "Node.js", "MongoDB", "Python" ],
      githubLink: "https://github.com/hariii15/stock-pro-frontend",
      liveDemoLink: "",
    },
    {
      title: "Nutrisence Project",
      description:
        "A project addressing child harassment issues in India, integrating solutions to alert authorities or guardians in real-time.",
      progress: 70,
      color: "#28A745",
      techStack: ["Python", "Flask","Node.js", "ReactNative", "TensorFlow"],
      githubLink: "https://github.com/hariii15/nutrisense",
      liveDemoLink: "https://github.com/hariii15/nutrisense",
    },
  ];

const Projects = () => {
  return (
    <div className="min-h-screen text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-8">My Projects</h1>
      <div className="space-y-8 w-full max-w-4xl">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-700"
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-3xl font-semibold mb-4">{project.title}</h2>
            <p className="text-gray-400 mb-6">{project.description}</p>

            {/* Tech Stack Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech, i) => {
                // Define different colors for different technologies
                const colors = {
                  React: { bg: 'bg-blue-700/20', text: 'text-blue-500' },
                  ReactNative: { bg: 'bg-blue-700/20', text: 'text-blue-500' },
                  'Node.js': { bg: 'bg-green-700/20', text: 'text-green-500' },
                  MongoDB: { bg: 'bg-green-700/20', text: 'text-green-500' },
                  Python: { bg: 'bg-purple-700/20', text: 'text-purple-500' },
                  TensorFlow: { bg: 'bg-red-700/20', text: 'text-red-500' },
                  Django: { bg: 'bg-purple-700/20', text: 'text-purple-500' },
                  Flask: { bg: 'bg-purple-700/20', text: 'text-purple-500' },
                  PostgreSQL: { bg: 'bg-blue-700/20', text: 'text-blue-500' },
                  SQLite: { bg: 'bg-blue-700/20', text: 'text-blue-500' },
                  Twilio: { bg: 'bg-pink-700/20', text: 'text-pink-500' },
                  WebRTC: { bg: 'bg-yellow-700/20', text: 'text-yellow-500' },
                };

                // Default color if tech not found in colors mapping
                const colorClasses = colors[tech] || { bg: 'bg-gray-700/20', text: 'text-gray-400' };

                return (
                  <motion.span
                    key={i}
                    className={`px-3 py-1 ${colorClasses.bg} ${colorClasses.text} rounded-full text-sm font-semibold hover:opacity-80 transition-opacity`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {tech}
                  </motion.span>
                );
              })}
            </div>

            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${project.progress}%`,
                  backgroundColor: project.color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Progress: {project.progress}%
            </p>

            {/* Links */}
            <div className="mt-6 flex gap-4">
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
              >
                GitHub Repo
              </a>
              <a
                href={project.liveDemoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-pink-700 hover:bg-pink-600 rounded-md transition-colors"
              >
                Live Demo
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
