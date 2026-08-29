import { escapeHtml, VOID_TAGS, type SnapNode } from './serialize';
import { stylesToTailwind } from './to-tailwind';
import { toInlineStyle } from './css-from-computed';

function attrToJsx(name: string): string {
  if (name === 'class') return 'className';
  if (name === 'for') return 'htmlFor';
  if (name === 'tabindex') return 'tabIndex';
  if (name === 'readonly') return 'readOnly';
  if (name === 'maxlength') return 'maxLength';
  if (name === 'minlength') return 'minLength';
  if (name === 'colspan') return 'colSpan';
  if (name === 'rowspan') return 'rowSpan';
  if (name === 'cellpadding') return 'cellPadding';
  if (name === 'cellspacing') return 'cellSpacing';
  if (name === 'srcset') return 'srcSet';
  if (name === 'crossorigin') return 'crossOrigin';
  if (name === 'autoplay') return 'autoPlay';
  if (name === 'playsinline') return 'playsInline';
  if (name === 'viewbox') return 'viewBox';
  if (name.includes('-') && name.startsWith('data-')) return name;
  if (name.includes('-')) {
    return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  }
  return name;
}

function styleObject(styles: Record<string, string>): string {
  const entries = Object.entries(styles).map(([k, v]) => {
    const camel = k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    return `${camel}: ${JSON.stringify(v)}`;
  });
  return `{${entries.join(', ')}}`;
}

function emit(
  node: SnapNode,
  indent: string,
  mode: 'tailwind' | 'inline',
): string {
  if (node.kind === 'text') {
    const t = node.text.replace(/\{/g, '{"{"}').replace(/\}/g, '{"}"}');
    return indent + t;
  }

  const { classes, leftover } =
    mode === 'tailwind'
      ? stylesToTailwind(node.styles)
      : { classes: [] as string[], leftover: node.styles };

  const props: string[] = [];
  const origClass = node.attrs.class;
  const tw = classes.join(' ');
  const cls = [tw, origClass].filter(Boolean).join(' ');
  if (cls) props.push(`className=${JSON.stringify(cls)}`);
  if (Object.keys(leftover).length) {
    props.push(`style={${styleObject(leftover)}}`);
  }
  for (const [k, v] of Object.entries(node.attrs)) {
    if (k === 'class' || k === 'style') continue;
    const jsxName = attrToJsx(k);
    if (v === '' && k !== 'value') {
      props.push(jsxName);
      continue;
    }
    props.push(`${jsxName}=${JSON.stringify(v)}`);
  }

  const propStr = props.length ? ' ' + props.join(' ') : '';
  if (VOID_TAGS.has(node.tag)) {
    return `${indent}<${node.tag}${propStr} />`;
  }
  if (node.children.length === 0) {
    return `${indent}<${node.tag}${propStr} />`;
  }
  const inner = node.children.map((c) => emit(c, indent + '  ', mode)).join('\n');
  return `${indent}<${node.tag}${propStr}>\n${inner}\n${indent}</${node.tag}>`;
}

export function toJsxComponent(root: SnapNode, mode: 'tailwind' | 'inline'): string {
  const body = emit(root, '    ', mode);
  return [
    'export default function ClonedBlock() {',
    '  return (',
    body,
    '  );',
    '}',
    '',
  ].join('\n');
}

export function toTailwindHtml(root: SnapNode): string {
  function emitHtml(node: SnapNode): string {
    if (node.kind === 'text') return escapeHtml(node.text);
    const { classes, leftover } = stylesToTailwind(node.styles);
    const orig = node.attrs.class ? ` ${escapeHtml(node.attrs.class)}` : '';
    const cls = classes.join(' ');
    const style = Object.keys(leftover).length ? toInlineStyle(leftover) : '';
    const parts: string[] = [];
    if (cls || orig) parts.push(`class="${escapeHtml(cls)}${orig}"`);
    if (style) parts.push(`style="${escapeHtml(style)}"`);
    for (const [k, v] of Object.entries(node.attrs)) {
      if (k === 'class' || k === 'style') continue;
      parts.push(`${k}="${escapeHtml(v)}"`);
    }
    const attr = parts.length ? ' ' + parts.join(' ') : '';
    if (VOID_TAGS.has(node.tag)) return `<${node.tag}${attr}>`;
    return `<${node.tag}${attr}>${node.children.map(emitHtml).join('')}</${node.tag}>`;
  }
  return emitHtml(root);
}
