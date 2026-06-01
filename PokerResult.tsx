import React from "react";

/* ───────────────────────── ค่าโบนัสเด้ง (แก้ได้) ─────────────────────────
   ฝั่งที่ได้มือพิเศษ +แต้ม / อีกฝั่ง −แต้ม (zero-sum) บวกทับแต้มชนะ-แพ้ปกติ ±1
*/
const BONUS = {
  tripsFront: 5,   // หัวตอง ชั้นบน (หน้า)
  fourKind: 6,     // โฟร์การ์ด (ชั้นกลาง/หลัง)
  straightFlush: 7 // สเตรทฟลัช (ชั้นกลาง/หลัง)
};

/* ───────────────────────── ข้อมูลเกม ─────────────────────────
   suit: 'H'♥ 'D'♦ 'C'♣ 'S'♠   |   result: 'win' | 'lose' | 'tie'
   แต้มเด้งคำนวณอัตโนมัติจากไพ่ ไม่ต้องกรอกเอง
*/
const players = { left: "เทพพนัน", right: "Rut gambler" };

const rows = [
  {
    label: "หน้า", top: true,
    left:  { cards: ["10H", "KC", "5C"],            hand: "ไฮการ์ด",  result: "win"  },
    right: { cards: ["9H", "6D", "2H"],             hand: "ไฮการ์ด",  result: "lose" },
  },
  {
    label: "กลาง",
    left:  { cards: ["6C", "5D", "4D", "8C", "7C"], hand: "สตรีท",    result: "lose" },
    right: { cards: ["AS", "8S", "5S", "4S", "2S"], hand: "ฟลัช",     result: "win"  },
  },
  {
    label: "หลัง",
    left:  { cards: ["QS", "QH", "QC", "JS", "JH"], hand: "ฟูลเฮ้าส์", result: "win"  },
    right: { cards: ["AC", "10C", "9C", "4C", "3C"], hand: "ฟลัช",    result: "lose" },
  },
];

/* ───────────────────────── helpers ───────────────────────── */
const SUITS = {
  H: { sym: "♥", red: true },
  D: { sym: "♦", red: true },
  C: { sym: "♣", red: false },
  S: { sym: "♠", red: false },
};
const RVAL = { "2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:11,Q:12,K:13,A:14 };

function parseCard(code) {
  const suit = code.slice(-1);
  const rank = code.slice(0, -1);
  return { rank, suit, value: RVAL[rank], ...SUITS[suit] };
}
const scoreOf = (r) => (r === "win" ? 1 : r === "lose" ? -1 : 0);

/* นับจำนวนแต่ละแต้ม */
function counts(cards) {
  const m = {};
  cards.forEach((c) => { const v = parseCard(c).value; m[v] = (m[v] || 0) + 1; });
  return Object.values(m);
}
const isFlush = (cards) => cards.every((c) => parseCard(c).suit === parseCard(cards[0]).suit);
function isStraight(cards) {
  let vals = [...new Set(cards.map((c) => parseCard(c).value))].sort((a, b) => a - b);
  if (vals.length !== cards.length) return false;
  if (vals.length !== 5) return false;
  if (vals[4] - vals[0] === 4) return true;
  // wheel A-2-3-4-5
  if (vals.join() === "2,3,4,5,14") return true;
  return false;
}

/* ตรวจจับเด้งของมือเดียว → คืนรายการโบนัส */
function detectBonus(cards, isTop) {
  const out = [];
  const c = counts(cards);
  if (isTop) {
    if (c.includes(3)) out.push({ key: "tripsFront", label: "ตอง", pts: BONUS.tripsFront });
    return out;
  }
  if (c.includes(4)) out.push({ key: "fourKind", label: "โฟร์การ์ด", pts: BONUS.fourKind });
  if (isFlush(cards) && isStraight(cards))
    out.push({ key: "straightFlush", label: "สเตรทฟลัช", pts: BONUS.straightFlush });
  return out;
}

/* ───────────────────────── UI ───────────────────────── */
function Card({ code }) {
  const { rank, sym, red } = parseCard(code);
  const color = red ? "#d23b3b" : "#1a1a1a";
  return (
    <div className="relative bg-white rounded-lg flex-shrink-0 shadow-md" style={{ width: 56, height: 78 }}>
      <span className="absolute font-extrabold leading-none" style={{ top: 7, left: 7, fontSize: 18, color }}>{rank}</span>
      <span className="absolute leading-none" style={{ bottom: 9, left: "50%", transform: "translateX(-50%)", fontSize: 25, color }}>{sym}</span>
    </div>
  );
}

function HandBadge({ text }) {
  return (
    <span className="inline-block rounded-md font-bold" style={{ padding: "6px 15px", fontSize: 15, color: "#d8cf8a", background: "rgba(120,110,40,0.28)", border: "1px solid rgba(180,165,70,0.45)" }}>
      {text}
    </span>
  );
}

function BonusBadge({ label, pts }) {
  return (
    <span className="inline-block rounded-md font-bold" style={{ padding: "5px 12px", fontSize: 13, color: "#ffd25e", background: "rgba(150,110,20,0.35)", border: "1px solid rgba(255,200,80,0.55)" }}>
      ⚡ {label} +{pts}
    </span>
  );
}

function ResultPill({ result }) {
  const win = result === "win", tie = result === "tie";
  const label = win ? "ชนะ" : tie ? "เสมอ" : "แพ้";
  const bg = win ? "rgba(34,90,52,0.55)" : tie ? "rgba(90,90,90,0.45)" : "rgba(110,40,40,0.55)";
  const border = win ? "rgba(80,180,110,0.6)" : tie ? "rgba(160,160,160,0.5)" : "rgba(200,90,90,0.6)";
  const fg = win ? "#7fe0a0" : tie ? "#cccccc" : "#e88a8a";
  const s = scoreOf(result);
  const sc = s > 0 ? "#4cd97a" : s < 0 ? "#e05c5c" : "#bbb";
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-xl font-bold" style={{ padding: "9px 24px", fontSize: 16, color: fg, background: bg, border: `1px solid ${border}` }}>{label}</span>
      <span className="font-extrabold" style={{ fontSize: 28, color: sc, minWidth: 34 }}>{s > 0 ? `+${s}` : s}</span>
    </div>
  );
}

function Hand({ data, align, isTop }) {
  const bonuses = detectBonus(data.cards, isTop);
  return (
    <div className={`flex flex-col ${align === "left" ? "items-start" : "items-end"}`} style={{ gap: 11 }}>
      <div className="flex" style={{ gap: 5 }}>
        {data.cards.map((c, i) => <Card key={i} code={c} />)}
      </div>
      <HandBadge text={data.hand} />
      {bonuses.length > 0 && (
        <div className={`flex flex-wrap ${align === "left" ? "justify-start" : "justify-end"}`} style={{ gap: 6 }}>
          {bonuses.map((b, i) => <BonusBadge key={i} label={b.label} pts={b.pts} />)}
        </div>
      )}
      <ResultPill result={data.result} />
    </div>
  );
}

export default function PokerResult() {
  // แต้มฐานชั้นละ ±1
  let baseL = 0, baseR = 0, bonusL = 0, bonusR = 0;
  rows.forEach((r) => {
    baseL += scoreOf(r.left.result);
    baseR += scoreOf(r.right.result);
    bonusL += detectBonus(r.left.cards, r.top).reduce((s, b) => s + b.pts, 0);
    bonusR += detectBonus(r.right.cards, r.top).reduce((s, b) => s + b.pts, 0);
  });
  // เด้งเป็น zero-sum: ฝั่งได้ +, อีกฝั่ง −
  const totalL = baseL + bonusL - bonusR;
  const totalR = baseR + bonusR - bonusL;

  const Total = ({ score }) => {
    const c = score > 0 ? "#4cd97a" : score < 0 ? "#e05c5c" : "#bbb";
    return <span className="font-extrabold" style={{ fontSize: 34, color: c }}>{score > 0 ? `+${score}` : score}</span>;
  };

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#0c2417", padding: "16px 10px" }}>
      <div className="w-full rounded-3xl" style={{ maxWidth: 760, background: "radial-gradient(circle at 50% 0%, #194a30 0%, #103423 55%, #0c2417 100%)", border: "1px solid rgba(120,200,150,0.18)", padding: "26px 18px 30px" }}>
        <h1 className="text-center font-extrabold" style={{ color: "#e9c84a", fontSize: 25, marginBottom: 22 }}>
          🦊 {players.left} ⚔️ 🦊 {players.right}
        </h1>

        {rows.map((row, i) => (
          <div key={i} style={{ marginBottom: 30 }}>
            <div className="grid items-start" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 8 }}>
              <Hand data={row.left} align="left" isTop={row.top} />
              <div className="self-center text-center font-extrabold" style={{ color: "#e9c84a", fontSize: 22, padding: "0 4px" }}>{row.label}</div>
              <Hand data={row.right} align="right" isTop={row.top} />
            </div>
          </div>
        ))}

        {/* แถบเด้งโบนัส (โชว์เมื่อมีอย่างน้อยฝั่งหนึ่งติดเด้ง) */}
        {(bonusL > 0 || bonusR > 0) && (
          <div className="rounded-2xl flex items-center justify-between" style={{ background: "rgba(150,110,20,0.18)", border: "1px solid rgba(255,200,80,0.4)", padding: "12px 20px", marginBottom: 12 }}>
            <span style={{ color: "#ffd25e", fontSize: 15, fontWeight: 700 }}>⚡ เด้ง {players.left}: +{bonusL}</span>
            <span style={{ color: "#ffd25e", fontSize: 15, fontWeight: 800 }}>เด้งโบนัส</span>
            <span style={{ color: "#ffd25e", fontSize: 15, fontWeight: 700 }}>⚡ เด้ง {players.right}: +{bonusR}</span>
          </div>
        )}

        {/* สรุปคะแนนรวม */}
        <div className="rounded-2xl flex items-center justify-between" style={{ background: "rgba(0,0,0,0.28)", border: "1px solid rgba(120,200,150,0.18)", padding: "16px 22px" }}>
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <span style={{ color: "#e0e0e0", fontSize: 15 }}>🦊 {players.left}</span>
            <Total score={totalL} />
          </div>
          <span style={{ color: "#e9c84a", fontSize: 18, fontWeight: 800 }}>รวม</span>
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <span style={{ color: "#e0e0e0", fontSize: 15 }}>🦊 {players.right}</span>
            <Total score={totalR} />
          </div>
        </div>
      </div>
    </div>
  );
}
