const BLOCK_SELECTOR =
  'section, article, header, footer, main, nav, aside, [class*="card"], [class*="Card"], [class*="hero"]';

function area(el: Element): number {
  const r = el.getBoundingClientRect();
  return r.width * r.height;
}

function isTinyLeaf(el: Element): boolean {
  if (el.children.length > 0) return false;
  const r = el.getBoundingClientRect();
  return r.width < 48 || r.height < 24;
}

function isMeaningfulBlock(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.matches(BLOCK_SELECTOR)) return true;
  const cs = getComputedStyle(el);
  const display = cs.display;
  if (display === 'flex' || display === 'grid') {
    const r = el.getBoundingClientRect();
    return r.width >= 120 && r.height >= 48;
  }
  return false;
}

export function preferBlockAncestor(el: Element): Element {
  if (!isTinyLeaf(el)) return el;
  let cur: Element | null = el;
  while (cur && cur !== document.body) {
    if (isMeaningfulBlock(cur) && area(cur) > area(el) * 4) return cur;
    cur = cur.parentElement;
  }
  return el.parentElement ?? el;
}

export function walkParent(el: Element): Element | null {
  const p = el.parentElement;
  if (!p || p === document.documentElement) return null;
  return p;
}

export function walkChild(el: Element): Element | null {
  const kids = [...el.children].filter((c) => {
    if (!(c instanceof HTMLElement)) return false;
    const r = c.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return kids[0] ?? null;
}
