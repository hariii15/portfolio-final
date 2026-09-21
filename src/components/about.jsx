import React from 'react';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card, Pill, Tag, SectionLabel } from './ui';

const capabilities = [
  {
    index: '01',
    title: 'AI agents & multi-agent workflows',
    text: 'Built AI agents and multi-agent workflows with LangChain and LangGraph — specialized agents coordinated through graph-based orchestration for code review, education, and general assistance.',
    stack: ['LangChain', 'LangGraph', 'Python', 'OpenRouter'],
  },
  {
    index: '02',
    title: 'RAG pipelines with agentic tools',
    text: 'Built RAG pipelines connected to vector databases, giving agents a set of tools they can use all by themselves — sending mails, reviewing calendars, creating folders on the system, and reviewing files on the machine.',
    stack: ['RAG', 'Pinecone', 'Vector DBs', 'Tool Calling', 'FastAPI'],
  },
  {
    index: '03',
    title: 'Telemetry intelligence layer',
    text: 'Built a telemetry intelligence layer for auditing and monitoring metrics for any Kubernetes environment, backed by data streaming pipelines for real-time observability and anomaly detection.',
    stack: ['Kubernetes', 'Prometheus', 'Grafana', 'Data Streaming', 'Scikit-Learn'],
  },
  {
    index: '04',
    title: 'Microservice architecture',
    text: 'Built microservice architecture pipelines with Kafka messaging, Docker containers, Spring Boot services, and PostgreSQL — scalable backends designed for production systems.',
    stack: ['Kafka', 'Docker', 'Spring Boot', 'PostgreSQL', 'Microservices'],
  },
  {
    index: '05',
    title: 'Dynamic, responsive applications',
    text: 'Built dynamic and responsive web, desktop, and mobile applications with Next.js, React, Electron, and React Native — from marketing sites to desktop-native AI clients.',
    stack: ['Next.js', 'React', 'Electron', 'React Native', 'TypeScript'],
  },
];

const groups = [
  { label: 'AI & ML', items: ['LangChain', 'LangGraph', 'RAG', 'Hugging Face', 'Scikit-Learn', 'TensorFlow', 'OpenRouter'] },
  { label: 'Backend', items: ['FastAPI', 'Spring Boot', 'Node.js', 'Express.js', 'Python', 'Flask', 'REST APIs', 'Kafka', 'Microservices'] },
  { label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Electron', 'React Native', 'HTML / CSS'] },
  { label: 'Cloud & DevOps', items: ['Kubernetes', 'Docker', 'Prometheus', 'Grafana', 'GCP'] },
  { label: 'Databases', items: ['PostgreSQL', 'Pinecone', 'Vector DBs', 'MongoDB', 'Firebase Firestore', 'SQL', 'Supabase'] },
  { label: 'Data & IoT', items: ['Pandas', 'NumPy', 'Data Streaming', 'NodeMCU'] },
];

const stats = [
  { value: '250+', label: 'LeetCode problems solved' },
  { value: '1,462', label: 'LeetCode contest rating' },
  { value: '400+', label: 'SkillRack problems solved' },
];

const About = () => {
  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <Eyebrow>Skills</Eyebrow>
        <div className="mt-3">
          <PageTitle>Capabilities</PageTitle>
        </div>
        <PageSubtitle>
          What I&apos;ve actually built — agent systems, data pipelines, and
          full-stack applications, end to end.
        </PageSubtitle>

        <Card className="mt-10 p-6 sm:p-8">
          <SectionLabel>What I&apos;ve built</SectionLabel>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {capabilities.map((c) => (
              <div
                key={c.index}
                className="relative flex flex-col rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] p-5 dark:border-[#232323] dark:bg-[#0A0A0A]"
              >
                <p className="mono text-[11px] font-semibold text-[#EC4899]">{c.index}</p>
                <h3 className="mt-1.5 text-[15px] font-bold leading-snug">{c.title}</h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[#6F6E69] dark:text-[#A1A1A1]">
                  {c.text}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="p-6 sm:p-7 lg:col-span-2">
            <SectionLabel>Technologies &amp; tools</SectionLabel>
            <div className="mt-5 space-y-5">
              {groups.map((g) => (
                <div key={g.label} className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr] sm:gap-4">
                  <p className="mono pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9B9A93] dark:text-[#6E6E6E]">
                    {g.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((item) => (
                      <Pill key={item}>{item}</Pill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <SectionLabel>Competitive programming</SectionLabel>
            <div className="mt-5 space-y-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-apple border border-[#E9E9E6] bg-[#F7F7F5] p-4 dark:border-[#232323] dark:bg-[#0A0A0A]"
                >
                  <div className="font-display text-2xl font-bold tracking-tight">{s.value}</div>
                  <div className="mt-1 text-[12.5px] text-[#6F6E69] dark:text-[#A1A1A1]">{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default About;
