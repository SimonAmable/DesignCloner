import { toInlineStyle } from './css-from-computed';
import { escapeHtml, VOID_TAGS, type CaptureSnapshot, type SnapNode } from './serialize';

function classNameFor(i: number): string {
  return `dc-${i}`;
}

function emit(
  node: SnapNode,
  classMap: Map<SnapNode, string>,
): string {
  if (node.kind === 'text') return escapeHtml(node.text);
  const cls = classMap.get(node);
  const extra = node.attrs.class ? ` ${escapeHtml(node.attrs.class)}` : '';
  const parts: string[] = [];
  if (cls) parts.push(`class="${cls}${extra}"`);
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === 'class') continue;
    parts.push(`${k}="${escapeHtml(v)}"`);
  }
  const attrStr = parts.length ? ' ' + parts.join(' ') : '';
  const open = `<${node.tag}${attrStr}>`;
  if (VOID_TAGS.has(node.tag)) return open;
  return `${open}${node.children.map((c) => emit(c, classMap)).join('')}</${node.tag}>`;
}

function collectClasses(node: SnapNode, map: Map<SnapNode, string>, i: { n: number }): void {
  if (node.kind !== 'element') return;
  if (Object.keys(node.styles).length) {
    map.set(node, classNameFor(i.n++));
  }
  for (const c of node.children) collectClasses(c, map, i);
  if (node.pseudoBefore || node.pseudoAfter) {
    if (!map.has(node)) map.set(node, classNameFor(i.n++));
  }
}

export function toHtmlDocument(snap: CaptureSnapshot): string {
  const map = new Map<SnapNode, string>();
  collectClasses(snap.root, map, { n: 0 });
  const rules: string[] = [];
  for (const [node, cls] of map) {
    const body = toInlineStyle(node.styles);
    if (body) rules.push(`.${cls} { ${body} }`);
    if (node.pseudoBefore) {
      rules.push(`.${cls}::before { ${toInlineStyle(node.pseudoBefore.styles)} }`);
    }
    if (node.pseudoAfter) {
      rules.push(`.${cls}::after { ${toInlineStyle(node.pseudoAfter.styles)} }`);
    }
  }
  for (const kf of snap.keyframes) rules.push(kf);
  const css = rules.join('\n');
  const html = emit(snap.root, map);
  return `<style>\n${css}\n</style>\n${html}`;
}
