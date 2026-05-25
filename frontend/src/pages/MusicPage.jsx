/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, CheckCircle, Volume2 } from "lucide-react";
import { C, card } from "../theme";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Full length tracks from archive.org (public domain)
const tracks = [
  {
    id: 1, title: "Midnight Frequencies", artist: "Luna Echo",
    reward: 0.45, genre: "Electronic", thumb: "🌙",
    src: "https://archive.org/download/78_hindustan_charles-wit-and-his-orchestra_gbia0000063b/Hindustan%20-%20Charles%20Wit%20and%20His%20Orchestra.mp3"
  },
  {
    id: 2, title: "Solar Wind", artist: "Drift Collective",
    reward: 0.38, genre: "Ambient", thumb: "☀️",
    src: "https://archive.org/download/78_sweet-georgia-brown_ben-bernie-and-his-hotel-roosevelt-orchestra-maceo-pinkard-kenneth_gbia0000216b/Sweet%20Georgia%20Brown%20-%20Ben%20Bernie%20and%20His%20Hotel%20Roosevelt%20Orchestra.mp3"
  },
  {
    id: 3, title: "Neon Pulse", artist: "CipherBeat",
    reward: 0.52, genre: "Synthwave", thumb: "💜",
    src: "https://archive.org/download/78_dinah_ethel-waters-and-her-ebony-four-harry-akst-sam-lewis-joe-young_gbia0000023b/Dinah%20-%20Ethel%20Waters%20and%20Her%20Ebony%20Four.mp3"
  },
  {
    id: 4, title: "Ocean Protocol", artist: "Deep Current",
    reward: 0.41, genre: "Chill", thumb: "🌊",
    src: "https://archive.org/download/78_bye-bye-blackbird_gene-austin-ray-henderson-mort-dixon_gbia0000066b/Bye%20Bye%20Blackbird%20-%20Gene%20Austin.mp3"
  },
  {
    id: 5, title: "Binary Rain", artist: "0xSoundwave",
    reward: 0.48, genre: "Tech House", thumb: "🔵",
    src: "https://archive.org/download/78_the-sheik-of-araby_helen-kane-ted-snyder-harry-b-smith-francis-wheeler_gbia0000094b/The%20Sheik%20of%20Araby%20-%20Helen%20Kane.mp3"
  },
  {
    id: 6, title: "Stellar Drift", artist: "Aurora Keys",
    reward: 0.55, genre: "Space Pop", thumb: "✨",
    src: "https://archive.org/download/78_somebody-stole-my-gal_ted-weems-and-his-orchestra-leo-wood_gbia0000047b/Somebody%20Stole%20My%20Gal%20-%20Ted%20Weems%20and%20His%20Orchestra.mp3"
  },
];

export default function MusicPage({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const m = t.music;

  const audioRef                      = useRef(null);
  const [current, setCurrent]         = useState(tracks[0]);
  const [playing, setPlaying]         = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [volume, setVolume]           = useState(0.8);
  const [liked, setLiked]             = useState([]);
  const [completed, setCompleted]     = useState([]);
  const [toast, setToast]             = useState(null);
  const [loading, setLoading]         = useState(false);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ── Audio events ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate    = () => setCurrentTime(audio.currentTime);
    const onLoadedMeta    = () => { setDuration(audio.duration); setLoading(false); };
    const onWaiting       = () => setLoading(true);
    const onCanPlay       = () => setLoading(false);
    const onEnded         = () => {
      setPlaying(false);
      if (!completed.includes(current.id)) creditReward(current);
    };

    audio.addEventListener("timeupdate",     onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("waiting",        onWaiting);
    audio.addEventListener("canplay",        onCanPlay);
    audio.addEventListener("ended",          onEnded);
    return () => {
      audio.removeEventListener("timeupdate",     onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("waiting",        onWaiting);
      audio.removeEventListener("canplay",        onCanPlay);
      audio.removeEventListener("ended",          onEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, completed]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // ── Credit reward after full listen ──────────────────────────────────────────
  const creditReward = async (track) => {
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
        const stored       = JSON.parse(localStorage.getItem("sr_user") || "{}");
        stored.balance     = data.balance;
        stored.totalEarned = (stored.totalEarned || 0) + data.reward;
        stored.dailyEarned = data.dailyEarned;
        localStorage.setItem("sr_user", JSON.stringify(stored));
        window.dispatchEvent(new Event("storage"));
        showToast(`+$${data.reward.toFixed(2)} earned!`);
      } else {
        showToast(data.message || "Limit reached for today");
      }
    } catch (err) {
      console.error("Credit error:", err);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Controls ──────────────────────────────────────────────────────────────────
  const playTrack = async (track) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (current.id !== track.id) {
      setCurrent(track);
      setCurrentTime(0);
      setDuration(0);
      setLoading(true);
      audio.src = track.src;
      audio.load();
      try { await audio.play(); setPlaying(true); } catch (e) { console.error(e); setPlaying(false); }
    } else {
      if (playing) { audio.pause(); setPlaying(false); }
      else { try { await audio.play(); setPlaying(true); } catch (e) { console.error(e); } }
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  };

  const skipForward = () => {
    const idx = tracks.findIndex(tr => tr.id === current.id);
    playTrack(tracks[(idx + 1) % tracks.length]);
  };

  const skipBack = () => {
    const audio = audioRef.current;
    // If more than 3s in, restart; otherwise go to prev track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      const idx = tracks.findIndex(tr => tr.id === current.id);
      playTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={current.src} preload="metadata" />

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, background: toast.startsWith("+") ? C.success : C.gold, color: "#000", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", transition: "all 0.3s" }}>
          {toast}
        </div>
      )}

      {/* PLAYER */}
      <div style={{ ...card(), padding: isMobile ? "18px 16px" : "24px", marginBottom: 16, background: C.surface2 }}>
        <div style={{ display: "flex", gap: isMobile ? 14 : 20, alignItems: "center", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          {/* Art */}
          <div style={{ width: isMobile ? 60 : 80, height: isMobile ? 60 : 80, borderRadius: 14, background: playing ? C.goldDim : C.surface, border: `2px solid ${playing ? C.gold : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 28 : 36, flexShrink: 0, transition: "all 0.3s" }}>
            {loading ? "⏳" : current.thumb}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
              <div>
                <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: isMobile ? 15 : 18, color: C.text }}>{current.title}</p>
                <p style={{ margin: "0 0 8px", color: C.muted, fontSize: 13 }}>{current.artist}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge color={C.gold} bg={C.goldDim}>{current.genre}</Badge>
                  <Badge color={C.success} bg={C.successDim}>+${current.reward} on completion</Badge>
                  {completed.includes(current.id) && <Badge color={C.teal} bg={C.tealDim}>✓ Completed</Badge>}
                </div>
              </div>
              {!isMobile && (
                <div style={{ textAlign: "right" }}>
                  <p style={{ color: C.muted, fontSize: 11, margin: "0 0 2px" }}>Reward</p>
                  <p style={{ color: C.gold, fontSize: 22, fontWeight: 900, margin: 0 }}>${current.reward}</p>
                </div>
              )}
            </div>

            {/* PROGRESS */}
            <div style={{ marginTop: 16 }}>
              <div onClick={seek} style={{ height: 6, background: C.surface, borderRadius: 3, cursor: "pointer", marginBottom: 6, position: "relative", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: playing ? `linear-gradient(90deg, ${C.gold}, ${C.teal})` : C.muted, borderRadius: 3, transition: "width 0.2s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.muted, fontSize: 11 }}>{fmt(currentTime)}</span>
                <span style={{ color: progress >= 100 ? C.success : C.gold, fontSize: 11, fontWeight: 600 }}>
                  {Math.round(progress)}% — {progress >= 100 ? "✓ Reward unlocked!" : "Listen to earn"}
                </span>
                <span style={{ color: C.muted, fontSize: 11 }}>{duration > 0 ? fmt(duration) : "--:--"}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 16 : 20, marginTop: 14 }}>
              {!isMobile && <button style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Shuffle size={14} /></button>}
              <button onClick={skipBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><SkipBack size={18} /></button>
              <button
                onClick={() => playTrack(current)}
                style={{ width: 48, height: 48, borderRadius: "50%", background: C.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 0 20px ${C.gold}44` }}
              >
                {playing ? <Pause size={20} color="#000" /> : <Play size={20} color="#000" style={{ marginLeft: 2 }} />}
              </button>
              <button onClick={skipForward} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><SkipForward size={18} /></button>
              {!isMobile && <Repeat size={14} color={C.muted} />}
              {!isMobile && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                  <Volume2 size={14} color={C.muted} />
                  <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ width: 80, accentColor: C.gold, cursor: "pointer" }} />
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
            <Badge color={C.success} bg={C.successDim}>{completed.length} completed</Badge>
            <Badge color={C.gold} bg={C.goldDim}>{tracks.length - completed.length} remaining</Badge>
          </div>
        </div>

        {tracks.map((tr, i) => {
          const isActive = current.id === tr.id;
          const isDone   = completed.includes(tr.id);
          return (
            <div key={tr.id} onClick={() => playTrack(tr)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < tracks.length - 1 ? `1px solid ${C.border}` : "none", background: isActive ? C.goldDim : "transparent", cursor: "pointer", transition: "background 0.2s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: isActive ? C.goldDim : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: isActive ? `1px solid ${C.gold}44` : "none" }}>
                {isActive && playing ? "▶" : tr.thumb}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? C.gold : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tr.title}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{tr.artist}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                {isDone
                  ? <CheckCircle size={16} color={C.success} />
                  : <Badge color={C.success} bg={C.successDim}>+${tr.reward}</Badge>
                }
                <button onClick={e => { e.stopPropagation(); setLiked(l => l.includes(tr.id) ? l.filter(x => x !== tr.id) : [...l, tr.id]); }} style={{ background: "none", border: "none", cursor: "pointer", color: liked.includes(tr.id) ? "#EF4444" : C.muted, padding: 0 }}>
                  <Heart size={14} fill={liked.includes(tr.id) ? "#EF4444" : "none"} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 12 }}>
        You must listen to the full track to earn rewards. Skipping disqualifies the reward.
      </p>
    </div>
  );
}