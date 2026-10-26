// EGONON SA — EgononOS v5.1 (dati simulatore da sim_data.js)
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
// Serie in egonon_site/sim_data.js (aggiornata ogni mese da Börse Düsseldorf, ISIN DE000A2UG4F2).
const SIM_META = window.EGONON_SIM || {monthly:{}};
const SIM_MONTHLY = {};
Object.keys(SIM_META.monthly).forEach(y=>{SIM_MONTHLY[y]={};Object.keys(SIM_META.monthly[y]).forEach(m=>{SIM_MONTHLY[y][+m]=SIM_META.monthly[y][m];});});
const SIM_SERIES = (()=>{const out=[];Object.keys(SIM_MONTHLY).map(Number).sort((a,b)=>a-b).forEach(y=>{Object.keys(SIM_MONTHLY[y]).map(Number).sort((a,b)=>a-b).forEach(m=>out.push({y,m,r:SIM_MONTHLY[y][m]}));});return out;})();
const SIM_FIRST = SIM_SERIES[0] || {y:2010,m:4};
const SIM_LAST = SIM_SERIES[SIM_SERIES.length-1] || {y:2026,m:6};
const MESI_LUNGHI = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const SIM_END_LABEL = MESI_LUNGHI[SIM_LAST.m-1]+" "+SIM_LAST.y;
const SIM_END_SHORT = String(SIM_LAST.m).padStart(2,"0")+"/"+SIM_LAST.y;
const SIM_LIVE_FROM = SIM_META.liveFrom || "2019-07";
const SIM_NOTE = (()=>{const [y,m]=SIM_LIVE_FROM.split("-").map(Number);const pm=m===1?12:m-1,py=m===1?y-1:y;
  return "Fino a "+String(pm).padStart(2,"0")+"/"+py+": simulazione retrospettiva della strategia (backtest), non performance realizzata. Da "+String(m).padStart(2,"0")+"/"+y+": certificato DE000A2UG4F2 (fonte Börse Düsseldorf). Dati al "+SIM_END_SHORT+".";})();

function simStats(rets){
  if(!rets.length) return null;
  let nav=1,peak=1,mdd=0;
  rets.forEach(r=>{nav*=(1+r/100);if(nav>peak)peak=nav;const dd=(nav/peak-1)*100;if(dd<mdd)mdd=dd;});
  const nY=rets.length/12;
  const cagr=(Math.pow(nav,1/nY)-1)*100;
  const mean=rets.reduce((a,b)=>a+b,0)/rets.length;
  const sd=Math.sqrt(rets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/Math.max(1,rets.length-1));
  const down=Math.sqrt(rets.reduce((a,b)=>a+Math.pow(Math.min(0,b),2),0)/rets.length);
  const vol=sd*Math.sqrt(12);
  return {cagr,vol,dd:mdd,sh:sd>0?(mean*12)/(sd*Math.sqrt(12)):0,so:down>0?(mean*12)/(down*Math.sqrt(12)):0,ca:mdd<0?cagr/Math.abs(mdd):0};
}
function simScorecard(){
  const all=SIM_SERIES.map(p=>p.r);
  return [["1 anno",12],["3 anni",36],["5 anni",60],["10 anni",120],["Dal "+SIM_FIRST.y,all.length]]
    .filter(([,n])=>n<=all.length).map(([l,n])=>Object.assign({l},simStats(all.slice(-n))));
}
function simDDEpisodes(){
  const out=[];let nav=1,peak=1,peakI=-1,ep=null;
  SIM_SERIES.forEach((p,i)=>{
    nav*=(1+p.r/100);
    if(nav>=peak){ if(ep){ep.rc=i-ep.troughI;ep.ok=true;out.push(ep);ep=null;} peak=nav;peakI=i; return; }
    const dd=(nav/peak-1)*100;
    if(!ep) ep={startI:peakI+1,dd:0,troughI:i};
    if(dd<ep.dd){ep.dd=dd;ep.troughI=i;}
  });
  if(ep){ep.rc=null;ep.ok=false;out.push(ep);}
  const lbl=i=>{const p=SIM_SERIES[Math.max(0,i)];return MESI_LUNGHI[p.m-1].slice(0,3)+" "+p.y;};
  const live=+SIM_LIVE_FROM.replace("-","");
  return out.filter(e=>e.dd<=-2).sort((a,b)=>a.dd-b.dd).slice(0,8).map(e=>{
    const t=SIM_SERIES[e.troughI];
    return {ev:lbl(e.startI)+" – "+lbl(e.troughI)+((t.y*100+t.m)<live?" (simulato)":""),
            dd:+e.dd.toFixed(2), tr:e.troughI-e.startI+1, rc:e.rc, ok:e.ok};
  });
}
const SIM_DD = simDDEpisodes();
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
  const endY=SIM_LAST.y,endM=SIM_LAST.m;
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
  document.getElementById("simSubtitle").innerHTML=`${invName}Investimento: <strong>${sccy(imp,cur)}</strong> &nbsp;|&nbsp; Inizio: <strong>${MESI[sm-1]} ${sy}</strong> &nbsp;|&nbsp; Fine: <strong>${SIM_END_LABEL}</strong>`;
  document.getElementById("simKpiValore").textContent=sccy(nav,cur);
  document.getElementById("simKpiAth").textContent="ATH: "+sccy(peak,cur);
  document.getElementById("simKpiRend").textContent=sfmt(totRet);
  document.getElementById("simKpiMesi").textContent=nM+" mesi";
  document.getElementById("simKpiCagr").textContent=sfmt(cagr);
  document.getElementById("simKpiVol").textContent=sfmt(vol);
  document.getElementById("simKpiDD").textContent=sfmt(maxDD);
  document.getElementById("simKpiDDDate").textContent="Data: "+maxDDDate;
  const athEl=document.getElementById("simAth");
  if(athEl){athEl.style.display="block";
    athEl.textContent=(isATH?"Al "+SIM_END_SHORT+" il valore simulato coincide con il massimo del periodo selezionato. ":"")+SIM_NOTE+" Le performance passate, reali o simulate, non sono indicative né garanzia di risultati futuri.";}

  // Grafico Canvas nativo — requestAnimationFrame garantisce layout aggiornato
  requestAnimationFrame(() => {
    drawNativeChart(document.getElementById("simChart"), navSeries, cur);
  });
  document.getElementById("simChartSub").textContent=`Dal ${MESI[sm-1]}/${sy} al ${SIM_END_SHORT} — ${nM} mesi  |  ATH: ${sccy(peak,cur)}`;

  // Scorecard
  const sc=simScorecard();
  let sh=`<thead><tr><th>Orizzonte</th><th>CAGR</th><th>VOL</th><th>MAX DD</th><th>SHARPE*</th><th>SORTINO*</th><th>CALMAR</th></tr></thead><tbody>`;
  sc.forEach(r=>{sh+=`<tr><td>${r.l}</td><td class="${r.cagr>=0?"pos":"neg"}">${sfmt(r.cagr)}</td><td>${r.vol.toFixed(1)}%</td><td class="neg">${sfmt(r.dd)}</td><td>${r.sh.toFixed(2)}</td><td>${r.so.toFixed(2)}</td><td>${r.ca.toFixed(2)}</td></tr>`;});
  document.getElementById("simScorecard").innerHTML=sh+"</tbody>";

  // DD table
  let dh=`<thead><tr><th>Evento</th><th>Max DD</th><th>Mesi Trough</th><th>Mesi Recovery</th><th>Stato</th></tr></thead><tbody>`;
  SIM_DD.forEach(d=>{dh+=`<tr><td>${d.ev}</td><td class="neg">${sfmt(d.dd)}</td><td>${d.tr}</td><td>${d.rc==null?"—":d.rc}</td><td>${d.ok?'<span class="badge-ok">RECOVERED</span>':"IN CORSO"}</td></tr>`;});
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
    const sfx=yr===SIM_LAST.y&&SIM_LAST.m<12?" YTD":"%";
    ch+=`<td class="${ap>=0?"ann-pos":"ann-neg"}">${(ap>=0?"+":"")+ap.toFixed(1)+sfx}</td></tr>`;
  });
  document.getElementById("simCalendar").innerHTML=ch+"</tbody>";
  const fullYrs=yrs.filter(yr=>Object.keys(SIM_MONTHLY[String(yr)]).length===12);
  const avgY=fullYrs.length?fullYrs.reduce((a,yr)=>a+(Object.values(SIM_MONTHLY[String(yr)]).reduce((p,r)=>p*(1+r/100),1)-1)*100,0)/fullYrs.length:0;
  document.getElementById("simCalSub").textContent=`Rendimento medio annuo (anni completi): ${sfmt(avgY,2)}  |  Anni positivi: ${posY}/${yrs.length}  |  ${SIM_NOTE}  *Indicatori del simulatore calcolati su rendimenti di fine mese (gli indicatori ufficiali di borsa usano prezzi giornalieri); Sharpe e Sortino con tasso privo di rischio 0%.`;

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
  doc.text("SIMULAZIONE EGONON GLOBAL MACRO INDEX OPUS — ISIN DE000A2UG4F2",ml,37);
  y=50;
  // Subtitle
  doc.setFontSize(11);doc.setFont("helvetica","bold");doc.setTextColor(26,39,68);
  const invN=d.inv?`${d.inv}  —  `:"";
  doc.text(`${invN}Investimento: ${sccy(d.imp,d.cur)}`,ml,y);y+=7;
  doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(100,100,100);
  doc.text(`Inizio: ${MESI[d.sm-1]} ${d.sy}  |  Fine: ${SIM_END_LABEL}  |  Durata: ${d.nM} mesi`,ml,y);y+=12;
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
  doc.setFillColor(255,248,230);doc.rect(ml,y,W-2*ml,12,"F");
  doc.setFontSize(7.5);doc.setFont("helvetica","italic");doc.setTextColor(120,80,0);
  doc.text(doc.splitTextToSize(SIM_NOTE+" Performance passate, reali o simulate, non garantiscono risultati futuri.",W-2*ml-6),ml+3,y+5);
  y+=18;
  // Scorecard
  doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(26,39,68);
  doc.text("SCORECARD MULTI-ORIZZONTE",ml,y);y+=6;
  const scH=["Orizzonte","CAGR","Volatilità","Max DD","Sharpe*","Sortino*","Calmar"];
  const scD=simScorecard().map(r=>[r.l,sfmt(r.cagr,2),r.vol.toFixed(1)+"%",sfmt(r.dd,2),r.sh.toFixed(2),r.so.toFixed(2),r.ca.toFixed(2)]);
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
  const ddCW=[70,22,20,26,26];
  doc.setFillColor(26,39,68);doc.rect(ml,y,W-2*ml,8,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(7.5);doc.setFont("helvetica","bold");
  let cx=ml;ddH.forEach((h,i)=>{doc.text(h,cx+2,y+5.5);cx+=ddCW[i];});y+=8;
  SIM_DD.forEach((d2,ri)=>{
    doc.setFillColor(ri%2===0?255:247,ri%2===0?255:247,ri%2===0?255:245);
    doc.rect(ml,y,W-2*ml,7,"F");doc.setFontSize(8);
    cx=ml;
    [d2.ev,sfmt(d2.dd),String(d2.tr),d2.rc==null?"—":String(d2.rc),d2.ok?"RECOVERED":"IN CORSO"].forEach((v,ci)=>{
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
  doc.text("ISIN DE000A2UG4F2 · EGONON Global Macro Index Opus · Fonte: Börse Düsseldorf · *Sharpe/Sortino con risk-free 0%.",ml,H-5);
  const dt=new Date().toISOString().split("T")[0];
  const nm=d.inv?d.inv.replace(/\s+/g,"_"):"Simulazione";
  doc.save(`EGONON_${nm}_${dt}.pdf`);
}

// ── KPI SITO (indicatori ufficiali Börse Düsseldorf da sim_data.js) ──
function egnPct(v,d){d=d==null?2:d;return (v>=0?"+":"−")+Math.abs(v).toFixed(d).replace(".",",")+"%";}
function egnNum(v,d){return (v<0?"−":"")+Math.abs(v).toFixed(d).replace(".",",");}
function egnDate(iso){const p=String(iso).split("-");return p[2]+"."+p[1]+"."+p[0];}
function egnYearsBack(iso,n){const p=String(iso).split("-");return p[2]+"."+p[1]+"."+(+p[0]-n);}
function egnFillKpi(){
  const k=(window.EGONON_SIM||{}).kpi; if(!k) return;
  const asOf=egnDate(k.asOf);
  document.querySelectorAll(".stat-box").forEach(b=>{
    const l=b.querySelector(".stat-label"), v=b.querySelector(".stat-value"); if(!l||!v) return;
    const t=l.textContent;
    if(/sharpe/i.test(t)){v.textContent=egnNum(k.sharpe_1y,2);l.textContent="Sharpe Ratio (1 anno)";}
    else if(/drawdown/i.test(t)){v.textContent=egnPct(k.maxdd_5y);l.textContent="Max drawdown (5 anni)";}
    else if(/12 mesi|1 anno/i.test(t)){v.textContent=egnPct(k.perf_1y);l.textContent="Performance 12 mesi";}
    else if(/3 anni/i.test(t)){v.textContent=egnPct(k.perf_3y);l.textContent="Performance 3 anni";}
    else if(/5 anni/i.test(t)){v.textContent=egnPct(k.perf_5y);l.textContent="Performance 5 anni";}
  });
  const hn=document.getElementById("egnKpiNote");
  if(hn) hn.textContent="Certificato DE000A2UG4F2 · indicatori ufficiali Börse Düsseldorf al "+asOf+". Le performance passate non sono indicative né garanzia di risultati futuri.";
  document.querySelectorAll(".track-table tbody tr").forEach(tr=>{
    const c=tr.cells; if(c.length<2) return; const t=c[0].textContent;
    if(/^\s*ultimo anno/i.test(t)){c[0].textContent="Ultimo anno ("+egnYearsBack(k.asOf,1)+" – "+asOf+")";c[1].textContent=egnPct(k.perf_1y);}
    else if(/^\s*anno in corso/i.test(t)&&k.ytd!=null){c[0].textContent="Anno in corso ("+egnDate(k.ytd_from)+" – "+asOf+")";c[1].textContent=egnPct(k.ytd);}
    else if(/^\s*3 anni/i.test(t)){c[0].textContent="3 anni ("+egnYearsBack(k.asOf,3)+" – "+asOf+")";c[1].textContent=egnPct(k.perf_3y);}
    else if(/^\s*5 anni/i.test(t)){c[0].textContent="5 anni ("+egnYearsBack(k.asOf,5)+" – "+asOf+")";c[1].textContent=egnPct(k.perf_5y);}
  });
  const tn=document.querySelector("#track-record .track-note");
  if(tn) tn.textContent="Dati al "+asOf+". Fonte: Börse Düsseldorf, indicatori ufficiali del certificato DE000A2UG4F2 (EGONON Global Macro Index Opus); anno in corso calcolato sulle chiusure Börse Düsseldorf dal "+egnDate(k.ytd_from)+". Max drawdown 5 anni "+egnPct(k.maxdd_5y)+", volatilità 1 anno "+egnPct(k.vola_1y).replace("+","")+". Le performance passate non sono indicative né garanzia di risultati futuri.";
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",egnFillKpi); else egnFillKpi();

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
    } else {
      try { runSim(); } catch(e){ console.warn("runSim init error:",e); }
    }
  }
  tryRunSim(20);
});
