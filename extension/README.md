# Design Clone

Hover a block, click, and copy an **exact snapshot** (HTML + computed inline CSS) wrapped as a prompt: rebuild this UI **pixel-perfect** in the **current app’s stack**.

Serialization and clipboard stay on-device. No accounts, payments, analytics, or network calls from the extension.

## Load unpacked

1. `cd extension`
2. `pnpm install`
3. `pnpm build` (or `pnpm dev` for a live reload session)
4. Chrome → `chrome://extensions` → Developer mode → **Load unpacked**
5. Select `extension/.output/chrome-mv3` after a build, or the path WXT prints during `pnpm dev`

## Shortcuts

- Toolbar icon: **Start inspect** (best for Cursor), or **Copy whole page** for `document.body` (often hundreds of KB — chat UIs will truncate the paste)
- **Alt+Shift+D** (Windows, Linux, and macOS — same command in `chrome://extensions` → keyboard shortcuts)
- **Escape** exits inspect mode
- **Arrow Up / Arrow Down** walk to parent / first child
- **Alt + mouse wheel** also walks the tree

If a page does not respond, it may be a `chrome://` or Web Store URL (Chrome blocks scripting there).

## What you copy

One format only: markup with **inline computed styles** (rest state) plus a `<style>` block of **hover/focus/active** rules, `@keyframes`, and used CSS variables when those sheets are readable. JS-only motion (Framer Motion, GSAP) cannot be serialized from CSS. Cross-origin stylesheets are blocked by the browser.

## Paste into Cursor or Lovable

1. Inspect a card, nav, or hero (↑ until the outline wraps the whole block) and click
2. Paste into Cursor Chat / Agent (or another coding AI)
3. The prompt already requires a pixel-perfect rebuild in the repo’s framework

## Manual test checklist

- [ ] Unpacked MV3 install loads
- [ ] Icon and Alt+Shift+D toggle inspect (yellow banner + dock)
- [ ] Hover outlines tag + size; click copies; links do not navigate
- [ ] Escape removes overlay and dock
- [ ] Clipboard is an exact snapshot plus rebuild-in-this-stack notes
- [ ] Open shadow roots flatten into the copy; cross-origin iframes add a note
- [ ] DevTools Network: no extension requests while copying
- [ ] Large trees still copy and toast a size warning
- [ ] Smoke pages: [linear.app](https://linear.app), [stripe.com](https://stripe.com), [apple.com](https://apple.com), [wikipedia.org](https://wikipedia.org)

## Zip

```bash
pnpm zip
```

Output is under `.output/`.

## Privacy

No backend. Clipboard write happens in the page’s content script. Do not expect copied markup in extension logs.
