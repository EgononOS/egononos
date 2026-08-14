// EGONON SA

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
        btn.textContent = 'Richiedi analisi gratuita';
      }
    } catch (err) {
      alert('Errore di connessione. Si prega di riprovare.');
      btn.disabled = false;
      btn.textContent = 'Richiedi analisi gratuita';
    }
  });
  })();

const SIM_MONTHLY = {
  "2010": {4:-0.0,5:1.3,6:1.1,7:-0.5,8:3.2,9:-0.7,10:0.1,11:-1.3,12:0.0},
  "2011": {1:-1.8,2:1.5,3:-0.1,4:3.5,5:-0.9,6:-0.7,7:2.8,8:-0.3,9:-0.8,10:1.6,11:-0.1,12:0.6},
  "2012": {1:2.3,2:0.7,3:-0.2,4:1.0,5:0.3,6:0.4,7:2.2,8:0.6,9:0.5,10:-0.4,11:1.0,12:-0.3},
  "2013": {1:-0.4,2:1.1,3:1.1,4:2.0,5:-1.7,6:-2.2,7:0.6,8:-0.5,9:2.0,10:1.9,11:1.6,12:-0.1},
  "2014": {1:0.1,2:1.9,3:0.0,4:0.3,5:1.7,6:1.0,7:0.5,8:2.2,9:-0.3,10:0.4,11:2.1,12:0.3},
  "2015": {1:2.4,2:1.4,3:1.2,4:-1.5,5:-0.8,6:-3.1,7:1.3,8:-3.6,9:-0.8,10:1.9,11:0.4,12:-1.2},
  "2016": {1:0.6,2:0.6,3:0.2,4:-0.2,5:-0.2,6:2.3,7:0.9,8:-0.4,9:0.3,10:-1.1,11:-3.0,12:0.3},
  "2017": {1:1.2,2:1.8,3:-0.4,4:0.4,5:0.5,6:-1.3,7:0.6,8:1.5,9:-0.9,10:1.8,11:0.7,12:0.4},
  "2018": {1:1.3,2:-1.1,3:-1.2,4:1.1,5:1.0,6:0.4,7:0.1,8:0.8,9:-0.6,10:-2.2,11:0.1,12:-2.4},
  "2019": {1:2.8,2:1.0,3:2.6,4:0.9,5:-2.7,6:2.9,7:-0.1,8:-0.1,9:-0.1,10:-0.2,11:0.3,12:0.7},
  "2020": {1:0.7,2:-1.0,3:-9.5,4:3.3,5:-0.7,6:-0.2,7:0.3,8:3.1,9:-1.7,10:1.0,11:-0.6,12:5.8},
  "2021": {1:2.5,2:-0.1,3:-2.1,4:2.0,5:-1.1,6:3.8,7:1.4,8:2.7,9:-2.8,10:5.1,11:1.9,12:-0.1},
  "2022": {1:-2.0,2:-0.3,3:0.9,4:-0.9,5:-4.8,6:-2.7,7:3.8,8:-1.8,9:-4.8,10:0.8,11:0.0,12:-0.4},
  "2023": {1:1.2,2:-1.4,3:2.7,4:0.1,5:2.4,6:1.1,7:2.4,8:-0.3,9:-1.7,10:-0.3,11:3.8,12:1.3},
  "2024": {1:2.5,2:3.4,3:1.7,4:-0.3,5:1.8,6:1.8,7:-1.1,8:0.3,9:0.3,10:0.2,11:0.2,12:0.2},
  "2025": {1:1.4,2:-0.9,3:-1.8,4:0.1,5:2.6,6:1.2,7:1.2,8:-0.3,9:1.4,10:2.0,11:-1.3,12:0.1},
  "2026": {1:4.5,2:-0.3,3:-3.1,4:3.5,5:2.0,6:-0.5},
};
const SIM_DD = [
  {ev:"2022 rates/inflation",dd:-12.27,tr:10,rc:16},
  {ev:"COVID-19",dd:-10.40,tr:2,rc:10},
  {ev:"2015 commodity/China",dd:-8.23,tr:6,rc:28},
  {ev:"Q4 2018 risk-off",dd:-5.13,tr:4,rc:3},
  {ev:"2013 consolidation",dd:-3.82,tr:2,rc:4},
  {ev:"2010/11 euro risk-off",dd:-3.52,tr:5,rc:3},
  {ev:"2026 Q1 risk-off",dd:-3.39,tr:2,rc:2},
  {ev:"2021 mini shock",dd:-2.80,tr:1,rc:1}
];
const MESI=["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];
let simData=null;
function sfmt(v,d=1){if(v==null)return"---";return(v>=0?"+":"")+v.toFixed(d)+"%";}
function sccy(v,cur){return cur+" "+Math.round(v).toLocaleString("it-CH").replace(/,/g,"'");}
function drawNativeChart(canvas,navSeries,cur){
  if(!canvas)return;
  const ctx=canvas.getContext("2d");
  if(!ctx)return;
  const rect=canvas.parentElement?canvas.parentElement.getBoundingClientRect():null;
  const W=(rect&&rect.width>100)?Math.floor(rect.width):(canvas.offsetWidth||900);
  const H=260;
  canvas.width=W;canvas.height=H;
  canvas.style.width=W+"px";canvas.style.height=H+"px";
  const vals=navSeries.map(p=>p.v);
  const lbls=navSeries.map(p=>p.lbl);
  const minV=Math.min(...vals);const maxV=Math.max(...vals);
  const pad={top:20,right:20,bottom:36,left:70};
  const gW=W-pad.left-pad.right;const gH=H-pad.top-pad.bottom;
  const range=maxV-minV||1;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle="#e8e4de";ctx.lineWidth=1;
  for(let i=0;i<=5;i++){
    const y=pad.top+(gH/5)*i;
    ctx.beginPath();ctx.moveTo(pad.left,y);ctx.lineTo(pad.left+gW,y);ctx.stroke();
    const val=maxV-(range/5)*i;
    ctx.fillStyle="#888";ctx.font="10px Inter,sans-serif";ctx.textAlign="right";
    ctx.fillText(cur+" "+Math.round(val/1000)+"k",pad.left-6,y+4);
  }
  const step=Math.ceil(lbls.length/6);
  ctx.fillStyle="#888";ctx.font="10px Inter,sans-serif";ctx.textAlign="center";
  for(let i=0;i<lbls.length;i+=step){
    const x=pad.left+(i/(navSeries.length-1))*gW;
    ctx.fillText(lbls[i],x,H-6);
  }
  ctx.beginPath();
  navSeries.forEach((p,i)=>{
    const x=pad.left+(i/(navSeries.length-1))*gW;
    const y=pad.top+gH-((p.v-minV)/range)*gH;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.lineTo(pad.left+gW,pad.top+gH);
  ctx.lineTo(pad.left,pad.top+gH);
  ctx.closePath();
  ctx.fillStyle="rgba(26,39,68,0.07)";ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle="#1a2744";ctx.lineWidth=2;ctx.lineJoin="round";
  navSeries.forEach((p,i)=>{
    const x=pad.left+(i/(navSeries.length-1))*gW;
    const y=pad.top+gH-((p.v-minV)/range)*gH;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  });
  ctx.stroke();
}
function runSim(){
  const inv=document.getElementById("simInvestitore").value.trim();
  const _mese=parseInt(document.getElementById("simMese").value);
  const _anno=parseInt(document.getElementById("simAnno").value);
  const imp=parseFloat(document.getElementById("simImporto").value);
  const cur=document.getElementById("simValuta").value;
  if(!_mese||!_anno||isNaN(imp)||imp<=0)return alert("Inserisci data e importo.");
  const sy=_anno,sm=_mese;
  let nav=imp,peak=imp,maxDD=0,maxDDDate="";
  const navSeries=[{v:imp,lbl:MESI[sm-1]+" "+sy}];
  const monthRets=[];
  let y=sy,m=sm;
  const endY=2026,endM=6;
  while(y<endY||(y===endY&&m<=endM)){
    const yr=SIM_MONTHLY[String(y)];
    const r=yr&&yr[m]!==undefined?yr[m]:null;
    if(r!==null){
      nav*=(1+r/100);monthRets.push(r);
      navSeries.push({v:nav,lbl:MESI[m-1]+" "+y});
      if(nav>peak)peak=nav;
      const dd=(nav-peak)/peak*100;
      if(dd<maxDD){maxDD=dd;maxDDDate=MESI[m-1]+" "+y;}
    }
    m++;if(m>12){m=1;y++;}
  }
  const nM=monthRets.length;const nY=nM/12;
  if(nM<1){alert("Dati insufficienti.");return;}
  const totRet=(nav-imp)/imp*100;
  const cagr=nY>0?(Math.pow(nav/imp,1/nY)-1)*100:totRet;
  const mean=monthRets.reduce((a,b)=>a+b,0)/monthRets.length;
  const vol=Math.sqrt(monthRets.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(monthRets.length-1))*Math.sqrt(12);
  const isATH=Math.abs(nav-peak)<0.01;
  simData={inv,imp,cur,sy,sm,nav,totRet,cagr,vol,maxDD,maxDDDate,nM,peak};
  const simResultsEl=document.getElementById("simResults");
  simResultsEl.style.visibility="visible";
  simResultsEl.style.opacity="1";
  const invName=inv?"Investitore: "+inv+"  |  ":"";
  document.getElementById("simSubtitle").innerHTML=invName+"Investimento: <strong>"+sccy(imp,cur)+"</strong> | Inizio: <strong>"+MESI[sm-1]+" "+sy+"</strong> | Fine: <strong>Giugno 2026</strong>";
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
  requestAnimationFrame(()=>{drawNativeChart(document.getElementById("simChart"),navSeries,cur);});
  document.getElementById("simChartSub").textContent="Dal "+MESI[sm-1]+"/"+sy+" al 6/2026 - "+nM+" mesi | ATH: "+sccy(peak,cur);
  const sc=[
    {l:"1 anno",cagr:9.34,vol:7.3,dd:-3.39,sh:0.71,so:0.92,ca:2.75},
    {l:"3 anni",cagr:9.56,vol:5.9,dd:-6.41,sh:0.9,so:1.23,ca:1.49},
    {l:"5 anni",cagr:5.92,vol:7.1,dd:-12.27,sh:0.28,so:0.3,ca:0.48},
    {l:"10 anni",cagr:4.24,vol:7.2,dd:-12.27,sh:0.06,so:0.06,ca:0.35}
  ];
  let stHtml="<tr><th>Orizzonte</th><th>CAGR</th><th>Volatilita</th><th>Max DD</th><th>Sharpe</th><th>Sortino</th><th>Calmar</th></tr>";
  sc.forEach(function(r){
    stHtml+="<tr><td>"+r.l+"</td><td>"+sfmt(r.cagr)+"</td><td>"+sfmt(r.vol)+"</td><td>"+sfmt(r.dd)+"</td><td>"+r.sh.toFixed(2)+"</td><td>"+r.so.toFixed(2)+"</td><td>"+r.ca.toFixed(2)+"</td></tr>";
  });
  document.getElementById("simScorecard").innerHTML=stHtml;
  let ddHtml="<tr><th>Evento</th><th>Drawdown</th><th>Durata (mesi)</th><th>Recovery (mesi)</th></tr>";
  SIM_DD.forEach(function(d){
    ddHtml+="<tr><td>"+d.ev+"</td><td style='color:#c0392b'>"+sfmt(d.dd)+"</td><td>"+d.tr+"</td><td>"+d.rc+"</td></tr>";
  });
  document.getElementById("simDDTable").innerHTML=ddHtml;
  const allYears=Object.keys(SIM_MONTHLY).map(Number).sort();
  let calHtml="<tr><th>Anno</th>";
  for(let mm=1;mm<=12;mm++)calHtml+="<th>"+MESI[mm-1]+"</th>";
  calHtml+="<th>Anno</th></tr>";
  allYears.forEach(function(yr){
    if(yr<sy||(yr===sy&&sm>1))return;
    const yd=SIM_MONTHLY[String(yr)];
    let ann=0;const isFirst=(yr===sy);
    calHtml+="<tr><td style='font-weight:700;color:#8B1A1A'>"+yr+"</td>";
    for(let mm=1;mm<=12;mm++){
      if(isFirst&&mm<sm){calHtml+="<td style='color:#ccc'>--</td>";continue;}
      const v=yd&&yd[mm]!==undefined?yd[mm]:null;
      if(v===null){calHtml+="<td style='color:#ccc'>--</td>";continue;}
      ann+=v;
      const cl=v>=0?"color:#1a7a1a":"color:#c0392b";
      calHtml+="<td style='"+cl+"'>"+( v>=0?"+":"")+v.toFixed(1)+"</td>";
    }
    const annCl=ann>=0?"color:#1a7a1a;font-weight:700":"color:#c0392b;font-weight:700";
    calHtml+="<td style='"+annCl+"">"+( ann>=0?"+":"")+ann.toFixed(1)+"%</td></tr>";
  });
  document.getElementById("simCalendar").innerHTML=calHtml;
  const yrs=allYears.filter(function(yr){return yr>=sy;});
  const posY=yrs.filter(function(yr){return Object.values(SIM_MONTHLY[String(yr)]).reduce(function(a,b){return a+b;},0)>=0;}).length;
  document.getElementById("simCalSub").textContent="Rendimenti mensili dal "+MESI[sm-1]+" "+sy+" a Giugno 2026 | Anni positivi: "+posY+"/"+yrs.length;
  document.getElementById("simResults").scrollIntoView({behavior:"smooth",block:"start"});
}
function simGeneraPDF(){
  if(!simData){alert("Prima esegua la simulazione.");return;}
  var d=simData;
  var today=new Date().toLocaleDateString("it-IT",{day:"2-digit",month:"long",year:"numeric"});
  var sub=(d.inv?"Investitore: "+d.inv+" | ":"")+"Investimento: "+sccy(d.imp,d.cur)+" | Inizio: "+MESI[d.sm-1]+" "+d.sy+" | Fine: Giugno 2026 | Durata: "+d.nM+" mesi";
  var CSS="*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#1A1A1A;background:#fff;padding:40px;font-size:13px}.hdr{border-bottom:3px solid #8B1A1A;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between}.hdr h1{font-size:22px;color:#8B1A1A;font-weight:700}.hdr p{font-size:11px;color:#666;margin-top:4px}.hdr-r{text-align:right;font-size:11px;color:#666}.stit{font-size:13px;font-weight:700;color:#8B1A1A;margin:20px 0 10px;text-transform:uppercase;border-bottom:1px solid #DDD;padding-bottom:6px}.kg{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}.kb{background:#FAF8F4;border:1px solid #DDD;border-radius:4px;padding:12px;text-align:center}.kv{font-size:20px;font-weight:700;color:#8B1A1A}.kl{font-size:10px;color:#666;text-transform:uppercase;margin-top:4px}table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px}th{background:#8B1A1A;color:#fff;padding:6px 8px;text-align:left;font-size:10px;text-transform:uppercase}td{padding:5px 8px;border-bottom:1px solid #EEE}tr:nth-child(even) td{background:#FAF8F4}.disc{font-size:9px;color:#888;line-height:1.5;border-top:1px solid #DDD;padding-top:12px;margin-top:24px}.foot{text-align:center;font-size:10px;color:#AAA;margin-top:12px}";
  var html="<!DOCTYPE html><html><head><meta charset='UTF-8'><title>EGONON — Report Simulazione</title><style>"+CSS+"</style></head><body>";
  html+="<div class='hdr'><div><h1>EGONON Global Macro Index</h1><p>"+sub+"</p></div><div class='hdr-r'><strong>EGONON SA</strong><br>info@egonon.ch<br>"+today+"</div></div>";
  html+="<div class='stit'>Risultati Principali</div>";
  html+="<div class='kg'>";
  var kpis=[
    {v:sccy(d.nav,d.cur),l:"Valore Finale"},
    {v:sfmt(d.totRet),l:"Rendimento Totale"},
    {v:sfmt(d.cagr),l:"CAGR Annualizzato"},
    {v:sfmt(d.vol),l:"Volatilita Annua"},
    {v:sfmt(d.maxDD),l:"Max Drawdown"},
    {v:d.nM+" mesi",l:"Durata"}
  ];
  kpis.forEach(function(k){html+="<div class='kb'><div class='kv'>"+k.v+"</div><div class='kl'>"+k.l+"</div></div>";});
  html+="</div>";
  html+="<div class='stit'>Scorecard per Orizzonte</div>";
  var sc=[
    {l:"1 anno",cagr:9.34,vol:7.3,dd:-3.39,sh:0.71,so:0.92,ca:2.75},
    {l:"3 anni",cagr:9.56,vol:5.9,dd:-6.41,sh:0.9,so:1.23,ca:1.49},
    {l:"5 anni",cagr:5.92,vol:7.1,dd:-12.27,sh:0.28,so:0.3,ca:0.48},
    {l:"10 anni",cagr:4.24,vol:7.2,dd:-12.27,sh:0.06,so:0.06,ca:0.35}
  ];
  html+="<table><tr><th>Orizzonte</th><th>CAGR</th><th>Volatilita</th><th>Max DD</th><th>Sharpe</th><th>Sortino</th><th>Calmar</th></tr>";
  sc.forEach(function(r){html+="<tr><td>"+r.l+"</td><td>"+sfmt(r.cagr)+"</td><td>"+sfmt(r.vol)+"</td><td>"+sfmt(r.dd)+"</td><td>"+r.sh.toFixed(2)+"</td><td>"+r.so.toFixed(2)+"</td><td>"+r.ca.toFixed(2)+"</td></tr>";});
  html+="</table>";
  html+="<div class='stit'>Drawdown Storici</div>";
  html+="<table><tr><th>Evento</th><th>Drawdown</th><th>Durata (mesi)</th><th>Recovery (mesi)</th></tr>";
  SIM_DD.forEach(function(dd){html+="<tr><td>"+dd.ev+"</td><td style='color:#c0392b'>"+sfmt(dd.dd)+"</td><td>"+dd.tr+"</td><td>"+dd.rc+"</td></tr>";});
  html+="</table>";
  html+="<div class='disc'>I rendimenti storici non sono indicativi di risultati futuri. Ogni investimento comporta rischi, inclusa la possibile perdita parziale o totale del capitale. I dati si riferiscono all'EGONON Global Macro Index (ISIN DE000A2UG4F2). EGONON SA, Via Magatti 2, 6900 Lugano, Svizzera. Autorizzata FINMA ai sensi della LIsFi.</div>";
  html+="</body></html>";
  var w=window.open("","_blank");
  if(w){w.document.write(html);w.document.close();setTimeout(function(){w.print();},500);}
  else alert("Il browser ha bloccato il popup. Consentire i popup per stampare.");
}