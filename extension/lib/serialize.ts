import { rewriteCssUrls, stylesFromComputed } from './css-from-computed';
import { captureInteractions } from './interactions';

export type SnapKind = 'element' | 'text';

export type SnapNode = {
  kind: SnapKind;
  tag: string;
  attrs: Record<string, string>;
  text: string;
  styles: Record<string, string>;
  children: SnapNode[];
  svg: boolean;
  pseudoBefore?: { content: string; styles: Record<string, string> };
  pseudoAfter?: { content: string; styles: Record<string, string> };
};

export type CaptureSnapshot = {
  root: SnapNode;
  notes: string[];
  fonts: string[];
  keyframes: string[];
  interactionCss: string;
  nodeCount: number;
  large: boolean;
};

const EVENT_ATTR = /^on/i;
const SKIP_TAGS = new Set([
  'SCRIPT',
  'NOSCRIPT',
  'LINK',
  'META',
  'STYLE',
  'DESIGN-CLONE-ROOT',
]);

function absUrl(value: string, base: string): string {
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}

function rewriteSrcset(value: string, base: string): string {
  return value
    .split(',')
    .map((part) => {
      const bits = part.trim().split(/\s+/);
      if (!bits[0]) return part.trim();
      bits[0] = absUrl(bits[0], base);
      return bits.join(' ');
    })
    .join(', ');
}

function shouldStripValue(el: Element): boolean {
  if (!(el instanceof HTMLInputElement) && !(el instanceof HTMLTextAreaElement)) return false;
  const type = 'type' in el ? el.type : '';
  return type === 'password' || type === 'email' || type === 'tel' || type === 'hidden';
}

function snapshotPseudo(
  el: Element,
  which: '::before' | '::after',
  parentStyles: Record<string, string>,
  base: string,
): { content: string; styles: Record<string, string> } | undefined {
  const cs = getComputedStyle(el, which);
  const content = cs.getPropertyValue('content');
  if (!content || content === 'none' || content === 'normal') return undefined;
  const styles = stylesFromComputed(cs, 'SPAN', parentStyles);
  for (const k of Object.keys(styles)) {
    const cur = styles[k];
    if (cur) styles[k] = rewriteCssUrls(cur, base);
  }
  styles.content = content;
  return { content, styles };
}

function walkNode(
  node: Node,
  notes: string[],
  fonts: Set<string>,
  parentStyles: Record<string, string> | undefined,
  isRoot: boolean,
  base: string,
  counter: { n: number },
): SnapNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (!text.trim() && text.indexOf('\n') >= 0 && !text.replace(/\s/g, '')) {
      return null;
    }
    if (!text) return null;
    return {
      kind: 'text',
      tag: '',
      attrs: {},
      text,
      styles: {},
      children: [],
      svg: false,
    };
  }
  if (!(node instanceof Element)) return null;
  const tag = node.tagName;
  if (SKIP_TAGS.has(tag)) return null;
  if (tag === 'IFRAME') {
    notes.push('Cross-origin iframe not captured.');
    // Same-origin iframes are still skipped in v1 to keep output small.
    return {
      kind: 'element',
      tag: 'iframe',
      attrs: { title: node.getAttribute('title') || 'iframe (not captured)' },
      text: '',
      styles: {},
      children: [],
      svg: false,
    };
  }

  counter.n += 1;
  const cs = getComputedStyle(node);
  if (cs.display === 'none') return null;

  const styles = stylesFromComputed(cs, tag, parentStyles, { isRoot });
  for (const k of Object.keys(styles)) {
    const cur = styles[k];
    if (cur) styles[k] = rewriteCssUrls(cur, base);
  }
  const ff = cs.fontFamily;
  if (ff) fonts.add(ff);

  const attrs: Record<string, string> = {};
  for (const attr of node.attributes) {
    if (EVENT_ATTR.test(attr.name)) continue;
    if (attr.name === 'style') continue;
    let value = attr.value;
    if (attr.name === 'src' || (attr.name === 'href' && tag === 'IMG')) {
      value = absUrl(value, base);
    } else if (attr.name === 'srcset') {
      value = rewriteSrcset(value, base);
    } else if (attr.name === 'href' && tag === 'IMG') {
      value = absUrl(value, base);
    }
    attrs[attr.name] = value;
  }
  if (shouldStripValue(node)) {
    delete attrs.value;
  }
  if (tag === 'CANVAS' || tag === 'VIDEO') {
    notes.push(`${tag.toLowerCase()} element kept without rasterizing.`);
  }

  const children: SnapNode[] = [];
  const shadow = node instanceof HTMLElement ? node.shadowRoot : null;
  const visitList: Node[] = [];
  if (shadow) {
    shadow.childNodes.forEach((c) => visitList.push(c));
  }
  node.childNodes.forEach((c) => visitList.push(c));

  for (const child of visitList) {
    const snap = walkNode(child, notes, fonts, styles, false, base, counter);
    if (snap) children.push(snap);
  }

  const svg = tag.toLowerCase() === 'svg' || node instanceof SVGElement;
  return {
    kind: 'element',
    tag: tag.toLowerCase(),
    attrs,
    text: '',
    styles,
    children,
    svg,
    pseudoBefore: snapshotPseudo(node, '::before', styles, base),
    pseudoAfter: snapshotPseudo(node, '::after', styles, base),
  };
}

export function captureElement(el: Element): CaptureSnapshot {
  const notes: string[] = [];
  const fonts = new Set<string>();
  const counter = { n: 0 };
  const root = walkNode(el, notes, fonts, undefined, true, location.href, counter);
  if (!root || root.kind !== 'element') {
    throw new Error('Could not capture element');
  }
  const blob = JSON.stringify(root);
  const interactions = captureInteractions(el);
  const keyframes = interactions.keyframes.filter((k) => {
    const nameMatch = /@keyframes\s+([^\s{]+)/.exec(k);
    const name = nameMatch?.[1];
    if (!name) return false;
    return blob.includes(name) || interactions.css.includes(name);
  });
  if (keyframes.length) {
    notes.push(`Included ${keyframes.length} @keyframes rule(s) by name.`);
  }
  if (interactions.ruleCount) {
    notes.push(
      `Included ${interactions.ruleCount} hover/focus/active CSS rule(s) from the page stylesheets.`,
    );
  }
  if (interactions.blockedSheets) {
    notes.push(
      `${interactions.blockedSheets} cross-origin stylesheet(s) could not be read — some hover motion may be missing.`,
    );
  }
  notes.push(
    'JS-only motion (Framer Motion, GSAP, WAAPI) is not in CSS; recreate equivalent transitions from the interaction block when present.',
  );
  const serializedGuess = blob.length + interactions.css.length;
  const large = counter.n > 1500 || serializedGuess > 400_000;
  return {
    root,
    notes: [...new Set(notes)],
    fonts: [...fonts],
    keyframes,
    interactionCss: interactions.css,
    nodeCount: counter.n,
    large,
  };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
