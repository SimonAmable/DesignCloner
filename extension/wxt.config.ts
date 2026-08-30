import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Design Clone',
    description:
      'Hover any element. Copy HTML, CSS, Tailwind, or JSX for Cursor, Claude, and Lovable.',
    version: '1.0.1',
    action: {
      default_title: 'Design Clone',
    },
    permissions: ['activeTab', 'scripting', 'clipboardWrite'],
    commands: {
      'toggle-inspect': {
        suggested_key: {
          default: 'Alt+Shift+D',
          mac: 'Alt+Shift+D',
        },
        description: 'Toggle Design Clone inspect mode',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      // Inject on user gesture via activeTab + scripting, not <all_urls>.
      delete manifest.host_permissions;
    },
  },
});
