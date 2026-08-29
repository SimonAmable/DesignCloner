const LAYOUT_PROPS = [
  'display',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'inset',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'flex-flow',
  'align-items',
  'align-content',
  'align-self',
  'justify-content',
  'justify-items',
  'justify-self',
  'place-items',
  'place-content',
  'gap',
  'column-gap',
  'row-gap',
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-flow',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-area',
  'grid-column',
  'grid-row',
  'color',
  'background',
  'background-color',
  'background-image',
  'background-size',
  'background-position',
  'background-repeat',
  'background-clip',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-transform',
  'text-overflow',
  'white-space',
  'word-break',
  'box-shadow',
  'opacity',
  'transform',
  'filter',
  'backdrop-filter',
  'overflow',
  'overflow-x',
  'overflow-y',
  'z-index',
  'object-fit',
  'object-position',
  'box-sizing',
  'vertical-align',
  'cursor',
  'transition',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'transform-origin',
  'translate',
  'rotate',
  'scale',
  'will-change',
  'mix-blend-mode',
  'pointer-events',
  'user-select',
  'list-style',
  'outline',
  'visibility',
  'clip-path',
  'aspect-ratio',
] as const;

const INHERITED = new Set([
  'color',
  'font',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'visibility',
  'cursor',
]);

const DEFAULT_DISPLAY: Record<string, string> = {
  DIV: 'block',
  P: 'block',
  SECTION: 'block',
  ARTICLE: 'block',
  HEADER: 'block',
  FOOTER: 'block',
  MAIN: 'block',
  NAV: 'block',
  ASIDE: 'block',
  H1: 'block',
  H2: 'block',
  H3: 'block',
  H4: 'block',
  H5: 'block',
  H6: 'block',
  UL: 'block',
  OL: 'block',
  LI: 'list-item',
  SPAN: 'inline',
  A: 'inline',
  STRONG: 'inline',
  EM: 'inline',
  CODE: 'inline',
  IMG: 'inline',
  SVG: 'inline',
  BUTTON: 'inline-block',
  INPUT: 'inline-block',
  LABEL: 'inline',
  TABLE: 'table',
  TR: 'table-row',
  TD: 'table-cell',
  TH: 'table-cell',
};

const ZEROISH = new Set(['0px', '0', 'none', 'normal', 'auto', 'static', 'visible', 'stretch']);

function isNoise(prop: string, value: string, tag: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v === 'none' && prop !== 'display') return true;
  if (prop === 'display' && DEFAULT_DISPLAY[tag] === v) return true;
  if (prop === 'position' && v === 'static') return true;
  if (prop === 'opacity' && v === '1') return true;
  if (prop === 'z-index' && (v === 'auto' || v === '0')) return true;
  if (prop === 'box-sizing' && v === 'content-box') return true;
  if (prop === 'font-style' && v === 'normal') return true;
  if (prop === 'font-weight' && (v === '400' || v === 'normal')) return true;
  if (prop === 'letter-spacing' && (v === 'normal' || v === '0px')) return true;
  if (prop === 'text-decoration' && (v.startsWith('none') || v === 'none')) return true;
  if (prop === 'text-transform' && v === 'none') return true;
  if (prop === 'text-align' && v === 'start') return true;
  if (prop === 'overflow' && v === 'visible') return true;
  if (prop === 'overflow-x' && v === 'visible') return true;
  if (prop === 'overflow-y' && v === 'visible') return true;
  if (prop === 'background-image' && v === 'none') return true;
  if (prop === 'background-color' && (v === 'rgba(0, 0, 0, 0)' || v === 'transparent')) return true;
  if (prop === 'border-style' && v === 'none') return true;
  if (prop === 'transform' && v === 'none') return true;
  if (prop === 'filter' && v === 'none') return true;
  if (prop === 'backdrop-filter' && v === 'none') return true;
  if (prop === 'box-shadow' && v === 'none') return true;
  if (prop === 'outline' && (v === 'none' || v.includes('0px'))) return true;
  if (prop === 'transition' && (v === 'none' || v.startsWith('all 0s'))) return true;
  if (prop === 'animation' && (v === 'none' || v.startsWith('none'))) return true;
  if (prop.includes('margin') || prop.includes('padding')) {
    if (v === '0px' || v === '0px 0px 0px 0px') return true;
  }
  if (prop === 'gap' || prop === 'column-gap' || prop === 'row-gap') {
    if (v === 'normal' || v === '0px') return true;
  }
  if (ZEROISH.has(v) && (prop === 'top' || prop === 'right' || prop === 'bottom' || prop === 'left')) {
    return true;
  }
  if (prop === 'flex' && (v === '0 1 auto' || v === 'none')) return true;
  if (prop === 'flex-grow' && v === '0') return true;
  if (prop === 'flex-shrink' && v === '1') return true;
  if (prop === 'flex-basis' && v === 'auto') return true;
  if (prop === 'flex-flow' && (v === 'row nowrap' || v === 'nowrap' || v === 'row')) return true;
  if (prop === 'flex-direction' && v === 'row') return true;
  if (prop === 'flex-wrap' && v === 'nowrap') return true;
  if (prop === 'align-items' && (v === 'normal' || v === 'stretch')) return true;
  if (prop === 'align-content' && (v === 'normal' || v === 'stretch')) return true;
  if (prop === 'align-self' && (v === 'auto' || v === 'normal' || v === 'stretch')) return true;
  if (prop === 'justify-content' && v === 'normal') return true;
  if (prop === 'justify-items' && (v === 'normal' || v === 'stretch')) return true;
  if (prop === 'justify-self' && (v === 'auto' || v === 'normal' || v === 'stretch')) return true;
  if (prop === 'place-items' && (v === 'normal' || v === 'stretch')) return true;
  if (prop === 'place-content' && (v === 'normal' || v === 'stretch')) return true;
  if (prop === 'grid-area' && v === 'auto') return true;
  if (prop === 'grid-column' && v === 'auto') return true;
  if (prop === 'grid-row' && v === 'auto') return true;
  if (prop === 'grid-auto-flow' && v === 'row') return true;
  if (prop === 'grid-auto-columns' && v === 'auto') return true;
  if (prop === 'grid-auto-rows' && v === 'auto') return true;
  if (prop === 'inset' && v === 'auto') return true;
  if (prop === 'min-width' && (v === '0px' || v === 'auto')) return true;
  if (prop === 'min-height' && (v === '0px' || v === 'auto')) return true;
  if (prop === 'max-width' && v === 'none') return true;
  if (prop === 'max-height' && v === 'none') return true;
  if (prop.startsWith('border') && /^0px(\s+solid)?(\s+rgb\([^)]+\))?$/.test(v)) return true;
  if (prop.includes('border') && prop.includes('radius') && (v === '0px' || v === '0px 0px 0px 0px'))
    return true;
  if (prop === 'object-fit' && v === 'fill') return true;
  if (prop === 'object-position' && v === '50% 50%') return true;
  if (prop === 'aspect-ratio' && v === 'auto') return true;
  if (prop === 'white-space' && v === 'normal') return true;
  if (prop === 'word-break' && v === 'normal') return true;
  if (prop === 'text-overflow' && v === 'clip') return true;
  if (prop === 'transition' && (v === 'all' || v === 'all 0s ease 0s')) return true;
  if (prop === 'cursor' && v === 'auto') return true;
  if (prop === 'vertical-align' && v === 'baseline') return true;
  if (prop === 'visibility' && v === 'visible') return true;
  if (prop === 'list-style' && v.includes('outside')) return true;
  if (prop === 'will-change' && v === 'auto') return true;
  if (prop === 'mix-blend-mode' && v === 'normal') return true;
  if (prop === 'pointer-events' && v === 'auto') return true;
  if (prop === 'user-select' && (v === 'auto' || v === 'text')) return true;
  if (prop === 'transform-origin' && (v === '50% 50%' || v === '50% 50% 0px')) return true;
  if ((prop === 'translate' || prop === 'rotate' || prop === 'scale') && v === 'none') return true;
  if (prop.startsWith('animation-') && (v === 'none' || v === '0s' || v === 'normal' || v === '1' || v === 'running' || v === 'none 0s ease 0s 1 normal none running'))
    return true;
  if (prop.startsWith('transition-') && (v === 'all' || v === '0s' || v === 'ease' || v === '0s' || v === 'none'))
    return true;
  return false;
}

const SHORTHAND_DROPS: Record<string, string[]> = {
  border: [
    'border-width',
    'border-style',
    'border-color',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
  ],
  margin: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
  padding: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'],
  background: [
    'background-color',
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-clip',
  ],
  font: ['font-family', 'font-size', 'font-weight', 'font-style', 'line-height'],
  grid: [
    'grid-template',
    'grid-template-columns',
    'grid-template-rows',
    'grid-template-areas',
    'grid-auto-flow',
    'grid-auto-columns',
    'grid-auto-rows',
  ],
  'grid-template': ['grid-template-columns', 'grid-template-rows', 'grid-template-areas'],
  flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
  'flex-flow': ['flex-direction', 'flex-wrap'],
  overflow: ['overflow-x', 'overflow-y'],
  transition: [
    'transition-property',
    'transition-duration',
    'transition-timing-function',
    'transition-delay',
  ],
  animation: [
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
  ],
  inset: ['top', 'right', 'bottom', 'left'],
  'place-items': ['align-items', 'justify-items'],
  'place-content': ['align-content', 'justify-content'],
};

function dropRedundantShorthands(styles: Record<string, string>): void {
  for (const [shorthand, longs] of Object.entries(SHORTHAND_DROPS)) {
    if (!(shorthand in styles)) continue;
    if (longs.some((k) => k in styles)) delete styles[shorthand];
  }
}

export function stylesFromComputed(
  cs: CSSStyleDeclaration,
  tag: string,
  parent?: Record<string, string>,
  opts?: { isRoot?: boolean },
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of LAYOUT_PROPS) {
    const value = cs.getPropertyValue(prop);
    if (!value) continue;
    if (isNoise(prop, value, tag)) continue;
    if (parent && INHERITED.has(prop) && parent[prop] === value.trim() && !opts?.isRoot) {
      continue;
    }
    if (
      (prop === 'width' || prop === 'height') &&
      !opts?.isRoot &&
      (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'P' || tag === 'SPAN')
    ) {
      // Keep used size on root; skip stretchy blocks unless max/min also set.
      continue;
    }
    out[prop] = value.trim();
  }

  if (opts?.isRoot) {
    const w = cs.getPropertyValue('width').trim();
    const h = cs.getPropertyValue('height').trim();
    if (w) out.width = w;
    if (h) out.height = h;
    const box = cs.getPropertyValue('box-sizing').trim();
    if (box) out['box-sizing'] = box;
  }

  dropRedundantShorthands(out);
  return out;
}

export function toInlineStyle(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

export function rewriteCssUrls(value: string, baseHref: string): string {
  return value.replace(/url\((['"]?)(.*?)\1\)/g, (_m, q: string, url: string) => {
    const trimmed = url.trim();
    if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return `url(${q}${trimmed}${q})`;
    }
    try {
      return `url(${q}${new URL(trimmed, baseHref).href}${q})`;
    } catch {
      return `url(${q}${trimmed}${q})`;
    }
  });
}
