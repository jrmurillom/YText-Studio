/**
 * YouTube Essentials Curated Graphic Assets Pack
 * Vector-based, zero external dependencies, high-contrast assets.
 */

export interface CuratedAssetDefinition {
  id: string;
  name: string;
  category: 'arrows' | 'badges' | 'reactions';
  width: number;
  height: number;
  dataUrl: string;
}

const svgToDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
};

export const CURATED_ASSETS: CuratedAssetDefinition[] = [
  // 1. ARROWS
  {
    id: 'yt_arrow_red',
    name: 'Red Shock Arrow',
    category: 'arrows',
    width: 240,
    height: 140,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 140" width="240" height="140">
        <defs>
          <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FF1E1E"/>
            <stop offset="100%" stop-color="#B30000"/>
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="4" dy="6" stdDeviation="0" flood-color="#000000"/>
          </filter>
        </defs>
        <path d="M 20 50 Q 80 20 150 45 L 150 20 L 225 70 L 150 120 L 150 95 Q 90 75 20 90 Z" 
              fill="url(#redGrad)" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" filter="url(#shadow)"/>
      </svg>
    `),
  },
  {
    id: 'yt_arrow_yellow_curved',
    name: 'Curved Yellow Arrow',
    category: 'arrows',
    width: 200,
    height: 180,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" width="200" height="180">
        <defs>
          <linearGradient id="yelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFE600"/>
            <stop offset="100%" stop-color="#FF9900"/>
          </linearGradient>
        </defs>
        <path d="M 30 160 C 20 80 80 30 140 40 L 135 15 L 190 60 L 135 105 L 140 80 C 90 70 50 100 55 160 Z" 
              fill="url(#yelGrad)" stroke="#000000" stroke-width="6" stroke-linejoin="round"/>
      </svg>
    `),
  },
  {
    id: 'yt_arrow_neon_cyan',
    name: 'Neon Pointer Arrow',
    category: 'arrows',
    width: 220,
    height: 110,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 110" width="220" height="110">
        <path d="M 15 40 L 140 40 L 140 15 L 210 55 L 140 95 L 140 70 L 15 70 Z" 
              fill="#00F0FF" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
      </svg>
    `),
  },

  // 2. BADGES
  {
    id: 'yt_badge_new',
    name: 'NEW Red Badge',
    category: 'badges',
    width: 200,
    height: 90,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 90" width="200" height="90">
        <rect x="8" y="8" width="184" height="74" rx="20" fill="#E11D48" stroke="#FFFFFF" stroke-width="6"/>
        <text x="100" y="58" font-family="Impact, Anton, Arial Black, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">NEW</text>
      </svg>
    `),
  },
  {
    id: 'yt_badge_vs',
    name: 'VS Clash Badge',
    category: 'badges',
    width: 160,
    height: 140,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" width="160" height="140">
        <circle cx="80" cy="70" r="60" fill="#FF003C" stroke="#FFFFFF" stroke-width="8"/>
        <text x="80" y="90" font-family="Impact, Anton, Arial Black, sans-serif" font-size="54" font-weight="900" fill="#FFFF00" text-anchor="middle" font-style="italic">VS</text>
      </svg>
    `),
  },
  {
    id: 'yt_badge_100',
    name: '100% Score Badge',
    category: 'badges',
    width: 180,
    height: 90,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 90" width="180" height="90">
        <rect x="6" y="6" width="168" height="78" rx="16" fill="#FACC15" stroke="#000000" stroke-width="7"/>
        <text x="90" y="58" font-family="Impact, Anton, Arial Black, sans-serif" font-size="44" font-weight="900" fill="#000000" text-anchor="middle">100%</text>
      </svg>
    `),
  },
  {
    id: 'yt_badge_live',
    name: 'LIVE Stream Pill',
    category: 'badges',
    width: 200,
    height: 80,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80" width="200" height="80">
        <rect x="6" y="6" width="188" height="68" rx="34" fill="#000000" stroke="#FF0000" stroke-width="5"/>
        <circle cx="45" cy="40" r="14" fill="#FF0000"/>
        <text x="115" y="53" font-family="Arial Black, Impact, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">LIVE</text>
      </svg>
    `),
  },

  // 3. REACTION ICONS
  {
    id: 'yt_icon_fire',
    name: 'Fire Flame',
    category: 'reactions',
    width: 140,
    height: 170,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 170" width="140" height="170">
        <defs>
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#FF1A00"/>
            <stop offset="50%" stop-color="#FF8800"/>
            <stop offset="100%" stop-color="#FFEE00"/>
          </linearGradient>
        </defs>
        <path d="M 70 10 C 70 10 95 55 95 80 C 95 90 90 95 85 95 C 100 85 115 105 115 125 C 115 150 95 165 70 165 C 40 165 20 140 20 115 C 20 85 45 60 55 40 C 55 60 65 75 75 75 C 65 50 70 10 70 10 Z" 
              fill="url(#fireGrad)" stroke="#000000" stroke-width="7" stroke-linejoin="round"/>
        <path d="M 70 110 C 60 110 50 120 50 135 C 50 150 60 158 70 158 C 80 158 90 150 90 135 C 90 125 80 115 70 110 Z" 
              fill="#FFFFFF" opacity="0.9"/>
      </svg>
    `),
  },
  {
    id: 'yt_icon_warning',
    name: 'Warning Danger',
    category: 'reactions',
    width: 160,
    height: 150,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 150" width="160" height="150">
        <polygon points="80,10 150,135 10,135" fill="#FFCC00" stroke="#000000" stroke-width="10" stroke-linejoin="round"/>
        <rect x="74" y="55" width="12" height="42" rx="6" fill="#000000"/>
        <circle cx="80" cy="114" r="7" fill="#000000"/>
      </svg>
    `),
  },
  {
    id: 'yt_icon_skull',
    name: 'Skull Danger',
    category: 'reactions',
    width: 150,
    height: 160,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 160" width="150" height="160">
        <path d="M 75 15 C 35 15 20 45 20 80 C 20 105 35 115 45 120 L 45 145 L 105 145 L 105 120 C 115 115 130 105 130 80 C 130 45 115 15 75 15 Z" 
              fill="#FFFFFF" stroke="#000000" stroke-width="8" stroke-linejoin="round"/>
        <ellipse cx="50" cy="75" rx="14" ry="18" fill="#000000"/>
        <ellipse cx="100" cy="75" rx="14" ry="18" fill="#000000"/>
        <polygon points="75,95 68,110 82,110" fill="#000000"/>
        <line x1="62" y1="130" x2="62" y2="145" stroke="#000000" stroke-width="4"/>
        <line x1="75" y1="130" x2="75" y2="145" stroke="#000000" stroke-width="4"/>
        <line x1="88" y1="130" x2="88" y2="145" stroke="#000000" stroke-width="4"/>
      </svg>
    `),
  },
  {
    id: 'yt_icon_lightning',
    name: 'Electric Lightning',
    category: 'reactions',
    width: 130,
    height: 180,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 180" width="130" height="180">
        <polygon points="75,10 15,100 65,100 45,170 115,80 65,80" fill="#FFEA00" stroke="#000000" stroke-width="8" stroke-linejoin="round"/>
      </svg>
    `),
  },
  {
    id: 'yt_icon_money',
    name: 'Money Bag',
    category: 'reactions',
    width: 150,
    height: 160,
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 160" width="150" height="160">
        <path d="M 60 25 L 90 25 L 85 45 L 65 45 Z" fill="#22C55E" stroke="#000000" stroke-width="6"/>
        <path d="M 75 45 C 30 45 15 80 15 115 C 15 145 40 155 75 155 C 110 155 135 145 135 115 C 135 80 120 45 75 45 Z" 
              fill="#4ADE80" stroke="#000000" stroke-width="8" stroke-linejoin="round"/>
        <text x="75" y="125" font-family="Arial Black, Impact, sans-serif" font-size="52" font-weight="900" fill="#14532D" text-anchor="middle">$</text>
      </svg>
    `),
  },
];
