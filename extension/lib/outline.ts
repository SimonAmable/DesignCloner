export function placeOutline(
  box: HTMLElement,
  label: HTMLElement,
  el: Element,
): void {
  const r = el.getBoundingClientRect();
  box.style.display = 'block';
  box.style.top = `${r.top}px`;
  box.style.left = `${r.left}px`;
  box.style.width = `${Math.max(r.width, 1)}px`;
  box.style.height = `${Math.max(r.height, 1)}px`;

  const tag = el.tagName.toLowerCase();
  const w = Math.round(r.width);
  const h = Math.round(r.height);
  label.textContent = `${tag} · ${w}×${h}px`;
  label.style.display = 'block';
  let top = r.top - 22;
  if (top < 4) top = r.bottom + 4;
  let left = r.left;
  if (left < 4) left = 4;
  label.style.top = `${top}px`;
  label.style.left = `${left}px`;
}

export function hideOutline(box: HTMLElement, label: HTMLElement): void {
  box.style.display = 'none';
  label.style.display = 'none';
}
