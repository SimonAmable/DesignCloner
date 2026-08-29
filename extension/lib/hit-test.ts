const HOST_TAG = 'DESIGN-CLONE-ROOT';

export function isOverlayNode(node: EventTarget | null): boolean {
  if (!(node instanceof Element)) return false;
  if (node.tagName === HOST_TAG) return true;
  return Boolean(node.closest?.(HOST_TAG.toLowerCase()));
}

export function hitTest(x: number, y: number): Element | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (isOverlayNode(el)) continue;
    if (el === document.documentElement || el === document.body) continue;
    return el;
  }
  const fallback = document.elementFromPoint(x, y);
  if (!fallback || isOverlayNode(fallback)) return null;
  return fallback;
}
