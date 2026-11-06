import { formatCount, formatPrice, illustrationAccounts, illustrationGrowth } from "@/lib/catalog";
import { getT } from "@/lib/i18n-server";

const INK = "#081021";

// የተጣሉት የብር ኖቶች፡ x, y, ማዞሪያ፣ ማዘንበያ፣ መጠን እና የመታያ መዘግየት።
const notes = [
  { x: 96, y: 610, rotate: -14, skew: -38, scale: 0.72, delay: "delay-700" },
  { x: 470, y: 614, rotate: 12, skew: 38, scale: 0.72, delay: "delay-700" },
  { x: 176, y: 628, rotate: -4, skew: -30, scale: 0.8, delay: "delay-500" },
  { x: 392, y: 630, rotate: 5, skew: 30, scale: 0.8, delay: "delay-500" },
  { x: 214, y: 566, rotate: 76, skew: 0, scale: 0.94, delay: "delay-300" },
  { x: 352, y: 572, rotate: 104, skew: 0, scale: 0.94, delay: "delay-300" },
  { x: 282, y: 540, rotate: 90, skew: 0, scale: 1, delay: "delay-100" },
];

const squares = [
  { x: 58, y: 110, size: 20, rotate: 24, opacity: "opacity-90" },
  { x: 496, y: 74, size: 14, rotate: -18, opacity: "opacity-70" },
  { x: 34, y: 400, size: 12, rotate: 40, opacity: "opacity-60" },
  { x: 506, y: 214, size: 24, rotate: 14, opacity: "opacity-80" },
];

const fingers = [186, 234, 282, 330];

function Note({ label }: { label: string }) {
  return (
    <g>
      <rect x="-82" y="-40" width="164" height="80" rx="5" fill="url(#hero-note)" stroke={INK} strokeOpacity="0.45" />
      <rect x="-75" y="-33" width="150" height="66" rx="3" fill="none" stroke={INK} strokeOpacity="0.4" />
      <ellipse rx="27" ry="27" fill={INK} fillOpacity="0.12" stroke={INK} strokeOpacity="0.5" />
      <text textAnchor="middle" y="6" fill={INK} className="font-heading text-[17px] font-bold">
        {label}
      </text>
      <text x="-68" y="-16" fill={INK} className="font-heading text-[12px] font-bold">
        100
      </text>
      <text x="68" y="25" textAnchor="end" fill={INK} className="font-heading text-[12px] font-bold">
        100
      </text>
    </g>
  );
}

/** ምሳሌ ምስል ብቻ ነው፤ ከእውነተኛ ማስታወቂያ ጋር አልተገናኘም። */
export async function HeroVisual() {
  const t = await getT();
  const account = illustrationAccounts[1];
  const min = Math.min(...illustrationGrowth);
  const span = Math.max(...illustrationGrowth) - min;
  const tiles = [
    { label: t("Views"), value: "151K", x: 196, y: 174 },
    { label: t("Watch hours"), value: "24.9K", x: 286, y: 174 },
    { label: t("New subscribers"), value: "+2.2K", x: 196, y: 240 },
    { label: t("Revenue"), value: "$138", x: 286, y: 240, gold: true },
  ];

  return (
    <div aria-hidden className="relative mx-auto h-[28rem] w-full max-w-xl sm:h-[40rem]">
      <svg viewBox="0 0 560 680" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="hero-glow">
            <stop offset="0" stopColor="#FFBE1A" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#FFAA33" stopOpacity="0.16" />
            <stop offset="1" stopColor="#FFAA33" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-fade">
            <stop offset="0.35" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <mask id="hero-pattern-mask">
            <rect width="560" height="680" fill="url(#hero-fade)" />
          </mask>
          <pattern id="hero-diamonds" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M22 5 39 22 22 39 5 22Z" fill="#FFBE1A" fillOpacity="0.13" />
          </pattern>
          <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE9A8" />
            <stop offset="0.4" stopColor="#FFBE1A" />
            <stop offset="1" stopColor="#C97A08" />
          </linearGradient>
          <linearGradient id="hero-arm" x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0" stopColor="#D08A12" />
            <stop offset="0.5" stopColor="#7A4A05" />
            <stop offset="1" stopColor="#2A1A03" />
          </linearGradient>
          <linearGradient id="hero-thumb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE9A8" />
            <stop offset="0.45" stopColor="#E9A21A" />
            <stop offset="1" stopColor="#6E4304" />
          </linearGradient>
          <linearGradient id="hero-finger" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3A2403" stopOpacity="0" />
            <stop offset="0.55" stopColor="#B87410" />
            <stop offset="1" stopColor="#FFD867" />
          </linearGradient>
          <linearGradient id="hero-arm-mask" gradientUnits="userSpaceOnUse" x1="440" y1="0" x2="556" y2="0">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <mask id="hero-arm-fade">
            <rect width="560" height="680" fill="url(#hero-arm-mask)" />
          </mask>
          <linearGradient id="hero-note" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE28A" />
            <stop offset="0.5" stopColor="#FFBE1A" />
            <stop offset="1" stopColor="#FFAA33" />
          </linearGradient>
          <linearGradient id="hero-floor" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFBE1A" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFE9A8" />
            <stop offset="1" stopColor="#FFBE1A" stopOpacity="0" />
          </linearGradient>
          <filter id="hero-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="16" />
          </filter>
          <filter id="hero-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        <rect width="560" height="680" fill="url(#hero-diamonds)" mask="url(#hero-pattern-mask)" />
        <circle cx="280" cy="270" r="280" fill="url(#hero-glow)" className="motion-safe:animate-pulse" />
        <ellipse cx="280" cy="648" rx="230" ry="26" fill="#FFBE1A" fillOpacity="0.45" filter="url(#hero-blur)" />
        <rect x="20" y="622" width="520" height="2" fill="url(#hero-floor)" />

        {squares.map((square) => (
          <rect
            key={square.x}
            x={square.x}
            y={square.y}
            width={square.size}
            height={square.size}
            rx="3"
            fill="url(#hero-gold)"
            transform={`rotate(${square.rotate} ${square.x} ${square.y})`}
            className={`${square.opacity} motion-safe:animate-pulse`}
          />
        ))}

        {/* ክንድ እና መዳፍ ከስልኩ ጀርባ */}
        <g mask="url(#hero-arm-fade)">
          <path d="M350 214C424 206 478 238 512 296L580 346V556L486 494C432 482 384 466 350 438Z" fill="url(#hero-arm)" />
          <path d="M388 211C436 216 482 244 512 296L580 346" fill="none" stroke="#FFE9A8" strokeOpacity="0.75" strokeWidth="2" />
        </g>

        {notes.map((note, index) => (
          <g key={index} className={`motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-16 motion-safe:fill-mode-both motion-safe:duration-1000 ${note.delay}`}>
            <g transform={`translate(${note.x} ${note.y}) rotate(${note.rotate}) skewX(${note.skew}) scale(${note.scale})`} filter="url(#hero-shadow)">
              <Note label={t("Birr")} />
            </g>
          </g>
        ))}

        {/* ስልኩ */}
        <g filter="url(#hero-shadow)">
          <rect x="172" y="24" width="216" height="446" rx="36" fill="#0B0B0B" stroke="url(#hero-gold)" strokeWidth="3" />
          <rect x="182" y="34" width="196" height="426" rx="28" fill="#141414" />
        </g>
        <rect x="248" y="44" width="64" height="16" rx="8" fill="#000000" />

        <circle cx="214" cy="96" r="20" fill="url(#hero-gold)" />
        <path d="M208 86 224 96 208 106Z" fill={INK} />
        <text x="244" y="84" className="fill-foreground font-heading text-[12px] font-semibold">
          @{account.handle}
        </text>
        <text x="244" y="106" className="fill-foreground font-heading text-[21px] font-bold">
          {formatCount(account.followers)}
        </text>
        <text x="244" y="120" className="fill-muted-foreground text-[10px]">
          {t(account.unit)}
        </text>

        <text x="196" y="156" className="fill-foreground font-heading text-[12px] font-semibold">
          {t("Channel analytics")}
        </text>
        <rect x="326" y="145" width="40" height="15" rx="7.5" fill="none" stroke="#FFBE1A" strokeOpacity="0.7" />
        <text x="346" y="156" textAnchor="middle" className="fill-primary text-[8px] font-semibold">
          {t("Example")}
        </text>

        {tiles.map((tile) => (
          <g key={tile.label}>
            <rect x={tile.x} y={tile.y} width="82" height="58" rx="10" fill="#222222" />
            <text x={tile.x + 9} y={tile.y + 20} className="fill-muted-foreground text-[8.5px]">
              {tile.label}
            </text>
            <text x={tile.x + 9} y={tile.y + 44} className={`${tile.gold ? "fill-primary" : "fill-foreground"} font-heading text-[17px] font-bold`}>
              {tile.value}
            </text>
          </g>
        ))}

        {illustrationGrowth.map((value, index) => {
          const height = 12 + ((value - min) / span) * 44;
          return <rect key={value} x={196 + index * 19} y={366 - height} width="13" height={height} rx="3" fill="url(#hero-gold)" />;
        })}

        <rect x="196" y="378" width="172" height="36" rx="12" fill="url(#hero-gold)" />
        <text x="282" y="401" textAnchor="middle" fill={INK} className="font-heading text-[13px] font-bold">
          {formatPrice(t, account.priceEtb)}
        </text>
        <rect x="226" y="432" width="108" height="4" rx="2" fill="#3A3A3A" />

        {/* ኖቶቹ የሚወጡበት ክፍተት */}
        <rect x="216" y="462" width="132" height="10" rx="5" fill="#000000" stroke="url(#hero-gold)" />

        {/* ጣቶች እና አውራ ጣት ከስልኩ ፊት */}
        {fingers.map((y) => (
          <g key={y}>
            <rect x="118" y={y} width="74" height="44" rx="21" fill="url(#hero-finger)" />
            <rect x="176" y={y + 11} width="10" height="22" rx="5" fill="#FFF3C9" fillOpacity="0.5" />
          </g>
        ))}
        <path
          d="M452 420C430 376 412 338 392 306C382 290 370 276 371 258C372 240 394 234 406 246C434 274 468 320 498 378Z"
          fill="url(#hero-thumb)"
          stroke="#000000"
          strokeOpacity="0.45"
          mask="url(#hero-arm-fade)"
        />
      </svg>
    </div>
  );
}
