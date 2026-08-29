const start = document.getElementById('start') as HTMLButtonElement;
const copyPage = document.getElementById('copy-page') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;

type ToggleResult = { ok: true; inspecting: boolean } | { ok: false; error: string };
type CopyPageResult =
  | { ok: true; large: boolean; chars: number; nodes: number }
  | { ok: false; error: string };

function setStatus(text: string, err = false): void {
  status.dataset.err = err ? '1' : '0';
  status.textContent = text;
}

async function toggle(): Promise<void> {
  setStatus('Starting…');
  const res = (await browser.runtime.sendMessage({ type: 'DC_TOGGLE_ACTIVE' })) as ToggleResult;
  if (!res?.ok) {
    setStatus(res?.error ?? 'Could not start inspect.', true);
    return;
  }
  setStatus(
    res.inspecting
      ? 'Inspect is on. Click a block on the page to copy an exact snapshot.'
      : 'Inspect is off.',
  );
}

async function copyWholePage(): Promise<void> {
  setStatus('Copying page…');
  const res = (await browser.runtime.sendMessage({
    type: 'DC_COPY_PAGE_ACTIVE',
  })) as CopyPageResult;
  if (!res?.ok) {
    setStatus(res?.error ?? 'Could not copy this page.', true);
    return;
  }
  const kb = Math.max(1, Math.round(res.chars / 1024));
  setStatus(
    res.large || res.chars > 80_000
      ? `Copied whole page (${kb} KB, ${res.nodes} nodes). Chat UIs truncate huge pastes — use inspect on one section for Cursor.`
      : `Copied whole page (${kb} KB). Paste into your AI for a pixel-perfect rebuild.`,
  );
}

start.addEventListener('click', () => {
  void toggle();
});
copyPage.addEventListener('click', () => {
  void copyWholePage();
});

void toggle();
