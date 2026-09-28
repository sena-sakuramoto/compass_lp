import { useEffect, useRef, useState, type ReactNode } from 'react';

// LP の共通部品。見た目は「図面の表題欄」：白い紙に細い罫線、節に図面番号、差し色は1色。

// 「、」「。」の後と「（」の前でしか折り返さない（語の途中で切れた見出しは読みにくい）
export function Phrase({ text }: { text: string }) {
  const parts = text.split(/(?<=[、。])|(?=（)/);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className="inline-block">
          {part}
        </span>
      ))}
    </>
  );
}

// 節の札。「01 — 課題」を、番号（差し色）と名前（太字）に分けて見せる
export function SectionLabel({ no, dark = false }: { no: string; dark?: boolean }) {
  const [num, ...rest] = no.split(' — ');
  const name = rest.join(' — ');
  return (
    <p className="flex items-baseline gap-3">
      <span className={`f-mono text-sm font-semibold ${dark ? 'text-[#5fd0e6]' : 'text-[var(--lp-accent-ink)]'}`}>{num}</span>
      {name && <span className={`text-sm font-bold tracking-wide ${dark ? 'text-white' : 'text-[var(--lp-ink)]'}`}>{name}</span>}
    </p>
  );
}

export function SectionHead({
  no,
  title,
  lead,
  dark = false,
  children,
}: {
  no: string;
  title: ReactNode;
  lead?: ReactNode;
  dark?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`grid gap-4 border-t pt-5 sm:pt-6 lg:grid-cols-12 lg:gap-8 ${dark ? 'border-white/25' : 'border-[var(--lp-ink)]'}`}>
      <div className="lg:col-span-7">
        <SectionLabel no={no} dark={dark} />
        <h2 className={`f-display mt-3 text-[28px] leading-[1.25] sm:text-4xl lg:text-[44px] font-black tracking-tight ${dark ? 'text-white' : 'text-[var(--lp-ink)]'}`}>
          {title}
        </h2>
      </div>
      {(lead || children) && (
        <div className={`lg:col-span-5 lg:pt-8 text-sm sm:text-base leading-relaxed ${dark ? 'text-white/75' : 'text-[var(--lp-sub)]'}`}>
          {lead && <p>{lead}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

// 実画面の録画。見えている間だけ再生し、画面外では止める（読み込みも見えてから）。
export function FeatureClip({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === 'undefined') return;
    video.muted = true;
    video.setAttribute('muted', '');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.preload !== 'auto') video.preload = 'auto';
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--lp-rule)] bg-white">
      <video
        ref={ref}
        className="block w-full h-auto"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

// これからの Compass（構想・開発中）。押したときだけ読み込んで、音つきで再生する。
export function ConceptVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = async () => {
    const video = ref.current;
    if (!video) return;
    setStarted(true);
    video.preload = 'auto';
    video.controls = true;
    try {
      await video.play();
    } catch {
      // 再生できなかったときは標準の操作バーから再生できる
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[4px] border border-white/20 bg-black">
      <video
        ref={ref}
        className="block w-full h-auto"
        src={src}
        poster={poster}
        playsInline
        preload="none"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      {!started && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 sm:p-6 text-left"
          aria-label="60秒のコンセプト映像を再生する（音が出ます）"
        >
          <span className="inline-flex items-center gap-3 rounded-[4px] bg-white px-4 py-3 text-sm sm:text-base font-bold text-[var(--lp-ink)]">
            <span aria-hidden className="inline-block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-[var(--lp-accent)]" />
            60秒のコンセプト映像を見る
            <span className="f-mono text-xs font-medium text-[var(--lp-sub)]">音が出ます</span>
          </span>
        </button>
      )}
    </div>
  );
}
