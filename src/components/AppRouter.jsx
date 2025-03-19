import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './welcome';
import Hero from './hero'; // Assuming you have a Hero component
import Layout from './Layout';
import About from './about';
import Project from './projects'
import Contact from './contact'
import Particles from './Particles';
const AppRouter = () => {
  return (
    <div style={{ height: '500px', position: 'relative', overflow: 'hidden'}}>
         <div className="absolute inset-0 z-10">
        <Particles
          particleColors={['#ffffff', '#ffffff']}
          particleCount={300}
          particleSpread={30}
          speed={0.3}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={true}
        />
      </div>

        <Router>
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/hero" element={<Hero />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Project />} />
            <Route path="/contact" element={<Contact />} />

        </Routes>
        </Router>
    </div>
  );
};

export default AppRouter;
