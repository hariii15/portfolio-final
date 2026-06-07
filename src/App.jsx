import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Welcome from './components/welcome';
import Hero from './components/hero';
import Layout from './components/Layout';
import About from './components/about';
import Projects from './components/projects';
import Contact from './components/contact';
import Acheivements from './components/acheivements';
import Blog from './components/blog';
import BlogDetail from './components/blogDetail';
import AdminLogin from './components/adminLogin';
import AdminDashboard from './components/adminDashboard';
import AdminEditor from './components/adminEditor';

// Helper to wait until all current images in the page DOM are loaded
const waitForPageImages = (callback) => {
  // Let React mount DOM elements on next tick
  setTimeout(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    if (imgs.length === 0) {
      callback();
      return;
    }

    let loadedCount = 0;
    let finished = false;

    // Safety timeout in case of slow/stuck network requests
    const safetyTimeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        callback();
      }
    }, 2000);

    const onImageLoad = () => {
      if (finished) return;
      loadedCount++;
      if (loadedCount === imgs.length) {
        finished = true;
        clearTimeout(safetyTimeout);
        callback();
      }
    };

    imgs.forEach((img) => {
      if (img.complete) {
        onImageLoad();
      } else {
        img.addEventListener('load', onImageLoad);
        img.addEventListener('error', onImageLoad); // handle broken links gracefully
      }
    });
  }, 60);
};

// ── Navigation Loader Component ──
const NavigationLoader = ({ children }) => {
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(false);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    // Skip the very first mount since the global loading screen handles it
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setLocalLoading(true);
    waitForPageImages(() => {
      setLocalLoading(false);
    });
  }, [location.pathname]);

  return (
    <>
      <AnimatePresence>
        {localLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.4, ease: 'easeInOut' }
            }}
            className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/90 backdrop-blur-[16px]"
          >
            {/* Spinning sunlight glow ring */}
            <div className="relative flex items-center justify-center mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-12 h-12 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: '#f59e0b',
                  borderRightColor: 'rgba(251, 191, 36, 0.3)',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)',
                }}
              />
              <div className="absolute w-8 h-8 rounded-full bg-black/80 border border-white/10" />
            </div>
            <p
              className="text-[9px] font-semibold text-amber-500/80 tracking-[0.4em] uppercase"
              style={{ letterSpacing: '0.4em' }}
            >
              Loading Page
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

const AppRouter = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let finished = false;

    // Safety timeout: max 4 seconds wait time
    const safetyTimeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        setLoading(false);
      }
    }, 4000);

    const checkAllLoaded = () => {
      waitForPageImages(() => {
        if (!finished) {
          finished = true;
          clearTimeout(safetyTimeout);
          setLoading(false);
        }
      });
    };

    if (document.readyState === 'complete') {
      checkAllLoaded();
    } else {
      window.addEventListener('load', checkAllLoaded);
      return () => {
        window.removeEventListener('load', checkAllLoaded);
        clearTimeout(safetyTimeout);
      };
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Global Initial Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-[24px]"
          >
            {/* Spinning sunlight glow ring */}
            <div className="relative flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-transparent"
                style={{
                  borderTopColor: '#f59e0b',
                  borderRightColor: 'rgba(251, 191, 36, 0.3)',
                  boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
                }}
              />
              <div className="absolute w-12 h-12 rounded-full bg-black/80 border border-white/10" />
            </div>

            {/* Glowing typography */}
            <h1
              className="text-xl font-bold tracking-widest text-white uppercase mb-2"
              style={{
                fontFamily: "'Outfit', 'Inter', sans-serif",
                letterSpacing: '0.25em',
                textShadow: '0 0 12px rgba(255,255,255,0.2)'
              }}
            >
              HARIHARPRADEEP
            </h1>
            <p
              className="text-[10px] font-semibold text-amber-500/80 tracking-[0.4em] uppercase"
              style={{ letterSpacing: '0.4em' }}
            >
              Initializing Portfolio
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application */}
      <div className="relative z-20 min-h-screen">
        <Router>
          <NavigationLoader>
            <Routes>
              {/* Welcome page rendered directly without Layout */}
              <Route path="/" element={<Welcome />} />

              {/* Admin Panel Pages (Independent layouts, no main portfolio Dock) */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/create" element={<AdminEditor />} />
              <Route path="/admin/edit/:id" element={<AdminEditor />} />

              {/* All other routes use Layout (with the main portfolio Dock navigation) */}
              <Route element={<Layout />}>
                <Route path="/hero" element={<Hero />} />
                <Route path="/about" element={<About />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/acheivements" element={<Acheivements />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogDetail />} />
              </Route>
            </Routes>
          </NavigationLoader>
        </Router>
      </div>
    </div>
  );
};

export default AppRouter;
