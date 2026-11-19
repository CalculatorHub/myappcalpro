import { useEffect, useRef, useState } from 'react';

const TAGLINE_LINES = [
  'Clear slab math for every Indian tax year.',
  'Built so CA students verify answers fast without spreadsheet guesswork.',
];

export function TaglineReveal() {
  const containerRef = useRef<HTMLElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const allWords = TAGLINE_LINES.flatMap((line, lineIndex) =>
    line.split(' ').map((word, wordIndex, arr) => ({
      word,
      isLastInLine: wordIndex === arr.length - 1,
      lineIndex,
    }))
  );
  const totalWords = allWords.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setReducedMotion(true);
      setRevealedCount(totalWords);
      return;
    }

    let rafId: number | null = null;

    const updateProgress = () => {
      rafId = null;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || 800;

      // Trigger line progresses cleanly from 85% down the viewport to 30% from the top
      const startY = viewportH * 0.85;
      const endY = viewportH * 0.30;
      const progress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY)));
      const nextCount = Math.round(progress * totalWords);
      setRevealedCount((prev) => Math.max(prev, nextCount));
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [totalWords]);

  return (
    <section
      ref={containerRef}
      aria-label="Core product promise"
      className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="max-w-[680px]">
        <h2 className="heading-2 leading-tight text-balance">
          {TAGLINE_LINES.map((line, lIdx) => {
            const offset = TAGLINE_LINES.slice(0, lIdx).reduce(
              (acc, prev) => acc + prev.split(' ').length,
              0
            );
            const words = line.split(' ');
            return (
              <span key={lIdx} className="block">
                {words.map((word, wIdx) => {
                  const globalIdx = offset + wIdx;
                  const active = reducedMotion || globalIdx < revealedCount;
                  return (
                    <span
                      key={`${lIdx}-${wIdx}`}
                      className={`inline-block transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        active ? 'opacity-100 text-white' : 'opacity-30 text-white'
                      }`}
                    >
                      {word}
                      {wIdx < words.length - 1 ? '\u00A0' : ''}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
}
