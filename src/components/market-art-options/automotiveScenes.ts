/*
 * Automotive MarketArt scene variants for internal preview (/automotive-art-options).
 * Shared visual language matches MarketArt.astro — not wired into live pages yet.
 */

export type AutomotiveVariant = 'current' | '1' | '2' | '3' | '4';

export const arcs = `
  <g stroke-opacity="0.1" stroke-width="2">
    <path d="M180 200 A140 140 0 0 1 320 60"/>
    <path d="M210 200 A110 110 0 0 1 320 90"/>
    <path d="M240 200 A80 80 0 0 1 320 120"/>
  </g>`;

export const glow = (id: string, cx: number, cy: number, r: number) => `
  <defs>
    <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#45556c" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#45556c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})" stroke="none"/>`;

export const automotiveScenes: Record<AutomotiveVariant, string> = {
  // CURRENT — curved windshield lite cross-section over a forming-line conveyor
  current: `
    ${glow('glow-auto-current', 160, 96, 80)}
    ${arcs}
    <g stroke-opacity="0.3" stroke-width="1.6">
      <path d="M36 164 H284"/>
      <circle cx="80" cy="170" r="4"/><circle cx="135" cy="170" r="4"/>
      <circle cx="190" cy="170" r="4"/><circle cx="245" cy="170" r="4"/>
    </g>
    <g stroke-opacity="0.55">
      <path d="M48 152 C92 74 228 74 272 152"/>
    </g>
    <g stroke-opacity="0.35" stroke-width="1.6">
      <path d="M48 140 C92 66 228 66 272 140"/>
      <path d="M48 152 V140"/><path d="M272 152 V140"/>
    </g>
    <circle cx="160" cy="84" r="4" fill="currentColor" stroke="none"/>`,

  // OPTION A — side silhouette: glass canopy hero over a subtle sedan outline
  '1': `
    ${glow('glow-auto-1', 152, 58, 88)}
    ${arcs}
    <g stroke-opacity="0.18" stroke-width="1.6">
      <path d="M36 168 H284"/>
    </g>
    <g stroke-opacity="0.28" stroke-width="1.6">
      <path d="M44 160 L58 146 L74 134 L86 128"/>
      <path d="M214 74 L248 96 L272 118 L284 146 L284 160"/>
      <path d="M44 160 H284"/>
      <path d="M86 160 C92 176 108 176 114 160"/>
      <path d="M206 160 C212 176 228 176 234 160"/>
    </g>
    <g stroke-opacity="0.22" stroke-width="1.6">
      <circle cx="100" cy="168" r="10"/>
      <circle cx="230" cy="168" r="10"/>
    </g>
    <g stroke-opacity="0.58">
      <path d="M86 128 C102 46 204 42 228 72"/>
    </g>
    <g stroke-opacity="0.36" stroke-width="1.6">
      <path d="M92 122 C106 54 198 50 222 68"/>
      <path d="M86 128 L92 122"/>
      <path d="M228 72 L222 68"/>
    </g>
    <circle cx="152" cy="46" r="4" fill="currentColor" stroke="none"/>`,

  // OPTION B — front three-quarter: hood converging lines + dominant curved windshield
  '2': `
    ${glow('glow-auto-2', 168, 64, 86)}
    ${arcs}
    <g stroke-opacity="0.18" stroke-width="1.6">
      <path d="M32 168 H288"/>
    </g>
    <g stroke-opacity="0.3" stroke-width="1.6">
      <path d="M112 132 L52 152 L36 142"/>
      <path d="M112 132 L168 138 L228 124"/>
      <path d="M228 124 L268 148 L276 168"/>
      <path d="M84 148 H148"/>
      <circle cx="108" cy="168" r="10"/>
    </g>
    <g stroke-opacity="0.58">
      <path d="M112 132 C104 48 196 36 248 88"/>
    </g>
    <g stroke-opacity="0.36" stroke-width="1.6">
      <path d="M118 126 C112 56 192 46 238 82"/>
      <path d="M112 132 L118 126"/>
      <path d="M248 88 L238 82"/>
      <path d="M248 88 L262 108"/>
    </g>
    <circle cx="168" cy="48" r="4" fill="currentColor" stroke="none"/>`,

  // OPTION C — glass on body: belt line + wheel arches with an exaggerated formed lite
  '3': `
    ${glow('glow-auto-3', 160, 72, 84)}
    ${arcs}
    <g stroke-opacity="0.18" stroke-width="1.6">
      <path d="M28 170 H292"/>
    </g>
    <g stroke-opacity="0.3" stroke-width="1.6">
      <path d="M40 168 H72 C82 148 98 148 108 168"/>
      <path d="M108 168 H212 C222 148 238 148 248 168"/>
      <path d="M248 168 H280"/>
      <path d="M52 136 H268"/>
      <path d="M64 152 H256" stroke-opacity="0.2"/>
    </g>
    <g stroke-opacity="0.22" stroke-width="1.6">
      <circle cx="90" cy="168" r="9"/>
      <circle cx="230" cy="168" r="9"/>
    </g>
    <g stroke-opacity="0.58">
      <path d="M52 132 C88 48 232 48 268 132"/>
    </g>
    <g stroke-opacity="0.38" stroke-width="1.6">
      <path d="M58 124 C90 56 230 56 262 124"/>
      <path d="M52 132 V124"/><path d="M268 132 V124"/>
      <path d="M52 132 L58 124"/><path d="M268 132 L262 124"/>
    </g>
    <circle cx="160" cy="52" r="4" fill="currentColor" stroke="none"/>`,

  // OPTION D — coupe profile: low fastback with a long curved roofline / windshield arc
  '4': `
    ${glow('glow-auto-4', 156, 50, 90)}
    ${arcs}
    <g stroke-opacity="0.18" stroke-width="1.6">
      <path d="M32 168 H288"/>
    </g>
    <g stroke-opacity="0.28" stroke-width="1.6">
      <path d="M36 160 L52 148 L64 138"/>
      <path d="M272 132 L286 148 L286 160 L36 160"/>
      <path d="M96 160 C102 174 116 174 122 160"/>
      <path d="M218 160 C224 174 238 174 244 160"/>
    </g>
    <g stroke-opacity="0.22" stroke-width="1.6">
      <circle cx="108" cy="168" r="8"/>
      <circle cx="232" cy="168" r="8"/>
    </g>
    <g stroke-opacity="0.58">
      <path d="M64 138 C78 44 228 40 272 96"/>
    </g>
    <g stroke-opacity="0.36" stroke-width="1.6">
      <path d="M70 132 C82 52 222 48 264 90"/>
      <path d="M64 138 L70 132"/>
      <path d="M272 96 L264 90"/>
    </g>
    <circle cx="156" cy="42" r="4" fill="currentColor" stroke="none"/>`,
};
