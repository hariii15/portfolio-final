import React from 'react';
import { useNavigate } from 'react-router-dom';
import Prism from './Prism';
import ShinyText from './shinyText';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      {/* Prism WebGL background */}
      <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <Prism
          animationType="3drotate"
          height={8}
          baseWidth={6.3}
          glow={0.2}
          noise={0}
          transparent={false}
          scale={3.1}
          hueShift={-0.0416}
          colorFrequency={0.55}
          bloom={1}
          timeScale={0.2}
          suspendWhenOffscreen={false}
        />
      </div>

      {/* Overlay content */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', zIndex: 10 }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 2.5rem)', textAlign: 'center', color: '#fff', margin: 0 }}>
          Hi, I'm <span style={{ fontWeight: 700, color: '#f472b6' }}>Hari</span>,
        </h1>
        <h2 style={{ marginTop: '0.75rem', fontSize: 'clamp(1rem, 3vw, 2rem)', textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
          AI &amp; Full-Stack Developer.
        </h2>
        <p style={{ marginTop: '0.75rem', maxWidth: '28rem', textAlign: 'center', fontSize: 'clamp(0.85rem, 2vw, 1rem)', color: 'rgba(255,255,255,0.6)' }}>
          Building intelligent, scalable applications with ML, Generative AI &amp; cloud-native tech.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          <a
            style={{ cursor: 'pointer', border: '1px solid rgba(255,255,255,0.5)', padding: '0.75rem 1.5rem', fontSize: 'clamp(0.85rem, 2vw, 1.1rem)', backdropFilter: 'blur(8px)', transition: 'background 0.2s', borderRadius: '2px' }}
            onClick={() => navigate('/hero')}
          >
            <ShinyText
              text="Know more about me"
              disabled={false}
              speed={3}
              className='custom-class'
            />
          </a>
          <a
            style={{
              cursor: 'pointer',
              border: '1px solid rgba(245,158,11,0.45)',
              padding: '0.65rem 1.5rem',
              fontSize: 'clamp(0.8rem, 2vw, 1rem)',
              backdropFilter: 'blur(8px)',
              borderRadius: '2px',
              color: 'rgba(251,191,36,0.85)',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            onClick={() => navigate('/blog')}
          >
            <span>Read My Blog</span>
            <span style={{ fontSize: '0.85em' }}>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
