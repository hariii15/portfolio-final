import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiLinkedin, FiGithub, FiMail, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import ScrollFloat from './ScrollFloat';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const formRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const triggers = [];

    if (formRef.current) {
      const st = gsap.fromTo(
        formRef.current,
        { opacity: 0, x: -30, scale: 0.96 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: formRef.current,
            start: 'top bottom-=50px',
            end: 'top center+=100px',
            scrub: 1,
          }
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    }

    if (infoRef.current) {
      const st = gsap.fromTo(
        infoRef.current,
        { opacity: 0, x: 30, scale: 0.96 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: infoRef.current,
            start: 'top bottom-=50px',
            end: 'top center+=100px',
            scrub: 1,
          }
        }
      );
      if (st.scrollTrigger) triggers.push(st.scrollTrigger);
    }

    return () => triggers.forEach(t => t.kill());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formSubmitData = new FormData(e.target);
    formSubmitData.append('_subject', `Portfolio Contact from ${formData.name}`);
    formSubmitData.append('_captcha', 'false');
    formSubmitData.append('_template', 'table');

    fetch('https://formsubmit.co/hariharpradeepjaybal@gmail.com', {
      method: 'POST',
      body: formSubmitData,
    })
    .then(response => {
      if (response.ok) {
        setIsSubmitting(false);
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ name: '', email: '', message: '' });
          setSubmitted(false);
        }, 5000);
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .catch(error => {
      console.error('FormSubmit failed:', error);
      setIsSubmitting(false);
      setError('Could not send message. Attempting to open your email client...');

      const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      window.location.href = `mailto:hariharpradeepjaybal@gmail.com?subject=${subject}&body=${body}`;
    });
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-4 sm:p-8" style={{ paddingBottom: '8rem' }}>
      <style>{`
        @keyframes silverShimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .silver-shimmer {
          background: linear-gradient(
            90deg,
            #9ca3af 0%,
            #e5e7eb 30%,
            #f9fafb 50%,
            #e5e7eb 70%,
            #9ca3af 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: silverShimmer 3.5s linear infinite;
        }
      `}</style>

      {/* ── Fixed background blobs — stay static ── */}
      <div
        className="pointer-events-none"
        style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}
      >
        {/* LARGE warm amber blob — top left */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-120px', left: '-160px',
            width: '900px', height: '900px',
            background: 'radial-gradient(circle, #f59e0b 0%, #d97706 35%, transparent 68%)',
            filter: 'blur(110px)',
            opacity: 0.10,
          }}
        />
        {/* LARGE warm white glow — top right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-80px', right: '-180px',
            width: '800px', height: '800px',
            background: 'radial-gradient(circle, #fef3c7 0%, #fbbf24 35%, transparent 68%)',
            filter: 'blur(130px)',
            opacity: 0.08,
          }}
        />
        {/* Mid depth amber blob */}
        <div
          className="absolute rounded-full"
          style={{
            top: '40%', left: '-100px',
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, #b45309 0%, #78350f 50%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.06,
          }}
        />
        {/* Small warm accent — mid right */}
        <div
          className="absolute rounded-full"
          style={{
            top: '35%', right: '5%',
            width: '250px', height: '250px',
            background: 'radial-gradient(circle, #fde68a 0%, transparent 70%)',
            filter: 'blur(70px)',
            opacity: 0.04,
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative max-w-4xl mx-auto w-full flex flex-col items-center" style={{ zIndex: 10 }}>
        
        {/* Title & Subtitle */}
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.01}
          containerClassName="text-4xl font-extrabold tracking-tight text-white mb-2"
        >
          Get In Touch
        </ScrollFloat>
        <p className="silver-shimmer text-sm mb-12 tracking-widest uppercase font-medium">
          Let's collaborate or chat about tech!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Left Panel: Form */}
          <div
            ref={formRef}
            className="p-8 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10, 9, 9, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px 0px rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.22)',
            }}
          >
            {/* Top edge highlight line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.35), transparent)' }}
            />

            <h2 className="text-xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
              Send Me a Message
            </h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-500/10 border border-amber-500/35 text-amber-200 p-4 rounded-lg text-sm"
              >
                <p>Thank you for your message! I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form
                action="https://formsubmit.co/hariharpradeepjaybal@gmail.com"
                method="POST"
                onSubmit={handleSubmit}
              >
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <FiUser />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/80 transition-colors text-sm"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <FiMail />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/80 transition-colors text-sm"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 text-gray-500">
                        <FiMessageSquare />
                      </div>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-amber-500/80 focus:outline-none focus:ring-1 focus:ring-amber-500/80 transition-colors text-sm"
                        placeholder="Your message..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm mt-2">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
                    style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.85)',
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Panel: Connections */}
          <div
            ref={infoRef}
            className="p-8 rounded-2xl overflow-hidden flex flex-col justify-between"
            style={{
              background: 'rgba(10, 9, 9, 0.60)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 0 0 1px rgba(245,158,11,0.18), 0 0 18px 0px rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.22)',
            }}
          >
            {/* Top edge highlight line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.35), transparent)' }}
            />

            <div>
              <h2 className="text-xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}>
                Connect With Me
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Feel free to reach out through any of these platforms. I'm always open to discussing new projects, creative ideas, or opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="https://www.linkedin.com/in/hari2a"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-250 hover:bg-white/5"
                style={{
                  background: 'rgba(5, 5, 5, 0.4)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <div className="bg-amber-500/10 p-3 rounded-full">
                  <FiLinkedin size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">LinkedIn</h3>
                  <p className="text-xs text-gray-400">Connect professionally</p>
                </div>
              </a>

              <a
                href="https://github.com/hariii15"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-250 hover:bg-white/5"
                style={{
                  background: 'rgba(5, 5, 5, 0.4)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <div className="bg-amber-500/10 p-3 rounded-full">
                  <FiGithub size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">GitHub</h3>
                  <p className="text-xs text-gray-400">Check out my code</p>
                </div>
              </a>

              <a
                href="mailto:hariharpradeepjaybal@gmail.com"
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-250 hover:bg-white/5"
                style={{
                  background: 'rgba(5, 5, 5, 0.4)',
                  border: '1px solid rgba(245,158,11,0.15)',
                }}
              >
                <div className="bg-amber-500/10 p-3 rounded-full">
                  <FiMail size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Email</h3>
                  <p className="text-xs text-gray-400">hariharpradeepjaybal@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
