export function wrapAsPrompt(opts: {
  payload: string;
  extraNotes: string[];
}): string {
  const notes = [
    '- Pixel-perfect is the bar. Do not approximate, restyle, or “improve” the design.',
    '- The markup and inline styles are the rest-state ground truth. A trailing <style> block (if present) is hover/focus/active, @keyframes, and CSS variables — recreate those micro-interactions, do not drop them.',
    '- Reproduce layout, typography, color, radius, spacing, shadows, transitions, and motion with the same values (px, hex/rgb, durations, easing).',
    '- Recreate this in the existing application using that project’s stack (React, Vue, Tailwind, CSS modules, etc.). Use arbitrary values when a token is not an exact match. Do not invent a new design system.',
    '- Keep structure; convert tags/classes to idiomatic components for this repo. Preserve image URLs and class names used by the interaction CSS.',
    ...opts.extraNotes.map((n) => `- ${n}`),
  ];

  return [
    'Source: Design Clone exact snapshot (HTML + computed inline CSS)',
    'Task: Rebuild this UI pixel-perfect in the current codebase.',
    '<code>',
    opts.payload,
    '</code>',
    'Notes:',
    ...notes,
  ].join('\n');
}
