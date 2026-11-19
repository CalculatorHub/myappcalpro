import { useState, useRef, useEffect } from 'react';
import { Question } from '@phosphor-icons/react';

interface TooltipProps {
  text: string;
  label?: string;
}

export function Tooltip({ text, label = 'More information' }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded text-zinc-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <Question size={14} weight="regular" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-lg border border-[#313131] bg-[#1F1F1F] p-3 text-xs leading-relaxed text-zinc-200 shadow-xl"
        >
          {text}
          <div className="absolute top-full left-1/2 -mt-px h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-[#313131] bg-[#1F1F1F]" />
        </div>
      )}
    </div>
  );
}
