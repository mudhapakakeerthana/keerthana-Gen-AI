const ASSETS = [
  { id:"s1", type:"Stock", symbol:"RELIANCE", name:"Reliance Industries", exchange:"NSE", sector:"Energy", price:2850, changePct:0.9, cagr3y:16.2, risk:"Moderate" },
  { id:"s2", type:"Stock", symbol:"TCS", name:"Tata Consultancy Services", exchange:"NSE", sector:"IT", price:4150, changePct:-0.4, cagr3y:10.5, risk:"Low" },
  { id:"s3", type:"Stock", symbol:"HDFCBANK", name:"HDFC Bank", exchange:"NSE", sector:"Banking", price:1560, changePct:1.4, cagr3y:11.8, risk:"Low" },
  { id:"mf1", type:"Mutual Fund", symbol:"UTI-N50", name:"UTI Nifty 50 Index Fund", aumCr:12000, expense:0.2, cagr3y:12.4, risk:"Moderate", benchmark:"NIFTY 50" },
  { id:"mf2", type:"Mutual Fund", symbol:"PPFAS", name:"Parag Parikh Flexi Cap Fund", aumCr:56000, expense:0.75, cagr3y:18.2, risk:"Moderate", benchmark:"NIFTY 500" },
  { id:"etf1", type:"ETF", symbol:"NIFTYBEES", name:"Nippon India ETF Nifty 50", aumCr:19000, expense:0.05, cagr3y:12.3, risk:"Moderate", benchmark:"NIFTY 50" },
  { id:"etf2", type:"ETF", symbol:"GOLDBEES", name:"Nippon India ETF Gold", aumCr:7500, expense:0.55, cagr3y:9.2, risk:"Low", benchmark:"Gold" },
  { id:"i1", type:"Index", symbol:"NIFTY50", name:"NIFTY 50", price:22350, changePct:0.6, risk:"Moderate" },
  { id:"i2", type:"Index", symbol:"SENSEX", name:"BSE SENSEX", price:74010, changePct:-0.1, risk:"Moderate" },
];

const NEWS = [
  { title:"RBI commentary: liquidity conditions remain under watch", src:"Macro", time:"2h" },
  { title:"Large-cap IT: margins stabilize; deal pipeline stays selective", src:"Sector", time:"5h" },
  { title:"Index update: NIFTY breadth improves; financials lead", src:"Markets", time:"8h" },
];

const watch = new Set(["s1","etf1","mf2"]);

function inr(n){
  if(n==null) return "—";
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n);
}
function num(n){
  if(n==null) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits:2 }).format(n);
}
function pct(n){
  if(n==null) return "—";
  return `${n>0?"+":""}${Number(n).toFixed(2)}%`;
}
function badgeClass(n){
  if(n==null) return "badge flat";
  if(n>0) return "badge up";
  if(n<0) return "badge down";
  return "badge flat";
}

function setIndexHeader(){
  const n50 = ASSETS.find(a=>a.symbol==="NIFTY50");
  const sx = ASSETS.find(a=>a.symbol==="SENSEX");
  document.getElementById("niftyVal").textContent = num(n50.price);
  const nc = document.getElementById("niftyChg");
  nc.textContent = pct(n50.changePct);
  nc.className = badgeClass(n50.changePct);

  document.getElementById("sensexVal").textContent = num(sx.price);
  const sc = document.getElementById("sensexChg");
  sc.textContent = pct(sx.changePct);
  sc.className = badgeClass(sx.changePct);

  document.getElementById("yr").textContent = new Date().getFullYear();
}

function toggleWatch(id){
  if(watch.has(id)) watch.delete(id);
  else watch.add(id);
  render();
}

function score(a){
  return (watch.has(a.id)?2:0) + (a.type==="Index"?0.3:0) + (a.changePct?Math.abs(a.changePct)/10:0) + (a.cagr3y?a.cagr3y/50:0);
}

function render(){
  const q = (document.getElementById("q").value || "").trim().toLowerCase();
  const type = document.getElementById("type").value;
  const risk = document.getElementById("risk").value;
  const sort = document.getElementById("sort").value;

  let items = ASSETS.filter(a=>{
    const matchesQ = !q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.sector||"").toLowerCase().includes(q);
    const matchesType = type==="All" ? true : a.type===type;
    const matchesRisk = risk==="All" ? true : a.risk===risk;
    return matchesQ && matchesType && matchesRisk;
  });

  items.sort((a,b)=>{
    if(sort==="Change") return (b.changePct??-999)-(a.changePct??-999);
    if(sort==="Price") return (b.price??-999)-(a.price??-999);
    if(sort==="3Y CAGR") return (b.cagr3y??-999)-(a.cagr3y??-999);
    if(sort==="Expense") return (a.expense??999)-(b.expense??999);
    return score(b)-score(a);
  });

  const tbody = document.getElementById("rows");
  tbody.innerHTML = "";

  items.forEach(a=>{
    const tr = document.createElement("tr");

    const star = document.createElement("td");
    star.innerHTML = `<span class="star" title="Watchlist">${watch.has(a.id) ? "★" : "☆"}</span>`;
    star.onclick = ()=>toggleWatch(a.id);

    const asset = document.createElement("td");
    asset.innerHTML = `
      <div class="asset-name">${a.symbol} · ${a.name}</div>
      <div class="asset-sub">${a.exchange ? `${a.exchange} · ` : ""}${a.sector ? a.sector : a.benchmark ? `Benchmark: ${a.benchmark}` : ""}</div>
    `;

    const typeTd = document.createElement("td");
    typeTd.textContent = a.type;

    const price = document.createElement("td");
    price.className="right";
    price.textContent = (a.type==="Stock"||a.type==="Index") ? inr(a.price) : `AUM ${num(a.aumCr)} Cr`;

    const daily = document.createElement("td");
    daily.className="right";
    daily.innerHTML = (a.type==="Stock"||a.type==="Index") ? `<span class="${badgeClass(a.changePct)}">${pct(a.changePct)}</span>` : "—";

    const cagr = document.createElement("td");
    cagr.className="right";
    cagr.textContent = a.cagr3y ? pct(a.cagr3y) : "—";

    const riskTd = document.createElement("td");
    riskTd.className="right";
    riskTd.textContent = a.risk || "—";

    tr.append(star, asset, typeTd, price, daily, cagr, riskTd);
    tbody.appendChild(tr);
  });
}

function renderNews(){
  const box = document.getElementById("news");
  box.innerHTML = "";
  NEWS.forEach(n=>{
    const row = document.createElement("div");
    row.className="news-item";
    row.innerHTML = `
      <div class="dot">📰</div>
      <div>
        <div class="asset-name">${n.title}</div>
        <div class="asset-sub">${n.src} · ${n.time} ago</div>
      </div>
    `;
    box.appendChild(row);
  });
}

function quickSearch(text){
  document.getElementById("q").value = text;
  document.getElementById("type").value = "All";
  document.getElementById("risk").value = "All";
  render();
  document.getElementById("screener").scrollIntoView({behavior:"smooth"});
}

function openModal(){
  document.getElementById("modal").classList.add("open");
}
function closeModal(){
  document.getElementById("modal").classList.remove("open");
}

window.quickSearch = quickSearch;
window.openModal = openModal;
window.closeModal = closeModal;

setIndexHeader();
renderNews();
render();
function computeRiskScore(){
  const tol = Number(document.getElementById("riskTol").value || 5);
  const horizon = document.getElementById("horizon").value;

  let horizonBoost = 0;
  if(horizon === "short") horizonBoost = -10;
  if(horizon === "mid") horizonBoost = 0;
  if(horizon === "long") horizonBoost = 10;

  // Score 0..100
  let score = Math.round((tol * 10) + horizonBoost);
  score = Math.max(0, Math.min(100, score));
  return score;
}

function riskLabel(score){
  if(score <= 35) return "Low";
  if(score <= 70) return "Moderate";
  return "High";
}

function updateRiskUI(){
  const tolEl = document.getElementById("riskTol");
  const tol = Number(tolEl.value || 5);
  const score = computeRiskScore();

  document.getElementById("riskTolVal").textContent = tol;
  const scoreEl = document.getElementById("riskScore");
  scoreEl.textContent = score;
  scoreEl.classList.remove("pop");
  void scoreEl.offsetWidth; // reflow for animation
  scoreEl.classList.add("pop");

  document.getElementById("riskMsg").textContent =
    `Suggested screener risk: ${riskLabel(score)} (score ${score}).`;
}

function applyRiskPreset(){
  const score = computeRiskScore();
  const label = riskLabel(score);

  // Set existing screener risk dropdown if present
  const riskSelect = document.getElementById("risk");
  if(riskSelect){
    riskSelect.value = label;
  }

  render();
  document.getElementById("screener").scrollIntoView({behavior:"smooth"});
}

function resetRiskPreset(){
  const riskSelect = document.getElementById("risk");
  if(riskSelect) riskSelect.value = "All";
  document.getElementById("riskTol").value = 5;
  document.getElementById("horizon").value = "mid";
  updateRiskUI();
  render();
}

window.applyRiskPreset = applyRiskPreset;
window.resetRiskPreset = resetRiskPreset;

// Hook up listeners if widget exists
const rt = document.getElementById("riskTol");
const hz = document.getElementById("horizon");
if(rt && hz){
  rt.addEventListener("input", updateRiskUI);
  hz.addEventListener("change", updateRiskUI);
  updateRiskUI();
}
