export type ToggleResult = { ok: true; inspecting: boolean } | { ok: false; error: string };
export type CopyPageResult =
  | { ok: true; large: boolean; chars: number; nodes: number }
  | { ok: false; error: string };

function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return true;
  return (
    /^(chrome|edge|about|devtools|chrome-extension|view-source):/i.test(url) ||
    url.startsWith('https://chrome.google.com/webstore') ||
    url.startsWith('https://chromewebstore.google.com')
  );
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function injectContent(tabId: number): Promise<void> {
  const files = ['content-scripts/content.js', '/content-scripts/content.js'] as const;
  let last: unknown;
  for (const file of files) {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: [file as '/content-scripts/content.js'],
      });
      return;
    } catch (err) {
      last = err;
    }
  }
  throw last instanceof Error ? last : new Error('Could not inject Design Clone on this page');
}

async function withContent<T>(
  tabId: number,
  message: { type: string },
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  for (let i = 0; i < 12; i++) {
    try {
      const data = (await browser.tabs.sendMessage(tabId, message)) as T;
      return { ok: true, data };
    } catch {
      if (i === 0) {
        try {
          await injectContent(tabId);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Injection failed';
          return { ok: false, error: msg };
        }
      }
      await sleep(40);
    }
  }
  return { ok: false, error: 'Page did not respond. Reload the tab and try again.' };
}

async function sendToggle(tabId: number): Promise<ToggleResult> {
  const res = await withContent<{ inspecting: boolean }>(tabId, { type: 'DC_TOGGLE' });
  if (!res.ok) return res;
  return { ok: true, inspecting: Boolean(res.data?.inspecting) };
}

async function sendCopyPage(tabId: number): Promise<CopyPageResult> {
  const res = await withContent<CopyPageResult>(tabId, { type: 'DC_COPY_PAGE' });
  if (!res.ok) return res;
  if (!res.data || typeof res.data !== 'object' || !('ok' in res.data)) {
    return { ok: false, error: 'Reload the extension and this tab, then try Copy whole page again.' };
  }
  return res.data;
}

export default defineBackground(() => {
  async function toggleInspect(tabId: number, url?: string): Promise<ToggleResult> {
    if (isRestrictedUrl(url)) {
      return {
        ok: false,
        error: 'Open a normal website (not chrome:// or the Web Store), then click Design Clone.',
      };
    }
    return sendToggle(tabId);
  }

  browser.action.onClicked.addListener((tab) => {
    if (tab.id != null) void toggleInspect(tab.id, tab.url);
  });

  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle-inspect') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id != null) await toggleInspect(tab.id, tab.url);
  });

  async function copyActivePage(): Promise<CopyPageResult> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return { ok: false, error: 'No active tab.' };
    if (isRestrictedUrl(tab.url)) {
      return {
        ok: false,
        error: 'Open a normal website (not chrome:// or the Web Store), then copy the page.',
      };
    }
    return sendCopyPage(tab.id);
  }

  browser.runtime.onMessage.addListener((msg: { type?: string }, _sender, sendResponse) => {
    if (msg?.type === 'DC_TOGGLE_ACTIVE') {
      void (async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab?.id == null) {
          sendResponse({ ok: false, error: 'No active tab.' } satisfies ToggleResult);
          return;
        }
        sendResponse(await toggleInspect(tab.id, tab.url));
      })();
      return true;
    }
    if (msg?.type === 'DC_COPY_PAGE_ACTIVE') {
      void copyActivePage().then(sendResponse);
      return true;
    }
  });
});
