import { toInlineCss } from './to-inline';
import { wrapAsPrompt } from './prompt-wrap';
import { collectUsedVars } from './interactions';
import type { CaptureSnapshot } from './serialize';

export function buildClipboard(snap: CaptureSnapshot): string {
  const html = toInlineCss(snap.root);
  const vars = collectUsedVars(`${html}\n${snap.interactionCss}`);
  const styleParts = [vars, ...snap.keyframes, snap.interactionCss].filter(Boolean);
  const payload = styleParts.length
    ? `${html}\n\n<style>\n${styleParts.join('\n')}\n</style>`
    : html;
  const extra = [
    ...snap.notes,
    snap.fonts.length ? `Fonts: ${snap.fonts.slice(0, 8).join(' | ')}` : '',
  ].filter(Boolean);
  return wrapAsPrompt({
    payload,
    extraNotes: extra,
  });
}
