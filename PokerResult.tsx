import React from "react";

const BONUS = { tripsFront: 5, fourKind: 6, straightFlash: 7 };
const players = { left: "เทพพนัน", right: "Rut gambler" };
const foul = { left: false, right: false };

const rows = [
  {
    label: "หน้า",
    top: true,
    left: { cards: ["AS", "AD", "5C"], hand: "คู่", result: "win" },
    right: { cards: ["KH", "KD", "8S"], hand: "คู่", result: "lose" },
  },
  {
    label: "กลาง",
    left: { cards: ["QS", "QH", "3H", "JH", "4C"], hand: "คู่", result: "win" },
    right: { cards: ["JC", "JS", "QD", "9H", "7D"], hand: "คู่", result: "lose" },
  },
  {
    label: "หลัง",
    left: { cards: ["2D", "KS", "KH", "KD", "KC"], hand: "สี่ตัว", result: "win" },
    right: { cards: ["5S", "3D", "3C", "2S", "2H"], hand: "สองคู่", result: "lose" },
  },
];

const SUITS = {
  H: { sym: "♥", red: true },
  D: { sym: "♦", red: true },
  C: { sym: "♣", red: false },
  S: { sym: "♠", red: false },
};

const RVAL = { "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, J: 11, Q: 12, K: 13, A: 14 };

const parseCard = (code) => {
  const suit = code.slice(-1);
  const rank = code.slice(0, -1);
  return { rank, suit, value: RVAL[rank], ...SUITS[suit] };
};

const scoreOf = (r) => (r === "win" ? 1 : r === "lose" ? -1 : 0);

const counts = (cards) => {
  const m = {};
  cards.forEach((c) => {
    const v = parseCard(c).value;
    m[v] = (m[v] || 0) + 1;
  });
  return Object.values(m);
};

const isFlush = (cards) => cards.every((c) => parseCard(c).suit === parseCard(cards[0]).suit);

function isStraight(cards) {
  let v = [...new Set(cards.map((c) => parseCard(c).value))].sort((a, b) => a - b);
  if (v.length !== cards.length || v.length !== 5) return false;
  if (v[4] - v[0] === 4) return true;
  if (v.join() === "2,3,4,5,14") return true;
  return false;
}

function detectBonus(cards, isTop) {
  const out = [];
  const c = counts(cards);
  if (isTop) {
    if (c.includes(3)) out.push({ label: "หัวตอง", pts: BONUS.tripsFront });
    return out;
  }
  if (c.includes(4)) out.push({ label: "โฟร์การ์ด", pts: BONUS.fourKind });
  if (isFlush(cards) && isStraight(cards)) out.push({ label: "สเตรทฟลัช", pts: BONUS.straightFlash });
  return out;
}

function Card({ code }) {
  const { rank, sym, red } = parseCard(code);
  const color = red ? "#d23b3b" : "#1a1a1a";
  return (
    <div className="relative bg-white rounded-lg flex-shrink-0 shadow-md" style={{ width: 54, height: 76 }}>
      <span className="absolute font-extrabold leading-none" style={{ top: 6, left: 6, fontSize: 17, color }}>
        {rank}
      </span>
      <span
        className="absolute leading-none"
        style={{ bottom: 8, left: "50%", transform: "translateX(-50%)", fontSize: 24, color }}
      >
        {sym}
      </span>
    </div>
  );
}

function HandBadge({ text, foul }) {
  const c = foul
    ? { color: "#e89090", bg: "rgba(110,40,40,0.30)", bd: "rgba(200,90,90,0.5)" }
    : { color: "#d8cf8a", bg: "rgba(120,110,40,0.28)", bd: "rgba(180,165,70,0.45)" };
  return (
    <span className="inline-block rounded-md font-bold" style={{ padding: "6px 14px", fontSize: 14, color: c.color, background: c.bg, border: `1px solid ${c.bd}` }}>
      {text}
    </span>
  );
}

function BonusBadge({ label, pts }) {
  return (
    <span className="inline-block rounded-md font-bold" style={{ padding: "5px 11px", fontSize: 12, color: "#3a2a00", background: "linear-gradient(180deg,#ffe08a,#f5b942)", border: "1px solid #ffcf5e", boxShadow: "0 0 8px rgba(255,200,80,0.6)" }}>
      ⚡ {label} +{pts}
    </span>
  );
}

function ResultPill({ result }) {
  const win = result === "win";
  const tie = result === "tie";
  const label = win ? "ชนะ" : tie ? "เสมอ" : "แพ้";
  const bg = win ? "rgba(34,90,52,0.55)" : tie ? "rgba(90,90,90,0.45)" : "rgba(110,40,40,0.55)";
  const bd = win ? "rgba(80,180,110,0.6)" : tie ? "rgba(160,160,160,0.5)" : "rgba(200,90,90,0.6)";
  const fg = win ? "#7fe0a0" : tie ? "#cccccc" : "#e88a8a";
  return (
    <span className="rounded-xl font-bold" style={{ padding: "8px 22px", fontSize: 16, color: fg, background: bg, border: `1px solid ${bd}` }}>
      {label}
    </span>
  );
}

function ScoreNum({ score, size = 26 }) {
  const c = score > 0 ? "#4cd97a" : score < 0 ? "#e05c5c" : "#bbb";
  return (
    <span className="font-extrabold" style={{ fontSize: size, color: c }}>
      {score > 0 ? `+${score}` : score}
    </span>
  );
}

function Hand({ data, align, top, foul, result }) {
  const bonuses = foul ? [] : detectBonus(data.cards, top);
  const A = align === "left" ? "items-start" : "items-end";
  const J = align === "left" ? "justify-start" : "justify-end";
  return (
    <div className={`flex flex-col ${A}`} style={{ gap: 10 }}>
      <div className="flex" style={{ gap: 5 }}>
        {data.cards.map((c, i) => (
          <Card key={i} code={c} />
        ))}
      </div>
      <HandBadge text={data.hand} foul={foul} />
      {bonuses.length > 0 && (
        <div className={`flex flex-wrap ${J}`} style={{ gap: 6 }}>
          {bonuses.map((b, i) => (
            <BonusBadge key={i} label={b.label} pts={b.pts} />
          ))}
        </div>
      )}
      <ResultPill result={result} />
    </div>
  );
}

export default function PokerResult() {
  const eff = rows.map((r) => {
    if (foul.left && foul.right) return { l: "tie", r: "tie" };
    if (foul.left) return { l: "lose", r: "win" };
    if (foul.right) return { l: "win", r: "lose" };
    return { l: r.left.result, r: r.right.result };
  });

  const rowBonus = rows.map((r) => ({
    left: foul.left ? [] : detectBonus(r.left.cards, r.top),
    right: foul.right ? [] : detectBonus(r.right.cards, r.top),
  }));

  let baseL = 0,
    baseR = 0,
    bonusL = 0,
    bonusR = 0;
  const events = [];

  rows.forEach((r, i) => {
    baseL += scoreOf(eff[i].l);
    baseR += scoreOf(eff[i].r);
    rowBonus[i].left.forEach((b) => {
      bonusL += b.pts;
      events.push({ who: players.left, ...b, row: r.label });
    });
    rowBonus[i].right.forEach((b) => {
      bonusR += b.pts;
      events.push({ who: players.right, ...b, row: r.label });
    });
  });

  const totalL = baseL + bonusL - bonusR;
  const totalR = baseR + bonusR - bonusL;
  const hasBonus = bonusL > 0 || bonusR > 0;
  const foulNames = [foul.left && players.left, foul.right && players.right].filter(Boolean);

  const Total = ({ score }) => <ScoreNum score={score} size={34} />;

  const goldGlowStyle = {
    animation: "goldGlow 1.6s ease-in-out infinite",
    "@keyframes goldGlow": {
      "0%,100%": { boxShadow: "0 0 9px 2px rgba(255,200,80,0.40),inset 0 0 7px rgba(255,210,90,0.18)", borderColor: "rgba(255,205,90,0.65)" },
      "50%": { boxShadow: "0 0 26px 7px rgba(255,215,110,0.9),inset 0 0 14px rgba(255,225,130,0.38)", borderColor: "rgba(255,238,160,1)" },
    },
  };

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#0c2417", padding: "16px 10px" }}>
      <style>{`
        @keyframes goldGlow {
          0%, 100% {
            box-shadow: 0 0 9px 2px rgba(255,200,80,0.40), inset 0 0 7px rgba(255,210,90,0.18);
            border-color: rgba(255,205,90,0.65);
          }
          50% {
            box-shadow: 0 0 26px 7px rgba(255,215,110,0.9), inset 0 0 14px rgba(255,225,130,0.38);
            border-color: rgba(255,238,160,1);
          }
        }
        @keyframes badgePulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="w-full rounded-3xl" style={{ maxWidth: 760, background: "radial-gradient(circle at 50% 0%, #194a30 0%, #103423 55%, #0c2417 100%)", border: "1px solid rgba(120,200,150,0.18)", padding: "26px 16px 30px" }}>
        <h1 className="text-center font-extrabold" style={{ color: "#e9c84a", fontSize: 24, marginBottom: 10 }}>
          🦊 {players.left} ⚔️ 🦊 {players.right}
        </h1>

        {foulNames.length > 0 && (
          <div className="text-center font-bold" style={{ color: "#ff9d4d", fontSize: 17, marginBottom: 14 }}>
            ⚠️ {foulNames.join(" และ ")} ฟาวล์
          </div>
        )}

        {hasBonus && (
          <div className="rounded-2xl" style={{ margin: "0 0 18px", padding: "12px 16px", background: "linear-gradient(135deg,rgba(255,200,80,0.18),rgba(255,170,40,0.10))", border: "1.5px solid rgba(255,205,90,0.7)", boxShadow: "0 0 16px rgba(255,200,80,0.35)", animation: "badgePulse 1.8s ease-in-out infinite" }}>
            <div className="text-center font-extrabold" style={{ color: "#ffd25e", fontSize: 16, marginBottom: 6 }}>
              ✨ มีเด้งโบนัส! ✨
            </div>
            {events.map((e, i) => (
              <div key={i} className="text-center font-bold" style={{ color: "#ffe2a0", fontSize: 14 }}>
                🦊 {e.who} — {e.label} (ชั้น{e.row}) <span style={{ color: "#ffd25e" }}>+{e.pts}</span>
              </div>
            ))}
          </div>
        )}

        {rows.map((row, i) => {
          const glow = rowBonus[i].left.length > 0 || rowBonus[i].right.length > 0;
          return (
            <div key={i} style={{ marginBottom: 28, borderRadius: 18, padding: glow ? "14px 10px" : "0", border: glow ? "2px solid rgba(255,205,90,0.7)" : "2px solid transparent", background: glow ? "rgba(150,110,20,0.06)" : "transparent", animation: glow ? "goldGlow 1.6s ease-in-out infinite" : "none" }}>
              <div className="grid items-start" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 6 }}>
                <Hand data={row.left} align="left" top={row.top} foul={foul.left} result={eff[i].l} />
                <div className="self-center flex flex-col items-center" style={{ gap: 8, padding: "0 2px", minWidth: 64 }}>
                  <span className="font-extrabold" style={{ color: glow ? "#ffd25e" : "#e9c84a", fontSize: 20 }}>
                    {glow ? "✨ " : ""}{row.label}
                  </span>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <ScoreNum score={scoreOf(eff[i].l)} />
                    <span style={{ color: "#6f8f7c", fontSize: 16 }}>:</span>
                    <ScoreNum score={scoreOf(eff[i].r)} />
                  </div>
                </div>
                <Hand data={row.right} align="right" top={row.top} foul={foul.right} result={eff[i].r} />
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl flex items-center justify-between" style={{ background: hasBonus ? "rgba(150,110,20,0.18)" : "rgba(0,0,0,0.22)", border: `1px solid ${hasBonus ? "rgba(255,200,80,0.4)" : "rgba(120,200,150,0.14)"}`, padding: "12px 18px", marginBottom: 12 }}>
          {hasBonus ? (
            <>
              <span style={{ color: "#ffd25e", fontSize: 14, fontWeight: 700 }}>⚡ {players.left}: +{bonusL}</span>
              <span style={{ color: "#ffd25e", fontSize: 15, fontWeight: 800 }}>เด้งโบนัส</span>
              <span style={{ color: "#ffd25e", fontSize: 14, fontWeight: 700 }}>⚡ {players.right}: +{bonusR}</span>
            </>
          ) : (
            <span className="w-full text-center" style={{ color: "#8aa597", fontSize: 14, fontWeight: 600 }}>
              เด้งโบนัส — ไม่มีในรอบนี้
            </span>
          )}
        </div>

        <div className="rounded-2xl flex items-center justify-between" style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(120,200,150,0.18)", padding: "16px 22px" }}>
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <span style={{ color: "#e0e0e0", fontSize: 14 }}>🦊 {players.left}</span>
            <Total score={totalL} />
          </div>
          <span style={{ color: "#e9c84a", fontSize: 18, fontWeight: 800 }}>รวม</span>
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <span style={{ color: "#e0e0e0", fontSize: 14 }}>🦊 {players.right}</span>
            <Total score={totalR} />
          </div>
        </div>
      </div>
    </div>
  );
}
