import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBarChart2,
  FiCalendar,
  FiCheck,
  FiDownload,
  FiGrid,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
  FiZap,
} from "react-icons/fi";
import "./northline.css";

const PERIODS = {
  "7 days": {
    scale: 0.28,
    dates: "Nov 24 – Nov 30",
    labels: [
      "Nov 24",
      "Nov 25",
      "Nov 26",
      "Nov 27",
      "Nov 28",
      "Nov 29",
      "Nov 30",
    ],
    weights: [12, 15, 10, 18, 13, 17, 15],
  },
  "30 days": {
    scale: 1,
    dates: "Nov 01 – Nov 30",
    labels: ["Nov 01–07", "Nov 08–14", "Nov 15–21", "Nov 22–30"],
    weights: [18, 23, 27, 32],
  },
  Quarter: {
    scale: 2.75,
    dates: "Sep 01 – Nov 30",
    labels: ["September", "October", "November"],
    weights: [28, 34, 38],
  },
};
const CHANNELS = [
  {
    name: "Direct",
    visitors: 18430,
    orders: 700,
    revenue: 1240000,
    change: 14.2,
    cost: 0,
  },
  {
    name: "Organic search",
    visitors: 14820,
    orders: 682,
    revenue: 1080000,
    change: 8.7,
    cost: 42000,
  },
  {
    name: "Paid social",
    visitors: 9240,
    orders: 268,
    revenue: 610000,
    change: -2.3,
    cost: 135000,
  },
  {
    name: "Partners",
    visitors: 4810,
    orders: 298,
    revenue: 570000,
    change: 21.4,
    cost: 57000,
  },
];
const CUSTOMERS = [
  [
    "NL-101",
    "Ananya Rao",
    "ananya@example.com",
    "Bengaluru",
    "Returning",
    "Direct",
    12,
    32400,
    "2026-11-30",
  ],
  [
    "NL-102",
    "Arjun Menon",
    "arjun@example.com",
    "Chennai",
    "New",
    "Organic search",
    1,
    2800,
    "2026-11-29",
  ],
  [
    "NL-103",
    "Meera Shah",
    "meera@example.com",
    "Mumbai",
    "VIP",
    "Partners",
    24,
    86400,
    "2026-11-28",
  ],
  [
    "NL-104",
    "Kavin Kumar",
    "kavin@example.com",
    "Coimbatore",
    "Returning",
    "Paid social",
    5,
    14500,
    "2026-11-26",
  ],
  [
    "NL-105",
    "Diya Nair",
    "diya@example.com",
    "Kochi",
    "New",
    "Direct",
    1,
    1950,
    "2026-11-24",
  ],
  [
    "NL-106",
    "Rohan Patel",
    "rohan@example.com",
    "Ahmedabad",
    "Returning",
    "Organic search",
    8,
    21600,
    "2026-11-21",
  ],
  [
    "NL-107",
    "Sara Ali",
    "sara@example.com",
    "Hyderabad",
    "VIP",
    "Direct",
    18,
    64800,
    "2026-11-18",
  ],
  [
    "NL-108",
    "Vikram Das",
    "vikram@example.com",
    "Pune",
    "New",
    "Partners",
    1,
    3200,
    "2026-11-12",
  ],
  [
    "NL-109",
    "Nila Thomas",
    "nila@example.com",
    "Kochi",
    "Returning",
    "Paid social",
    4,
    11200,
    "2026-11-06",
  ],
  [
    "NL-110",
    "Aditya Roy",
    "aditya@example.com",
    "Kolkata",
    "Inactive",
    "Organic search",
    3,
    7650,
    "2026-10-18",
  ],
  [
    "NL-111",
    "Isha Bose",
    "isha@example.com",
    "Delhi",
    "Inactive",
    "Direct",
    6,
    17400,
    "2026-10-03",
  ],
  [
    "NL-112",
    "Dev Prakash",
    "dev@example.com",
    "Coimbatore",
    "Inactive",
    "Partners",
    2,
    5400,
    "2026-09-14",
  ],
].map(
  ([id, name, email, city, segment, channel, orders, spent, lastOrder]) => ({
    id,
    name,
    email,
    city,
    segment,
    channel,
    orders,
    spent,
    lastOrder,
  }),
);
const INITIAL_RULES = [
  {
    id: "daily",
    name: "Daily sales summary",
    description: "Start the day with yesterday’s revenue and order count.",
    trigger: "Every day at 9:00 AM",
    action: "Prepare an email summary",
    enabled: true,
    threshold: 9,
  },
  {
    id: "vip",
    name: "Recognise your best customers",
    description: "Flag customers whose total spend crosses your chosen amount.",
    trigger: "Customer spend exceeds threshold",
    action: "Add to VIP review list",
    enabled: true,
    threshold: 50000,
  },
  {
    id: "return",
    name: "Bring customers back",
    description: "Find customers who have not placed an order recently.",
    trigger: "Days since last order",
    action: "Prepare a follow-up list",
    enabled: false,
    threshold: 30,
  },
];
const TABS = [
  ["Overview", FiGrid],
  ["Performance", FiBarChart2],
  ["Customers", FiUsers],
  ["Automations", FiZap],
];
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
const compactMoney = (value) =>
  value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : money(value);
const count = (value) => value.toLocaleString("en-IN");
const date = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
function csvDownload(name, rows) {
  const cell = (value) =>
    `"${String(value)
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""')}"`;
  const url = URL.createObjectURL(
    new Blob(
      ["\ufeff" + rows.map((row) => row.map(cell).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    ),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Metric({ label, value, detail, change }) {
  return (
    <article>
      <div>
        <span>{label}</span>
        {change && (
          <small className={change.startsWith("-") ? "north-loss" : ""}>
            {change}
          </small>
        )}
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
function Trend({ revenue, period }) {
  const values = period.weights.map((weight) => (revenue * weight) / 100);
  return (
    <article className="north-revenue-panel">
      <div className="north-panel-head">
        <div>
          <span>Revenue over time</span>
          <strong>{compactMoney(revenue)}</strong>
        </div>
        <span>Sample period</span>
      </div>
      <div
        className="north-period-chart"
        role="img"
        aria-label={`Revenue by period: ${period.labels.map((label, i) => `${label}: ${money(values[i])}`).join("; ")}`}
      >
        {values.map((value, i) => (
          <div key={period.labels[i]}>
            <span>{compactMoney(value)}</span>
            <div className="north-bar-track">
              <i
                style={{ height: `${(value / Math.max(...values)) * 100}%` }}
              />
            </div>
            <small>{period.labels[i]}</small>
          </div>
        ))}
      </div>
    </article>
  );
}
function ChannelTable({ rows, onReport, onExport }) {
  return (
    <section className="north-table-panel">
      <div className="north-panel-head">
        <div>
          <span>Channel performance</span>
          <p>Where revenue is coming from</p>
        </div>
        <button onClick={onReport || onExport}>
          {onReport ? "View report" : "Export CSV"}{" "}
          {onReport ? <FiArrowUpRight /> : <FiDownload />}
        </button>
      </div>
      <div className="north-table">
        <table className="north-data-table">
          <thead>
            <tr>
              <th>Channel</th>
              <th>Visitors</th>
              <th>Conversion</th>
              <th>Revenue</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{count(row.visitors)}</td>
                <td>{((row.orders / row.visitors) * 100).toFixed(1)}%</td>
                <td>{compactMoney(row.revenue)}</td>
                <td className={row.change < 0 ? "north-loss" : "north-gain"}>
                  {row.change > 0 ? "+" : ""}
                  {row.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function NorthlineDashboard() {
  const [tab, setTab] = useState("Overview"),
    [range, setRange] = useState("30 days"),
    [channel, setChannel] = useState("All channels");
  const [query, setQuery] = useState(""),
    [segment, setSegment] = useState("All customers"),
    [customerSort, setCustomerSort] = useState("recent"),
    [customer, setCustomer] = useState(null);
  const [rules, setRules] = useState(INITIAL_RULES),
    [configuration, setConfiguration] = useState(null),
    [log, setLog] = useState([]),
    [newRule, setNewRule] = useState(false),
    [notice, setNotice] = useState("");
  const searchRef = useRef(null),
    customerPanel = useRef(null),
    customerOpener = useRef(null),
    searchRequested = useRef(false);
  const period = PERIODS[range];
  const rows = useMemo(
    () =>
      CHANNELS.map((row) => ({
        ...row,
        revenue: Math.round(row.revenue * period.scale),
        orders: Math.round(row.orders * period.scale),
        visitors: Math.round(row.visitors * period.scale),
        cost: Math.round(row.cost * period.scale),
      })),
    [period],
  );
  const performanceRows =
    channel === "All channels"
      ? rows
      : rows.filter((row) => row.name === channel);
  const totals = (source) =>
    source.reduce(
      (result, row) => ({
        revenue: result.revenue + row.revenue,
        orders: result.orders + row.orders,
        visitors: result.visitors + row.visitors,
        cost: result.cost + row.cost,
      }),
      { revenue: 0, orders: 0, visitors: 0, cost: 0 },
    );
  const total = totals(rows),
    performance = totals(performanceRows);
  const customers = CUSTOMERS.filter(
    (c) =>
      (segment === "All customers" || c.segment === segment) &&
      `${c.name} ${c.email} ${c.city} ${c.id}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  ).sort((a, b) =>
    customerSort === "spent"
      ? b.spent - a.spent
      : customerSort === "name"
        ? a.name.localeCompare(b.name)
        : b.lastOrder.localeCompare(a.lastOrder),
  );
  const exportChannels = () =>
    csvDownload(`northline-${range.replaceAll(" ", "-")}-channels.csv`, [
      [
        "Channel",
        "Visitors",
        "Orders",
        "Conversion %",
        "Revenue INR",
        "Change %",
        "Cost INR",
      ],
      ...performanceRows.map((r) => [
        r.name,
        r.visitors,
        r.orders,
        ((r.orders / r.visitors) * 100).toFixed(2),
        r.revenue,
        r.change,
        r.cost,
      ]),
    ]);
  const navigate = (value) => {
    setTab(value);
    setNotice("");
  };
  const search = () => {
    searchRequested.current = true;
    navigate("Customers");
    setTimeout(() => searchRef.current?.focus(), 0);
  };
  const runRule = (rule) => {
    let detail;
    if (
      rule.id === "vip" ||
      rule.trigger === "Customer spend exceeds threshold"
    )
      detail = `${CUSTOMERS.filter((c) => c.spent >= rule.threshold).length} example customers match the ₹${count(rule.threshold)} spend threshold.`;
    else if (rule.id === "return" || rule.trigger === "Days since last order")
      detail = `${CUSTOMERS.filter((c) => (new Date("2026-11-30T12:00:00") - new Date(`${c.lastOrder}T12:00:00`)) / 86400000 >= rule.threshold).length} example customers match the ${rule.threshold}-day follow-up rule.`;
    else
      detail = `Example summary: ${money(Math.round(total.revenue / (range === "7 days" ? 7 : range === "Quarter" ? 91 : 30)))} average daily revenue for this sample period.`;
    setLog((items) =>
      [
        {
          id: crypto.randomUUID(),
          name: rule.name,
          detail,
          time: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...items,
      ].slice(0, 10),
    );
    setNotice(
      `Preview ready for “${rule.name}”. No email was sent and no customer record was changed.`,
    );
  };
  const showCustomer = (c, event) => {
    customerOpener.current = event.currentTarget;
    setCustomer(c);
    setTimeout(() => customerPanel.current?.focus(), 0);
  };
  const closeCustomer = () => {
    setCustomer(null);
    customerOpener.current?.focus();
  };
  const headings = {
    Overview: ["Good morning, Hari.", "A clear picture of your business."],
    Performance: [
      "Know what is working.",
      "Compare channels, revenue, and the cost of growth.",
    ],
    Customers: [
      "People behind the numbers.",
      "A sample customer directory with useful details in one place.",
    ],
    Automations: [
      "Less routine. More focus.",
      "Preview useful rules for everyday business tasks.",
    ],
  };
  return (
    <main className="north-site">
      <aside className="north-sidebar">
        <div className="north-logo">
          <span>N</span>
          <strong>Northline</strong>
        </div>
        <nav aria-label="Dashboard sections">
          {TABS.map(([name, icon]) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              className={tab === name ? "active" : ""}
              onClick={() => navigate(name)}
            >
              {React.createElement(icon)}
              {name}
            </button>
          ))}
        </nav>
        <div className="north-side-bottom">
          <span>HJ</span>
          <div>
            <strong>Hari J.</strong>
            <small>Demo workspace</small>
          </div>
        </div>
      </aside>
      <div className="north-main">
        <div className="north-demo-bar">
          <Link className="demo-back demo-back--light" to="/business">
            <FiArrowLeft /> Back to examples
          </Link>
          <span className="demo-badge demo-badge--dark">
            Interactive portfolio demo
          </span>
        </div>
        <header className="north-header">
          <div>
            <span>Workspace / {tab}</span>
            <h1>{headings[tab][0]}</h1>
            <p className="north-intro">{headings[tab][1]}</p>
          </div>
          <div>
            <button aria-label="Search customers" onClick={search}>
              <FiSearch />
            </button>
            <span className="north-date">
              <FiCalendar />
              {period.dates}
            </span>
          </div>
        </header>
        <nav
          className="north-mobile-tabs"
          aria-label="Mobile dashboard sections"
        >
          {TABS.map(([name, icon]) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              aria-current={tab === name ? "page" : undefined}
              onClick={() => navigate(name)}
            >
              {React.createElement(icon)}
              {name}
            </button>
          ))}
        </nav>
        <section className="north-toolbar">
          <div>
            <span className="north-live">
              <i />
              Sample data
            </span>
            <p>Illustrative November 2026 workspace</p>
          </div>
          <div className="north-range" aria-label="Reporting period">
            {Object.keys(PERIODS).map((item) => (
              <button
                key={item}
                className={range === item ? "active" : ""}
                aria-pressed={range === item}
                onClick={() => setRange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
        {tab === "Overview" && (
          <div className="north-view">
            <section className="north-metrics" aria-label="Business overview">
              <Metric
                label="Net revenue"
                value={compactMoney(total.revenue)}
                detail="Across all channels"
                change="+12.4%"
              />
              <Metric
                label="Orders"
                value={count(total.orders)}
                detail="Orders in this sample period"
                change="+8.1%"
              />
              <Metric
                label="Conversion rate"
                value={`${((total.orders / total.visitors) * 100).toFixed(2)}%`}
                detail="Orders / visitors"
                change="+0.6%"
              />
              <Metric
                label="Avg. order value"
                value={money(total.revenue / total.orders)}
                detail="Revenue / orders"
              />
            </section>
            <section className="north-panels">
              <Trend revenue={total.revenue} period={period} />
              <article className="north-goal-panel">
                <div className="north-panel-head">
                  <span>Period revenue target</span>
                  <FiArrowUpRight />
                </div>
                <div className="north-context-image">
                  <img
                    src="https://images.unsplash.com/photo-1742836531271-98fd8151d257?auto=format&fit=crop&q=84&w=1200"
                    alt="Business owner checking store operations"
                  />
                  <span>Store operations</span>
                </div>
                <div className="north-goal">
                  <span>
                    78<small>%</small>
                  </span>
                  <div className="north-goal-ring" />
                </div>
                <strong>
                  {compactMoney(total.revenue)}{" "}
                  <small>of {compactMoney(4500000 * period.scale)}</small>
                </strong>
                <p>Review channel performance to decide where to focus next.</p>
              </article>
            </section>
            <ChannelTable
              rows={rows}
              onReport={() => navigate("Performance")}
            />
          </div>
        )}
        {tab === "Performance" && (
          <div className="north-view">
            <div className="north-section-heading">
              <div>
                <h2>Channel report</h2>
                <p>Compare the sources that bring people to your business.</p>
              </div>
              <label className="north-control">
                Channel
                <select
                  aria-label="Channel"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                >
                  <option>All channels</option>
                  {CHANNELS.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <section className="north-metrics">
              <Metric
                label="Revenue"
                value={compactMoney(performance.revenue)}
                detail={channel}
              />
              <Metric
                label="Visitors"
                value={count(performance.visitors)}
                detail="Visits during selected period"
              />
              <Metric
                label="Orders"
                value={count(performance.orders)}
                detail={`${((performance.orders / performance.visitors) * 100).toFixed(2)}% conversion`}
              />
              <Metric
                label="Channel costs"
                value={compactMoney(performance.cost)}
                detail="Illustrative acquisition costs"
              />
            </section>
            <section className="north-panels">
              <Trend revenue={performance.revenue} period={period} />
              <article className="north-breakdown">
                <div className="north-panel-head">
                  <span>Revenue by channel</span>
                </div>
                {performanceRows.map((row) => (
                  <div className="north-channel-bar" key={row.name}>
                    <div>
                      <span>{row.name}</span>
                      <strong>{compactMoney(row.revenue)}</strong>
                    </div>
                    <meter
                      min="0"
                      max={performance.revenue}
                      value={row.revenue}
                    >
                      {((row.revenue / performance.revenue) * 100).toFixed(1)}%
                    </meter>
                    <small>
                      {((row.revenue / performance.revenue) * 100).toFixed(1)}%
                      of selected revenue
                    </small>
                  </div>
                ))}
              </article>
            </section>
            <ChannelTable rows={performanceRows} onExport={exportChannels} />
            <div className="north-insight">
              <FiBarChart2 />
              <p>
                {channel === "All channels"
                  ? "Partners have the highest conversion rate in this sample. Paid social is declining despite acquisition spend, so it is worth reviewing that campaign."
                  : `${channel} brings in ${compactMoney(performance.revenue)} from ${count(performance.visitors)} visits. Use the channel selector to compare another source.`}
              </p>
            </div>
          </div>
        )}
        {tab === "Customers" && (
          <div className="north-view">
            <section className="north-metrics">
              <Metric
                label="Sample profiles"
                value={String(CUSTOMERS.length)}
                detail="Illustrative directory, not your customer data"
              />
              <Metric
                label="New customers"
                value={String(
                  CUSTOMERS.filter((c) => c.segment === "New").length,
                )}
                detail="Within this sample directory"
              />
              <Metric
                label="VIP customers"
                value={String(
                  CUSTOMERS.filter((c) => c.segment === "VIP").length,
                )}
                detail="Customers with a VIP designation"
              />
              <Metric
                label="Returning customers"
                value={String(
                  CUSTOMERS.filter((c) => c.segment === "Returning").length,
                )}
                detail="Within this sample directory"
              />
            </section>
            <section className="north-table-panel">
              <div className="north-panel-head">
                <div>
                  <span>Customer directory</span>
                  <p>Lifetime figures · independent of reporting period</p>
                </div>
                <button
                  onClick={() =>
                    csvDownload("northline-sample-customers.csv", [
                      [
                        "ID",
                        "Name",
                        "Email",
                        "City",
                        "Segment",
                        "Channel",
                        "Orders",
                        "Lifetime spend INR",
                        "Last order",
                      ],
                      ...customers.map((c) => [
                        c.id,
                        c.name,
                        c.email,
                        c.city,
                        c.segment,
                        c.channel,
                        c.orders,
                        c.spent,
                        c.lastOrder,
                      ]),
                    ])
                  }
                >
                  Export CSV <FiDownload />
                </button>
              </div>
              <div className="north-directory-controls">
                <label className="north-search">
                  <FiSearch />
                  <input
                    ref={searchRef}
                    autoFocus={searchRequested.current}
                    aria-label="Search customer directory"
                    placeholder="Search name, email or city"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <label className="north-control">
                  Segment
                  <select
                    aria-label="Customer segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  >
                    {[
                      "All customers",
                      "New",
                      "Returning",
                      "VIP",
                      "Inactive",
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label className="north-control">
                  Sort by
                  <select
                    aria-label="Customer sort order"
                    value={customerSort}
                    onChange={(e) => setCustomerSort(e.target.value)}
                  >
                    <option value="recent">Latest order</option>
                    <option value="spent">Highest spend</option>
                    <option value="name">Name</option>
                  </select>
                </label>
              </div>
              <div className="north-table">
                <table className="north-data-table north-customer-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Segment</th>
                      <th>Orders</th>
                      <th>Lifetime spend</th>
                      <th>Last order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <button
                            className="north-customer-link"
                            onClick={(e) => showCustomer(c, e)}
                          >
                            <span className="north-avatar">
                              {c.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                            <span>
                              {c.name}
                              <small>{c.email}</small>
                            </span>
                          </button>
                        </td>
                        <td>
                          <span
                            className={`north-segment north-segment-${c.segment.toLowerCase()}`}
                          >
                            {c.segment}
                          </span>
                        </td>
                        <td>{c.orders}</td>
                        <td>{money(c.spent)}</td>
                        <td>{date(c.lastOrder)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!customers.length && (
                <div className="north-empty">
                  <h3>No customers match.</h3>
                  <p>Try another search or segment.</p>
                  <button
                    onClick={() => {
                      setQuery("");
                      setSegment("All customers");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
              <p className="north-result-count" aria-live="polite">
                Showing {customers.length} of {CUSTOMERS.length} sample profiles
              </p>
            </section>
          </div>
        )}
        {tab === "Automations" && (
          <div className="north-view">
            <div className="north-section-heading">
              <div>
                <h2>Useful work, on repeat.</h2>
                <p>
                  {rules.filter((r) => r.enabled).length} enabled rules ·
                  configuration stays in this demo session.
                </p>
              </div>
              <button
                className="north-action"
                onClick={() => setNewRule((v) => !v)}
                aria-expanded={newRule}
              >
                <FiPlus /> Add rule
              </button>
            </div>
            {newRule && (
              <form
                className="north-new-rule"
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  setRules((items) => [
                    ...items,
                    {
                      id: crypto.randomUUID(),
                      name: data.get("name").trim(),
                      description: "A custom rule for this demo workspace.",
                      trigger: data.get("trigger"),
                      action:
                        data.get("trigger") ===
                        "Customer spend exceeds threshold"
                          ? "Add to VIP review list"
                          : "Prepare a follow-up list",
                      threshold: Number(data.get("threshold")),
                      enabled: false,
                    },
                  ]);
                  setNewRule(false);
                }}
              >
                <label className="north-control">
                  Rule name
                  <input
                    name="name"
                    aria-label="Rule name"
                    required
                    maxLength="80"
                    pattern=".*\S.*"
                    placeholder="For example: weekly customer review"
                  />
                </label>
                <label className="north-control">
                  When
                  <select name="trigger" aria-label="Rule trigger">
                    <option>Customer spend exceeds threshold</option>
                    <option>Days since last order</option>
                  </select>
                </label>
                <label className="north-control">
                  Threshold
                  <input
                    name="threshold"
                    aria-label="New rule threshold"
                    type="number"
                    min="1"
                    max="10000000"
                    defaultValue="30"
                    required
                  />
                </label>
                <button className="north-action" type="submit">
                  Create rule
                </button>
                <button
                  className="north-secondary"
                  type="button"
                  onClick={() => setNewRule(false)}
                >
                  Cancel
                </button>
              </form>
            )}
            <div className="north-rules">
              {rules.map((rule) => (
                <article className="north-rule" key={rule.id}>
                  <div className="north-rule-heading">
                    <span className="north-rule-icon">
                      <FiZap />
                    </span>
                    <div>
                      <h3>{rule.name}</h3>
                      <p>{rule.description}</p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={rule.enabled}
                      aria-label={`Enable ${rule.name}`}
                      className={`north-switch ${rule.enabled ? "on" : ""}`}
                      onClick={() =>
                        setRules((items) =>
                          items.map((r) =>
                            r.id === rule.id
                              ? { ...r, enabled: !r.enabled }
                              : r,
                          ),
                        )
                      }
                    >
                      <i />
                    </button>
                  </div>
                  <div className="north-rule-flow">
                    <span>
                      <small>WHEN</small>
                      {rule.trigger}
                    </span>
                    <FiArrowUpRight />
                    <span>
                      <small>THEN</small>
                      {rule.action}
                    </span>
                  </div>
                  <div className="north-rule-actions">
                    <span>
                      {rule.enabled ? "Enabled for preview" : "Paused"}
                    </span>
                    <button
                      onClick={() =>
                        setConfiguration(
                          configuration === rule.id ? null : rule.id,
                        )
                      }
                      aria-expanded={configuration === rule.id}
                    >
                      Configure
                    </button>
                    <button
                      disabled={!rule.enabled}
                      onClick={() => runRule(rule)}
                    >
                      Run preview <FiArrowUpRight />
                    </button>
                  </div>
                  {configuration === rule.id && (
                    <form
                      className="north-rule-config"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const threshold = Number(
                          new FormData(e.currentTarget).get("threshold"),
                        );
                        setRules((items) =>
                          items.map((r) =>
                            r.id === rule.id
                              ? {
                                  ...r,
                                  threshold,
                                  trigger:
                                    rule.id === "daily"
                                      ? `Every day at ${String(threshold).padStart(2, "0")}:00`
                                      : r.trigger,
                                }
                              : r,
                          ),
                        );
                        setConfiguration(null);
                        setNotice(
                          "Rule configuration updated for this demo session.",
                        );
                      }}
                    >
                      <label className="north-control">
                        {rule.id === "daily"
                          ? "Hour of day (0–23)"
                          : rule.trigger === "Customer spend exceeds threshold"
                            ? "Customer spend threshold (₹)"
                            : "Days without an order"}
                        <input
                          key={rule.threshold}
                          name="threshold"
                          aria-label={`Threshold for ${rule.name}`}
                          type="number"
                          min={rule.id === "daily" ? 0 : 1}
                          max={rule.id === "daily" ? 23 : 10000000}
                          defaultValue={rule.threshold}
                          required
                        />
                      </label>
                      <button className="north-action" type="submit">
                        <FiCheck /> Save configuration
                      </button>
                    </form>
                  )}
                </article>
              ))}
            </div>
            <section className="north-table-panel">
              <div className="north-panel-head">
                <div>
                  <span>Preview activity</span>
                  <p>
                    Simulations only. No schedules, messages, or live
                    integrations are started.
                  </p>
                </div>
              </div>
              {log.length ? (
                log.map((event) => (
                  <div className="north-log-entry" key={event.id}>
                    <FiCheck />
                    <div>
                      <strong>{event.name}</strong>
                      <p>{event.detail}</p>
                    </div>
                    <time>{event.time}</time>
                  </div>
                ))
              ) : (
                <div className="north-empty">
                  <p>Run an enabled rule to see what it would prepare.</p>
                </div>
              )}
            </section>
            {notice && (
              <div className="north-notice" role="status">
                <p>{notice}</p>
                <button
                  aria-label="Dismiss notification"
                  onClick={() => setNotice("")}
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
        )}
        <p className="north-disclaimer">
          Illustrative portfolio dashboard · Sample data · No real customer
          messages or integrations · Image courtesy of Unsplash
        </p>
      </div>
      {customer && (
        <div
          className="north-dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCustomer();
          }}
        >
          <section
            className="north-customer-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="north-customer-name"
            ref={customerPanel}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeCustomer();
              if (e.key === "Tab") {
                e.preventDefault();
                customerPanel.current?.querySelector("button")?.focus();
              }
            }}
          >
            <button
              className="north-dialog-close"
              aria-label="Close customer details"
              onClick={closeCustomer}
            >
              <FiX />
            </button>
            <span className="north-avatar">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <p className="north-eyebrow">SAMPLE CUSTOMER / {customer.id}</p>
            <h2 id="north-customer-name">{customer.name}</h2>
            <p>{customer.email}</p>
            <dl>
              {[
                ["City", customer.city],
                ["Segment", customer.segment],
                ["Acquisition channel", customer.channel],
                ["Lifetime orders", customer.orders],
                ["Lifetime spend", money(customer.spent)],
                ["Last order", date(customer.lastOrder)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <small>Fictional profile for this portfolio demonstration.</small>
          </section>
        </div>
      )}
    </main>
  );
}
