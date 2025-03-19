import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiLinkedin, FiGithub, FiMail, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className='min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center'>
      <motion.div
        className="max-w-4xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-bold text-center mb-2"
          variants={itemVariants}
        >
          Get In Touch
        </motion.h1>

        <motion.p
          className="text-gray-400 text-center mb-12"
          variants={itemVariants}
        >
          Let's collaborate on your next project or just have a chat about tech!
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-6">Send Me a Message</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/50 text-green-300 p-4 rounded-lg"
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
                    <label htmlFor="name" className="block text-sm text-gray-400 mb-1">Name</label>
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
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-400 mb-1">Email</label>
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
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm text-gray-400 mb-1">Message</label>
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
                        className="pl-10 w-full p-2 bg-transparent border border-white/20 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
                        placeholder="Your message..."
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm mt-2">
                      {error}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-pink-700 text-white rounded-lg hover:bg-pink-600 transition-colors mt-4"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Connect With Me</h2>
              <p className="text-gray-400 mb-6">
                Feel free to reach out through any of these platforms. I'm always open to discussing new projects, creative ideas, or opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <motion.a
                href="https://www.linkedin.com/in/hari2a" // Fixed URL: added https:// prefix
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-white/20 hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FiLinkedin size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">LinkedIn</h3>
                  <p className="text-sm text-gray-400">Connect professionally</p>
                </div>
              </motion.a>

              <motion.a
                href="https://github.com/hariii15"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg border border-white/20 hover:border-gray-500/50 hover:bg-gray-500/10 transition-colors"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="bg-gray-700/30 p-3 rounded-full">
                  <FiGithub size={24} className="text-gray-300" />
                </div>
                <div>
                  <h3 className="font-medium">GitHub</h3>
                  <p className="text-sm text-gray-400">Check out my code</p>
                </div>
              </motion.a>

              <motion.a
                href="mailto:hariharpradeepjaybal@gmail.com"
                className="flex items-center gap-4 p-4 rounded-lg border border-white/20 hover:border-pink-500/50 hover:bg-pink-500/10 transition-colors"
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="bg-pink-500/20 p-3 rounded-full">
                  <FiMail size={24} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-gray-400">hariharpradeepjaybal@gmail.com</p>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
