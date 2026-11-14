// Original vector studies. Each frame is composed for a specific cinematic use.
// Shared shapes keep the collection coherent without repeating the composition.
const Person = ({ x = 300, y = 140, scale = 1, fill = "currentColor" }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} fill={fill}>
    <circle cy="-28" r="14" />
    <path d="M-15-8Q0-17 15-8L23 63H12L8 128H-3L-8 63H-12L-17 128H-28L-23 57Z" />
    <path d="m-15 0-29 52 8 5L-6 21M15 0l25 49-8 6L6 21" />
  </g>
);
const Chair = ({ x, y, fill }) => (
  <g
    transform={`translate(${x} ${y})`}
    fill="none"
    stroke={fill}
    strokeWidth="6"
  >
    <path d="M0 0v48h60V0M0 48l-8 70m68-70 8 70" />
  </g>
);

export default function ShotArt({
  type = "landscape",
  palette = "ochre",
  className = "",
  title = "",
}) {
  const colors = {
    ochre: ["#ceaa70", "#e8d9b8", "#383f37", "#a4593f"],
    sage: ["#91a18e", "#d6dbbe", "#263e39", "#c6a778"],
    rust: ["#be745a", "#e7c6a6", "#403632", "#dfac60"],
    blue: ["#8199a3", "#d0d5c8", "#273c48", "#b88865"],
  };
  const [bg, light, ink, accent] = colors[palette] || colors.ochre;
  let drawing;
  switch (type) {
    case "wide":
      drawing = (
        <>
          <path fill={light} d="M0 0h600v155H0z" />
          <path fill={accent} d="M0 207 164 145l94 64 119-32 223 60v163H0Z" />
          <path fill={ink} d="m0 293 211-62 211 63 178-53v159H0Z" />
          <Person x={371} y={209} scale={0.48} fill={light} />
        </>
      );
      break;
    case "full":
      drawing = (
        <>
          <rect x="170" width="260" height="370" fill={light} />
          <path d="m0 370 170-90h260l170 90" fill={accent} />
          <Person x={301} y={116} scale={1.25} fill={ink} />
          <path d="m298 274 144 53h-82l-77-53" fill={ink} opacity=".25" />
        </>
      );
      break;
    case "medium":
      drawing = (
        <>
          <circle cx="435" cy="105" r="72" fill={light} />
          <path d="M0 255h600v145H0" fill={accent} />
          <Person x={271} y={182} scale={2.6} fill={ink} />
          <path d="m311 250 73-45 13 13-69 60" fill={ink} />
        </>
      );
      break;
    case "portrait":
      drawing = (
        <>
          <rect x="73" width="118" height="400" fill={accent} />
          <path
            d="M246 51q107-42 151 69l-8 56 25 43-32 12-9 47 38 122H139l69-138-9-89q-5-77 47-122"
            fill={ink}
          />
          <path
            d="M277 66q65 0 84 64l-7 47 24 37-25 9-6 37-58 17-35-42-9-96q-1-43 32-73"
            fill={light}
          />
          <path
            d="m324 162 23-2m-29 58 22 4"
            stroke={ink}
            strokeWidth="5"
            fill="none"
          />
        </>
      );
      break;
    case "eye":
      drawing = (
        <>
          <path d="M0 30q300-90 600 80v230H0" fill={accent} />
          <path d="M60 185q219-190 480 0-250 159-480 0" fill={light} />
          <ellipse cx="292" cy="176" rx="62" ry="69" fill={ink} />
          <circle cx="291" cy="174" r="30" fill="#1d2524" />
          <circle cx="309" cy="153" r="10" fill={light} />
          <path
            d="M50 181Q280-20 550 185M91 109Q306 9 493 106"
            fill="none"
            stroke={ink}
            strokeWidth="14"
          />
        </>
      );
      break;
    case "two":
      drawing = (
        <>
          <rect x="50" y="30" width="500" height="230" fill={light} />
          <path d="M0 300h600v100H0" fill={accent} />
          <Person x={205} y={159} scale={1.25} fill={ink} />
          <Person x={389} y={168} scale={1.18} fill={accent} />
          <path d="M276 227h56v8h-56z" fill={ink} />
        </>
      );
      break;
    case "shoulder":
      drawing = (
        <>
          <rect x="100" y="25" width="330" height="275" fill={light} />
          <Person x={375} y={150} scale={1.4} fill={accent} />
          <circle cx="110" cy="119" r="64" fill={ink} />
          <path d="M0 400V232q108-94 230 5l91 163" fill={ink} />
        </>
      );
      break;
    case "group":
      drawing = (
        <>
          <path d="M0 235h600v165H0" fill={light} />
          <circle cx="450" cy="80" r="45" fill={accent} />
          {[155, 245, 340, 430].map((x, i) => (
            <Person
              key={x}
              x={x}
              y={159 + (i % 2) * 14}
              scale={1.02 - i * 0.05}
              fill={i % 2 ? accent : ink}
            />
          ))}
        </>
      );
      break;
    case "pov":
      drawing = (
        <>
          <path fill={light} d="M153 0h294v258H153z" />
          <path d="m290 137-49 263h167l-83-263" fill={accent} />
          <path
            d="m0 400 92-135 74 29 33 106m401 0-92-135-74 29-33 106"
            fill={ink}
          />
          <path d="m111 271 35-81 16 9-7 74m289-2-35-81-16 9 7 74" fill={ink} />
          <circle cx="307" cy="106" r="30" fill={ink} />
        </>
      );
      break;
    case "overhead":
      drawing = (
        <>
          <rect x="116" y="25" width="368" height="285" rx="160" fill={light} />
          <circle cx="300" cy="168" r="92" fill={accent} />
          <circle cx="300" cy="168" r="65" fill={ink} />
          <circle cx="300" cy="168" r="51" fill={light} />
          <rect x="140" y="145" width="26" height="51" rx="12" fill={ink} />
          <rect x="433" y="145" width="26" height="51" rx="12" fill={ink} />
          <path d="M390 80v70m15-70v70" stroke={ink} strokeWidth="4" />
        </>
      );
      break;
    case "low":
      drawing = (
        <>
          <path d="m0 0 175 400H0m600-400L425 400h175" fill={ink} />
          <path d="m137 0 163 305L463 0" fill={light} />
          <Person x={300} y={125} scale={1.9} fill={accent} />
          <path d="M0 0h600" stroke={accent} strokeWidth="20" />
        </>
      );
      break;
    case "high":
      drawing = (
        <>
          <path d="m0 0 600 140v260H0" fill={light} />
          <path d="m0 0 287 96L75 400H0m600-260L363 118 600 355" fill={ink} />
          <ellipse cx="310" cy="245" rx="70" ry="14" fill={accent} />
          <Person x={300} y={145} scale={0.8} fill={ink} />
        </>
      );
      break;
    case "dutch":
      drawing = (
        <g transform="rotate(-16 300 180)">
          <rect x="-80" y="-100" width="760" height="400" fill={light} />
          {[50, 170, 350, 510].map((x) => (
            <rect key={x} x={x} y="-80" width="30" height="450" fill={ink} />
          ))}
          <rect x="-80" y="290" width="760" height="160" fill={accent} />
          <Person x={292} y={135} fill={ink} />
        </g>
      );
      break;
    case "street":
      drawing = (
        <>
          <path
            d="m0 0 237 129v115L0 345m600-345L361 129v115l239 101"
            fill={ink}
          />
          <path d="M237 129h124v115H237" fill={light} />
          <path d="m237 244-77 156h325L361 244" fill={accent} />
          <Person x={300} y={204} scale={0.58} fill={ink} />
          {[68, 128, 468, 528].map((x) => (
            <path key={x} d={`M${x} 70v130`} stroke={bg} strokeWidth="15" />
          ))}
        </>
      );
      break;
    case "orbit":
      drawing = (
        <>
          <circle cx="300" cy="168" r="123" fill={light} />
          <ellipse
            cx="300"
            cy="228"
            rx="209"
            ry="62"
            fill="none"
            stroke={accent}
            strokeWidth="18"
            strokeDasharray="600 100"
          />
          <Person x={300} y={119} fill={ink} />
          <path d="m492 200 33 32-46 13" fill={accent} />
        </>
      );
      break;
    case "window":
      drawing = (
        <>
          <path d="M0 0h600v400H0" fill={ink} />
          <path d="M115 36h215v205H115" fill={light} />
          <path d="m115 241 132-90 353 227H221Z" fill={accent} />
          <path d="M222 36v205M115 139h215" stroke={ink} strokeWidth="13" />
          <Chair x={373} y={193} fill={light} />
        </>
      );
      break;
    case "silhouette":
      drawing = (
        <>
          <circle cx="300" cy="157" r="126" fill={light} />
          <path d="M0 284q300-73 600 0v116H0" fill={accent} />
          <Person x={300} y={154} scale={1.2} fill={ink} />
          <path d="m295 307 95 93H206l80-93" fill={ink} />
        </>
      );
      break;
    case "detail":
      drawing = (
        <>
          <path d="m20 260 259-101 302 102-259 103Z" fill={light} />
          <path d="m230 109 76-28 78 28-77 30z" fill={accent} />
          <path d="m230 109 77 30v109l-77-30z" fill={ink} />
          <path d="m307 139 77-30v109l-77 30z" fill={accent} />
          <path d="m254 107 52-18 55 18-54 19z" fill={light} />
          <path d="m285 249 142 39 78-27-121-43" fill={ink} opacity=".22" />
        </>
      );
      break;
    case "food":
      drawing = (
        <>
          <path d="M0 210h600v190H0" fill={accent} />
          <ellipse cx="292" cy="221" rx="164" ry="68" fill={ink} />
          <ellipse cx="292" cy="207" rx="154" ry="64" fill={light} />
          <ellipse cx="292" cy="200" rx="98" ry="40" fill={bg} />
          <path d="M229 194q26-51 61-10 23-59 64-1l-12 32h-98" fill={ink} />
          <path
            d="M276 119q-17-28 2-44m32 43q-17-28 2-44"
            stroke={light}
            strokeWidth="5"
            fill="none"
          />
          <path
            d="m477 142-11 143m29-143-11 143"
            stroke={ink}
            strokeWidth="5"
          />
        </>
      );
      break;
    case "interview":
      drawing = (
        <>
          <rect x="330" y="25" width="160" height="240" fill={light} />
          <path d="M407 25v240" stroke={bg} strokeWidth="8" />
          <Chair x={227} y={198} fill={light} />
          <Person x={254} y={132} scale={1.1} fill={ink} />
          <path
            d="m360 161 99 96-3 45m-44-45h85"
            stroke={ink}
            strokeWidth="7"
            fill="none"
          />
          <rect x="348" y="148" width="29" height="15" rx="7" fill={accent} />
        </>
      );
      break;
    case "vehicle":
      drawing = (
        <>
          <circle cx="463" cy="96" r="51" fill={light} />
          <path d="M0 251h600v149H0" fill={accent} />
          <path d="m0 321 600-35v11L0 334" fill={light} />
          <path d="m128 230 43-66h170l63 63 48 7v57H103v-53Z" fill={ink} />
          <path d="m183 176-30 49h83v-49m14 0v49h111l-47-49" fill={bg} />
          <circle
            cx="172"
            cy="285"
            r="30"
            fill={ink}
            stroke={light}
            strokeWidth="8"
          />
          <circle
            cx="380"
            cy="285"
            r="30"
            fill={ink}
            stroke={light}
            strokeWidth="8"
          />
        </>
      );
      break;
    case "sea":
      drawing = (
        <>
          <path d="M0 0h600v158H0" fill={light} />
          <circle cx="430" cy="98" r="39" fill={accent} />
          <path d="M0 158h600v242H0" fill={ink} />
          {[185, 226, 267].map((y, i) => (
            <path
              key={y}
              d={`M0 ${y}q75-28 150 0t150 0 150 0 150 0`}
              fill="none"
              stroke={i === 1 ? light : bg}
              strokeWidth="9"
            />
          ))}
          <path d="m380 152 50-66v66" fill={bg} />
        </>
      );
      break;
    case "door":
      drawing = (
        <>
          <rect width="600" height="400" fill={ink} />
          <path d="M211 31h179v276H211" fill={light} />
          <path d="m211 31 117 41v235H211" fill={accent} />
          <circle cx="306" cy="184" r="5" fill={ink} />
          <path d="m328 307 62 0 158 93H211" fill={light} />
        </>
      );
      break;
    default:
      drawing = (
        <>
          <circle cx="443" cy="92" r="55" fill={light} />
          <path
            d="m0 245 158-132 111 135L403 126l197 119v155H0"
            fill={accent}
          />
          <path d="m0 291 238-104 184 90 178-53v176H0" fill={ink} />
          <path d="m267 267 61 133h-48l-37-133" fill={light} />
          <Person x={261} y={215} scale={0.32} fill={light} />
        </>
      );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
    >
      <rect width="600" height="400" fill={bg} />
      {drawing}
      <path
        d="M24 55V24h31m490 0h31v31M24 345v31h31m490 0h31v-31"
        stroke={light}
        strokeWidth="1"
        opacity=".6"
      />
    </svg>
  );
}
