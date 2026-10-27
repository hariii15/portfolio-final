import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import { ThemeProvider } from './theme/ThemeContext';

const WorldExplorer = React.lazy(() => import('./components/tools/WorldExplorer'));
const DumbTypes = React.lazy(() => import('./components/tools/DumbTypes'));
const CubeTimer = React.lazy(() => import('./components/tools/CubeTimer'));
const PeriodicTable = React.lazy(() => import('./components/tools/PeriodicTable'));
const FlagLearn = React.lazy(() => import('./components/tools/FlagLearn'));
const RunLog = React.lazy(() => import('./components/tools/RunLog'));

// Flat, static loader — no glow, no blur, no gradient.
const Loader = ({ label }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
    {label && (
      <p className="mono mt-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">
        {label}
      </p>
    )}
  </div>
);

const NavigationLoader = ({ children }) => {
  const location = useLocation();
  const [localLoading, setLocalLoading] = useState(false);
  const isFirstMount = React.useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setLocalLoading(true);
    const t = setTimeout(() => setLocalLoading(false), 350);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <>
      {localLoading && <Loader label="Loading" />}
      {children}
    </>
  );
};

const AppRouter = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    if (document.readyState === 'complete') return () => clearTimeout(t);
    const onLoad = () => setLoading(false);
    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(t);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-[#111111] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
        {loading && <Loader label="Hariharpradeep" />}
        <Router>
          <NavigationLoader>
            <Suspense fallback={<Loader label="Loading" />}>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/create" element={<AdminEditor />} />
                <Route path="/admin/edit/:id" element={<AdminEditor />} />
                <Route path="/admin/tools/world-explorer" element={<WorldExplorer />} />
                <Route path="/admin/tools/dumb-types" element={<DumbTypes />} />
                <Route path="/admin/tools/cube-timer" element={<CubeTimer />} />
                <Route path="/admin/tools/periodic-table" element={<PeriodicTable />} />
                <Route path="/admin/tools/flag-learn" element={<FlagLearn />} />
                <Route path="/admin/tools/run-log" element={<RunLog />} />
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
            </Suspense>
          </NavigationLoader>
        </Router>
      </div>
    </ThemeProvider>
  );
};

export default AppRouter;
