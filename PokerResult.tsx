import React from "react";

/* ───────────────────────── ค่าโบนัสเด้ง (แก้ได้) ───────────────────────── */
const BONUS = {
  tripsFront: 5,   // หัวตอง ชั้นบน (หน้า)
  fourKind: 6,     // โฟร์การ์ด (ชั้นกลาง/หลัง)
  straightFlush: 7 // สเตรทฟลัช (ชั้นกลาง/หลัง)
};

const players = { left: "เทพพนัน", right: "Rut gambler" };

/* ฝั่งไหนฟาวล์ ให้ตั้ง true → ฝั่งนั้นแพ้ทั้ง 3 ชั้น ไม่ได้เด้ง แต่ยังโชว์ไพ่ */
const foul = { left: false, right: true };

/* suit: 'H'♥ 'D'♦ 'C'♣ 'S'♠ */
const rows = [
  {
    label: "หน้า", top: true,
    left:  { cards: ["QC", "KS", "AH"],            hand: "ไฮการ์ด", result: "win"  },
    right: { cards: ["2C", "3D", "7S"],            hand: "ไฮการ์ด", result: "lose" },
  },
  {
    label: "กลาง",
    left:  { cards: ["7S", "5H", "5C", "8S", "8C"], hand: "สองคู่",  result: "win"  },
    right: { cards: ["AH", "AS", "KC", "KD", "5H"], hand: "สองคู่",  result: "lose" },
  },
  {
    label: "หลัง",
    left:  { cards: ["6D", "JH", "JD", "2H", "2D"], hand: "สองคู่",  result: "win"  },
    right: { cards: ["8C", "9D", "4S", "6H", "JC"], hand: "ไฮการ์ด", result: "lose" },
  },
];

/* ───────────────────────── helpers ───────────────────────── */
const SUITS = { H:{sym:"♥",red:true}, D:{sym:"♦",red:true}, C:{sym:"♣",red:false}, S:{sym:"♠",red:false} };
const RVAL = {"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,J:11,Q:12,K:13,A:14};
function parseCard(code){ const suit=code.slice(-1); const rank=code.slice(0,-1); return {rank,suit,value:RVAL[rank],...SUITS[suit]}; }
const scoreOf = (r) => (r==="win"?1:r==="lose"?-1:0);
function counts(cards){ const m={}; cards.forEach(c=>{const v=parseCard(c).value; m[v]=(m[v]||0)+1;}); return Object.values(m); }
const isFlush = (cards)=>cards.every(c=>parseCard(c).suit===parseCard(cards[0]).suit);
function isStraight(cards){ let v=[...new Set(cards.map(c=>parseCard(c).value))].sort((a,b)=>a-b); if(v.length!==cards.length||v.length!==5)return false; if(v[4]-v[0]===4)return true; if(v.join()==="2,3,4,5,14")return true; return false; }
function detectBonus(cards,isTop){ const out=[]; const c=counts(cards);
  if(isTop){ if(c.includes(3)) out.push({label:"หัวตอง",pts:BONUS.tripsFront}); return out; }
  if(c.includes(4)) out.push({label:"โฟร์การ์ด",pts:BONUS.fourKind});
  if(isFlush(cards)&&isStraight(cards)) out.push({label:"สเตรทฟลัช",pts:BONUS.straightFlush});
  return out;
}

/* ───────────────────────── UI ───────────────────────── */
function Card({code}){
  const {rank,sym,red}=parseCard(code); const color=red?"#d23b3b":"#1a1a1a";
  return (
    <div className="relative bg-white rounded-lg flex-shrink-0 shadow-md" style={{width:56,height:78}}>
      <span className="absolute font-extrabold leading-none" style={{top:7,left:7,fontSize:18,color}}>{rank}</span>
      <span className="absolute leading-none" style={{bottom:9,left:"50%",transform:"translateX(-50%)",fontSize:25,color}}>{sym}</span>
    </div>
  );
}
function HandBadge({text,foul}){
  const c = foul
    ? {color:"#e89090",bg:"rgba(110,40,40,0.30)",bd:"rgba(200,90,90,0.5)"}
    : {color:"#d8cf8a",bg:"rgba(120,110,40,0.28)",bd:"rgba(180,165,70,0.45)"};
  return <span className="inline-block rounded-md font-bold" style={{padding:"6px 15px",fontSize:15,color:c.color,background:c.bg,border:`1px solid ${c.bd}`}}>{text}</span>;
}
function BonusBadge({label,pts}){
  return <span className="inline-block rounded-md font-bold" style={{padding:"5px 12px",fontSize:13,color:"#ffd25e",background:"rgba(150,110,20,0.35)",border:"1px solid rgba(255,200,80,0.55)"}}>⚡ {label} +{pts}</span>;
}
function FoulTag(){
  return <span className="inline-block rounded-md font-bold" style={{padding:"4px 12px",fontSize:13,color:"#ff8a8a",background:"rgba(150,30,30,0.4)",border:"1px solid rgba(255,90,90,0.6)"}}>⚠️ ฟาวล์</span>;
}
function ResultPill({result}){
  const win=result==="win",tie=result==="tie";
  const label=win?"ชนะ":tie?"เสมอ":"แพ้";
  const bg=win?"rgba(34,90,52,0.55)":tie?"rgba(90,90,90,0.45)":"rgba(110,40,40,0.55)";
  const bd=win?"rgba(80,180,110,0.6)":tie?"rgba(160,160,160,0.5)":"rgba(200,90,90,0.6)";
  const fg=win?"#7fe0a0":tie?"#cccccc":"#e88a8a";
  const s=scoreOf(result); const sc=s>0?"#4cd97a":s<0?"#e05c5c":"#bbb";
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-xl font-bold" style={{padding:"9px 24px",fontSize:16,color:fg,background:bg,border:`1px solid ${bd}`}}>{label}</span>
      <span className="font-extrabold" style={{fontSize:28,color:sc,minWidth:34}}>{s>0?`+${s}`:s}</span>
    </div>
  );
}
function Hand({data,align,isTop,foul,effResult}){
  const bonuses = foul ? [] : detectBonus(data.cards,isTop);
  const A = align==="left"?"items-start":"items-end";
  const J = align==="left"?"justify-start":"justify-end";
  return (
    <div className={`flex flex-col ${A}`} style={{gap:11}}>
      <div className="flex" style={{gap:5}}>{data.cards.map((c,i)=><Card key={i} code={c} />)}</div>
      <HandBadge text={data.hand} foul={foul} />
      {foul && <FoulTag />}
      {bonuses.length>0 && (
        <div className={`flex flex-wrap ${J}`} style={{gap:6}}>
          {bonuses.map((b,i)=><BonusBadge key={i} label={b.label} pts={b.pts} />)}
        </div>
      )}
      <ResultPill result={effResult} />
    </div>
  );
}

export default function PokerResult(){
  // ผลแต่ละชั้นหลังคิดฟาวล์
  const eff = rows.map(r=>{
    if(foul.left && foul.right) return {l:"tie",r:"tie"};
    if(foul.left)  return {l:"lose",r:"win"};
    if(foul.right) return {l:"win", r:"lose"};
    return {l:r.left.result, r:r.right.result};
  });

  let baseL=0,baseR=0,bonusL=0,bonusR=0;
  rows.forEach((r,i)=>{
    baseL+=scoreOf(eff[i].l); baseR+=scoreOf(eff[i].r);
    if(!foul.left)  bonusL+=detectBonus(r.left.cards,r.top).reduce((s,b)=>s+b.pts,0);
    if(!foul.right) bonusR+=detectBonus(r.right.cards,r.top).reduce((s,b)=>s+b.pts,0);
  });
  const totalL=baseL+bonusL-bonusR;
  const totalR=baseR+bonusR-bonusL;

  const Total=({score})=>{ const c=score>0?"#4cd97a":score<0?"#e05c5c":"#bbb"; return <span className="font-extrabold" style={{fontSize:34,color:c}}>{score>0?`+${score}`:score}</span>; };
  const foulNames=[foul.left&&players.left,foul.right&&players.right].filter(Boolean);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{background:"#0c2417",padding:"16px 10px"}}>
      <div className="w-full rounded-3xl" style={{maxWidth:760,background:"radial-gradient(circle at 50% 0%, #194a30 0%, #103423 55%, #0c2417 100%)",border:"1px solid rgba(120,200,150,0.18)",padding:"26px 18px 30px"}}>
        <h1 className="text-center font-extrabold" style={{color:"#e9c84a",fontSize:25,marginBottom:foulNames.length?10:22}}>
          🦊 {players.left} ⚔️ 🦊 {players.right}
        </h1>

        {foulNames.length>0 && (
          <div className="text-center font-bold" style={{color:"#ff9d4d",fontSize:17,marginBottom:18}}>
            ⚠️ {foulNames.join(" และ ")} ฟาวล์
          </div>
        )}

        {rows.map((row,i)=>(
          <div key={i} style={{marginBottom:30}}>
            <div className="grid items-start" style={{gridTemplateColumns:"1fr auto 1fr",gap:8}}>
              <Hand data={row.left}  align="left"  isTop={row.top} foul={foul.left}  effResult={eff[i].l} />
              <div className="self-center text-center font-extrabold" style={{color:"#e9c84a",fontSize:22,padding:"0 4px"}}>{row.label}</div>
              <Hand data={row.right} align="right" isTop={row.top} foul={foul.right} effResult={eff[i].r} />
            </div>
          </div>
        ))}

        {(bonusL>0||bonusR>0) && (
          <div className="rounded-2xl flex items-center justify-between" style={{background:"rgba(150,110,20,0.18)",border:"1px solid rgba(255,200,80,0.4)",padding:"12px 20px",marginBottom:12}}>
            <span style={{color:"#ffd25e",fontSize:15,fontWeight:700}}>⚡ เด้ง {players.left}: +{bonusL}</span>
            <span style={{color:"#ffd25e",fontSize:15,fontWeight:800}}>เด้งโบนัส</span>
            <span style={{color:"#ffd25e",fontSize:15,fontWeight:700}}>⚡ เด้ง {players.right}: +{bonusR}</span>
          </div>
        )}

        <div className="rounded-2xl flex items-center justify-between" style={{background:"rgba(0,0,0,0.28)",border:"1px solid rgba(120,200,150,0.18)",padding:"16px 22px"}}>
          <div className="flex flex-col items-center" style={{gap:4}}>
            <span style={{color:"#e0e0e0",fontSize:15}}>🦊 {players.left}</span>
            <Total score={totalL} />
          </div>
          <span style={{color:"#e9c84a",fontSize:18,fontWeight:800}}>รวม</span>
          <div className="flex flex-col items-center" style={{gap:4}}>
            <span style={{color:"#e0e0e0",fontSize:15}}>🦊 {players.right}</span>
            <Total score={totalR} />
          </div>
        </div>
      </div>
    </div>
  );
}
