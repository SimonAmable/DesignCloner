const SPACING: Record<string, number> = {
  '0': 0,
  px: 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
  '36': 144,
  '40': 160,
  '44': 176,
  '48': 192,
  '52': 208,
  '56': 224,
  '60': 240,
  '64': 256,
  '72': 288,
  '80': 320,
  '96': 384,
};

const FONT_SIZE: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
  '8xl': 96,
  '9xl': 128,
};

const RADIUS: Record<string, number> = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

const FONT_WEIGHT: Record<string, string> = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

function parsePx(v: string): number | null {
  const m = /^(-?[\d.]+)px$/.exec(v.trim());
  return m ? Number(m[1]) : null;
}

function closestKey(px: number, table: Record<string, number>, tol = 0.51): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const [k, val] of Object.entries(table)) {
    const d = Math.abs(val - px);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  if (best !== null && bestD <= tol) return best;
  return null;
}

function spacingToken(px: number): string {
  const k = closestKey(px, SPACING, 0.6);
  if (k === 'DEFAULT') return '';
  if (k) return k;
  if (Number.isInteger(px)) return `[${px}px]`;
  return `[${px}px]`;
}

function rgbToHex(v: string): string | null {
  const m =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(v) ||
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(v);
  if (!m) {
    if (v.startsWith('#') || v === 'transparent' || v === 'currentcolor') return v;
    return null;
  }
  const r = Math.round(Number(m[1]));
  const g = Math.round(Number(m[2]));
  const b = Math.round(Number(m[3]));
  const a = m[4] === undefined ? 1 : Number(m[4]);
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
  if (a < 1) {
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}${Math.round(a * 255)
      .toString(16)
      .padStart(2, '0')}`;
  }
  return hex;
}

function colorClass(prefix: string, value: string): string {
  const hex = rgbToHex(value);
  if (!hex) return `${prefix}-[${value.replace(/\s+/g, '_')}]`;
  if (hex === 'transparent') return `${prefix}-transparent`;
  return `${prefix}-[${hex}]`;
}

function fourSides(
  prefix: 'p' | 'm',
  top: string | undefined,
  right: string | undefined,
  bottom: string | undefined,
  left: string | undefined,
  shorthand: string | undefined,
): string[] {
  const out: string[] = [];
  if (shorthand && !top && !right) {
    const parts = shorthand.split(/\s+/);
    const nums = parts.map(parsePx);
    if (nums.every((n) => n !== null)) {
      const [t, r, b, l] = [
        nums[0]!,
        nums[1] ?? nums[0]!,
        nums[2] ?? nums[0]!,
        nums[3] ?? nums[1] ?? nums[0]!,
      ];
      if (t === r && r === b && b === l) return [`${prefix}-${spacingToken(t)}`];
      if (t === b && r === l) return [`${prefix}y-${spacingToken(t)}`, `${prefix}x-${spacingToken(r)}`];
      return [
        `${prefix}t-${spacingToken(t)}`,
        `${prefix}r-${spacingToken(r)}`,
        `${prefix}b-${spacingToken(b)}`,
        `${prefix}l-${spacingToken(l)}`,
      ];
    }
  }
  const map: [string, string | undefined][] = [
    [`${prefix}t`, top],
    [`${prefix}r`, right],
    [`${prefix}b`, bottom],
    [`${prefix}l`, left],
  ];
  for (const [pre, val] of map) {
    if (!val) continue;
    const px = parsePx(val);
    if (px === null) continue;
    if (prefix === 'm' && px < 0) out.push(`-${pre}-${spacingToken(-px)}`);
    else out.push(`${pre}-${spacingToken(px)}`);
  }
  return out;
}

export function stylesToTailwind(styles: Record<string, string>): {
  classes: string[];
  leftover: Record<string, string>;
} {
  const leftover: Record<string, string> = { ...styles };
  const classes: string[] = [];

  const take = (key: string): string | undefined => {
    const v = leftover[key];
    if (v !== undefined) delete leftover[key];
    return v;
  };

  const display = take('display');
  if (display === 'flex') classes.push('flex');
  else if (display === 'inline-flex') classes.push('inline-flex');
  else if (display === 'grid') classes.push('grid');
  else if (display === 'inline-grid') classes.push('inline-grid');
  else if (display === 'block') classes.push('block');
  else if (display === 'inline-block') classes.push('inline-block');
  else if (display === 'inline') classes.push('inline');
  else if (display === 'none') classes.push('hidden');
  else if (display === 'contents') classes.push('contents');
  else if (display) leftover.display = display;

  const pos = take('position');
  if (pos === 'relative') classes.push('relative');
  else if (pos === 'absolute') classes.push('absolute');
  else if (pos === 'fixed') classes.push('fixed');
  else if (pos === 'sticky') classes.push('sticky');
  else if (pos === 'static') classes.push('static');
  else if (pos) leftover.position = pos;

  for (const side of ['top', 'right', 'bottom', 'left'] as const) {
    const v = take(side);
    if (!v) continue;
    const px = parsePx(v);
    if (px === null) leftover[side] = v;
    else classes.push(`${side}-${spacingToken(px)}`);
  }

  const dir = take('flex-direction');
  if (dir === 'column') classes.push('flex-col');
  else if (dir === 'column-reverse') classes.push('flex-col-reverse');
  else if (dir === 'row-reverse') classes.push('flex-row-reverse');
  else if (dir === 'row') classes.push('flex-row');
  else if (dir) leftover['flex-direction'] = dir;

  const wrap = take('flex-wrap');
  if (wrap === 'wrap') classes.push('flex-wrap');
  else if (wrap === 'wrap-reverse') classes.push('flex-wrap-reverse');
  else if (wrap === 'nowrap') classes.push('flex-nowrap');
  else if (wrap) leftover['flex-wrap'] = wrap;

  const ai = take('align-items');
  const aiMap: Record<string, string> = {
    'flex-start': 'items-start',
    'flex-end': 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
    start: 'items-start',
    end: 'items-end',
  };
  if (ai && aiMap[ai]) classes.push(aiMap[ai]);
  else if (ai) leftover['align-items'] = ai;

  const jc = take('justify-content');
  const jcMap: Record<string, string> = {
    'flex-start': 'justify-start',
    'flex-end': 'justify-end',
    center: 'justify-center',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
    start: 'justify-start',
    end: 'justify-end',
  };
  if (jc && jcMap[jc]) classes.push(jcMap[jc]);
  else if (jc) leftover['justify-content'] = jc;

  const gap = take('gap');
  const cg = take('column-gap');
  const rg = take('row-gap');
  if (gap) {
    const px = parsePx(gap);
    if (px !== null) classes.push(`gap-${spacingToken(px)}`);
    else leftover.gap = gap;
  } else {
    if (cg) {
      const px = parsePx(cg);
      if (px !== null) classes.push(`gap-x-${spacingToken(px)}`);
      else leftover['column-gap'] = cg;
    }
    if (rg) {
      const px = parsePx(rg);
      if (px !== null) classes.push(`gap-y-${spacingToken(px)}`);
      else leftover['row-gap'] = rg;
    }
  }

  classes.push(
    ...fourSides(
      'p',
      take('padding-top'),
      take('padding-right'),
      take('padding-bottom'),
      take('padding-left'),
      take('padding'),
    ),
  );
  classes.push(
    ...fourSides(
      'm',
      take('margin-top'),
      take('margin-right'),
      take('margin-bottom'),
      take('margin-left'),
      take('margin'),
    ),
  );

  const w = take('width');
  if (w === '100%') classes.push('w-full');
  else if (w === '100vw') classes.push('w-screen');
  else if (w === 'auto') classes.push('w-auto');
  else if (w) {
    const px = parsePx(w);
    classes.push(px !== null ? `w-${spacingToken(px)}` : `w-[${w}]`);
  }
  const h = take('height');
  if (h === '100%') classes.push('h-full');
  else if (h === '100vh') classes.push('h-screen');
  else if (h === 'auto') classes.push('h-auto');
  else if (h) {
    const px = parsePx(h);
    classes.push(px !== null ? `h-${spacingToken(px)}` : `h-[${h}]`);
  }

  const mw = take('max-width');
  if (mw && mw !== 'none') {
    const px = parsePx(mw);
    classes.push(px !== null ? `max-w-[${px}px]` : `max-w-[${mw}]`);
  }
  const mh = take('max-height');
  if (mh && mh !== 'none') {
    const px = parsePx(mh);
    classes.push(px !== null ? `max-h-[${px}px]` : `max-h-[${mh}]`);
  }

  const fs = take('font-size');
  if (fs) {
    const px = parsePx(fs);
    if (px !== null) {
      const tok = closestKey(px, FONT_SIZE, 1);
      classes.push(tok ? `text-${tok}` : `text-[${px}px]`);
    } else leftover['font-size'] = fs;
  }

  const fw = take('font-weight');
  if (fw) {
    const named = Object.entries(FONT_WEIGHT).find(([, n]) => n === fw)?.[0];
    if (named && named !== 'normal') classes.push(`font-${named}`);
    else if (fw !== '400' && fw !== 'normal') classes.push(`font-[${fw}]`);
  }

  const lh = take('line-height');
  if (lh && lh !== 'normal') {
    const px = parsePx(lh);
    classes.push(px !== null ? `leading-[${px}px]` : `leading-[${lh}]`);
  }

  const ls = take('letter-spacing');
  if (ls && ls !== 'normal') {
    const px = parsePx(ls);
    classes.push(px !== null ? `tracking-[${px}px]` : `tracking-[${ls}]`);
  }

  const ta = take('text-align');
  if (ta === 'center') classes.push('text-center');
  else if (ta === 'right') classes.push('text-right');
  else if (ta === 'left') classes.push('text-left');
  else if (ta === 'justify') classes.push('text-justify');
  else if (ta) leftover['text-align'] = ta;

  const color = take('color');
  if (color) classes.push(colorClass('text', color));
  const bg = take('background-color');
  if (bg) classes.push(colorClass('bg', bg));
  take('background');
  const bgi = take('background-image');
  if (bgi && bgi !== 'none') leftover['background-image'] = bgi;

  const br = take('border-radius');
  if (br) {
    const px = parsePx(br.split(' ')[0] ?? br);
    if (px !== null) {
      const tok = closestKey(px, RADIUS, 1);
      if (tok === 'DEFAULT') classes.push('rounded');
      else if (tok) classes.push(`rounded-${tok}`);
      else classes.push(`rounded-[${px}px]`);
    } else leftover['border-radius'] = br;
  }

  const bw = take('border-width');
  const bstyle = take('border-style');
  const bc = take('border-color');
  take('border');
  take('border-top');
  take('border-right');
  take('border-bottom');
  take('border-left');
  if (bstyle && bstyle !== 'none') {
    const px = bw ? parsePx(bw.split(' ')[0] ?? bw) : 1;
    if (px === 1 || px === null) classes.push('border');
    else if (px === 0) {
      /* skip */
    } else if (px === 2) classes.push('border-2');
    else if (px === 4) classes.push('border-4');
    else if (px === 8) classes.push('border-8');
    else classes.push(`border-[${px}px]`);
    if (bc) classes.push(colorClass('border', bc));
  }

  const shadow = take('box-shadow');
  if (shadow && shadow !== 'none') classes.push(`shadow-[${shadow.replace(/\s+/g, '_')}]`);

  const op = take('opacity');
  if (op && op !== '1') {
    const n = Number(op);
    if (!Number.isNaN(n)) classes.push(`opacity-[${n}]`);
  }

  const overflow = take('overflow');
  if (overflow === 'hidden') classes.push('overflow-hidden');
  else if (overflow === 'auto') classes.push('overflow-auto');
  else if (overflow === 'scroll') classes.push('overflow-scroll');
  else if (overflow) leftover.overflow = overflow;

  const z = take('z-index');
  if (z && z !== 'auto') classes.push(`z-[${z}]`);

  const ofit = take('object-fit');
  if (ofit === 'cover') classes.push('object-cover');
  else if (ofit === 'contain') classes.push('object-contain');
  else if (ofit) leftover['object-fit'] = ofit;

  const tform = take('transform');
  if (tform && tform !== 'none') leftover.transform = tform;

  take('font');
  const ff = take('font-family');
  if (ff) leftover['font-family'] = ff;

  const box = take('box-sizing');
  if (box === 'border-box') classes.push('box-border');
  else if (box === 'content-box') classes.push('box-content');

  take('flex-flow');
  take('inset');

  const grow = take('flex-grow');
  if (grow === '1') classes.push('grow');
  else if (grow === '0') classes.push('grow-0');
  else if (grow) leftover['flex-grow'] = grow;
  const shrink = take('flex-shrink');
  if (shrink === '1') classes.push('shrink');
  else if (shrink === '0') classes.push('shrink-0');
  else if (shrink) leftover['flex-shrink'] = shrink;
  take('flex-basis');
  take('flex');

  const gtc = take('grid-template-columns');
  if (gtc && gtc !== 'none') leftover['grid-template-columns'] = gtc;
  take('grid-template-rows');
  take('grid');

  return { classes: classes.filter(Boolean), leftover };
}
