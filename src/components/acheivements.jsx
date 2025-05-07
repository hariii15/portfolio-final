import React from 'react';
import { motion } from 'framer-motion';
import Merncertificate from './merncertficate.jpg';
import KPR_cert from './kpr-hack-25.png'
import InternalHack from './internal.png'; // Import the new image

const certificateItems = [
  {
    id: 1,
    title: "Mern-stack Internship ",
    issuer: "G-Zoft",
    date: "January 2023",
    image: Merncertificate,
    link: "#", // Later you can replace this with actual link or local path
  },
  {
    id:2,
    title:"KPR-Horizon'25",
    issuer:"KPR",
    date:"March 2025",
    image:KPR_cert,
    link:"#",
  },
  {
    id: 3,
    title: "Internal Hackathon",
    issuer: "Sri Eshwar College of Engineering",
    date: "April 2025",
    image: InternalHack,
    link: "#",
  },
];

const Acheivements = () => {
  // Function to handle certificate viewing
  const handleViewCertificate = (cert) => {
    // Open the image in a new tab
    window.open(cert.image, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center">
      <motion.h1
        className="text-4xl font-bold mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Acheivements
      </motion.h1>

      <motion.p
        className="text-gray-400 mb-8 max-w-2xl text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        A collection of certifications that reflect my continuous learning journey
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        {certificateItems.map((cert, index) => (
          <motion.div
            key={cert.id}
            className="rounded-lg overflow-hidden border border-white/20 bg-transparent backdrop-blur-sm hover:border-pink-500/50 transition-colors"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="relative">
              <img
                src={cert.image}
                alt={cert.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                {/* Fix: Changed to button with onClick handler */}
                <button
                  onClick={() => handleViewCertificate(cert)}
                  className="text-white text-sm bg-pink-600/80 px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
                >
                  View Certificate
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{cert.title}</h3>
              <div className="flex justify-between text-sm text-gray-400">
                <span>{cert.issuer}</span>
                <span>{cert.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Acheivements;
