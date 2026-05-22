// MusicPage.jsx
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Heart, CheckCircle } from "lucide-react";
import { C, card } from "../theme";
import { tracks } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function MusicPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(tracks[0]);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState([]);
  const [completed, setCompleted] = useState([1]);
  const intervalRef = useRef(null);
  const m = t.music;

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setPlaying(false);
            setCompleted(c => [...c, current.id]);
            clearInterval(intervalRef.current);
            return 100;
          }
          return p + 0.5;
        });
      }, 60);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, current]);

  const handlePlay = track => {
    if (current.id !== track.id) { setCurrent(track); setProgress(0); setPlaying(true); }
    else setPlaying(!playing);
  };

  const elapsed = Math.floor((progress / 100) * current.duration);

  return (
    <div>
      {/* PLAYER */}
      <div style={{ ...card(), padding: isMobile ? "18px 16px" : "24px", marginBottom: 16, background: C.surface2 }}>
        <div style={{ display: "flex", gap: isMobile ? 14 : 20, alignItems: isMobile ? "flex-start" : "center", flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ width: isMobile ? 60 : 72, height: isMobile ? 60 : 72, borderRadius: 14, background: C.goldDim, border: `1px solid ${C.gold}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 28 : 32, flexShrink: 0 }}>
            {current.thumb}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <p style={{ margin: "0 0 3px", fontWeight: 800, fontSize: isMobile ? 15 : 17, color: C.text }}>{current.title}</p>
                <p style={{ margin: "0 0 6px", color: C.muted, fontSize: 13 }}>{current.artist}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge color={C.gold} bg={C.goldDim}>{current.genre}</Badge>
                  <Badge color={C.success} bg={C.successDim}>🏆 +${current.reward}</Badge>
                  {completed.includes(current.id) && <Badge color={C.teal} bg={C.tealDim}>✓ {m.completed}</Badge>}
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
              <div style={{ height: 4, background: C.surface, borderRadius: 3, marginBottom: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: playing ? C.gold : C.muted, borderRadius: 3, transition: "width 0.1s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: C.muted, fontSize: 10 }}>{fmt(elapsed)}</span>
                <span style={{ color: C.gold, fontSize: 10, fontWeight: 600 }}>{Math.round(progress)}% {m.verified}</span>
                <span style={{ color: C.muted, fontSize: 10 }}>{fmt(current.duration)}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 14 : 18, marginTop: 12 }}>
              {!isMobile && <button style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><Shuffle size={14} /></button>}
              <button onClick={() => { setProgress(0); setPlaying(false); }} style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><SkipBack size={16} /></button>
              <button onClick={() => handlePlay(current)} style={{ width: 42, height: 42, borderRadius: "50%", background: C.gold, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {playing ? <Pause size={18} color="#000" /> : <Play size={18} color="#000" style={{ marginLeft: 2 }} />}
              </button>
              <button style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted }}><SkipForward size={16} /></button>
              {!isMobile && <Repeat size={14} color={C.muted} />}
            </div>
          </div>
        </div>
      </div>

      {/* TRACK LIST */}
      <div style={{ ...card(), padding: 0 }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{m.available}</p>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge color={C.success} bg={C.successDim}>{completed.length} ✓</Badge>
            <Badge color={C.gold} bg={C.goldDim}>{tracks.length - completed.length} {m.remaining}</Badge>
          </div>
        </div>
        {tracks.map((tr, i) => {
          const isActive = current.id === tr.id;
          const isDone = completed.includes(tr.id);
          return (
            <div key={tr.id} onClick={() => handlePlay(tr)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < tracks.length - 1 ? `1px solid ${C.border}` : "none", background: isActive ? C.goldDim : "transparent", cursor: "pointer" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: isActive ? C.goldDim : C.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{tr.thumb}</div>
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