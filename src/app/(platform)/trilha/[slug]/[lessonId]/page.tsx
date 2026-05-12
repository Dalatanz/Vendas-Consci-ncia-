"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Gauge,
  CheckCircle2,
} from "lucide-react";
import { NeonButton } from "@/components/NeonButton";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug ?? "");
  const lessonId = String(params.lessonId ?? "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [data, setData] = useState<null | {
    lesson: { title: string; description: string | null; videoUrl: string; durationSec: number };
    module: { slug: string; title: string };
    prevLessonId: string | null;
    nextLessonId: string | null;
    progress: { progressPct: number; currentTimeSec: number; completed: boolean } | null;
  }>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [fs, setFs] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    if (!lessonId) return;
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d?.progress?.currentTimeSec && videoRef.current) {
          videoRef.current.currentTime = d.progress.currentTimeSec;
        }
      })
      .catch(() => setData(null));
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const scheduleSave = useCallback(
    (overrides?: { completed?: boolean }) => {
      if (!lessonId || !videoRef.current) return;
      const el = videoRef.current;
      const pct = duration ? Math.min(100, (el.currentTime / duration) * 100) : 0;
      const body = {
        progressPct: overrides?.completed ? 100 : pct,
        currentTimeSec: Math.floor(el.currentTime),
        completed: Boolean(overrides?.completed) || pct >= 95,
      };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/lessons/${lessonId}/progress`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }).catch(() => {});
      }, 800);
    },
    [duration, lessonId],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  async function markComplete() {
    await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
    load();
  }

  if (!data) {
    return <p className="text-zinc-500">Carregando player…</p>;
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/trilha/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[var(--uvc-neon)]"
      >
        <ChevronLeft className="h-4 w-4" /> {data.module.title}
      </Link>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">
        {data.lesson.title}
      </h1>

      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--uvc-neon)_20%,transparent)] bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)]"
      >
        <video
          ref={videoRef}
          src={data.lesson.videoUrl}
          className="aspect-video w-full bg-black"
          playsInline
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            if (data.progress?.currentTimeSec) {
              e.currentTarget.currentTime = data.progress.currentTimeSec;
            }
          }}
          onTimeUpdate={(e) => {
            setCurrent(e.currentTarget.currentTime);
            scheduleSave();
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            scheduleSave({ completed: true });
            setPlaying(false);
          }}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-12">
          <div
            className="mb-3 h-1.5 cursor-pointer rounded-full bg-zinc-800"
            onClick={(e) => {
              const bar = e.currentTarget;
              const rect = bar.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              if (videoRef.current && duration) {
                videoRef.current.currentTime = pct * duration;
              }
            }}
          >
            <div
              className="h-full rounded-full bg-[var(--uvc-neon)]"
              style={{ width: `${duration ? (current / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full border border-white/15 p-2 text-white hover:border-[var(--uvc-neon)]"
                onClick={() => {
                  if (data.prevLessonId) router.push(`/trilha/${slug}/${data.prevLessonId}`);
                }}
                disabled={!data.prevLessonId}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="rounded-full border-2 border-[var(--uvc-neon)] bg-[color-mix(in_srgb,var(--uvc-neon)_15%,transparent)] p-3 text-[var(--uvc-neon)]"
                onClick={() => {
                  if (!videoRef.current) return;
                  if (playing) videoRef.current.pause();
                  else void videoRef.current.play();
                }}
              >
                {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-0.5" />}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/15 p-2 text-white hover:border-[var(--uvc-neon)]"
                onClick={() => {
                  if (data.nextLessonId) router.push(`/trilha/${slug}/${data.nextLessonId}`);
                }}
                disabled={!data.nextLessonId}
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Gauge className="h-4 w-4" />
                <select
                  value={rate}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setRate(v);
                    if (videoRef.current) videoRef.current.playbackRate = v;
                  }}
                  className="rounded border border-white/10 bg-black/60 px-2 py-1 text-white"
                >
                  {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                    <option key={r} value={r}>
                      {r}x
                    </option>
                  ))}
                </select>
              </span>
              <button
                type="button"
                className="rounded border border-white/10 p-2 hover:border-[var(--uvc-neon)]"
                onClick={async () => {
                  const el = wrapRef.current;
                  if (!el) return;
                  if (!document.fullscreenElement) {
                    await el.requestFullscreen();
                    setFs(true);
                  } else {
                    await document.exitFullscreen();
                    setFs(false);
                  }
                }}
              >
                {fs ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <NeonButton type="button" className="gap-2" onClick={markComplete}>
          <CheckCircle2 className="h-4 w-4" />
          Marcar aula como concluída
        </NeonButton>
        <p className="text-xs text-zinc-500 self-center">
          O progresso é salvo automaticamente durante a reprodução. Ao concluir, você pode ganhar
          pontos (sem duplicidade por aula).
        </p>
      </div>
    </div>
  );
}
