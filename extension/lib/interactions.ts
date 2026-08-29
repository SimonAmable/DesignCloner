const STATE = String.raw`:(?:hover|focus-visible|focus-within|focus|active|disabled|checked|visited|placeholder-shown|target)`;
const STATE_RE = new RegExp(STATE, 'i');
const STRIP_RE = new RegExp(STATE, 'gi');

const MAX_RULES = 220;
const MAX_CHARS = 70_000;

function stripStates(selector: string): string {
  return selector.replace(STRIP_RE, '').replace(/\s+/g, ' ').trim();
}

function isInteractionSelector(selector: string): boolean {
  return STATE_RE.test(selector) || selector.includes('::placeholder');
}

function collectElements(root: Element): Element[] {
  const out: Element[] = [root];
  const visit = (el: Element): void => {
    el.querySelectorAll('*').forEach((child) => {
      if (child.tagName === 'DESIGN-CLONE-ROOT') return;
      out.push(child);
      const shadow = child instanceof HTMLElement ? child.shadowRoot : null;
      if (shadow) {
        shadow.querySelectorAll('*').forEach((s) => out.push(s));
      }
    });
  };
  visit(root);
  const ownShadow = root instanceof HTMLElement ? root.shadowRoot : null;
  if (ownShadow) ownShadow.querySelectorAll('*').forEach((s) => out.push(s));
  return out;
}

function anyMatch(els: Element[], selector: string): boolean {
  const stripped = stripStates(selector);
  if (!stripped) return false;
  try {
    return els.some((el) => el.matches(stripped));
  } catch {
    return false;
  }
}

function walkRules(
  rules: CSSRuleList,
  els: Element[],
  out: Set<string>,
  wrap: (css: string) => string,
): void {
  if (out.size >= MAX_RULES) return;
  for (let i = 0; i < rules.length; i++) {
    if (out.size >= MAX_RULES) return;
    const rule = rules.item(i);
    if (!rule) continue;
    if (rule instanceof CSSStyleRule) {
      if (!isInteractionSelector(rule.selectorText || '')) continue;
      const parts = rule.selectorText.split(',');
      if (!parts.some((p) => anyMatch(els, p.trim()))) continue;
      out.add(wrap(rule.cssText));
      continue;
    }
    if (rule instanceof CSSMediaRule) {
      const cond = rule.conditionText;
      walkRules(rule.cssRules, els, out, (css) => `@media ${cond} { ${css} }`);
      continue;
    }
    if (rule instanceof CSSSupportsRule) {
      const cond = rule.conditionText;
      walkRules(rule.cssRules, els, out, (css) => `@supports ${cond} { ${css} }`);
    }
  }
}

function sheetsFor(root: Element): CSSStyleSheet[] {
  const list: CSSStyleSheet[] = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    const s = document.styleSheets.item(i);
    if (s) list.push(s);
  }
  const addShadow = (el: Element): void => {
    const shadow = el instanceof HTMLElement ? el.shadowRoot : null;
    if (shadow) {
      shadow.querySelectorAll('style').forEach((st) => {
        const sheet = (st as HTMLStyleElement).sheet;
        if (sheet) list.push(sheet);
      });
    }
    el.querySelectorAll('*').forEach((child) => addShadow(child));
  };
  addShadow(root);
  return list;
}

export type InteractionCapture = {
  css: string;
  keyframes: string[];
  blockedSheets: number;
  ruleCount: number;
};

export function captureInteractions(root: Element): InteractionCapture {
  const els = collectElements(root);
  const rules = new Set<string>();
  const keyframes: string[] = [];
  let blockedSheets = 0;

  for (const sheet of sheetsFor(root)) {
    let cssRules: CSSRuleList;
    try {
      cssRules = sheet.cssRules;
    } catch {
      blockedSheets += 1;
      continue;
    }
    walkRules(cssRules, els, rules, (css) => css);
    for (let i = 0; i < cssRules.length; i++) {
      const rule = cssRules.item(i);
      if (rule instanceof CSSKeyframesRule) keyframes.push(rule.cssText);
    }
  }

  let css = '';
  for (const rule of rules) {
    if (css.length + rule.length > MAX_CHARS) break;
    css += rule + '\n';
  }

  return {
    css: css.trim(),
    keyframes,
    blockedSheets,
    ruleCount: rules.size,
  };
}

export function collectUsedVars(html: string): string {
  const names = new Set<string>();
  const re = /var\(\s*(--[\w-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[1]) names.add(m[1]);
  }
  if (!names.size) return '';
  const cs = getComputedStyle(document.documentElement);
  const decls: string[] = [];
  for (const name of names) {
    const v = cs.getPropertyValue(name).trim();
    if (v) decls.push(`${name}: ${v}`);
  }
  if (!decls.length) return '';
  return `:root { ${decls.join('; ')} }`;
}
