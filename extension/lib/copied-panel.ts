import type { CaptureSnapshot } from './serialize';
import { writeClipboard } from './clipboard';

export const PANEL_CSS = `
.panel {
  pointer-events: auto;
  position: fixed; right: 16px; bottom: 16px; z-index: 4;
  width: min(420px, calc(100vw - 32px));
  box-sizing: border-box;
  background: #111214; color: #e8eaed;
  border: 1px solid #26282d; border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0,0,0,.45);
  font: 500 12px/1.4 ui-sans-serif, system-ui, sans-serif;
  padding: 12px;
  display: none;
  transform-origin: bottom right;
}
.panel[data-open="1"] { display: block; animation: dc-in .32s cubic-bezier(.2,1.2,.3,1); }
.panel[data-flash="1"] { animation: dc-pop .36s cubic-bezier(.2,1.4,.3,1); }
@keyframes dc-in { from { opacity: 0; transform: translateY(8px) scale(.97); } }
@keyframes dc-pop { 40% { transform: scale(1.015); } }
.head { display: flex; align-items: center; gap: 8px; }
.check {
  flex: none; width: 18px; height: 18px; border-radius: 50%;
  background: #22c55e; color: #04140a;
  display: grid; place-items: center;
  font: 800 11px/1 ui-sans-serif, system-ui, sans-serif;
}
.title { font-weight: 650; color: #fff; white-space: nowrap; }
.target {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font: 500 11px/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; color: #9aa0aa;
}
.x {
  all: unset; margin-left: auto; flex: none; cursor: pointer;
  width: 22px; height: 22px; border-radius: 6px;
  display: grid; place-items: center; color: #8a909a; font-size: 15px; line-height: 1;
}
.x:hover { background: #1d1f23; color: #fff; }
.meta { margin: 6px 0 8px 26px; color: #8a909a; font-size: 11px; }
.meta .warn { color: #f5c518; }
textarea {
  display: block; box-sizing: border-box; width: 100%;
  height: 168px; resize: vertical; min-height: 96px; max-height: 50vh;
  margin: 0; padding: 8px 10px;
  background: #0a0b0c; color: #c9cdd4;
  border: 1px solid #22242a; border-radius: 8px;
  font: 400 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre-wrap; overflow-wrap: anywhere; overflow: auto; outline: none;
  scrollbar-width: thin; scrollbar-color: #33363d transparent;
}
textarea:focus { border-color: #3a3d44; }
.foot { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.hint { color: #6b717b; font-size: 11px; }
.again {
  all: unset; margin-left: auto; cursor: pointer;
  padding: 6px 10px; border-radius: 7px;
  background: #e8eaed; color: #111;
  font: 650 12px/1 ui-sans-serif, system-ui, sans-serif;
}
.again:hover { background: #fff; }
.again:active { transform: scale(.97); }
`;

export type CopiedPanel = {
  el: HTMLElement;
  show: (opts: { text: string; snap: CaptureSnapshot; target: string }) => void;
  hide: () => void;
  isOpen: () => boolean;
};

function describeKb(chars: number): string {
  const kb = chars / 1024;
  return kb < 10 ? `${kb.toFixed(1)} KB` : `${Math.round(kb)} KB`;
}

function describeTokens(chars: number): string {
  const t = Math.round(chars / 4);
  return t < 1000 ? `~${t} tokens` : `~${(t / 1000).toFixed(t < 10_000 ? 1 : 0)}k tokens`;
}

/** Short tag-and-class label for an element, like `section.hero` or `div#app`. */
export function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) return `${tag}#${el.id}`;
  const cls = Array.from(el.classList).slice(0, 2).join('.');
  return cls ? `${tag}.${cls}` : tag;
}

export function createCopiedPanel(onClose: () => void): CopiedPanel {
  const el = document.createElement('div');
  el.className = 'panel';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Copied snapshot');
  el.innerHTML = `
    <div class="head">
      <span class="check" aria-hidden="true">✓</span>
      <span class="title">Copied</span>
      <span class="target"></span>
      <button class="x" type="button" aria-label="Close">×</button>
    </div>
    <div class="meta"></div>
    <textarea readonly spellcheck="false" aria-label="Copied prompt"></textarea>
    <div class="foot">
      <span class="hint">Paste into your AI agent</span>
      <button class="again" type="button">Copy again</button>
    </div>`;

  const target = el.querySelector('.target') as HTMLElement;
  const meta = el.querySelector('.meta') as HTMLElement;
  const area = el.querySelector('textarea') as HTMLTextAreaElement;
  const title = el.querySelector('.title') as HTMLElement;
  const again = el.querySelector('.again') as HTMLButtonElement;
  let flashTimer = 0;

  function flash(label: string): void {
    title.textContent = label;
    el.dataset.flash = '0';
    void el.offsetWidth;
    el.dataset.flash = '1';
    window.clearTimeout(flashTimer);
    flashTimer = window.setTimeout(() => {
      el.dataset.flash = '0';
      title.textContent = 'Copied';
    }, 1400);
  }

  (el.querySelector('.x') as HTMLButtonElement).addEventListener('click', () => {
    el.dataset.open = '0';
    onClose();
  });
  again.addEventListener('click', () => {
    void writeClipboard(area.value).then(() => flash('Copied again'));
  });
  // Keep page shortcuts (and the page itself) from reacting to keys typed here.
  for (const type of ['keydown', 'keyup', 'keypress'] as const) {
    el.addEventListener(type, (e) => {
      if ((e as KeyboardEvent).key !== 'Escape') e.stopPropagation();
    });
  }

  return {
    el,
    show({ text, snap, target: label }) {
      const wasOpen = el.dataset.open === '1';
      target.textContent = label;
      const parts = [
        `${snap.nodeCount} nodes`,
        describeKb(text.length),
        describeTokens(text.length),
      ];
      if (snap.interactionCss) parts.push('hover/focus states');
      if (snap.keyframes.length) {
        parts.push(`${snap.keyframes.length} animation${snap.keyframes.length > 1 ? 's' : ''}`);
      }
      meta.textContent = parts.join(' · ');
      if (snap.large) {
        const warn = document.createElement('span');
        warn.className = 'warn';
        warn.textContent = ' · Large, try a smaller block';
        meta.appendChild(warn);
      }
      area.value = text;
      area.scrollTop = 0;
      area.scrollLeft = 0;
      el.dataset.open = '1';
      if (wasOpen) flash('Copied');
    },
    hide() {
      el.dataset.open = '0';
    },
    isOpen: () => el.dataset.open === '1',
  };
}
