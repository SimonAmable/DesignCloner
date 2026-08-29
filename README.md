# DesignCloner

Two projects in one folder:

| Folder | What it is |
| --- | --- |
| `website/` | DesignCloner web app from [github.com/SimonAmable/DesignCloner](https://github.com/SimonAmable/DesignCloner) |
| `extension/` | Design Clone Chrome extension (WXT) |

## Website

```bash
cd website
npm install
cp .env.example .env
npm run dev
```

## Extension

```bash
cd extension
pnpm install
pnpm build
```

Then Chrome → `chrome://extensions` → Developer mode → Load unpacked → `extension/.output/chrome-mv3`.
