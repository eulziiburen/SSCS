import type { SceneKey } from "@/lib/data";

type Scene = {
  sky: [string, string];
  sun: string;
  far: string;
  near: string;
  water?: string;
  palm?: boolean;
  city?: boolean;
  pillars?: boolean;
  pines?: boolean;
  dunes?: boolean;
  ger?: boolean;
  snow?: boolean;
};

// Landscape art — each destination gets its own palette
const SCENES: Record<SceneKey, Scene> = {
  baikal: { sky: ["#8FC3E8", "#E7F2F8"], sun: "#FFF4C8", far: "#7F9DB5", near: "#3E6A57", water: "#3C7FB4" },
  hainan: { sky: ["#46B3D8", "#CFF1F5"], sun: "#FFF1A8", far: "#6CBFA1", near: "#2F8A6B", water: "#1E9CC0", palm: true },
  shanghai: { sky: ["#F2A65A", "#F8D9B0"], sun: "#FFE6B8", far: "#B77D6A", near: "#4B3E55", water: "#6A6F99", city: true },
  canton: { sky: ["#5D7FB8", "#C9D6EE"], sun: "#FFF1C4", far: "#8494B8", near: "#394A6E", water: "#4E6A9C", city: true },
  manzhouli: { sky: ["#9CB8D9", "#EEF1F4"], sun: "#FFFFFF", far: "#B3B9A6", near: "#8A8A5E", city: true },
  zhangjiajie: { sky: ["#A7C6C0", "#EAF1EC"], sun: "#FFFBE6", far: "#8FA99A", near: "#3E5F4B", pillars: true },
  khuvsgul: { sky: ["#6FA9DD", "#DDEEFA"], sun: "#FFF6D0", far: "#6E8FA8", near: "#2F5D3A", water: "#2F6FA8", pines: true },
  gobi: { sky: ["#F0B37A", "#FBE3C4"], sun: "#FFF1D6", far: "#D99A5E", near: "#B97339", dunes: true },
  terelj: { sky: ["#7DB6E3", "#E8F3FB"], sun: "#FFF6D0", far: "#8FA37E", near: "#5E7D3E", ger: true },
  altai: { sky: ["#8DB2D8", "#EEF3F8"], sun: "#FFFFFF", far: "#C9D6E2", near: "#5B6F58", snow: true },
  khustai: { sky: ["#E9B872", "#F7E6C4"], sun: "#FFF1D0", far: "#B6A26B", near: "#7E8A45", ger: true },
  seoul: { sky: ["#C995C4", "#F3DDEE"], sun: "#FFF1F4", far: "#9C88A8", near: "#4A4263", city: true },
};

export function SceneArt({ scene, id }: { scene: SceneKey; id: string }) {
  const s = SCENES[scene];
  const g = `sky-${id}`;
  return (
    <svg className="art" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.sky[0]} />
          <stop offset="1" stopColor={s.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#${g})`} />
      <circle cx="310" cy="70" r="26" fill={s.sun} opacity=".95" />
      {s.dunes ? (
        <>
          <path d="M0 190 Q100 150 200 185 T400 175 V250 H0Z" fill={s.far} />
          <path d="M0 225 Q120 185 230 222 T400 210 V250 H0Z" fill={s.near} />
        </>
      ) : (
        <>
          <path d="M0 180 L60 130 L110 160 L170 105 L240 165 L300 125 L360 158 L400 140 V250 H0Z" fill={s.far} />
          {s.snow && <path d="M160 113 L170 105 L182 118 L176 116 L170 122 L164 116Z M292 132 L300 125 L310 135 L303 133 L298 138Z" fill="#fff" />}
          <path d="M0 215 Q90 185 180 208 T400 200 V250 H0Z" fill={s.near} />
        </>
      )}
      {s.water && (
        <>
          <rect x="0" y="225" width="400" height="25" fill={s.water} />
          <path d="M40 235 h40 M150 241 h60 M280 234 h50" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
        </>
      )}
      {s.city &&
        Array.from({ length: 14 }, (_, i) => {
          const w = 22 + ((i * 37) % 18);
          const h = 40 + ((i * 53) % 90);
          return <rect key={i} x={i * 30} y={250 - h} width={w} height={h} fill={s.near} opacity=".92" />;
        })}
      {s.palm && (
        <>
          <path d="M320 250 C318 200 322 170 330 140" stroke="#3A4A2A" strokeWidth="5" fill="none" />
          <path
            d="M330 140 q-30 -5 -45 15 M330 140 q30 -8 45 10 M330 140 q-12 -25 -35 -28 M330 140 q18 -24 38 -22"
            stroke="#2F6B3E"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      )}
      {s.pillars &&
        [40, 95, 140, 250, 300, 345].map((x, i) => {
          const h = 90 + ((i * 41) % 70);
          return <path key={x} d={`M${x} 260 L${x + 4} ${260 - h} Q${x + 14} ${250 - h} ${x + 26} ${258 - h} L${x + 30} 260Z`} fill={s.near} />;
        })}
      {s.pines &&
        Array.from({ length: 16 }, (_, i) => {
          const x = i * 26 + ((i * 7) % 10);
          const h = 30 + ((i * 13) % 22);
          return <path key={i} d={`M${x} 252 L${x + 9} ${252 - h} L${x + 18} 252Z`} fill="#1F4A2C" />;
        })}
      {s.ger && (
        <g transform="translate(250 205)">
          <path d="M0 30 V14 Q24 -6 48 14 V30Z" fill="#F7F4EC" />
          <path d="M0 14 Q24 -6 48 14" stroke="#B5462F" strokeWidth="3" fill="none" />
          <rect x="19" y="17" width="10" height="13" fill="#D9892B" />
        </g>
      )}
    </svg>
  );
}
