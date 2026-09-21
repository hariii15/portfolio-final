import React, { useState } from 'react';
import { FiLinkedin, FiGithub, FiMail, FiSend } from 'react-icons/fi';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card, SectionLabel, Field, inputCls, PrimaryButton } from './ui';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
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
      .then((response) => {
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
      .catch(() => {
        setIsSubmitting(false);
        setError('Could not send message. Opening your email client instead…');
        const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
        const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
        window.location.href = `mailto:hariharpradeepjaybal@gmail.com?subject=${subject}&body=${body}`;
      });
  };

  const channels = [
    { icon: <FiLinkedin size={18} />, title: 'LinkedIn', sub: 'Connect professionally', href: 'https://www.linkedin.com/in/hari2a' },
    { icon: <FiGithub size={18} />, title: 'GitHub', sub: 'Check out my code', href: 'https://github.com/hariii15' },
    { icon: <FiMail size={18} />, title: 'Email', sub: 'hariharpradeepjaybal@gmail.com', href: 'mailto:hariharpradeepjaybal@gmail.com' },
  ];

  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <Eyebrow>Contact</Eyebrow>
        <div className="mt-3">
          <PageTitle>Get in touch</PageTitle>
        </div>
        <PageSubtitle>
          Open to collaboration, new projects, and conversations about AI and engineering.
        </PageSubtitle>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Card className="p-6 sm:p-8">
            <SectionLabel>Send a message</SectionLabel>
            {submitted ? (
              <div className="mt-4 rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] p-4 text-sm dark:border-[#2E2E2E] dark:bg-[#161616]">
                <p className="font-semibold">Message sent.</p>
                <p className="mt-1 text-[#6F6E69] dark:text-[#A1A1A1]">
                  Thank you — I will get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <Field label="Name">
                  <input
                    type="text" id="name" name="name" required
                    value={formData.name} onChange={handleChange}
                    placeholder="Your name" className={inputCls}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email" id="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="your.email@example.com" className={inputCls}
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    id="message" name="message" required rows={5}
                    value={formData.message} onChange={handleChange}
                    placeholder="Your message…" className={`${inputCls} resize-y`}
                  />
                </Field>
                {error && <p className="text-[13px] text-[#EC4899]">{error}</p>}
                <PrimaryButton type="submit" className="w-full">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-black" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FiSend size={15} /> Send message
                    </span>
                  )}
                </PrimaryButton>
              </form>
            )}
          </Card>

          <Card className="p-6 sm:p-8">
            <SectionLabel>Channels</SectionLabel>
            <div className="mt-5 space-y-3">
              {channels.map((c) => (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-apple border border-[#E9E9E6] p-4 transition-colors hover:bg-[#F7F7F5] dark:border-[#232323] dark:hover:bg-[#161616]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#E9E9E6] bg-[#F7F7F5] text-[#111111] dark:border-[#2E2E2E] dark:bg-[#0A0A0A] dark:text-[#EDEDED]">
                    {c.icon}
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold">{c.title}</span>
                    <span className="block text-[12.5px] text-[#6F6E69] dark:text-[#A1A1A1]">{c.sub}</span>
                  </span>
                </a>
              ))}
            </div>
            <div className="mono mt-6 rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] p-4 text-[12px] leading-relaxed text-[#6F6E69] dark:border-[#232323] dark:bg-[#0A0A0A] dark:text-[#A1A1A1]">
              Prefer email? Write to<br />
              <span className="text-[#111111] dark:text-[#EDEDED]">hariharpradeepjaybal@gmail.com</span>
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default Contact;
