import { hitTest, isOverlayNode } from '../lib/hit-test';
import { hideOutline, placeOutline } from '../lib/outline';
import { preferBlockAncestor, walkChild, walkParent } from '../lib/walk';
import { captureElement } from '../lib/serialize';
import { buildClipboard } from '../lib/emit';
import { writeClipboard } from '../lib/clipboard';

const UI_CSS = `
:host { all: initial; }
.banner {
  pointer-events: none;
  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
  z-index: 2;
  background: #f5c518; color: #111;
  font: 600 13px/1.3 ui-sans-serif, system-ui, sans-serif;
  padding: 8px 14px; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  white-space: nowrap;
}
.outline {
  position: fixed; pointer-events: none; z-index: 1;
  border: 2px solid #f5c518; box-shadow: inset 0 0 0 1px rgba(0,0,0,.35);
  background: rgba(245,197,24,.08); display: none;
}
.label {
  position: fixed; pointer-events: none; z-index: 2;
  background: #111; color: #f5c518;
  font: 600 11px/1 ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 4px 6px; border-radius: 4px; display: none;
}
.dock {
  pointer-events: none;
  position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%);
  z-index: 3;
  background: #12141a; color: #c5c9d3;
  font: 500 12px/1.3 ui-sans-serif, system-ui, sans-serif;
  padding: 10px 14px; border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,.45);
  border: 1px solid #2a2e38;
  text-align: center;
}
.dock strong { color: #e8eaed; font-weight: 650; }
.toast {
  pointer-events: none; position: fixed; left: 50%; bottom: 72px;
  transform: translateX(-50%);
  background: #0e1116; color: #fff; padding: 8px 12px; border-radius: 8px;
  font: 500 12px/1 ui-sans-serif, system-ui, sans-serif;
  opacity: 0; transition: opacity .18s ease;
  border: 1px solid #2a2e38;
}
.toast[data-show="1"] { opacity: 1; }
`;

export default defineContentScript({
  matches: ['<all_urls>'],
  registration: 'runtime',
  runAt: 'document_idle',
  main() {
    if (window.__designCloneInjected) return;
    window.__designCloneInjected = true;

    let inspecting = false;
    let current: Element | null = null;
    let toastTimer = 0;

    const host = document.createElement('design-clone-root');
    host.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = UI_CSS;
    shadow.appendChild(style);

    const banner = document.createElement('div');
    banner.className = 'banner';
    banner.textContent = 'Hover a block, ↑ for parent, click to copy exact snapshot · Esc to exit';
    const outline = document.createElement('div');
    outline.className = 'outline';
    const label = document.createElement('div');
    label.className = 'label';
    const dock = document.createElement('div');
    dock.className = 'dock';
    dock.innerHTML =
      '<strong>Pixel-perfect copy</strong> · HTML + CSS + hover/focus · paste into your AI';
    const toast = document.createElement('div');
    toast.className = 'toast';

    shadow.append(banner, outline, label, dock, toast);
    document.documentElement.appendChild(host);

    function showToast(msg: string): void {
      toast.textContent = msg;
      toast.dataset.show = '1';
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => {
        toast.dataset.show = '0';
      }, 2000);
    }

    async function copyFrom(el: Element): Promise<void> {
      const snap = captureElement(el);
      await writeClipboard(buildClipboard(snap));
      const extra = snap.large ? ' · Large selection — consider a smaller parent.' : '';
      showToast(`Copied exact snapshot${extra}`);
    }

    function pageRoot(): Element {
      return document.body ?? document.documentElement;
    }

    function onMove(e: MouseEvent): void {
      if (!inspecting) return;
      if (isOverlayNode(e.target)) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      current = preferBlockAncestor(hit);
      placeOutline(outline, label, current);
    }

    function onClick(e: MouseEvent): void {
      if (!inspecting) return;
      if (isOverlayNode(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const hit = hitTest(e.clientX, e.clientY);
      const el = hit ? preferBlockAncestor(hit) : current;
      if (!el) return;
      current = el;
      void copyFrom(el);
    }

    function onKey(e: KeyboardEvent): void {
      if (!inspecting) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setInspecting(false);
        return;
      }
      if (e.key === 'ArrowUp' && current) {
        e.preventDefault();
        const p = walkParent(current);
        if (p) {
          current = p;
          placeOutline(outline, label, current);
        }
      }
      if (e.key === 'ArrowDown' && current) {
        e.preventDefault();
        const c = walkChild(current);
        if (c) {
          current = c;
          placeOutline(outline, label, current);
        }
      }
    }

    function onWheel(e: WheelEvent): void {
      if (!inspecting || !e.altKey || !current) return;
      e.preventDefault();
      const next = e.deltaY < 0 ? walkParent(current) : walkChild(current);
      if (next) {
        current = next;
        placeOutline(outline, label, current);
      }
    }

    function setInspecting(on: boolean): void {
      inspecting = on;
      host.style.display = on ? 'block' : 'none';
      if (!on) {
        hideOutline(outline, label);
        current = null;
      }
    }

    setInspecting(false);

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('wheel', onWheel, { capture: true, passive: false });

    browser.runtime.onMessage.addListener(
      (
        msg: { type?: string },
        _sender,
        sendResponse: (r: unknown) => void,
      ) => {
        if (msg?.type === 'DC_TOGGLE') {
          const next = !inspecting;
          setInspecting(next);
          sendResponse({ inspecting: next });
          return;
        }
        if (msg?.type === 'DC_COPY_PAGE') {
          void (async () => {
            try {
              const snap = captureElement(pageRoot());
              snap.notes.unshift(
                'Full page snapshot (document.body). Prefer inspect on one section if this exceeds the AI context window.',
              );
              const text = buildClipboard(snap);
              await writeClipboard(text);
              sendResponse({
                ok: true,
                large: snap.large,
                chars: text.length,
                nodes: snap.nodeCount,
              });
            } catch {
              sendResponse({ ok: false, error: 'Could not snapshot this page.' });
            }
          })();
          return true;
        }
      },
    );
  },
});

declare global {
  interface Window {
    __designCloneInjected?: boolean;
  }
}
