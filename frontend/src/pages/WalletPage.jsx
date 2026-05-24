// WalletPage.jsx
/* eslint-disable react/prop-types */
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Copy, Check, DollarSign, Loader, AlertCircle } from "lucide-react";
import { C, card } from "../theme";
import { coins } from "../data/mockData";
import { useBreakpoints } from "../hooks/useBreakpoints";
import { useLang } from "../context/LangContext";
import { Badge } from "../components/SharedComponents";

const WALLET_ADDR = "TXx9kM3q8F7ZnP2R4jLwBvCe5UdHm6QrKp";

export default function WalletPage({ user }) {
  const { t } = useLang();
  const { isMobile } = useBreakpoints();
  const [tab, setTab] = useState("deposit");
  const [copied, setCopied] = useState(false);
  const [coin, setCoin] = useState("USDT");
  const [withdrawForm, setWithdrawForm] = useState({ coin: "USDT", amount: "", wallet: "" });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [txHistory] = useState([]);
  const w = t.wallet;

  const balance = user?.balance ?? 0;

  const copy = () => {
    navigator.clipboard?.writeText(WALLET_ADDR);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    setWithdrawError("");
    const amt = parseFloat(withdrawForm.amount);
    if (!withdrawForm.wallet.trim()) return setWithdrawError("Enter your wallet address");
    if (!amt || amt <= 0) return setWithdrawError("Enter a valid amount");
    if (amt > balance) return setWithdrawError(`Insufficient balance. Available: $${balance.toFixed(2)}`);
    if (amt < 10) return setWithdrawError("Minimum withdrawal is $10.00");

    setWithdrawLoading(true);
    try {
      const token = localStorage.getItem("sr_token");
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amt, coin: withdrawForm.coin, walletAddress: withdrawForm.wallet }),
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) throw new Error("Backend not connected. Run: vercel dev");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Withdrawal failed");
      setWithdrawSuccess(true);
      setWithdrawForm({ coin: "USDT", amount: "", wallet: "" });
    } catch (err) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div>
      {/* BALANCE HEADER */}
      <div style={{ ...card(), padding: isMobile ? "18px 16px" : "24px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ color: C.muted, fontSize: 11, margin: "0 0 6px", textTransform: "uppercase" }}>{w.available}</p>
          <p style={{ color: C.text, fontSize: isMobile ? 28 : 34, fontWeight: 900, margin: "0 0 3px" }}>${balance.toFixed(2)}</p>
          <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>≈ {(balance * 0.0000103).toFixed(6)} BTC · ≈ {balance.toFixed(2)} USDT</p>
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
            {withdrawSuccess ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.successDim, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Check size={24} color={C.success} />
                </div>
                <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 6px", color: C.text }}>Withdrawal Submitted</p>
                <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Your request is pending approval. You'll be notified once processed.</p>
                <button onClick={() => setWithdrawSuccess(false)} style={{ background: C.gold, border: "none", color: "#000", borderRadius: 9, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  New Withdrawal
                </button>
              </div>
            ) : (
              <>
                {withdrawError && (
                  <div style={{ background: C.dangerDim, border: `1px solid ${C.danger}44`, borderRadius: 8, padding: "10px 14px", color: C.danger, fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.selectCryptoWithdraw}</label>
                  <select
                    value={withdrawForm.coin}
                    onChange={e => setWithdrawForm(f => ({ ...f, coin: e.target.value }))}
                    style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px", fontSize: 13, outline: "none" }}
                  >
                    {coins.map(c => <option key={c.id} value={c.id}>{c.id} — {c.name}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.amount}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      value={withdrawForm.amount}
                      onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      type="number"
                      min="0"
                      step="0.01"
                      style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px 10px 32px", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                    />
                    <DollarSign size={13} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                  <p style={{ color: C.muted, fontSize: 11, margin: "5px 0 0" }}>
                    {w.minWithdraw} · Available: <span style={{ color: C.text, fontWeight: 600 }}>${balance.toFixed(2)}</span>
                  </p>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6, fontWeight: 600 }}>{w.walletAddr}</label>
                  <input
                    value={withdrawForm.wallet}
                    onChange={e => setWithdrawForm(f => ({ ...f, wallet: e.target.value }))}
                    placeholder={w.walletPlaceholder}
                    style={{ width: "100%", background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 9, padding: "10px 12px", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                  style={{ width: "100%", background: withdrawLoading ? C.dim : C.gold, border: "none", color: "#000", borderRadius: 9, padding: "12px", cursor: withdrawLoading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {withdrawLoading && <Loader size={15} style={{ animation: "spin 1s linear infinite" }} />}
                  {withdrawLoading ? "Processing…" : w.submitWithdraw}
                </button>
                <p style={{ color: C.muted, fontSize: 11, textAlign: "center", margin: "10px 0 0" }}>{w.withdrawNote}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div style={{ ...card(), padding: txHistory.length === 0 ? "40px 20px" : 0 }}>
          {txHistory.length === 0 ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: C.muted, fontSize: 14, margin: "0 0 6px" }}>No transactions yet</p>
              <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>Your deposit and withdrawal history will appear here</p>
            </div>
          ) : (
            txHistory.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: i < txHistory.length - 1 ? `1px solid ${C.border}` : "none" }}>
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
            ))
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
