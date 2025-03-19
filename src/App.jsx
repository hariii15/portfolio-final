import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/welcome';
import Hero from './components/hero';
import Layout from './components/Layout';
import About from './components/about';
import Projects from './components/projects';
import Contact from './components/contact';
import Certificates from './components/certificates';

const AppRouter = () => {
  return (
    <div className="relative min-h-screen bg-black">
      {/* Application content with adjusted z-index */}
      <div className="relative z-20 min-h-screen">
        <Router>
          <Routes>
            {/* Welcome page rendered directly without Layout */}
            <Route path="/" element={<Welcome />} />

            {/* All other routes use Layout */}
            <Route element={<Layout />}>
              <Route path="/hero" element={<Hero />} />
              <Route path="/about" element={<About />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default AppRouter;
