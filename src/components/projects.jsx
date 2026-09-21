import React from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card, Tag, SecondaryButton, SectionLabel } from './ui';

const projects = [
  {
    title: 'KubeMind Industrial',
    subtitle: 'AI-powered infrastructure intelligence',
    description:
      'Cloud-native observability and predictive intelligence for Kubernetes-based industrial environments. AI agents monitor health, detect anomalies, predict failures, and provide recommendations, with an Infrastructure Copilot for natural-language interaction.',
    techStack: ['Next.js', 'TypeScript', 'FastAPI', 'LangGraph', 'Kubernetes', 'Prometheus', 'Scikit-Learn'],
    githubLink: 'https://github.com/hariii15/abb',
    liveDemoLink: '',
  },
  {
    title: 'Thoth AI Companion',
    subtitle: 'Multi-agent desktop assistant & RAG',
    description:
      'Desktop-native AI assistant with a LangGraph backend routing to specialized agents for code review, education, and general assistance. Persistent semantic memory with Pinecone and native system tooling in an Electron client.',
    techStack: ['Electron', 'TypeScript', 'FastAPI', 'LangGraph', 'Pinecone', 'OpenRouter'],
    githubLink: 'https://github.com/hariii15/Thoth',
    liveDemoLink: '',
  },
  {
    title: 'Mannmathi',
    subtitle: 'AI-powered smart farming assistant',
    description:
      'Multilingual mobile app for small-scale farmers. ML-based plant disease detection, IoT soil-health analysis, and personalized recommendations with a multilingual chatbot.',
    techStack: ['React Native', 'Python', 'GCP', 'Docker', 'Hugging Face', 'NodeMCU'],
    githubLink: 'https://github.com/hariii15/mannmathi',
    liveDemoLink: '',
  },
  {
    title: 'Safra',
    subtitle: 'Parametric insurance platform',
    description:
      'Risk prediction for gig workers using weather, pollution, demand, and outage signals. Dynamic premium calculation with a zero-touch automated claims engine.',
    techStack: ['React', 'Node.js', 'FastAPI', 'Firebase', 'Machine Learning', 'Docker'],
    githubLink: 'https://github.com/hariii15/dev-trial',
    liveDemoLink: '',
  },
  {
    title: 'Evalio AI',
    subtitle: 'Software Engineering Intern',
    description:
      'Contributed to an AI-driven personalized learning platform — backend services, workflow pipelines, and optimized data retrieval for administrative operations.',
    techStack: ['Python', 'FastAPI', 'REST APIs', 'Databases', 'Cloud Services'],
    githubLink: '',
    liveDemoLink: 'https://evalioai.com/',
  },
  {
    title: 'Noter',
    subtitle: 'AI note-taking system',
    description:
      'Intelligent note-taking with AI agents for summarization, review, and actionable insights.',
    techStack: ['Node.js', 'React', 'Tailwind', 'Deepseek', 'Firebase'],
    githubLink: 'https://github.com/hariii15/Noter_v.02',
    liveDemoLink: 'https://noter-7d803.web.app/',
  },
  {
    title: 'Buis-bot',
    subtitle: 'AI business assistant',
    description:
      'Assistant chatbot for business owners with persistent user context for growth insights and contextual help.',
    techStack: ['Flask', 'React', 'Tailwind', 'Deepseek', 'Supabase'],
    githubLink: 'https://github.com/hariii15/buiss_bot',
    liveDemoLink: 'https://buiss-bot.vercel.app/',
  },
  {
    title: 'StockMarket Tracker',
    subtitle: 'Market intelligence & portfolio tool',
    description:
      'Real-time monitoring with price alerts, portfolio management, and ML-based predictive analytics.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Python'],
    githubLink: 'https://github.com/hariii15/stock-pro-frontend',
    liveDemoLink: '',
  },
  {
    title: 'WATCH 2.0',
    subtitle: "Women's safety & wellness platform",
    description:
      'Upgraded safety platform with doctor consultations, real-time protection, and wellness tools.',
    techStack: ['React', 'Flask', 'PostgreSQL', 'WebRTC'],
    githubLink: 'https://github.com/hariii15/watch2.0',
    liveDemoLink: '',
  },
  {
    title: 'WATCH',
    subtitle: "Women's emergency safety app",
    description:
      'Emergency safety app with automatic SOS alerts, unusual behavior detection, and real-time updates.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Twilio'],
    githubLink: 'https://github.com/hariii15/watch',
    liveDemoLink: '',
  },
];

const Projects = () => {
  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <Eyebrow>Work</Eyebrow>
        <div className="mt-3">
          <PageTitle>Projects</PageTitle>
        </div>
        <PageSubtitle>
          Selected work across AI platforms, full-stack applications, and
          industry projects.
        </PageSubtitle>

        <div className="mt-10 space-y-4">
          {projects.map((p, i) => (
            <Card key={i} className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#EC4899]">
                    {String(i + 1).padStart(2, '0')} — {p.subtitle}
                  </p>
                  <h2 className="font-display mt-2 text-[22px] font-bold tracking-tight">
                    {p.title}
                  </h2>
                </div>
                {(p.githubLink || p.liveDemoLink) && (
                  <div className="flex shrink-0 gap-2">
                    {p.githubLink && (
                      <SecondaryButton href={p.githubLink} className="px-4 py-2 text-[13px]">
                        GitHub <FiArrowUpRight size={14} />
                      </SecondaryButton>
                    )}
                    {p.liveDemoLink && (
                      <SecondaryButton href={p.liveDemoLink} className="px-4 py-2 text-[13px]">
                        {p.title.includes('Evalio') ? 'Website' : 'Live demo'} <FiArrowUpRight size={14} />
                      </SecondaryButton>
                    )}
                  </div>
                )}
              </div>

              <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                {p.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.techStack.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-6">
          <SectionLabel>Note</SectionLabel>
          <p className="mt-2 text-sm text-[#6F6E69] dark:text-[#A1A1A1]">
            More experiments and contributions are on GitHub. Each project above
            links to its repository or live deployment where available.
          </p>
        </Card>
      </div>
    </Page>
  );
};

export default Projects;
