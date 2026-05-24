/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, CheckCircle, Volume2 } from "lucide-react";
import { C, card } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Free sample tracks from freemusicarchive / pixabay (replace with your own URLs)
const tracks = [
  { id: 1, title: "Midnight Frequencies", artist: "Luna Echo",       duration: 30, reward: 0.45, genre: "Electronic", thumb: "🌙", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Solar Wind",           artist: "Drift Collective", duration: 30, reward: 0.38, genre: "Ambient",    thumb: "☀️", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Neon Pulse",           artist: "CipherBeat",       duration: 30, reward: 0.52, genre: "Synthwave",  thumb: "💜", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Ocean Protocol",       artist: "Deep Current",     duration: 30, reward: 0.41, genre: "Chill",      thumb: "🌊", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Binary Rain",          artist: "0xSoundwave",      duration: 30, reward: 0.48, genre: "Tech House", thumb: "🔵", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: 6, title: "Stellar Drift",        artist: "Aurora Keys",      duration: 30, reward: 0.55, genre: "Space Pop",  thumb: "✨", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
];

export default function MusicPage({ user, onBalanceUpdate }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const m = t.music;

  const audioRef                    = useRef(null);
  const [current, setCurrent]       = useState(tracks[0]);
  const [playing, setPlaying]       = useState(false);
  const [progress, setProgress]     = useState(0);    // 0-100
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volume, setVolume]         = useState(0.8);
  const [liked, setLiked]           = useState([]);
  const [completed, setCompleted]   = useState([]);
  const [earning, setEarning]       = useState(null); // shows reward toast
  const [credited, setCredited]     = useState({}); // trackId -> amount credited

  // ── Audio event listeners ───────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setPlaying(false);
      if (!completed.includes(current.id)) {
        handleTrackComplete(current);
      }
    };

    audio.addEventListener("timeupdate",     onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended",          onEnded);

    return () => {
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended",          onEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, completed]);

  // ── Sync volume ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── When track completes — call backend ─────────────────────────────────────
  const handleTrackComplete = async (track) => {
    setCompleted(c => [...c, track.id]);

    const token = localStorage.getItem("sr_token");
    if (!token) return;

    try {
      const res  = await fetch("/api/music/complete", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ trackId: track.id, reward: track.reward }),
      });
      const data = await res.json();

      if (data.success) {
        // Update localStorage balance
        const stored = JSON.parse(localStorage.getItem("sr_user") || "{}");
        stored.balance    = data.balance;
        stored.totalEarned = (stored.totalEarned || 0) + data.reward;
        localStorage.setItem("sr_user", JSON.stringify(stored));

        // Notify parent (Dashboard) to refresh balance
        if (onBalanceUpdate) onBalanceUpdate(data.balance);

        // Show reward toast
        setCredited(prev => ({ ...prev, [track.id]: data.reward }));
        setEarning(`+$${data.reward.toFixed(2)} earned!`);
        setTimeout(() => setEarning(null), 3000);
      }
    } catch (err) {
      console.error("Failed to credit reward:", err);
    }
  };

  // ── Play / pause ─────────────────────────────────────────────────────────────
  const handlePlay = async (track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (current.id !== track.id) {
      // Switch track
      setCurrent(track);
      setProgress(0);
      setCurrentTime(0);
      audio.src = track.src;
      audio.load();
      try { await audio.play(); setPlaying(true); } catch (e) { console.error(e); }
    } else {
      // Toggle play/pause
      if (playing) { audio.pause(); setPlaying(false); }
      else { try { await audio.play(); setPlaying(true); } catch (e) { console.error(e); } }
    }
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  const handleSkipForward = () => {
    const idx  = tracks.findIndex(t => t.id === current.id);
    const next = tracks[(idx + 1) % tracks.length];
    handlePlay(next);
  };

  const handleSkipBack = () => {
    const idx  = tracks.findIndex(t => t.id === current.id);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    handlePlay(prev);
  };

  const progressPct = progress || 0;
  const displayTime = currentTime || 0;
  const displayDur  = duration   || current.duration;

  return (
    <div>
      {/* Hidden audio element */}
      <audio ref={audioRef} src={current.src} preload="metadata" />

      {/* Reward toast */}
      {earning && (
        <div style={{ position: "fixed", top: 20, right: 20, background: C.success, color: "#000", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 14, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {earning}
        </div>
      )}

      {/* PLAYER CARD */}
      <div style={{ ...card(), padding: isMobile ? "18px 16px" : "24px", marginBottom: 16, background: C.surface2 }}>
        <div style={{ display: "flex", gap: isMobile ? 14 : 20, alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          {/* Thumbnail */}
          <div style={{ width: isMobile ? 60 : 72, height: isMobile ? 60 : 72, borderRadius: 14, background: playing ? C.goldDim : C.surface, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 28 : 32, flexShrink: 0, transition: "background 0.3s" }}>
            {current.thumb}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: isMobile ? 15 : 17, color: C.text }}>{current.title}</p>
                <p style={{ margin: "0 0 6px", color: C.muted, fontSize: 13 }}>{current.artist}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge color={C.gold} bg={C.goldDim}>{current.genre}</Badge>
                  <Badge color={C.success} bg={C.successDim}>+${current.reward}</Badge>
                  {completed.includes(current.id) && <Badge color={C.teal} bg={C.tealDim}>✓ {m.completed}</Badge>}
                  {credited[current.id] && <Badge color={C.success} bg={C.successDim}>+${credited[current.id].toFixed(2)} credited</Badge>}
                </div>
              </div>
              {!isMobile && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: C.muted, fontSize: 11, margin: "0 0 3px" }}>{m.reward}</p>
                  <p style={{ color: C.gold, fontSize: 20, fontWeight: 800, margin: 0 }}>${current.reward}</p>
                </div>
              )}
            </div>

            {/* PROGRESS BAR */}
            <div style={{ marginTop: 14 }}>
              <div
                onClick={handleSeek}
                style={{ height: 6, background: C.surface, borderRadius: 3, marginBottom: 5, overflow: "hidden", cursor: "pointer" }}
              >
                <div style={{ height: "100%", width: `${progressPct}%`, background: playing ? C.gold : C.muted, borderRadius: 3, transition: "width 0.1s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.muted, fontSize: 10 }}>{fmt(displayTime)}</span>
                <span style={{ color: C.gold, fontSize: 10, fontWeight: 600 }}>{Math.round(progressPct)}% {m.verified}</span>
                <span style={{ color: C.muted, fontSize: 10 }}>{fmt(displayDur)}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 18, marginTop: 12 }}>
              {!isMobile && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><Shuffle size={14} /></button>}
              <button onClick={handleSkipBack} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><SkipBack size={16} /></button>
              <button
                onClick={() => handlePlay(current)}
                style={{ width: 42, height: 42, borderRadius: "50%", background: C.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                {playing ? <Pause size={18} color="#000" /> : <Play size={18} color="#000" style={{ marginLeft: 2 }} />}
              </button>
              <button onClick={handleSkipForward} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><SkipForward size={16} /></button>
              {!isMobile && <Repeat size={14} color={C.muted} />}

              {/* VOLUME */}
              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                  <Volume2 size={14} color={C.muted} />
                  <input
                    type="range" min="0" max="1" step="0.05"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    style={{ width: 70, accentColor: C.gold, cursor: "pointer" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRACK LIST */}
      <div style={{ ...card(), padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{m.available}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color={C.success} bg={C.successDim}>{completed.length} done</Badge>
            <Badge color={C.gold}    bg={C.goldDim}>{tracks.length - completed.length} {m.remaining}</Badge>
          </div>
        </div>

        {tracks.map((tr, i) => {
          const isActive = current.id === tr.id;
          const isDone   = completed.includes(tr.id);
          return (
            <div
              key={tr.id}
              onClick={() => handlePlay(tr)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < tracks.length - 1 ? `1px solid ${C.border}` : "none", background: isActive ? C.goldDim : "transparent", cursor: "pointer" }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 9, background: isActive ? C.goldDim : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {isActive && playing ? "▶" : tr.thumb}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.gold : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tr.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{tr.artist}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {isDone && <CheckCircle size={14} color={C.success} />}
                <Badge color={C.success} bg={C.successDim}>+${tr.reward}</Badge>
                {!isMobile && <span style={{ color: C.muted, fontSize: 11 }}>{fmt(tr.duration)}</span>}
                <button
                  onClick={e => { e.stopPropagation(); setLiked(l => l.includes(tr.id) ? l.filter(x => x !== tr.id) : [...l, tr.id]); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: liked.includes(tr.id) ? "#EF4444" : C.muted, padding: 0 }}
                >
                  <Heart size={14} fill={liked.includes(tr.id) ? "#EF4444" : "none"} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}