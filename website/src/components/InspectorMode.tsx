import React, { useState, useEffect } from 'react';

interface InspectorModeProps {
  isActive: boolean;
  onDeactivate: () => void;
}

export const InspectorMode: React.FC<InspectorModeProps> = ({ isActive, onDeactivate }) => {
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      setHoveredRect(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target || target.closest('#inspector-ui')) return;

      const rect = target.getBoundingClientRect();
      setHoveredRect(rect);
      setHoveredTag(target.tagName.toLowerCase() + (target.className ? `.${target.className.toString().split(' ')[0]}` : ''));
    };

    const handleClick = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (!target || target.closest('#inspector-ui')) return;

      e.preventDefault();
      e.stopPropagation();

      const sampleSnippet = `<!-- Extracted by Design Cloner -->\n<${target.tagName.toLowerCase()} className="${target.className}">\n  ${target.innerText.slice(0, 40)}...\n</${target.tagName.toLowerCase()}>`;

      navigator.clipboard.writeText(sampleSnippet);
      setCopiedToast(`Copied snippet for ${target.tagName.toLowerCase()} to clipboard!`);
      setTimeout(() => setCopiedToast(null), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick, true);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div id="inspector-ui" className="pointer-events-none fixed inset-0 z-[100]">
      {/* Top Banner Control */}
      <div className="pointer-events-auto absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full border border-blue-500/40 bg-black/90 px-5 py-2.5 shadow-2xl backdrop-blur-md">
        <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse" />
        <span className="text-xs font-semibold text-blue-200">
          Design Cloner Inspector active — Hover & click any element to copy prompt snippet
        </span>
        <button
          type="button"
          onClick={onDeactivate}
          className="ml-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white hover:bg-white/20"
        >
          ✕
        </button>
      </div>

      {/* Hover Bounding Box */}
      {hoveredRect && (
        <div
          className="fixed rounded-md border-2 border-blue-400 bg-blue-500/10 pointer-events-none transition-all duration-75"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        >
          <div className="absolute -top-7 left-0 rounded bg-blue-600 px-2 py-0.5 text-[11px] font-mono font-bold text-white shadow">
            {hoveredTag}
          </div>
        </div>
      )}

      {/* Copied Toast */}
      {copiedToast && (
        <div className="pointer-events-auto fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-emerald-950/90 px-6 py-3 text-sm font-semibold text-emerald-200 shadow-2xl backdrop-blur-md animate-bounce">
          ✨ {copiedToast}
        </div>
      )}
    </div>
  );
};
