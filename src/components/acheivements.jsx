import React from 'react';
import { FiArrowUpRight } from 'react-icons/fi';
import { Page, Eyebrow, PageTitle, PageSubtitle, Card } from './ui';
import Merncertificate from './merncertficate.jpg';
import KPR_cert from './kpr-hack-25.png';
import InternalHack from './internal.png';
import DjangoCert from './django.png';
import SQLCert from './sql.png';

const certificateItems = [
  { id: 1, title: 'MERN-Stack Internship', issuer: 'G-Zoft', date: 'Jan 2023', image: Merncertificate },
  { id: 2, title: "KPR-Horizon'25", issuer: 'KPR', date: 'Mar 2025', image: KPR_cert },
  { id: 3, title: 'Internal Hackathon', issuer: 'Sri Eshwar College of Engineering', date: 'Apr 2025', image: InternalHack },
  { id: 4, title: 'Django Masterclass', issuer: 'Knowledge Nest', date: 'May 2025', image: DjangoCert },
  { id: 5, title: 'Learn SQL in 3 Hours', issuer: 'OCSALY Academy', date: 'May 2025', image: SQLCert },
];

const Acheivements = () => {
  const open = (cert) => window.open(cert.image, '_blank');

  return (
    <Page>
      <div className="pt-12 sm:pt-16">
        <Eyebrow>Credentials</Eyebrow>
        <div className="mt-3">
          <PageTitle>Achievements</PageTitle>
        </div>
        <PageSubtitle>
          Certifications, hackathons, and continuous learning.
        </PageSubtitle>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificateItems.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <button onClick={() => open(cert)} className="block w-full text-left" aria-label={`View ${cert.title}`}>
                <div className="border-b border-[#E9E9E6] bg-[#F7F7F5] dark:border-[#232323] dark:bg-[#0A0A0A]">
                  <img src={cert.image} alt={cert.title} className="h-44 w-full object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-[16px] font-bold tracking-tight">{cert.title}</h3>
                  <div className="mono mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.1em] text-[#9B9A93] dark:text-[#6E6E6E]">
                    <span>{cert.issuer}</span>
                    <span>{cert.date}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#EC4899]">
                    View certificate <FiArrowUpRight size={14} />
                  </span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
};

export default Acheivements;
