import React, { useRef } from 'react';
import { FiArrowRight, FiMapPin, FiBriefcase } from 'react-icons/fi';
import Profile from '../profile.jpeg';
import HeroMascot from './HeroMascot';
import ShinyText from './shinyText';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card, Pill, Tag, SecondaryButton, PrimaryButton, SectionLabel } from './ui';

const experiences = [
  {
    index: '01',
    role: 'AI SWE Intern',
    company: 'Evalio AI',
    text: 'Built AI pipelines and agent workflows for personalized learning, with full-stack delivery across frontend and backend services.',
    stack: ['React', 'AI Pipelines', 'Agents', 'Node.js', 'Firebase'],
  },
  {
    index: '02',
    role: 'Product Engineering Intern',
    company: 'Effigo',
    current: true,
    text: 'Building scalable backend services and interfaces for production systems, working across microservices, messaging, and data layers.',
    stack: ['Spring Boot', 'React', 'Scalable Applications', 'Kafka', 'Microservices', 'PostgreSQL'],
  },
];

const Hero = () => {
  const runwayRef = useRef(null);
  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);

  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <Eyebrow>Hi, this is</Eyebrow>
        <div className="mt-3">
          <PageTitle>Hariharpradeep J</PageTitle>
        </div>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="flex h-full flex-col overflow-hidden">
            <div className="border-b border-[#E9E9E6] bg-[#F7F7F5] dark:border-[#232323] dark:bg-[#0A0A0A]">
              <img
                src={Profile}
                alt="Hariharpradeep J"
                className="h-72 w-full object-cover"
                style={{ objectPosition: 'center 20%' }}
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <SectionLabel>Profile</SectionLabel>
              <h2 className="font-display mt-2 text-xl font-bold tracking-tight">
                AI &amp; Full-Stack Developer
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                Experienced in ML, generative AI, FastAPI, React, and
                cloud-native technologies.
              </p>
              {/* Free-floating mascot runway — NOT a card/box. Roams between text and buttons. */}
              <div ref={runwayRef} className="relative mt-1 h-[86px] overflow-visible">
                <HeroMascot runwayRef={runwayRef} primaryRef={primaryRef} secondaryRef={secondaryRef} />
              </div>
              <div className="mt-auto flex flex-col gap-2 pt-1 sm:flex-row">
                <div ref={primaryRef} className="flex-1">
                  <PrimaryButton to="/projects" className="w-full">
                    View projects <FiArrowRight size={15} />
                  </PrimaryButton>
                </div>
                <div ref={secondaryRef} className="flex-1">
                  <SecondaryButton to="/contact" className="w-full">
                    Contact
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </Card>

          {/* About + experience — stretches to match profile card height */}
          <div className="flex h-full flex-col gap-5 lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <SectionLabel>About</SectionLabel>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[#37352F] dark:text-[#c9c9c9]">
                I’m a software engineer who loves building things that people can actually use. I’ve worked across RAG pipelines, AI agents, developer workflows, and end-to-end applications, turning ideas into working products from the ground up.
              </p>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[#37352F] dark:text-[#c9c9c9]">
                Currently focusing on building software that scales, survives change, and stands the test of time, including working with complex and legacy systems. enjoying the process of understanding how things work under the hood and building systems that are reliable, and useful.
              </p>
            </Card>

            <Card className="flex-1 p-6 sm:p-8">
              <SectionLabel>Experience</SectionLabel>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {experiences.map((e) => (
                  <div
                    key={e.company}
                    className="relative flex flex-col rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] p-5 dark:border-[#232323] dark:bg-[#0A0A0A]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="mono text-[11px] font-semibold text-[#EC4899]">{e.index}</p>
                      {e.current && (
                        <ShinyText
                          text="Current"
                          className="mono text-[10.5px] font-medium tracking-[0.14em] uppercase"
                        />
                      )}
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-bold leading-snug">{e.role}</h3>
                    <p className="mt-0.5 text-[13.5px] font-medium text-[#6F6E69] dark:text-[#A1A1A1]">
                      {e.company}
                    </p>
                    <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                      {e.text}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {e.stack.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Hero;
