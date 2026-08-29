import { toInlineStyle } from './css-from-computed';
import { escapeHtml, VOID_TAGS, type SnapNode } from './serialize';

function attrsHtml(node: SnapNode, style: string): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === 'className') continue;
    parts.push(`${k}="${escapeHtml(v)}"`);
  }
  if (style) parts.push(`style="${escapeHtml(style)}"`);
  return parts.length ? ' ' + parts.join(' ') : '';
}

function emit(node: SnapNode): string {
  if (node.kind === 'text') return escapeHtml(node.text);
  const style = toInlineStyle(node.styles);
  const open = `<${node.tag}${attrsHtml(node, style)}>`;
  if (VOID_TAGS.has(node.tag)) return open;
  const inner = node.children.map(emit).join('');
  return `${open}${inner}</${node.tag}>`;
}

export function toInlineCss(root: SnapNode): string {
  return emit(root);
}
