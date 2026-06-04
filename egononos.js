// EGONON SA — EgononOS v5
// Script unificato (esterno) — nessun inline per compatibilità CSP


  (function() {
  const lf = document.getElementById('leadForm');
  if(!lf) return;
  lf.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Invio in corso...';

    const payload = {
      nome: document.getElementById('nome').value.trim(),
      cognome: document.getElementById('cognome').value.trim(),
      email: document.getElementById('email').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      professione: document.getElementById('professione').value.trim(),
      patrimonio_stimato: document.getElementById('patrimonio').value,
      messaggio: document.getElementById('messaggio').value.trim(),
    };

    try {
      const res = await fetch('https://superagent-df474b25.base44.app/functions/submitLeadAnalisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) {
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
      } else {
        alert('Errore: ' + (data.error || 'Si prega di riprovare.'));
        btn.disabled = false;
        btn.textContent = 'Richiedi analisi gratuita →';
      }
    } catch (err) {
      alert('Errore di connessione. Si prega di riprovare.');
      btn.disabled = false;
      btn.textContent = 'Richiedi analisi gratuita →';
    }
  });
  })();



// ── DATI STORICI MENSILI ──
const SIM_MONTHLY = {
  "2010": {4:0.0,5:1.3,6:1.1,7:-0.5,8:3.2,9:-0.7,10:0.1,11:-1.3,12:0.0},
  "2011": {1:-1.8,2:1.5,3:-0.1,4:3.5,5:-0.9,6:-0.7,7:2.8,8:-0.3,9:-0.8,10:1.6,11:-0.1,12:0.6},
  "2012": {1:2.3,2:0.7,3:-0.2,4:1.0,5:0.3,6:0.4,7:2.2,8:0.6,9:0.5,10:-0.4,11:1.0,12:-0.3},
  "2013": {1:-0.4,2:1.1,3:1.1,4:2.0,5:-1.7,6:-2.2,7:0.6,8:-0.5,9:2.0,10:1.9,11:1.6,12:-0.1},
  "2014": {1:0.1,2:1.9,3:0.0,4:0.3,5:1.7,6:1.0,7:0.5,8:2.2,9:-0.3,10:0.4,11:2.1,12:0.3},
  "2015": {1:2.4,2:1.4,3:1.2,4:-1.5,5:-0.8,6:-3.1,7:1.3,8:-3.6,9:-0.8,10:1.9,11:0.4,12:-1.2},
  "2016": {1:0.6,2:0.6,3:0.2,4:-0.2,5:-0.2,6:2.3,7:0.9,8:-0.4,9:0.3,10:-1.1,11:-3.0,12:0.3},
  "2017": {1:1.2,2:1.8,3:-0.4,4:0.4,5:0.5,6:-1.3,7:0.6,8:1.5,9:-0.9,10:1.8,11:0.7,12:0.4},
  "2018": {1:1.3,2:-1.1,3:-1.2,4:1.1,5:1.0,6:0.4,7:0.1,8:0.8,9:-0.6,10:-2.2,11:0.1,12:-2.4},
  "2019": {1:2.8,2:1.0,3:2.6,4:0.9,5:-2.7,6:2.9,7:-0.1,8:-0.1,9:-0.1,10:-0.2,11:0.3,12:0.7},
  "2020": {1:0.7,2:-1.0,3:-3.5,4:3.3,5:-0.7,6:-0.2,7:0.3,8:3.1,9:-1.7,10:1.0,11:-0.6,12:5.8},
  "2021": {1:2.5,2:-0.1,3:-2.1,4:2.0,5:-1.1,6:3.8,7:1.4,8:2.7,9:-2.8,10:5.1,11:1.9,12:-0.1},
  "2022": {1:-2.0,2:-0.3,3:0.9,4:-0.9,5:-4.8,6:-2.7,7:3.8,8:-1.8,9:-4.8,10:0.8,11:0.0,12:-0.4},
  "2023": {1:1.2,2:-1.4,3:2.7,4:0.1,5:2.4,6:1.1,7:2.4,8:-0.3,9:-1.7,10:-0.3,11:3.8,12:1.3},
  "2024": {1:2.5,2:3.4,3:1.7,4:-0.3,5:1.8,6:1.8,7:-1.1,8:0.3,9:0.3,10:0.2,11:0.2,12:0.2},
  "2025": {1:1.4,2:-0.9,3:-1.8,4:0.1,5:2.6,6:1.2,7:1.2,8:-0.3,9:1.4,10:2.0,11:-1.3,12:0.1},
  "2026": {1:4.5,2:-0.3,3:-3.1,4:3.5,5:2.0,6:2.1}
};
const SIM_DD = [
  {ev:"2022 rates/inflation",dd:-12.27,tr:10,rc:16},
  {ev:"COVID-19",dd:-10.40,tr:2,rc:10},
  {ev:"2015 commodity/China",dd:-8.23,tr:6,rc:28},
  {ev:"Q4 2018 risk-off",dd:-5.13,tr:4,rc:3},
  {ev:"2013 consolidation",dd:-3.82,tr:2,rc:4},
  {ev:"2010/11 euro risk-off",dd:-3.52,tr:5,rc:3},
  {ev:"2026 Q1 risk-off",dd:-3.39,tr:2,rc:2},
  {ev:"2021 mini shock",dd:-2.80,tr:1,rc:1},
];
const MESI = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
let simData = null;

function sfmt(v,d=1){if(v==null)return"—";return(v>=0?"+":"")+v.toFixed(d)+"%";}
function sccy(v,cur){return cur+" "+Math.round(v).toLocaleString("it-CH").replace(/,/g,"'");}


function drawNativeChart(canvas, navSeries, cur) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  // Usa il parent per la larghezza reale
  const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
  const W = (rect && rect.width > 100) ? Math.floor(rect.width) : (canvas.offsetWidth || 900);
  const H = 260;
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const vals = navSeries.map(p => p.v);
  const lbls = navSeries.map(p => p.lbl);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const pad = { top: 20, right: 20, bottom: 36, left: 70 };
  const gW = W - pad.left - pad.right;
  const gH = H - pad.top - pad.bottom;
  const range = maxV - minV || 1;

  // sfondo
  ctx.clearRect(0, 0, W, H);

  // griglia orizzontale
  ctx.strokeStyle = "#e8e4de";
  ctx.lineWidth = 1;
  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + (gH / steps) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + gW, y); ctx.stroke();
    const val = maxV - (range / steps) * i;
    ctx.fillStyle = "#888"; ctx.font = "10px Inter,sans-serif"; ctx.textAlign = "right";
    ctx.fillText(cur + " " + Math.round(val / 1000) + "k", pad.left - 6, y + 4);
  }

  // etichette asse X (max 8)
  const step = Math.ceil(lbls.length / 6);
  ctx.fillStyle = "#888"; ctx.font = "10px Inter,sans-serif"; ctx.textAlign = "center";
  for (let i = 0; i < lbls.length; i += step) {
    const x = pad.left + (i / (navSeries.length - 1)) * gW;
    ctx.fillText(lbls[i], x, H - 6);
  }

  // area sotto la linea
  ctx.beginPath();
  navSeries.forEach((p, i) => {
    const x = pad.left + (i / (navSeries.length - 1)) * gW;
    const y = pad.top + gH - ((p.v - minV) / range) * gH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + gW, pad.top + gH);
  ctx.lineTo(pad.left, pad.top + gH);
  ctx.closePath();
  ctx.fillStyle = "rgba(26,39,68,0.07)";
  ctx.fill();

  // linea principale
  ctx.beginPath();
  ctx.strokeStyle = "#1a2744";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  navSeries.forEach((p, i) => {
    const x = pad.left + (i / (navSeries.length - 1)) * gW;
    const y = pad.top + gH - ((p.v - minV) / range) * gH;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function runSim(){
  const inv = document.getElementById("simInvestitore").value.trim();
  const _mese = parseInt(document.getElementById("simMese").value);
  const _anno = parseInt(document.getElementById("simAnno").value);
  const imp = parseFloat(document.getElementById("simImporto").value);
  const cur = document.getElementById("simValuta").value;
  if(!_mese||!_anno||isNaN(imp)||imp<=0) return alert("Inserisci data e importo.");
  const sy = _anno, sm = _mese;

  // Build nav series
  let nav=imp, peak=imp, maxDD=0, maxDDDate="";
  const navSeries=[{v:imp,lbl:MESI[sm-1]+" "+sy}];
  const monthRets=[];
  let y=sy,m=sm;
  const endY=2026,endM=6;
  while(y<endY||(y===endY&&m<=endM)){
    const yr=SIM_MONTHLY[String(y)];
    const r=yr&&yr[m]!==undefined?yr[m]:null;
    if(r!==null){
      nav*=(1+r/100);
      monthRets.push(r);
      navSeries.push({v:nav,lbl:MESI[m-1]+" "+y});
      if(nav>peak)peak=nav;
      const dd=(nav-peak)/peak*100;
      if(dd<maxDD){maxDD=dd;maxDDDate=MESI[m-1]+" "+y;}
    }
    m++;if(m>12){m=1;y++;}
  }
  const nM=monthRets.length;
  const nY=nM/12;
  if(nM<1){alert("Dati insufficienti per il periodo selezionato.");return;}
  const totRet=(nav-imp)/imp*100;
  const cagr=nY>0?(Math.pow(nav/imp,1/nY)-1)*100:totRet;
  const mean=monthRets.reduce((a,b)=>a+b,0)/monthRets.length;
  const vol=Math.sqrt(monthRets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(monthRets.length-1))*Math.sqrt(12);
  const isATH=Math.abs(nav-peak)<0.01;
  simData={inv,imp,cur,sy,sm,nav,totRet,cagr,vol,maxDD,maxDDDate,nM,peak};

  // Show results
  // Mostra PRIMA il container (necessario per canvas in Chrome)
  const simResultsEl = document.getElementById("simResults");
  simResultsEl.style.visibility = "visible";
  simResultsEl.style.opacity = "1";
  const invName=inv?`Investitore: ${inv}  |  `:"";
  document.getElementById("simSubtitle").innerHTML=`${invName}Investimento: <strong>${sccy(imp,cur)}</strong> &nbsp;|&nbsp; Inizio: <strong>${MESI[sm-1]} ${sy}</strong> &nbsp;|&nbsp; Fine: <strong>Giugno 2026</strong>`;
  document.getElementById("simKpiValore").textContent=sccy(nav,cur);
  document.getElementById("simKpiAth").textContent="ATH: "+sccy(peak,cur);
  document.getElementById("simKpiRend").textContent=sfmt(totRet);
  document.getElementById("simKpiMesi").textContent=nM+" mesi";
  document.getElementById("simKpiCagr").textContent=sfmt(cagr);
  document.getElementById("simKpiVol").textContent=sfmt(vol);
  document.getElementById("simKpiDD").textContent=sfmt(maxDD);
  document.getElementById("simKpiDDDate").textContent="Data: "+maxDDDate;
  if(isATH)document.getElementById("simAth").style.display="block";
  else document.getElementById("simAth").style.display="none";

  // Grafico Canvas nativo — requestAnimationFrame garantisce layout aggiornato
  requestAnimationFrame(() => {
    drawNativeChart(document.getElementById("simChart"), navSeries, cur);
  });
  document.getElementById("simChartSub").textContent=`Dal ${MESI[sm-1]}/${sy} al 6/2026 — ${nM} mesi  |  ATH: ${sccy(peak,cur)}`;

  // Scorecard
  const sc=[
    {l:"1 anno",cagr:12.19,vol:7.25,dd:-3.39,sh:1.68,so:1.41,ca:3.60},
    {l:"3 anni",cagr:10.51,vol:5.91,dd:-3.39,sh:1.78,so:1.44,ca:4.08},
    {l:"5 anni",cagr:6.47,vol:7.16,dd:-12.27,sh:0.90,so:0.62,ca:1.51},
    {l:"10 anni",cagr:4.51,vol:7.17,dd:-12.27,sh:0.63,so:0.35,ca:0.95},
    {l:"Inception",cagr:4.82,vol:6.32,dd:-12.27,sh:0.76,so:0.45,ca:1.18},
  ];
  let sh=`<thead><tr><th>Orizzonte</th><th>CAGR</th><th>VOL</th><th>MAX DD</th><th>SHARPE</th><th>SORTINO</th><th>CALMAR</th></tr></thead><tbody>`;
  sc.forEach(r=>{sh+=`<tr><td>${r.l}</td><td class="pos">${sfmt(r.cagr)}</td><td>${r.vol.toFixed(1)}%</td><td class="neg">${sfmt(r.dd)}</td><td>${r.sh.toFixed(2)}</td><td>${r.so.toFixed(2)}</td><td>${r.ca.toFixed(2)}</td></tr>`;});
  document.getElementById("simScorecard").innerHTML=sh+"</tbody>";

  // DD table
  let dh=`<thead><tr><th>Evento</th><th>Max DD</th><th>Mesi Trough</th><th>Mesi Recovery</th><th>Stato</th></tr></thead><tbody>`;
  SIM_DD.forEach(d=>{dh+=`<tr><td>${d.ev}</td><td class="neg">${sfmt(d.dd)}</td><td>${d.tr}</td><td>${d.rc}</td><td><span class="badge-ok">RECOVERED</span></td></tr>`;});
  document.getElementById("simDDTable").innerHTML=dh+"</tbody>";

  // Calendar
  const yrs=Object.keys(SIM_MONTHLY).map(Number).sort();
  let posY=0;
  let ch=`<thead><tr><th>Anno</th>${MESI.map(m=>`<th>${m}</th>`).join("")}<th>Anno%</th></tr></thead><tbody>`;
  yrs.forEach(yr=>{
    const data=SIM_MONTHLY[String(yr)];
    ch+=`<tr><td>${yr}</td>`;
    let ar=1;
    for(let m=1;m<=12;m++){
      const r=data[m];
      if(r===undefined)ch+=`<td class="na">—</td>`;
      else{ar*=(1+r/100);const cls=r>0?"pos":r<0?"neg":"";ch+=`<td class="${cls}">${(r>=0?"+":"")+r.toFixed(1)}</td>`;}
    }
    const ap=(ar-1)*100;
    if(ap>0)posY++;
    const sfx=yr===2026?" YTD":"%";
    ch+=`<td class="${ap>=0?"ann-pos":"ann-neg"}">${(ap>=0?"+":"")+ap.toFixed(1)+sfx}</td></tr>`;
  });
  document.getElementById("simCalendar").innerHTML=ch+"</tbody>";
  document.getElementById("simCalSub").textContent=`Rendimento medio annuo: +5.88%  |  Anni positivi: ${posY}/${yrs.length}`;

  document.getElementById("simResults").scrollIntoView({behavior:"smooth",block:"start"});
}

function simGeneraPDF(){
  if(!simData)return;
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,H=297,ml=18;
  let y=0;
  const d=simData;
  // Header
  doc.setFillColor(26,39,68);doc.rect(0,0,W,40,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(17);doc.setFont("helvetica","bold");
  doc.text("EGONON SA",ml,15);
  doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(170,180,210);
  doc.text("Gestione Patrimoniale Indipendente  ·  Autorizzata FINMA",ml,22);
  doc.text("Via della Posta 7, 6900 Lugano  ·  info@egonon.ch  ·  +41 58 566 60 69",ml,29);
  doc.setFontSize(9);doc.setTextColor(255,255,255);
  doc.text("SIMULAZIONE EGONON GLOBAL MACRO INDEX OPUS — ISIN XS2999220143",ml,37);
  y=50;
  // Subtitle
  doc.setFontSize(11);doc.setFont("helvetica","bold");doc.setTextColor(26,39,68);
  const invN=d.inv?`${d.inv}  —  `:"";
  doc.text(`${invN}Investimento: ${sccy(d.imp,d.cur)}`,ml,y);y+=7;
  doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(100,100,100);
  doc.text(`Inizio: ${MESI[d.sm-1]} ${d.sy}  |  Fine: Giugno 2026  |  Durata: ${d.nM} mesi`,ml,y);y+=12;
  // KPIs
  const kpis=[
    {l:"VALORE FINALE",v:sccy(d.nav,d.cur),c:[26,39,68]},
    {l:"RENDIMENTO",v:sfmt(d.totRet),c:[26,122,60]},
    {l:"CAGR",v:sfmt(d.cagr),c:[26,122,60]},
    {l:"VOLATILITÀ",v:sfmt(d.vol),c:[60,60,60]},
    {l:"MAX DRAWDOWN",v:sfmt(d.maxDD),c:[192,57,43]},
  ];
  const bw=(W-2*ml-16)/5;
  kpis.forEach((k,i)=>{
    const x=ml+i*(bw+4);
    doc.setFillColor(247,247,245);doc.rect(x,y,bw,22,"F");
    doc.setDrawColor(220,220,215);doc.setLineWidth(0.3);doc.rect(x,y,bw,22,"S");
    doc.setFillColor(...k.c);doc.rect(x,y,bw,1.5,"F");
    doc.setFontSize(7);doc.setFont("helvetica","bold");doc.setTextColor(100,100,100);
    doc.text(k.l,x+2,y+8);
    doc.setFontSize(10);doc.setFont("helvetica","bold");doc.setTextColor(...k.c);
    doc.text(k.v,x+2,y+17);
  });
  y+=30;
  // ATH
  doc.setFillColor(240,255,244);doc.rect(ml,y,W-2*ml,9,"F");
  doc.setFontSize(8);doc.setFont("helvetica","italic");doc.setTextColor(26,122,60);
  doc.text("✓  Massimo storico raggiunto al 30/06/2026. Ogni investimento dal 2010 è in guadagno.",ml+3,y+6);
  y+=15;
  // Scorecard
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(26,39,68);
  doc.text("SCORECARD MULTI-ORIZZONTE",ml,y);y+=6;
  const scH=["Orizzonte","CAGR","Volatilità","Max DD","Sharpe","Sortino","Calmar"];
  const scD=[["1 anno","+8.70%","9.6%","-3.39%","0.91","0.60","2.57"],["3 anni","+10.38%","6.8%","-12.27%","1.53","2.27","0.85"],["5 anni","+7.91%","7.5%","-12.27%","1.05","1.49","0.64"],["10 anni","+7.29%","5.8%","-12.27%","1.25","1.92","0.59"],["Inception","+6.70%","7.3%","-12.27%","0.92","1.28","0.55"]];
  const cw=(W-2*ml)/scH.length;
  doc.setFillColor(26,39,68);doc.rect(ml,y,W-2*ml,8,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont("helvetica","bold");
  scH.forEach((h,i)=>doc.text(h,ml+i*cw+2,y+5.5));y+=8;
  scD.forEach((r,ri)=>{
    doc.setFillColor(ri%2===0?255:247,ri%2===0?255:247,ri%2===0?255:245);
    doc.rect(ml,y,W-2*ml,7,"F");doc.setFontSize(8);
    r.forEach((c,ci)=>{
      doc.setTextColor(ci===1?26:ci===3?192:40,ci===1?122:ci===3?57:40,ci===1?60:ci===3?43:40);
      doc.setFont("helvetica",ci===0?"bold":"normal");
      doc.text(c,ml+ci*cw+2,y+5);
    });y+=7;
  });y+=10;
  // DD table
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(26,39,68);
  doc.text("DRAWDOWN RECOVERY TIMELINE",ml,y);y+=6;
  const ddH=["Evento","Max DD","Trough","Recovery","Stato"];
  const ddCW=[65,25,22,28,24];
  doc.setFillColor(26,39,68);doc.rect(ml,y,W-2*ml,8,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont("helvetica","bold");
  let cx=ml;ddH.forEach((h,i)=>{doc.text(h,cx+2,y+5.5);cx+=ddCW[i];});y+=8;
  SIM_DD.forEach((d2,ri)=>{
    doc.setFillColor(ri%2===0?255:247,ri%2===0?255:247,ri%2===0?255:245);
    doc.rect(ml,y,W-2*ml,7,"F");doc.setFontSize(8);
    cx=ml;
    [d2.ev,sfmt(d2.dd),String(d2.tr),String(d2.rc),"RECOVERED"].forEach((v,ci)=>{
      doc.setTextColor(ci===1?192:ci===4?26:40,ci===1?57:ci===4?122:40,ci===1?43:ci===4?60:40);
      doc.setFont("helvetica",ci===0||ci===4?"bold":"normal");
      doc.text(v,cx+2,y+5);cx+=ddCW[ci];
    });y+=7;
  });y+=10;
  // Calendar
  if(y>H-50){doc.addPage();y=20;}
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(26,39,68);
  doc.text("CALENDARIO RENDIMENTI ANNO PER ANNO",ml,y);y+=6;
  const calH=["Anno",...MESI,"Anno%"];const calCW=12;
  doc.setFillColor(26,39,68);doc.rect(ml,y,W-2*ml,7,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(6.5);doc.setFont("helvetica","bold");
  calH.forEach((h,i)=>doc.text(h,ml+i*calCW+1,y+5));y+=7;
  Object.keys(SIM_MONTHLY).map(Number).sort().forEach((yr,ri)=>{
    if(y>H-25){doc.addPage();y=20;}
    const data=SIM_MONTHLY[String(yr)];
    doc.setFillColor(ri%2===0?255:247,ri%2===0?255:247,ri%2===0?255:245);
    doc.rect(ml,y,W-2*ml,6,"F");doc.setFontSize(6.5);
    doc.setFont("helvetica","bold");doc.setTextColor(40,40,40);
    doc.text(String(yr),ml+1,y+4.5);
    let ar=1;
    for(let m=1;m<=12;m++){
      const r=data[m];const x2=ml+m*calCW+1;
      if(r===undefined){doc.setTextColor(180,180,180);doc.setFont("helvetica","normal");doc.text("—",x2,y+4.5);}
      else{ar*=(1+r/100);doc.setTextColor(r>0?26:r<0?192:100,r>0?122:r<0?57:100,r>0?60:r<0?43:100);doc.setFont("helvetica","normal");doc.text((r>=0?"+":"")+r.toFixed(1),x2,y+4.5);}
    }
    const ap=(ar-1)*100;
    doc.setTextColor(ap>=0?26:192,ap>=0?122:57,ap>=0?60:43);doc.setFont("helvetica","bold");
    doc.text((ap>=0?"+":"")+ap.toFixed(1)+"%",ml+13*calCW+1,y+4.5);y+=6;
  });
  // Footer
  doc.setFillColor(26,39,68);doc.rect(0,H-26,W,26,"F");
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(170,180,210);
  doc.text("EGONON SA  ·  www.egonon.ch  ·  +41 58 566 60 69  ·  Autorizzata FINMA",ml,H-17);
  doc.setFontSize(6.5);doc.setTextColor(100,115,150);
  doc.text("Documento simulativo. Le performance passate non garantiscono risultati futuri. EGONON SA è autorizzata ai sensi della LIsFi.",ml,H-10);
  doc.text("ISIN XS2999220143 · EGONON Global Macro Index Opus.",ml,H-5);
  const dt=new Date().toISOString().split("T")[0];
  const nm=d.inv?d.inv.replace(/\s+/g,"_"):"Simulazione";
  doc.save(`EGONON_${nm}_${dt}.pdf`);
}

// Auto-run on load
function toggleMenu(){
  const btn = document.getElementById("navHamburger");
  const menu = document.getElementById("navMobileMenu");
  btn.classList.toggle("open");
  menu.classList.toggle("open");
}
function closeMenu(){
  const btn = document.getElementById("navHamburger");
  const menu = document.getElementById("navMobileMenu");
  btn.classList.remove("open");
  menu.classList.remove("open");
}
window.addEventListener("DOMContentLoaded",()=>{
  // Aspetta che Chart.js sia disponibile prima di eseguire il sim iniziale
  // Imposta Gen 2020 come default nei nuovi select
  const meseEl = document.getElementById("simMese");
  const annoEl = document.getElementById("simAnno");
  if(meseEl) meseEl.value = "1";
  if(annoEl) annoEl.value = "2020";

  function tryRunSim(attempts){
    if(typeof Chart !== "undefined"){
      try { runSim(); } catch(e){ console.warn("runSim init error:",e); }
    } else if(attempts > 0) {
      setTimeout(()=>tryRunSim(attempts-1), 100);
    }
  }
  tryRunSim(20);
});
