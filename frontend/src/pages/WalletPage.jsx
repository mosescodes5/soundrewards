// WalletPage.jsx
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Copy, Check, DollarSign } from "lucide-react";
import { C, card } from "../theme";
import { coins } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const WALLET_ADDR = "TXx9kM3q8F7ZnP2R4jLwBvCe5UdHm6QrKp";

const history = [
  { type: "deposit",  coin: "USDT", amount: "+$89.00",  status: "confirmed", date: "May 20", hash: "0x7a4f...3c9e" },
  { type: "withdraw", coin: "USDT", amount: "-$50.00",  status: "approved",  date: "May 19", hash: "0x2b1d...8f4a" },
  { type: "deposit",  coin: "BTC",  amount: "+$145.30", status: "confirmed", date: "May 15", hash: "bc1q7...2mn9" },
  { type: "withdraw", coin: "ETH",  amount: "-$30.00",  status: "pending",   date: "May 14", hash: "0x9c3e...1a7b" },
];

export default function WalletPage() {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [tab, setTab] = useState("deposit");
  const [copied, setCopied] = useState(false);
  const [coin, setCoin] = useState("USDT");
  const w = t.wallet;

  const copy = () => { navigator.clipboard?.writeText(WALLET_ADDR); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div>
      {/* BALANCE HEADER */}
      <div style={{ ...card(), padding: isMobile ? "18px 16px" : "24px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>{w.available}</p>
          <p style={{ color: C.text, fontSize: isMobile ? 28 : 34, fontWeight: 900, margin: "0 0 3px" }}>$142.50</p>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>≈ 0.00147 BTC · ≈ 142.50 USDT</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setTab("deposit")} style={{ display: "flex", alignItems: "center", gap: 7, background: C.tealDim, border: `1px solid ${C.teal}44`, color: C.teal, borderRadius: 9, padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            <ArrowDownLeft size={15} />{w.deposit}
          </button>
          <button onClick={() => setTab("withdraw")} style={{ display: "flex", alignItems: "center", gap: 7, background: C.goldDim, border: `1px solid ${C.gold}44`, color: C.gold, borderRadius: 9, padding: "10px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
            <ArrowUpRight size={15} />{w.withdraw}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 11, padding: 4, width: "fit-content" }}>
        {["deposit", "withdraw", "history"].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} style={{ background: tab === tb ? C.surface2 : "transparent", border: tab === tb ? `1px solid ${C.border2}` : "1px solid transparent", color: tab === tb ? C.text : C.muted, borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: tab === tb ? 600 : 400 }}>
            {tb === "deposit" ? w.deposit : tb === "withdraw" ? w.withdraw : w.history}
          </button>
        ))}
      </div>

      {/* DEPOSIT TAB */}
      {tab === "deposit" && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <div>
            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px", fontWeight: 600 }}>{w.selectCrypto}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {coins.map(c => (
                <div key={c.id} onClick={() => setCoin(c.id)} style={{ ...card(), padding: "12px 14px", cursor: "pointer", border: coin === c.id ? `1px solid ${c.color}88` : `1px solid ${C.border}`, background: coin === c.id ? c.color + "11" : C.surface, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: c.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: c.color }}>{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{c.id}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.muted }}>{c.name}</p>
                  </div>
                  <span style={{ fontSize: 11, color: C.muted }}>{w.minLabel} {c.min}</span>
                  {coin === c.id && <Check size={14} color={c.color} />}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ color: C.muted, fontSize: 11, margin: "0 0 10px", fontWeight: 600 }}>{w.depositAddr}</p>
            <div style={{ ...card(), padding: "20px" }}>
              {/* QR placeholder */}
              <div style={{ display: "flex", justifyContent: "center", background: "#fff", borderRadius: 10, padding: 20, marginBottom: 14 }}>
                <div style={{ width: 90, height: 90, background: "#000", borderRadius: 4, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, padding: 7 }}>
                  {Array.from({ length: 49 }, (_, i) => (
                    <div key={i} style={{ background: [0,1,2,4,6,7,14,16,18,22,24,26,28,29,30,31,32,36,38,42,44,46,48].includes(i) ? "#000" : "#fff" }} />
                  ))}
                </div>
              </div>
              <p style={{ color: C.muted, fontSize: 10, margin: "0 0 6px" }}>{w.yourAddr} ({coin})</p>
              <div style={{ display: "flex", gap: 7, alignItems: "center", background: C.surface2, borderRadius: 7, padding: "9px 11px", marginBottom: 12 }}>
                <span style={{ flex: 1, fontSize: 10, color: C.text, wordBreak: "break-all", lineHeight: 1.4 }}>{WALLET_ADDR}</span>
                <button onClick={copy} style={{ background: "transparent", border: "none", cursor: "pointer", color: copied ? C.success : C.muted, flexShrink: 0 }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div style={{ background: C.goldDim, borderRadius: 7, padding: "9px 11px" }}>
                <p style={{ color: C.gold, fontSize: 11, margin: 0 }}>{w.warning.replace("{coin}", coin)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WITHDRAW TAB */}
      {tab === "withdraw" && (
        <div style={{ maxWidth: 480 }}>
          <div style={{ ...card(), padding: "24px" }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.selectCryptoWithdraw}</label>
              <select style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px", fontSize: 13, outline: "none" }}>
                {coins.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.amount}</label>
              <div style={{ position: "relative" }}>
                <input placeholder="0.00" style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px 10px 32px", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
                <DollarSign size={13} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              </div>
              <p style={{ color: C.muted, fontSize: 11, margin: "5px 0 0" }}>{w.minWithdraw}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.walletAddr}</label>
              <input placeholder={w.walletPlaceholder} style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
            </div>
            <button style={{ width: "100%", background: C.gold, border: "none", color: "#000", borderRadius: 9, padding: "12px", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>{w.submitWithdraw}</button>
            <p style={{ color: C.muted, fontSize: 11, textAlign: "center", margin: "10px 0 0" }}>{w.withdrawNote}</p>
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div style={{ ...card(), padding: 0 }}>
          {history.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: h.type === "deposit" ? C.successDim : C.dangerDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {h.type === "deposit" ? <ArrowDownLeft size={14} color={C.success} /> : <ArrowUpRight size={14} color={C.danger} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{h.type} · {h.coin}</p>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.hash}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 13, color: h.type === "deposit" ? C.success : C.danger }}>{h.amount}</p>
                <Badge color={h.status !== "pending" ? C.success : C.gold} bg={h.status !== "pending" ? C.successDim : C.goldDim} small>{h.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}