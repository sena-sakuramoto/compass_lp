import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Pause, Play, RotateCcw, Volume1, Volume2, VolumeX } from 'lucide-react';

// トップの紹介動画。
// ブラウザは音つきの自動再生を許さないので、最初は消音で繰り返し流し、
// 「ナレーション付きで見る」を押したら頭から音つきで1回流す。見終わったら消音の繰り返しに戻す。

const VOLUME_KEY = 'compass-lp-hero-volume';
const FADE_MS = 400;

type Mode = 'preview' | 'narration';

function readVolume(): number {
  try {
    const v = Number(window.localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) && v > 0 && v <= 1 ? v : 0.8;
  } catch {
    return 0.8;
  }
}

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

type HeroVideoProps = {
  isMobile: boolean;
  src: string;
  poster: string;
};

export function HeroVideo({ isMobile, src, poster }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeRef = useRef<number | null>(null);
  const [mode, setMode] = useState<Mode>('preview');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(readVolume);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchedOnce, setWatchedOnce] = useState(false);

  const stopFade = () => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  // 音はいきなり鳴らさず FADE_MS かけて上げる（時計で進めるので、画面が裏にあっても最後は必ず目標の音量になる）
  const fadeTo = useCallback((target: number) => {
    const video = videoRef.current;
    if (!video) return;
    stopFade();
    const from = video.volume;
    const start = performance.now();
    fadeRef.current = window.setInterval(() => {
      const k = Math.min(1, (performance.now() - start) / FADE_MS);
      video.volume = from + (target - from) * k;
      if (k >= 1) stopFade();
    }, 25);
  }, []);

  useEffect(() => () => stopFade(), []);

  // 消音の自動再生を確実に始める。
  // React は muted を属性として書かないので、iPhone の Safari 向けに属性を直接付ける。
  // 読み込み前に呼んだ play() は失敗することがあるので、再生できる状態になった時点でもう一度試す。
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.setAttribute('muted', '');
    const tryPlay = () => {
      if (!video.paused || !video.muted) return;
      video.play().catch(() => setPlaying(!video.paused));
    };
    tryPlay();
    video.addEventListener('canplay', tryPlay);
    video.addEventListener('loadeddata', tryPlay);
    return () => {
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [isMobile]);

  const startNarration = async () => {
    const video = videoRef.current;
    if (!video) return;
    setMode('narration');
    video.loop = false;
    video.currentTime = 0;
    video.volume = 0;
    video.muted = false;
    setMuted(false);
    try {
      await video.play();
      fadeTo(volume);
    } catch {
      setPlaying(!video.paused);
    }
  };

  const backToPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    stopFade();
    setMode('preview');
    setWatchedOnce(true);
    video.muted = true;
    setMuted(true);
    video.loop = true;
    video.currentTime = 0;
    video.play().catch(() => setPlaying(!video.paused));
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(!video.paused);
      }
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.muted) {
      video.muted = false;
      setMuted(false);
      video.volume = 0;
      fadeTo(volume);
    } else {
      stopFade();
      video.muted = true;
      setMuted(true);
    }
  };

  const changeVolume = (v: number) => {
    const video = videoRef.current;
    setVolume(v);
    try {
      window.localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      // 保存できない環境でも音量はその場で効く
    }
    if (!video) return;
    stopFade();
    video.volume = v;
    if (v === 0 && !video.muted) {
      video.muted = true;
      setMuted(true);
    } else if (v > 0 && video.muted) {
      video.muted = false;
      setMuted(false);
    }
  };

  const seekFromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    video.currentTime = k * duration;
    setTime(video.currentTime);
  };

  const onSeekKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    if (e.key === 'ArrowRight') video.currentTime = Math.min(duration, video.currentTime + 5);
    else if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
    else return;
    e.preventDefault();
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progress = duration ? (time / duration) * 100 : 0;
  const narration = mode === 'narration';

  return (
    <div className="group relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-[#04090f]">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload={isMobile ? 'metadata' : 'auto'}
        poster={poster}
        className={`w-full h-auto ${narration ? 'cursor-pointer' : ''}`}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onClick={narration ? togglePlay : undefined}
        onPlay={() => setPlaying(true)}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => {
          setTime(e.currentTarget.currentTime);
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onDurationChange={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onEnded={narration ? backToPreview : undefined}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* 自動再生が止められたとき（主にスマホ） */}
      {!playing && !narration && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="再生"
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a5f]/85 text-white shadow-lg hover:bg-[#1e3a5f] transition-colors"
        >
          <Play size={22} className="ml-0.5" />
        </button>
      )}

      {/* 消音で流れている間：ナレーション付きで見る */}
      {!narration && (
        <button
          type="button"
          onClick={startNarration}
          aria-label={watchedOnce ? 'もう一度ナレーション付きで見る' : 'ナレーション付きで見る'}
          className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-[#1e3a5f] shadow-lg ring-1 ring-black/5 transition hover:bg-white hover:shadow-xl active:scale-95"
        >
          {watchedOnce ? <RotateCcw size={16} /> : <Volume2 size={17} />}
          <span>{watchedOnce ? 'もう一度ナレーション付きで見る' : 'ナレーション付きで見る'}</span>
        </button>
      )}

      {/* ナレーション中：操作バー */}
      {narration && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pb-2.5 pt-10 sm:px-4 sm:pb-3 transition-opacity duration-300 ${
            isMobile || !playing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
          }`}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="再生位置"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              seekFromPointer(e);
            }}
            onPointerMove={(e) => {
              if (e.buttons & 1) seekFromPointer(e);
            }}
            onKeyDown={onSeekKey}
            className="group/seek relative mb-2 h-4 cursor-pointer touch-none"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25 transition-all group-hover/seek:h-1.5" />
            <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#00b4d8] transition-all group-hover/seek:h-1.5" style={{ width: `${progress}%` }} />
            <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-white">
            <button type="button" onClick={togglePlay} aria-label={playing ? '一時停止' : '再生'} className="rounded-full p-1.5 hover:bg-white/15 transition-colors">
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button type="button" onClick={toggleMute} aria-label={muted ? '音を出す' : '音を消す'} className="rounded-full p-1.5 hover:bg-white/15 transition-colors">
              <VolumeIcon size={18} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              aria-label="音量"
              className="hero-volume h-1 w-20 sm:w-28 cursor-pointer accent-[#00b4d8]"
            />

            <span className="ml-1 text-[11px] sm:text-xs tabular-nums text-white/80">
              {formatTime(time)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={backToPreview}
              className="ml-auto rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white/85 hover:bg-white/15 transition-colors"
            >
              音なしに戻す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
