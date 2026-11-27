"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { episodeCount, seriesList, type Genre, type Language, type Series } from "@/data/catalog";
import { messages } from "@/data/messages";

const filters: Array<"all" | Genre> = ["all", "fam", "rom", "thr"];
const gradient = (item: Series) => "linear-gradient(160deg," + item.colors[0] + "," + item.colors[1] + ")";

export default function MicroDramaApp() {
  const [language, setLanguage] = useState<Language>("ru");
  const [filter, setFilter] = useState<"all" | Genre>("all");
  const [current, setCurrent] = useState<Series | null>(null);
  const [episode, setEpisode] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [hintVisible, setHintVisible] = useState(false);
  const [flash, setFlash] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const episodeStripRef = useRef<HTMLDivElement>(null);
  const text = messages[language];
  const likeKey = current ? current.id + "-" + episode : "";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!current) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [current]);

  useEffect(() => {
    const strip = episodeStripRef.current;
    if (!strip || !current) return;
    const chip = strip.children.item(episode) as HTMLElement | null;
    if (!chip) return;
    const chipRect = chip.getBoundingClientRect();
    const stripRect = strip.getBoundingClientRect();
    strip.scrollTo({ left: strip.scrollLeft + chipRect.left - stripRect.left - (strip.clientWidth - chipRect.width) / 2, behavior: "smooth" });
  }, [current, episode]);
  useEffect(() => {
    if (!current) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try { video.currentTime = 0; } catch { /* Metadata may not be ready yet. */ }
    setProgress(0);
    if (!paused) void video.play().catch(() => undefined);
  }, [current, episode]);

  useEffect(() => {
    if (!current) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") goToEpisode(episode + 1);
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") goToEpisode(episode - 1);
      else if (event.key === " ") { event.preventDefault(); togglePlayback(); }
      else if (event.key === "Escape") closePlayer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current, episode, paused]);

  function openSeries(item: Series) {
    setCurrent(item);
    setEpisode(0);
    setPaused(false);
    setProgress(0);
    setHintVisible(true);
    window.setTimeout(() => setHintVisible(false), 3500);
  }

  function closePlayer() {
    videoRef.current?.pause();
    setCurrent(null);
    setPaused(false);
    setProgress(0);
    window.scrollTo(0, 0);
  }

  function goToEpisode(next: number) {
    if (next < 0) { setEpisode(0); return; }
    if (next >= episodeCount) { closePlayer(); return; }
    setEpisode(next);
    setProgress(0);
  }

  function togglePlayback() {
    const video = videoRef.current;
    const nextPaused = !paused;
    setPaused(nextPaused);
    if (!video) return;
    if (nextPaused) video.pause();
    else void video.play().catch(() => undefined);
  }

  function showFlash(value: string) {
    setFlash(value);
    window.setTimeout(() => setFlash(""), 700);
  }

  function toggleLike() {
    setLikes((old) => ({ ...old, [likeKey]: !old[likeKey] }));
  }

  async function shareSeries() {
    if (!current) return;
    try {
      if (navigator.share) await navigator.share({ title: current.title[language], url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); showFlash("🔗"); }
    } catch { /* Sharing was cancelled or is unavailable. */ }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) goToEpisode(dy < 0 ? episode + 1 : episode - 1);
    touchStart.current = null;
  }

  const featured = seriesList[0];
  const visibleSeries = seriesList.filter((item) => filter === "all" || item.genre === filter);
  const caption = current ? text.hooks[episode].replace("{A}", current.lead).replace("{B}", current.other[language]) : "";

  return (
    <>
      <main className="wrap" id="home" hidden={Boolean(current)}>
        <header className="nav">
          <span className="logo">Микродрама</span>
          <div className="seg" role="group" aria-label="Язык / Тіл">
            <button type="button" aria-pressed={language === "ru"} onClick={() => setLanguage("ru")}>РУ</button>
            <button type="button" aria-pressed={language === "kk"} onClick={() => setLanguage("kk")}>ҚАЗ</button>
          </div>
        </header>
        <h1 className="lead">{text.lead}</h1>
        <div className="chips" id="filters" role="group" aria-label={text.all}>
          {filters.map((item) => <button key={item} type="button" className="f" aria-pressed={filter === item} onClick={() => setFilter(item)}>{text[item]}</button>)}
        </div>
        <button type="button" className="feat" id="feat" hidden={filter !== "all"} style={{ background: gradient(featured) }} onClick={() => openSeries(featured)}>
          <small>{text.newt}</small><h2>{featured.title[language]}</h2><span className="pill">{text.watch}</span>
        </button>
        <div className="grid" id="grid">
          {visibleSeries.map((item) => <button type="button" className="p" key={item.id} onClick={() => openSeries(item)}>
            <div className="poster" style={{ background: gradient(item) }}>{item.title[language]}</div>
            <h3>{item.title[language]}</h3>
            <div className="m">{text[item.genre]} · {text.eps.replace("{n}", String(episodeCount))}</div>
            <div className="m">{text.free}</div>
          </button>)}
        </div>
        <p className="note" id="note">{text.note}</p>
      </main>

      {current && <section id="player" aria-label="Player" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div id="stage" style={{ background: gradient(current) }}>
          <video ref={videoRef} className="media" autoPlay muted playsInline preload="auto" onEnded={() => goToEpisode(episode + 1)} onTimeUpdate={(event) => {
            const video = event.currentTarget;
            setProgress(video.duration ? Math.min(1, video.currentTime / video.duration) : 0);
          }}>
            <source src="/videos/flower-sample.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="top">
          <div className="bars" id="bars">{Array.from({ length: episodeCount }, (_, index) => <div className={"bar" + (index < episode ? " done" : "")} key={index}><i style={{ width: index === episode ? (progress * 100) + "%" : undefined }} /></div>)}</div>
          <div className="head">
            <button type="button" className="ibtn" id="close" aria-label="Close" onClick={closePlayer}>✕</button>
            <span className="t" id="ptitle">{current.title[language]}</span>
            <button type="button" className="ibtn" id="pp" aria-label={paused ? "Play" : "Pause"} onClick={togglePlayback}>{paused ? "▶" : "❚❚"}</button>
          </div>
        </div>
        <div className="center"><p className="lab" id="lab">{text.of.replace("{n}", String(episode + 1)).replace("{m}", String(episodeCount))}</p><p className="big" id="big">{episode + 1}</p><p className="sub" id="sub" key={episode}>{caption}</p></div>
        <button type="button" className="zone zl" aria-label="Prev" onClick={() => goToEpisode(episode - 1)} />
        <button type="button" className="zone zc" aria-label="Pause" onClick={() => { togglePlayback(); showFlash(paused ? "▶" : "❚❚"); }} />
        <button type="button" className="zone zr" aria-label="Next" onClick={() => goToEpisode(episode + 1)} />
        <div className="rail"><button type="button" className="ibtn" id="like" aria-label="Like" aria-pressed={Boolean(likes[likeKey])} onClick={toggleLike}>{likes[likeKey] ? "♥" : "♡"}</button><button type="button" className="ibtn" id="share" aria-label="Share" onClick={shareSeries}>↗</button></div>
        {flash && <div className="flash">{flash}</div>}
        {hintVisible && <div className="hint">{text.hint}</div>}
        <div className="bottom">
          <div className="ctrl"><button type="button" className="ibtn" id="prev" aria-label="Prev" onClick={() => goToEpisode(episode - 1)}>‹</button><button type="button" className="ibtn" id="next" aria-label="Next" onClick={() => goToEpisode(episode + 1)}>›</button></div>
          <div className="eps" id="eps" ref={episodeStripRef}>{Array.from({ length: episodeCount }, (_, index) => <button type="button" className="chip" key={index} aria-label={text.ep + " " + (index + 1)} aria-current={index === episode ? "true" : undefined} onClick={() => goToEpisode(index)}>{index + 1}</button>)}</div>
        </div>
      </section>}
    </>
  );
}

