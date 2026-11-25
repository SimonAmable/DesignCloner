import { hitTest, isOverlayNode } from '../lib/hit-test';
import { hideOutline, placeOutline } from '../lib/outline';
import { preferBlockAncestor, walkChild, walkParent } from '../lib/walk';
import { captureElement } from '../lib/serialize';
import { buildClipboard } from '../lib/emit';
import { writeClipboard } from '../lib/clipboard';
import { PANEL_CSS, createCopiedPanel, describeElement } from '../lib/copied-panel';

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
  transition: border-color .15s ease, background-color .15s ease;
}
.outline[data-copied="1"] { border-color: #22c55e; background: rgba(34,197,94,.14); }
.label[data-copied="1"] { color: #22c55e; }
.inspect { display: none; }
.inspect[data-on="1"] { display: block; }
.inspect[data-panel="1"] .dock { display: none; }
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
${PANEL_CSS}
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
    let copiedTimer = 0;

    const host = document.createElement('design-clone-root');
    host.style.cssText =
      'position:fixed;inset:0;z-index:2147483646;pointer-events:none;';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = UI_CSS;
    shadow.appendChild(style);

    const banner = document.createElement('div');
    banner.className = 'banner';
    banner.textContent = 'Click a block to copy · ↑ ↓ parent / child · Esc to exit';
    const outline = document.createElement('div');
    outline.className = 'outline';
    const label = document.createElement('div');
    label.className = 'label';
    const dock = document.createElement('div');
    dock.className = 'dock';
    dock.innerHTML =
      '<strong>Pixel-perfect copy</strong> · HTML + CSS + hover/focus · paste into your AI';

    const inspectUi = document.createElement('div');
    inspectUi.className = 'inspect';
    inspectUi.append(banner, outline, label, dock);
    const panel = createCopiedPanel(() => syncVisibility());

    shadow.append(inspectUi, panel.el);
    document.documentElement.appendChild(host);

    function syncVisibility(): void {
      const panelOpen = panel.isOpen();
      inspectUi.dataset.on = inspecting ? '1' : '0';
      inspectUi.dataset.panel = panelOpen ? '1' : '0';
      host.style.display = inspecting || panelOpen ? 'block' : 'none';
    }

    function markCopied(): void {
      outline.dataset.copied = '1';
      label.dataset.copied = '1';
      label.textContent = `Copied · ${label.textContent ?? ''}`;
      window.clearTimeout(copiedTimer);
      copiedTimer = window.setTimeout(clearCopied, 1200);
    }

    function clearCopied(): void {
      window.clearTimeout(copiedTimer);
      if (outline.dataset.copied !== '1') return;
      outline.dataset.copied = '0';
      label.dataset.copied = '0';
      if (inspecting && current) placeOutline(outline, label, current);
    }

    async function copyFrom(el: Element): Promise<void> {
      const snap = captureElement(el);
      const text = buildClipboard(snap);
      await writeClipboard(text);
      markCopied();
      panel.show({ text, snap, target: describeElement(el) });
      syncVisibility();
    }

    function pageRoot(): Element {
      return document.body ?? document.documentElement;
    }

    function onMove(e: MouseEvent): void {
      if (!inspecting) return;
      if (isOverlayNode(e.target)) return;
      const hit = hitTest(e.clientX, e.clientY);
      if (!hit) return;
      const next = preferBlockAncestor(hit);
      if (next === current) return;
      current = next;
      clearCopied();
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
      if (e.key === 'Escape' && panel.isOpen()) {
        e.preventDefault();
        panel.hide();
        syncVisibility();
        return;
      }
      if (!inspecting) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setInspecting(false);
        return;
      }
      // Arrow keys inside the copied panel scroll the code, not the selection.
      if (isOverlayNode(e.target)) return;
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
      if (isOverlayNode(e.target)) return;
      e.preventDefault();
      const next = e.deltaY < 0 ? walkParent(current) : walkChild(current);
      if (next) {
        current = next;
        placeOutline(outline, label, current);
      }
    }

    function setInspecting(on: boolean): void {
      inspecting = on;
      if (!on) {
        hideOutline(outline, label);
        clearCopied();
        current = null;
      }
      syncVisibility();
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
              panel.show({ text, snap, target: 'Whole page' });
              syncVisibility();
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
