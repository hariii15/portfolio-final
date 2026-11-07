import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sendContact } from '../../lib/sendContact';
import {
  FiArrowLeft,
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCamera,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiGrid,
  FiHeart,
  FiMail,
  FiMenu,
  FiMinus,
  FiPlus,
  FiSend,
  FiSearch,
  FiShoppingBag,
  FiUsers,
  FiX,
  FiZap,
} from 'react-icons/fi';
import './business.css';

const demos = [
  {
    number: '01',
    title: 'Ember & Oak',
    type: 'Appointment booking',
    description: 'A welcoming service site that turns browsing into a confirmed appointment in under a minute.',
    path: '/business/ember-oak',
    className: 'biz-work-card--ember',
    meta: 'Salon / Studio',
    bestFor: 'Salons, barbers, spas, trainers and other appointment-based businesses.',
    features: ['Show services and prices', 'Let customers choose a date and time', 'Confirm bookings online'],
  },
  {
    number: '02',
    title: 'Lumina Care',
    type: 'Healthcare booking',
    description: 'A calm, trustworthy appointment experience that makes choosing care feel straightforward.',
    path: '/business/lumina-care',
    className: 'biz-work-card--lumina',
    meta: 'Clinic / Wellness',
    bestFor: 'Clinics, dentists, therapists, wellness centres and consultants.',
    features: ['Introduce the care team', 'Show available appointments', 'Collect booking details safely'],
  },
  {
    number: '03',
    title: 'Northline',
    type: 'Business intelligence',
    description: 'One operational view for revenue, customers, channel performance, and decisions that need attention.',
    path: '/business/northline',
    className: 'biz-work-card--northline',
    meta: 'Analytics / Operations',
    bestFor: 'Owners who want to understand sales, customers and daily business performance.',
    features: ['See important numbers together', 'Compare sales and customer growth', 'Find what needs attention'],
  },
  {
    number: '04',
    title: 'Sora Table',
    type: 'Restaurant presence',
    description: 'A story-rich dining website that balances atmosphere, menu discovery, and reservation intent.',
    path: '/business/sora-table',
    className: 'biz-work-card--sora',
    meta: 'Restaurant / Hospitality',
    bestFor: 'Restaurants, cafés, cloud kitchens, caterers and small hospitality businesses.',
    features: ['Show the menu and atmosphere', 'Share opening hours and location', 'Accept table reservations'],
  },
  {
    number: '05',
    title: 'Fieldnote',
    type: 'Curated storefront',
    description: 'A considered commerce experience for a small maker, with products given room to feel valuable.',
    path: '/business/fieldnote',
    className: 'biz-work-card--fieldnote',
    meta: 'Retail / E-commerce',
    bestFor: 'Local makers, home businesses, gift shops and small product brands.',
    features: ['Display products clearly', 'Filter and explore collections', 'Add products to an order'],
  },
  {
    number: '06',
    title: 'Asterline',
    type: 'Fashion ordering',
    description: 'An editorial clothing store with collection discovery, size selection, and a focused ordering flow.',
    path: '/business/asterline',
    className: 'biz-work-card--asterline',
    meta: 'Fashion / Direct-to-consumer',
    bestFor: 'Clothing brands, boutiques, tailors and made-to-order fashion businesses.',
    features: ['Show clothing with real photos', 'Choose size and quantity', 'Review an order before checkout'],
  },
  {
    number: '07',
    title: 'Meher House',
    type: 'Bridal services',
    description: 'A warm, image-led website that helps brides explore makeup, photography and complete wedding packages.',
    path: '/business/meher-house',
    className: 'biz-work-card--meher',
    meta: 'Bridal / Creative services',
    bestFor: 'Makeup artists, wedding photographers, planners, decorators and bridal studios.',
    features: ['Show real work and packages', 'Explain what each service includes', 'Collect wedding date enquiries'],
  },
];

const DemoBadge = ({ dark = false }) => (
  <span className={`demo-badge${dark ? ' demo-badge--dark' : ''}`}>Concept demo by Hari</span>
);

const DemoBack = ({ light = false }) => (
  <Link className={`demo-back${light ? ' demo-back--light' : ''}`} to="/business">
    <FiArrowLeft /> Business portfolio
  </Link>
);

export const BusinessHub = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollToSection = (id) => (event) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
  };

  return (
    <main className="biz-hub">
      <header className="biz-nav biz-shell">
        <Link className="biz-brand" to="/">
          <span>H</span>
          <span className="biz-brand-copy">Hari</span>
        </Link>
        <button className="biz-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
        <nav className={menuOpen ? 'is-open' : ''}>
          <a href="#work" onClick={scrollToSection('work')}>Examples</a>
          <a href="#capabilities" onClick={scrollToSection('capabilities')}>Services</a>
          <a href="#process" onClick={scrollToSection('process')}>How we work</a>
          <Link className="biz-nav-cta" to="/business/contact">Start a project <FiArrowUpRight /></Link>
        </nav>
      </header>

      <section className="biz-hero biz-shell">
        <div className="biz-hero-copy">
          <p className="biz-kicker"><span /> For business owners ready to grow</p>
          <h1>Turn more visitors into <em>customers.</em></h1>
          <p className="biz-hero-intro">
            Your website should do more than look good. It should help people understand your business, trust you,
            book a service or place an order—and save you time while doing it.
          </p>
          <p className="biz-hero-note">I build the website and the tools behind it. You stay involved, see the progress and approve every important step.</p>
          <div className="biz-hero-actions">
            <a href="#work" onClick={scrollToSection('work')} className="biz-button biz-button--dark">See what I can build <FiArrowRight /></a>
            <Link to="/business/contact" className="biz-text-link">Talk about your business <FiArrowUpRight /></Link>
          </div>
        </div>
        <div className="biz-hero-composition" aria-label="A preview of business products">
          <div className="biz-orbit biz-orbit--one" />
          <div className="biz-orbit biz-orbit--two" />
          <div className="biz-mini biz-mini--booking">
            <div className="biz-mini-top"><span>Today’s schedule</span><FiCalendar /></div>
            <strong>8 appointments</strong>
            <div className="biz-mini-slots"><i /><i /><i /><i /></div>
          </div>
          <div className="biz-mini biz-mini--chart">
            <div className="biz-mini-top"><span>Monthly revenue</span><FiBarChart2 /></div>
            <strong>₹4.82L <small>+12.4%</small></strong>
            <svg viewBox="0 0 240 70" role="img" aria-label="Rising revenue chart">
              <path d="M4 60 C30 52, 38 62, 61 45 S92 43, 112 28 S153 39, 174 20 S209 26, 236 6" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>
          <div className="biz-mini biz-mini--store">
            <span className="biz-product-shape" />
            <div><small>New order</small><strong>Handmade carafe</strong><span>₹2,800</span></div>
          </div>
          <div className="biz-float-label">built to be useful<br /><span>not just impressive</span></div>
        </div>
      </section>

      <section className="biz-outcomes">
        <div className="biz-shell">
          <article><span>01</span><div><strong>Help customers find and trust you</strong><p>A clear, professional website that explains what you do.</p></div></article>
          <article><span>02</span><div><strong>Make booking or buying simple</strong><p>Fewer calls and messages just to confirm basic details.</p></div></article>
          <article><span>03</span><div><strong>Keep your daily work organised</strong><p>Bookings, orders and business numbers in the right place.</p></div></article>
        </div>
      </section>

      <section className="biz-simple biz-shell">
        <div>
          <p className="biz-kicker"><span /> You stay involved</p>
          <h2>You know your business.<br />I handle the technology.</h2>
        </div>
        <div className="biz-simple-points">
          <article><span>01</span><div><h3>Explain it in your own words</h3><p>Tell me what your business does, what is difficult today, and what you want customers to do. No technical words are needed.</p></div></article>
          <article><span>02</span><div><h3>See the design before it is finished</h3><p>I show you the pages and important steps early. You can ask for changes while the website is still being shaped.</p></div></article>
          <article><span>03</span><div><h3>Review every important stage</h3><p>You will see regular progress, try the working website, and approve the important decisions before launch.</p></div></article>
        </div>
      </section>

      <section className="biz-work biz-shell" id="work">
        <div className="biz-section-heading">
          <div><p className="biz-kicker"><span /> Examples for different businesses</p><h2>Find an example<br />close to your needs.</h2></div>
          <p>Each example below is a complete sample website. Open one to understand what it does and how a similar website could help your business.</p>
        </div>
        <div className="biz-work-grid">
          {demos.map((demo) => (
            <Link to={demo.path} className={`biz-work-card ${demo.className}`} key={demo.path}>
              <div className="biz-work-meta"><span>{demo.number}</span><span>{demo.meta}</span></div>
              <div className="biz-work-visual" aria-hidden="true">
                {demo.number === '01' && <><span className="ember-portrait" /><span className="ember-book">BOOK<br />A SEAT</span></>}
                {demo.number === '02' && <><span className="lumina-circle"><FiPlus /></span><span className="lumina-line" /></>}
                {demo.number === '03' && <><span className="northline-bars"><i /><i /><i /><i /><i /><i /></span><span className="northline-dot" /></>}
                {demo.number === '04' && <><span className="sora-sun" /><span className="sora-type">空</span></>}
                {demo.number === '05' && <><span className="fieldnote-vase" /><span className="fieldnote-rule" /></>}
                {demo.number === '06' && <><span className="asterline-preview" /><span className="asterline-word">NEW / 06</span></>}
                {demo.number === '07' && <><span className="meher-preview" /><span className="meher-monogram">M</span></>}
              </div>
              <div className="biz-work-copy">
                <div>
                  <span>{demo.type}</span><h3>{demo.title}</h3><p>{demo.description}</p>
                  <p className="biz-work-for"><strong>Good for:</strong> {demo.bestFor}</p>
                  <ul>{demo.features.map((feature) => <li key={feature}><FiCheck />{feature}</li>)}</ul>
                  <small className="biz-open-demo">Open this example to try it</small>
                </div>
                <span className="biz-round-arrow"><FiArrowUpRight /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="biz-capabilities" id="capabilities">
        <div className="biz-shell">
          <div className="biz-cap-intro">
            <p className="biz-kicker biz-kicker--light"><span /> Services I can provide</p>
            <h2>Choose what your<br />business needs.</h2>
            <p>You can start with one simple website or build a larger system over time. I will explain the options and help you choose only what is useful.</p>
          </div>
          <div className="biz-cap-list">
            {[
              ['01', 'A professional business website', 'Clearly explain your business, show your work or products, and help customers call, message or send an enquiry.'],
              ['02', 'Online booking', 'Let customers choose a service, select an available date and time, and receive a booking confirmation.'],
              ['03', 'Online shop and ordering', 'Show products with photos and prices, let customers choose options, and collect their orders online.'],
              ['04', 'Business dashboard and reports', 'See sales, bookings, customers or stock in one simple screen instead of checking many different places.'],
              ['05', 'Automatic messages and routine work', 'Send confirmations, reminders and updates automatically, so you spend less time doing the same task again and again.'],
            ].map(([number, title, copy]) => (
              <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><FiArrowUpRight /></article>
            ))}
          </div>
        </div>
      </section>

      <section className="biz-process biz-shell" id="process">
        <div className="biz-section-heading">
          <div><p className="biz-kicker"><span /> How we work together</p><h2>A clear process.<br />No technical confusion.</h2></div>
          <p>You stay close to the project from the first conversation to the final launch. Nothing important is decided without showing you first.</p>
        </div>
        <div className="biz-process-steps">
          <article><span>01 / Talk</span><h3>Tell me about your business.</h3><p>We discuss your customers, your current problems, your budget and what you want the website to achieve.</p><strong>Your part: Share your needs.</strong></article>
          <article><span>02 / Plan</span><h3>See a clear plan and design.</h3><p>I show you what pages we need, how they will look, and what customers will be able to do.</p><strong>Your part: Review and suggest changes.</strong></article>
          <article><span>03 / Build</span><h3>Follow the work as it grows.</h3><p>I build the website in small parts and share working updates. You can open it, try it and give feedback.</p><strong>Your part: Test and approve.</strong></article>
          <article><span>04 / Launch</span><h3>Go online with support.</h3><p>I check phones and computers, fix final issues, publish the website and explain how everything works.</p><strong>Your part: Start using it.</strong></article>
        </div>
      </section>

      <section className="biz-closing biz-shell">
        <div>
          <p className="biz-kicker biz-kicker--light"><span /> Not sure what you need?</p>
          <h2>Just tell me about<br /><em>your business.</em></h2>
        </div>
        <div className="biz-closing-action">
          <p>You do not need to prepare a technical document. Tell me what you sell, how customers reach you today, and what you want to improve.</p>
          <Link to="/business/contact">Talk about your idea <FiArrowUpRight /></Link>
        </div>
      </section>

      <footer className="biz-footer biz-shell">
        <span>© {new Date().getFullYear()} Hariharpradeep J</span>
        <span>Designed & built with intent</span>
        <Link to="/">Back to main portfolio <FiArrowUpRight /></Link>
      </footer>
    </main>
  );
};

const salonServices = [
  { name: 'The Signature Cut', time: '60 min', price: '₹1,200' },
  { name: 'Cut & Botanical Care', time: '90 min', price: '₹1,850' },
  { name: 'Colour Consultation', time: '45 min', price: '₹900' },
];

export const EmberOak = () => {
  const [service, setService] = useState(0);
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('11:30');
  const [booked, setBooked] = useState(false);
  const days = [['MON', '18'], ['TUE', '19'], ['WED', '20'], ['THU', '21']];

  return (
    <main className="ember-site">
      <div className="demo-utility"><DemoBack /><DemoBadge /></div>
      <header className="ember-nav">
        <Link to="/business/ember-oak" className="ember-logo">Ember <i>&</i> Oak</Link>
        <nav><a href="#story">Our approach</a><a href="#services">Services</a><a href="#book">Book a seat</a></nav>
        <a href="#book" className="ember-nav-book">Book now <FiArrowUpRight /></a>
      </header>
      <section className="ember-hero">
        <div className="ember-hero-copy">
          <span className="ember-eyebrow">Independent hair studio · Bengaluru</span>
          <h1>Good hair.<br /><em>No theatre.</em></h1>
          <p>Considered cuts, honest advice, and a chair that never feels rushed.</p>
          <a href="#book">Find your appointment <FiArrowRight /></a>
        </div>
        <div className="ember-hero-art"><span className="ember-arch" /><span className="ember-face-line">e&o</span><p>Quiet craft<br />since 2019</p></div>
        <div className="ember-vertical">CUT · CARE · COLOUR</div>
      </section>
      <section className="ember-story" id="story">
        <p>Our philosophy</p>
        <h2>A cut should live well<br />after you leave the chair.</h2>
        <div><span>We start by listening.</span><p>No rushed consultations and no hard sell. Just thoughtful work built around your texture, routine, and the way you want to feel.</p></div>
      </section>
      <section className="ember-services" id="services">
        <div><span className="ember-eyebrow">The menu</span><h2>Simple services.<br />Done properly.</h2></div>
        <div className="ember-service-list">
          {salonServices.map((item, index) => <article key={item.name}><span>0{index + 1}</span><h3>{item.name}</h3><p>{item.time}</p><strong>{item.price}</strong></article>)}
        </div>
      </section>
      <section className="ember-booking" id="book">
        <div className="ember-book-intro"><span className="ember-eyebrow">Make time for yourself</span><h2>Book your<br />chair.</h2><p>Choose a service and a time. This demo confirms instantly—no account needed.</p></div>
        <div className="ember-book-card">
          {!booked ? <>
            <div className="ember-step"><span>01</span><div><label>Choose a service</label><div className="ember-select-wrap"><select value={service} onChange={(e) => setService(Number(e.target.value))}>{salonServices.map((item, i) => <option value={i} key={item.name}>{item.name} — {item.price}</option>)}</select><FiChevronDown /></div></div></div>
            <div className="ember-step"><span>02</span><div><label>Choose a day</label><div className="ember-days">{days.map((d, i) => <button className={day === i ? 'active' : ''} onClick={() => setDay(i)} key={d[1]}><small>{d[0]}</small><strong>{d[1]}</strong></button>)}</div></div></div>
            <div className="ember-step"><span>03</span><div><label>Available times</label><div className="ember-times">{['09:30', '11:30', '14:00', '16:30'].map((t) => <button className={time === t ? 'active' : ''} onClick={() => setTime(t)} key={t}>{t}</button>)}</div></div></div>
            <button className="ember-confirm" onClick={() => setBooked(true)}>Confirm appointment <span>{days[day][0]} {days[day][1]} · {time}</span></button>
          </> : <div className="ember-success"><span><FiCheck /></span><p>Appointment reserved</p><h3>See you on {days[day][0].toLowerCase()}, the {days[day][1]}th.</h3><small>{salonServices[service].name} · {time}</small><button onClick={() => setBooked(false)}>Change booking</button></div>}
        </div>
      </section>
      <footer className="ember-footer"><span>Ember & Oak</span><p>Concept website · No real appointment will be created.</p><DemoBack /></footer>
    </main>
  );
};

const doctors = [
  { initials: 'AM', name: 'Dr. Anika Mehra', specialty: 'General dentistry', next: 'Tue, 10:30' },
  { initials: 'RK', name: 'Dr. Rohan Kapoor', specialty: 'Orthodontics', next: 'Wed, 14:00' },
  { initials: 'NS', name: 'Dr. Nila Shah', specialty: 'Dental wellness', next: 'Thu, 09:00' },
];

export const LuminaCare = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className="lumina-site">
      <div className="demo-utility demo-utility--blue"><DemoBack /><DemoBadge /></div>
      <header className="lumina-nav">
        <Link className="lumina-logo" to="/business/lumina-care"><span><FiPlus /></span>Lumina Care</Link>
        <nav><a href="#care">Our care</a><a href="#team">Clinicians</a><a href="#appointment">Appointments</a></nav>
        <a href="#appointment" className="lumina-cta">Book an appointment</a>
      </header>
      <section className="lumina-hero">
        <div className="lumina-hero-copy">
          <span className="lumina-kicker">Modern dental care, thoughtfully delivered</span>
          <h1>A calmer way to<br />care for your smile.</h1>
          <p>Clear advice, gentle treatment, and appointments designed around real life—not waiting rooms.</p>
          <div><a href="#appointment">Find an appointment <FiArrowRight /></a><a href="#care">Explore our care</a></div>
          <small><FiClock /> Most appointments available within 48 hours</small>
        </div>
        <div className="lumina-visual">
          <div className="lumina-photo"><span className="lumina-smile">◡</span></div>
          <div className="lumina-rating"><span>4.9</span><p>Patient experience<br /><i>Illustrative demo data</i></p></div>
          <div className="lumina-open"><i /> Now welcoming new patients</div>
        </div>
      </section>
      <section className="lumina-care" id="care">
        <div className="lumina-section-title"><span>Care, without confusion</span><h2>Everything you need.<br />Nothing you don’t.</h2></div>
        <div className="lumina-care-grid">
          <article><span>01</span><FiHeart /><h3>Everyday care</h3><p>Check-ups, hygiene, and prevention that fits comfortably into your routine.</p></article>
          <article><span>02</span><FiZap /><h3>Urgent visits</h3><p>Fast assessment and clear next steps when something does not feel right.</p></article>
          <article><span>03</span><FiGrid /><h3>Smile planning</h3><p>Orthodontics and cosmetic care with a plan you can see and understand.</p></article>
        </div>
      </section>
      <section className="lumina-team" id="team">
        <div className="lumina-section-title"><span>Meet your care team</span><h2>Skilled clinicians.<br />Human conversations.</h2></div>
        <div className="lumina-team-list">{doctors.map((doctor) => <article key={doctor.name}><div>{doctor.initials}</div><h3>{doctor.name}</h3><p>{doctor.specialty}</p><span>Next: {doctor.next}</span></article>)}</div>
      </section>
      <section className="lumina-appointment" id="appointment">
        <div className="lumina-appointment-copy"><span>Book online</span><h2>Choose the care<br />that works for you.</h2><p>Select a clinician to preview the next appointment. In a real build, this connects to live availability and confirmations.</p></div>
        <div className="lumina-appointment-card">
          {!confirmed ? <>
            <label>1. Select a clinician</label>
            <div className="lumina-doctor-options">{doctors.map((doctor, index) => <button className={selectedDoctor === index ? 'active' : ''} onClick={() => setSelectedDoctor(index)} key={doctor.name}><span>{doctor.initials}</span><div><strong>{doctor.name}</strong><small>{doctor.specialty}</small></div><i /></button>)}</div>
            <label>2. Next available appointment</label>
            <div className="lumina-slot"><FiCalendar /><div><strong>{doctors[selectedDoctor].next}</strong><small>New patient consultation · 45 min</small></div><FiCheck /></div>
            <button className="lumina-confirm" onClick={() => setConfirmed(true)}>Reserve this time <FiArrowRight /></button>
          </> : <div className="lumina-success"><span><FiCheck /></span><h3>Your visit is reserved.</h3><p>{doctors[selectedDoctor].name}<br />{doctors[selectedDoctor].next}</p><small>This is a portfolio demo—no appointment was created.</small><button onClick={() => setConfirmed(false)}>Choose another time</button></div>}
        </div>
      </section>
      <footer className="lumina-footer"><span className="lumina-logo"><i><FiPlus /></i>Lumina Care</span><p>Concept clinic website for portfolio demonstration.</p><DemoBack /></footer>
    </main>
  );
};

const channelRows = [
  ['Direct', '18,430', '3.8%', '₹12.4L', '+14.2%'],
  ['Organic search', '14,820', '4.6%', '₹10.8L', '+8.7%'],
  ['Paid social', '9,240', '2.9%', '₹6.1L', '-2.3%'],
  ['Partners', '4,810', '6.2%', '₹5.7L', '+21.4%'],
];

export const NorthlineDashboard = () => {
  const [range, setRange] = useState('30 days');
  const multipliers = { '7 days': .28, '30 days': 1, 'Quarter': 2.75 };
  const multiplier = multipliers[range];
  const currency = (n) => `₹${(n * multiplier).toFixed(1)}L`;

  return (
    <main className="north-site">
      <aside className="north-sidebar">
        <div className="north-logo"><span>N</span><strong>Northline</strong></div>
        <nav>
          <button className="active"><FiGrid />Overview</button><button><FiBarChart2 />Performance</button><button><FiUsers />Customers</button><button><FiZap />Automations</button>
        </nav>
        <div className="north-side-bottom"><span>HJ</span><div><strong>Hari J.</strong><small>Administrator</small></div></div>
      </aside>
      <div className="north-main">
        <div className="north-demo-bar"><DemoBack light /><DemoBadge dark /></div>
        <header className="north-header"><div><span>Workspace / Overview</span><h1>Good morning, Hari.</h1></div><div><button><FiSearch /></button><button className="north-date"><FiCalendar /> Nov 01 — Nov 30</button></div></header>
        <section className="north-toolbar"><div><span className="north-live"><i /> Live data</span><p>Last synced 2 minutes ago</p></div><div className="north-range">{Object.keys(multipliers).map((item) => <button className={range === item ? 'active' : ''} onClick={() => setRange(item)} key={item}>{item}</button>)}</div></section>
        <section className="north-metrics">
          <article><div><span>Net revenue</span><small>↗ 12.4%</small></div><strong>{currency(35.2)}</strong><p>vs. previous period</p></article>
          <article><div><span>New customers</span><small>↗ 8.1%</small></div><strong>{Math.round(1284 * multiplier).toLocaleString()}</strong><p>68% first-time buyers</p></article>
          <article><div><span>Conversion rate</span><small>↗ 0.6%</small></div><strong>4.18%</strong><p>Across all channels</p></article>
          <article><div><span>Avg. order value</span><small className="flat">→ 0.2%</small></div><strong>₹2,742</strong><p>Target ₹2,800</p></article>
        </section>
        <section className="north-panels">
          <article className="north-revenue-panel">
            <div className="north-panel-head"><div><span>Revenue performance</span><strong>{currency(35.2)}</strong></div><p><i />Revenue <i />Target</p></div>
            <div className="north-chart"><div className="north-y"><span>12L</span><span>8L</span><span>4L</span><span>0</span></div><div className="north-chart-area"><span className="gridline g1"/><span className="gridline g2"/><span className="gridline g3"/><svg viewBox="0 0 700 210" preserveAspectRatio="none"><defs><linearGradient id="northFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C8FF45" stopOpacity=".28"/><stop offset="1" stopColor="#C8FF45" stopOpacity="0"/></linearGradient></defs><path d="M0 190 C55 178 80 145 130 152 S210 120 260 134 S345 90 390 106 S475 55 520 75 S610 32 700 20 L700 210 L0 210Z" fill="url(#northFill)"/><path d="M0 190 C55 178 80 145 130 152 S210 120 260 134 S345 90 390 106 S475 55 520 75 S610 32 700 20" fill="none" stroke="#C8FF45" strokeWidth="3"/><path d="M0 165 C100 145 180 150 270 115 S440 100 520 60 S620 52 700 44" fill="none" stroke="#53605c" strokeDasharray="7 7" strokeWidth="2"/></svg><div className="north-x"><span>Nov 01</span><span>Nov 08</span><span>Nov 15</span><span>Nov 22</span><span>Nov 30</span></div></div></div>
          </article>
          <article className="north-goal-panel"><div className="north-panel-head"><span>Monthly target</span><FiArrowUpRight /></div><div className="north-goal"><span>78<small>%</small></span><div className="north-goal-ring" /></div><strong>{currency(35.2)} <small>of {currency(45.0)}</small></strong><p>At the current pace, you are projected to reach 96% of target.</p></article>
        </section>
        <section className="north-table-panel"><div className="north-panel-head"><div><span>Channel performance</span><p>Where revenue is coming from</p></div><button>View report <FiArrowUpRight /></button></div><div className="north-table"><div className="north-tr north-th"><span>Channel</span><span>Visitors</span><span>Conversion</span><span>Revenue</span><span>Change</span></div>{channelRows.map((row) => <div className="north-tr" key={row[0]}>{row.map((cell, i) => <span className={i === 4 && cell.startsWith('-') ? 'negative' : ''} key={cell}>{cell}</span>)}</div>)}</div></section>
        <p className="north-disclaimer">Illustrative portfolio dashboard · Values are sample data</p>
      </div>
    </main>
  );
};

export const SoraTable = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="sora-site">
      <div className="demo-utility demo-utility--sora"><DemoBack light /><DemoBadge dark /></div>
      <header className="sora-nav"><Link to="/business/sora-table" className="sora-logo">SORA<span>空</span></Link><nav><a href="#story">Story</a><a href="#menu">Menu</a><a href="#visit">Visit</a></nav><a href="#visit">Reserve a table</a></header>
      <section className="sora-hero">
        <div className="sora-hero-text"><span>Seasonal Japanese dining · Bengaluru</span><h1>Quiet food.<br /><em>Bold memory.</em></h1><p>A neighbourhood table shaped by the seasons, charcoal, and the patience to let ingredients speak.</p><a href="#menu">Discover the menu <FiArrowRight /></a></div>
        <div className="sora-hero-art"><div className="sora-plate"><span /><i /></div><p>秋<br /><span>autumn menu</span></p></div>
        <div className="sora-side-note">DINNER · TUE—SUN · 6PM—11PM</div>
      </section>
      <section className="sora-marquee"><span>Seasonal produce</span><i>✦</i><span>Open charcoal</span><i>✦</i><span>Local growers</span><i>✦</i><span>Small room</span></section>
      <section className="sora-story" id="story"><div className="sora-story-mark">空</div><div><span>Our table</span><h2>There are only<br />twenty-four seats.</h2></div><p>Enough for warmth. Few enough for attention. Sora is an intimate dining room where Japanese technique meets produce grown close to home.</p></section>
      <section className="sora-menu" id="menu"><div className="sora-menu-head"><span>This season</span><h2>From our evening menu</h2><button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Show less' : 'View full menu'} <FiPlus /></button></div><div className="sora-menu-list">
        {[['01','Hokkaido milk bread','miso butter · smoked salt','380'],['02','Charred aubergine','sesame · shiso · black garlic','720'],['03','Market fish','yuzu kosho · daikon · burnt leek','1,480'],['04','Koji duck','plum · turnip · sansho','1,850'], ...(menuOpen ? [['05','Miso caramel','barley · pear · brown butter','620'],['06','Tea service','seasonal wagashi','480']] : [])].map((item) => <article key={item[0]}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><strong>₹{item[3]}</strong></article>)}
      </div></section>
      <section className="sora-visit" id="visit"><div><span>Come for dinner</span><h2>Save your seat.</h2><p>Reservations open 30 days ahead. For groups larger than six, write to us directly.</p></div><div className="sora-reserve-card"><label>Choose an evening</label><div><button><span>THU</span><strong>21</strong></button><button className="active"><span>FRI</span><strong>22</strong></button><button><span>SAT</span><strong>23</strong></button></div><label>Available tables</label><select><option>2 guests · 7:30 PM</option><option>2 guests · 9:15 PM</option><option>4 guests · 8:00 PM</option></select><button className="sora-reserve">Continue reservation <FiArrowRight /></button><small>Concept demo—no reservation is created.</small></div></section>
      <footer className="sora-footer"><span className="sora-logo">SORA<i>空</i></span><p>Concept restaurant website · Bengaluru</p><DemoBack light /></footer>
    </main>
  );
};

const products = [
  { name: 'Riverstone carafe', category: 'Tableware', price: 2800, className: 'field-product--carafe' },
  { name: 'Low serving bowl', category: 'Tableware', price: 1900, className: 'field-product--bowl' },
  { name: 'Morning cup', category: 'Drinkware', price: 980, className: 'field-product--cup' },
  { name: 'Palm oil lamp', category: 'Objects', price: 2400, className: 'field-product--lamp' },
];

export const FieldnoteStore = () => {
  const [cart, setCart] = useState(0);
  const [filter, setFilter] = useState('All pieces');
  const filtered = useMemo(() => filter === 'All pieces' ? products : products.filter((p) => p.category === filter), [filter]);

  return (
    <main className="field-site">
      <div className="demo-utility demo-utility--field"><DemoBack /><DemoBadge /></div>
      <header className="field-nav"><button><FiMenu /></button><Link className="field-logo" to="/business/fieldnote">FIELDNOTE<small>objects for unhurried homes</small></Link><button className="field-bag"><FiShoppingBag /><span>{cart}</span></button></header>
      <section className="field-hero"><div className="field-hero-copy"><span>Collection 04 / Earth & water</span><h1>Made slowly.<br /><em>Kept for years.</em></h1><p>Functional ceramics shaped by hand in small batches, for the rituals that make a home yours.</p><a href="#shop">Shop the collection <FiArrowRight /></a></div><div className="field-hero-object"><span className="field-vessel"/><i>Each form carries<br />the mark of its maker.</i></div><div className="field-edition">04<small>/ 24</small></div></section>
      <section className="field-manifesto"><span>Our approach</span><p>We make fewer things, <em>more carefully.</em> Every object begins with local clay and ends in the hands of one maker.</p><div><span>Hand thrown</span><span>Small batch</span><span>Natural materials</span></div></section>
      <section className="field-shop" id="shop"><div className="field-shop-head"><div><span>The current collection</span><h2>Objects with a quiet presence.</h2></div><div>{['All pieces','Tableware','Drinkware','Objects'].map((item) => <button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div><div className="field-products">{filtered.map((product) => <article key={product.name}><div className={`field-product-art ${product.className}`}><span/><button onClick={() => setCart(cart + 1)} aria-label={`Add ${product.name} to bag`}><FiPlus /></button></div><div><span>{product.category}</span><h3>{product.name}</h3><p>₹{product.price.toLocaleString('en-IN')}</p></div></article>)}</div></section>
      <section className="field-note"><span>Studio notes · 07</span><h2>The beauty of<br />useful things.</h2><p>Good objects do not ask for attention. They earn affection slowly—through morning tea, shared meals, and the small repetitions of a life.</p><a href="#shop">Read the studio journal <FiArrowUpRight /></a></section>
      <footer className="field-footer"><div className="field-logo">FIELDNOTE<small>objects for unhurried homes</small></div><p>Concept storefront · Products and checkout are illustrative.</p><DemoBack /></footer>
      {cart > 0 && <div className="field-cart-toast"><FiCheck /><span>{cart} {cart === 1 ? 'piece' : 'pieces'} in your bag</span><button onClick={() => setCart(0)}><FiX /></button></div>}
    </main>
  );
};

const apparelProducts = [
  { name: 'Form overshirt', category: 'New', price: 3490, image: 'https://images.unsplash.com/photo-1776838103951-993ff1ffc916?auto=format&fit=crop&q=82&w=1200', position: 'center' },
  { name: 'Archive shirt', category: 'Shirts', price: 2890, image: 'https://images.unsplash.com/photo-1602185335134-2d072c07703c?auto=format&fit=crop&q=82&w=1200', position: 'center' },
  { name: 'Shift leather jacket', category: 'Outerwear', price: 8490, image: 'https://images.unsplash.com/photo-1768745545869-f21c69e5b8e9?auto=format&fit=crop&q=82&w=1200', position: 'center 28%' },
  { name: 'Everyday layer', category: 'Essentials', price: 2490, image: 'https://images.unsplash.com/photo-1622445275992-e7efb32d2257?auto=format&fit=crop&q=82&w=1200', position: 'center' },
];

export const AsterlineStore = () => {
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [bag, setBag] = useState([]);
  const categories = ['All', 'New', 'Shirts', 'Outerwear', 'Essentials'];
  const shownProducts = category === 'All' ? apparelProducts : apparelProducts.filter((item) => item.category === category);
  const bagCount = bag.reduce((total, item) => total + item.quantity, 0);

  const openProduct = (product) => {
    setSelected(product);
    setSize('M');
    setQuantity(1);
  };

  const addToBag = () => {
    setBag([...bag, { ...selected, size, quantity }]);
    setSelected(null);
  };

  return (
    <main className="aster-site">
      <div className="demo-utility demo-utility--aster"><DemoBack light /><DemoBadge dark /></div>
      <header className="aster-nav">
        <button className="aster-menu" aria-label="Open menu"><FiMenu /></button>
        <Link className="aster-logo" to="/business/asterline">ASTERLINE<span>Designed for repeat wear</span></Link>
        <nav><a href="#collection">New arrival</a><a href="#collection">Shop</a><a href="#story">Our standard</a></nav>
        <button className="aster-bag" onClick={() => bagCount && document.getElementById('aster-order')?.scrollIntoView({ behavior: 'smooth' })}>Bag <span>{String(bagCount).padStart(2, '0')}</span></button>
      </header>

      <section className="aster-hero">
        <div className="aster-hero-image"><img src="https://images.unsplash.com/photo-1768825136230-34fb80291f19?auto=format&fit=crop&q=85&w=1800" alt="Fashion editorial on a city street" /><span>01 / 06</span></div>
        <div className="aster-hero-copy"><span className="aster-label">Autumn / Winter 26</span><h1>Wear it<br /><em>your way.</em></h1><p>Purposeful layers. Relaxed structure. Clothes built to become part of your week, not just your wardrobe.</p><a href="#collection">Explore the collection <FiArrowDown /></a></div>
        <div className="aster-hero-note">Bengaluru · India<br />Worldwide outlook</div>
      </section>

      <section className="aster-ticker" aria-label="Brand principles"><span>Free alterations</span><i>+</i><span>Natural fibres</span><i>+</i><span>Small runs</span><i>+</i><span>Easy exchanges</span><i>+</i><span>Made to be worn</span></section>

      <section className="aster-collection" id="collection">
        <div className="aster-collection-head"><div><span className="aster-label">Collection 06</span><h2>Clothes for the<br />life you already have.</h2></div><p>Considered essentials, edited down. Select a piece to choose your size and preview the ordering experience.</p></div>
        <div className="aster-filters">{categories.map((item) => <button className={category === item ? 'active' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
        <div className="aster-products">{shownProducts.map((product, index) => <article key={product.name} onClick={() => openProduct(product)}><div className="aster-product-image"><img src={product.image} style={{ objectPosition: product.position }} alt={product.name} /><span>{String(index + 1).padStart(2, '0')}</span><button aria-label={`Choose ${product.name}`}><FiPlus /></button></div><div className="aster-product-copy"><div><small>{product.category}</small><h3>{product.name}</h3></div><strong>₹{product.price.toLocaleString('en-IN')}</strong></div></article>)}</div>
      </section>

      <section className="aster-story" id="story"><div className="aster-story-image"><img src="https://images.unsplash.com/photo-1744135995163-5096abf1841c?auto=format&fit=crop&q=82&w=1400" alt="A considered clothing rail" /></div><div className="aster-story-copy"><span className="aster-label">Our standard</span><h2>Less noise.<br />Better clothes.</h2><p>We design around repeat wear: useful pockets, forgiving shapes, tactile materials, and colours that work together without trying.</p><div><span>01</span><p>Limited collections instead of constant drops.</p></div><div><span>02</span><p>Clear fabric, fit, and care information.</p></div><div><span>03</span><p>Alterations that keep good clothing in use.</p></div></div></section>

      <section className="aster-order" id="aster-order">
        <div><span className="aster-label">Your selection</span><h2>{bagCount ? `${bagCount} ${bagCount === 1 ? 'piece' : 'pieces'}, ready.` : 'Your bag is waiting.'}</h2></div>
        {bagCount ? <div className="aster-order-list">{bag.map((item, index) => <article key={`${item.name}-${index}`}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>Size {item.size} · Qty {item.quantity}</span></div><p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p></article>)}<div className="aster-total"><span>Total</span><strong>₹{bag.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('en-IN')}</strong></div><button onClick={() => setBag([])}>Preview checkout <FiArrowRight /></button><small>Portfolio demonstration only—no payment or order is created.</small></div> : <p className="aster-empty">Choose a piece from the collection to preview size selection and ordering.</p>}
      </section>

      <footer className="aster-footer"><div className="aster-logo">ASTERLINE<span>Designed for repeat wear</span></div><p>Concept fashion store · Images courtesy of Unsplash</p><DemoBack light /></footer>

      {selected && <div className="aster-modal" role="dialog" aria-modal="true" aria-label={`Order ${selected.name}`}><button className="aster-modal-close" onClick={() => setSelected(null)} aria-label="Close"><FiX /></button><div className="aster-modal-image"><img src={selected.image} style={{ objectPosition: selected.position }} alt={selected.name} /></div><div className="aster-modal-content"><span className="aster-label">{selected.category} / Collection 06</span><h2>{selected.name}</h2><strong>₹{selected.price.toLocaleString('en-IN')}</strong><p>A relaxed, easy layer with considered proportions. Cut for movement and designed for frequent wear.</p><label>Select size</label><div className="aster-sizes">{['XS','S','M','L','XL'].map((item) => <button className={size === item ? 'active' : ''} onClick={() => setSize(item)} key={item}>{item}</button>)}</div><div className="aster-fit-note"><span>Fit note</span><p>Relaxed fit. Choose your usual size or size down for a closer shape.</p></div><div className="aster-add-row"><div><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><FiPlus /></button></div><button onClick={addToBag}>Add to bag · ₹{(selected.price * quantity).toLocaleString('en-IN')}</button></div></div></div>}
    </main>
  );
};

export const BusinessContact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', business: '', help: '', budget: '', message: '', website: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const updateField = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendContact(formData);
      setStatus('sent');
    } catch {
      setStatus('idle');
      setError('The form could not send right now. You can email me directly instead.');
    }
  };

  return (
    <main className="biz-contact-page">
      <header className="biz-contact-nav biz-shell"><Link className="biz-brand" to="/business"><span>H</span><span>Hari</span></Link><Link to="/business"><FiArrowLeft /> Back to business portfolio</Link></header>
      <section className="biz-contact-hero biz-shell">
        <div className="biz-contact-intro">
          <p className="biz-kicker"><span /> Start with a simple conversation</p>
          <h1>Tell me about<br /><em>your business.</em></h1>
          <p>You do not need to know the right technical words. Explain what you do, what is difficult today and what you would like to improve. I will help turn that into a clear plan.</p>
          <div className="biz-contact-details"><article><FiMail /><div><span>Email</span><a href="mailto:hariharpradeepjaybal@gmail.com">hariharpradeepjaybal@gmail.com</a></div></article><article><FiClock /><div><span>What happens next?</span><p>I will read your message and reply with useful questions and a suggested next step.</p></div></article></div>
        </div>
        <div className="biz-contact-form-wrap">
          {status === 'sent' ? <div className="biz-contact-success" role="status"><span><FiCheck /></span><p>Message sent</p><h2>Thank you for telling me about your business.</h2><small>I will review the details and get back to you soon.</small><Link to="/business">Explore the examples <FiArrowRight /></Link></div> : <form onSubmit={handleSubmit} className="biz-contact-form">
            <div className="biz-contact-form-head"><span>Project enquiry</span><p>Fields marked * are required.</p></div>
            <input className="biz-contact-honey" tabIndex="-1" autoComplete="off" aria-hidden="true" name="website" value={formData.website} onChange={updateField} />
            <div className="biz-contact-row"><label>Your name *<input required name="name" value={formData.name} onChange={updateField} placeholder="How should I address you?" /></label><label>Email address *<input required type="email" name="email" value={formData.email} onChange={updateField} placeholder="you@example.com" /></label></div>
            <div className="biz-contact-row"><label>Phone number<input name="phone" value={formData.phone} onChange={updateField} placeholder="Optional" /></label><label>Business name<input name="business" value={formData.business} onChange={updateField} placeholder="Your shop, studio or company" /></label></div>
            <label>What would you like help with? *<select required name="help" value={formData.help} onChange={updateField}><option value="">Choose one</option><option>New business website</option><option>Online booking system</option><option>Online store or ordering</option><option>Dashboard or internal tool</option><option>Improve an existing website</option><option>I am not sure yet</option></select></label>
            <label>Approximate budget<select name="budget" value={formData.budget} onChange={updateField}><option value="">Choose if you know</option><option>Below ₹25,000</option><option>₹25,000 – ₹50,000</option><option>₹50,000 – ₹1,00,000</option><option>Above ₹1,00,000</option><option>I need guidance</option></select></label>
            <label>Tell me about your business and the problem you want to solve *<textarea required rows="6" name="message" value={formData.message} onChange={updateField} placeholder="For example: I run a salon. Customers currently book through WhatsApp and it is difficult to track available times..." /></label>
            {error && <p className="biz-contact-error">{error} <a href="mailto:hariharpradeepjaybal@gmail.com">Send an email</a></p>}
            <button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : <>Send project enquiry <FiSend /></>}</button>
            <small>By sending this form, you are only starting a conversation. There is no payment or commitment.</small>
          </form>}
        </div>
      </section>
      <footer className="biz-contact-footer biz-shell"><span>© {new Date().getFullYear()} Hariharpradeep J</span><p>Clear communication. Practical websites. No unnecessary complexity.</p></footer>
    </main>
  );
};

const bridalServices = [
  { number: '01', title: 'Bridal makeup', copy: 'A complete wedding-day look, planned through a trial and shaped around your skin, outfit and comfort.' },
  { number: '02', title: 'Wedding photography', copy: 'Calm, natural coverage—from getting ready to the final celebration—with an eye for real moments.' },
  { number: '03', title: 'The complete story', copy: 'Makeup, portraits and event coverage organised as one simple experience with one point of contact.' },
];

export const MeherHouse = () => {
  const [enquirySent, setEnquirySent] = useState(false);
  return (
    <main className="meher-site">
      <div className="demo-utility demo-utility--meher"><DemoBack /><DemoBadge /></div>
      <header className="meher-nav"><Link className="meher-logo" to="/business/meher-house">MEHER<small>bridal house</small></Link><nav><a href="#services">Services</a><a href="#stories">Our work</a><a href="#enquire">Enquire</a></nav><a href="#enquire">Check your date <FiArrowDown /></a></header>
      <section className="meher-hero">
        <div className="meher-hero-copy"><span>Bridal makeup & photography · Bengaluru</span><h1>Feel like yourself.<br /><em>Remember it forever.</em></h1><p>Thoughtful bridal beauty and honest wedding photographs, created by one calm team around your day.</p><a href="#services">Explore the experience <FiArrowRight /></a></div>
        <div className="meher-hero-image"><img src="https://images.unsplash.com/photo-1742891602017-40b3a924f476?auto=format&fit=crop&q=85&w=1500" alt="Indian bridal portrait with detailed makeup and jewellery" /><span>Meher bride / 24</span></div>
        <div className="meher-script">made with care</div>
      </section>
      <section className="meher-promise"><p>One team for the way you look<br />and the way your day is remembered.</p><div><span>Makeup trials</span><i>·</i><span>Wedding day beauty</span><i>·</i><span>Photography</span><i>·</i><span>Albums</span></div></section>
      <section className="meher-services" id="services"><div className="meher-section-head"><span>What we do</span><h2>Choose the care<br />your day needs.</h2><p>Every service is explained clearly, with timing, preparation and deliverables agreed before you book.</p></div><div className="meher-service-list">{bridalServices.map((service) => <article key={service.number}><span>{service.number}</span><div><h3>{service.title}</h3><p>{service.copy}</p></div><FiArrowUpRight /></article>)}</div></section>
      <section className="meher-stories" id="stories"><div className="meher-story-grid"><figure className="meher-story-main"><img src="https://images.unsplash.com/photo-1677691256999-45d69a11b197?auto=format&fit=crop&q=85&w=1400" alt="Bride in a red bridal outfit" /><figcaption>The wedding portrait</figcaption></figure><figure><img src="https://images.unsplash.com/photo-1743779622035-c52b3d5267ce?auto=format&fit=crop&q=85&w=1100" alt="Bride having her makeup applied" /><figcaption>The getting ready story</figcaption></figure><figure><img src="https://images.unsplash.com/photo-1758141247290-c603f023942d?auto=format&fit=crop&q=85&w=1100" alt="Bride looking into a decorative mirror" /><figcaption>The quiet moments</figcaption></figure></div><div className="meher-story-copy"><span>Real moments, gently held</span><h2>Your day is not<br />a photo shoot.</h2><p>We guide when you need us and step back when the moment is already perfect. The result feels polished, but never unfamiliar.</p></div></section>
      <section className="meher-packages"><div><span>Simple packages</span><h2>Know what is included<br />before you decide.</h2></div><div className="meher-package-grid"><article><small>Beauty</small><h3>The bridal look</h3><p>Trial · Wedding-day makeup · Hair styling · Saree or veil setting</p><strong>From ₹18,000</strong></article><article className="featured"><small>Complete</small><h3>The full story</h3><p>Bridal beauty · Getting ready · Ceremony · Couple portraits · Edited gallery</p><strong>From ₹65,000</strong></article><article><small>Photography</small><h3>The wedding story</h3><p>8-hour coverage · Two photographers · Edited gallery · Highlight album</p><strong>From ₹48,000</strong></article></div></section>
      <section className="meher-enquire" id="enquire"><div><span>Planning your day?</span><h2>Let’s check<br />your date.</h2><p>Share the basic details. This portfolio demo shows how a bridal business can collect useful enquiries without long phone calls.</p></div>{!enquirySent ? <form onSubmit={(event) => { event.preventDefault(); setEnquirySent(true); }}><label>Your name<input required placeholder="Name" /></label><div><label>Wedding date<input required type="date" /></label><label>Interested in<select required defaultValue=""><option value="" disabled>Choose a service</option><option>Bridal makeup</option><option>Wedding photography</option><option>Complete makeup + photography</option></select></label></div><label>Tell us a little about your celebration<textarea rows="4" placeholder="Venue, event size and anything you would like us to know" /></label><button>Send date enquiry <FiArrowRight /></button><small>Concept demo—no real enquiry is sent.</small></form> : <div className="meher-enquiry-success"><span><FiCheck /></span><h3>Your date enquiry is ready.</h3><p>In a real website, the studio would now receive the wedding details and contact the bride.</p><button onClick={() => setEnquirySent(false)}>Try again</button></div>}</section>
      <footer className="meher-footer"><span className="meher-logo">MEHER<small>bridal house</small></span><p>Concept bridal website · Images courtesy of Unsplash</p><DemoBack /></footer>
    </main>
  );
};

