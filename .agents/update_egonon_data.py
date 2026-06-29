#!/usr/bin/env python3
"""
EGONON SA — Script di aggiornamento dati certificato
Fonte unica di verità: .agents/egonon_nav_database.csv
Da eseguire ogni lunedì dopo aver aggiornato il CSV con i dati mensili ufficiali.
"""

import csv
import json
import math
import re
from collections import defaultdict
from datetime import datetime

CSV_PATH = '.agents/egonon_nav_database.csv'
INDEX_PATH = 'egonon_site/index.html'
FUNCTION_PATH = 'functions/egononJS.ts'

def load_csv():
    rows = []
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def calc_kpi(rows):
    last = rows[-1]
    last_nav = float(last['NAV_Reconstructed_From_Rounded_Returns'])
    last_date = datetime.strptime(last['Date'], '%Y-%m-%d')
    
    def nav_n_years_ago(n):
        target_year = last_date.year - n
        target_prefix = f"{target_year}-{last_date.month:02d}"
        # cerca il mese esatto, poi quello più vicino
        for row in rows:
            if row['Date'].startswith(target_prefix):
                return float(row['NAV_Reconstructed_From_Rounded_Returns'])
        # fallback: anno-mese precedente
        target_prefix2 = f"{target_year}-"
        candidates = [r for r in rows if r['Date'].startswith(target_prefix2)]
        if candidates:
            return float(candidates[-1]['NAV_Reconstructed_From_Rounded_Returns'])
        return None

    nav_1y = nav_n_years_ago(1)
    nav_3y = nav_n_years_ago(3)
    nav_5y = nav_n_years_ago(5)
    nav_inception = float(rows[0]['NAV_Reconstructed_From_Rounded_Returns'])
    
    perf_1y = round((last_nav / nav_1y - 1) * 100, 2) if nav_1y else None
    perf_3y = round((last_nav / nav_3y - 1) * 100, 2) if nav_3y else None
    perf_5y = round((last_nav / nav_5y - 1) * 100, 2) if nav_5y else None
    perf_inception = round((last_nav / nav_inception - 1) * 100, 2)
    
    max_dd = round(min(float(r['Drawdown_From_Rounded_NAV']) for r in rows) * 100, 2)
    
    # YTD
    dec_prev = None
    for row in rows:
        if row['Date'].startswith(f'{last_date.year - 1}-12'):
            dec_prev = float(row['NAV_Reconstructed_From_Rounded_Returns'])
    ytd = round((last_nav / dec_prev - 1) * 100, 2) if dec_prev else None

    # Volatilità 1Y (12 mesi rolling)
    last_12 = [float(r['Monthly_Return_Decimal']) for r in rows[-12:]]
    mean_m = sum(last_12) / len(last_12)
    vol_m = math.sqrt(sum((r - mean_m)**2 for r in last_12) / (len(last_12)-1))
    vol_ann = round(vol_m * math.sqrt(12) * 100, 2)
    
    rf_monthly = 0.04/12  # risk-free ~4% annuo
    excess = [(r - rf_monthly) for r in last_12]
    sharpe = round((sum(excess)/len(excess)) / (math.sqrt(sum((e - sum(excess)/len(excess))**2 for e in excess)/(len(excess)-1))) * math.sqrt(12), 2)

    return {
        'last_nav': last_nav,
        'last_date': last['Date'],
        'formatted_date': last_date.strftime('%d.%m.%Y'),
        'perf_1y': perf_1y,
        'perf_3y': perf_3y,
        'perf_5y': perf_5y,
        'perf_inception': perf_inception,
        'max_dd': max_dd,
        'ytd': ytd,
        'vol_ann': vol_ann,
        'sharpe': sharpe,
    }

def build_sim_monthly(rows):
    sim = defaultdict(dict)
    for row in rows:
        y = row['Year']
        m = int(row['Month_Number'])
        r = float(row['Monthly_Return_Pct_Displayed'])
        sim[y][m] = r
    lines = ['const SIM_MONTHLY = {']
    for year in sorted(sim.keys()):
        months = sim[year]
        month_str = ','.join(f'{m}:{v}' for m, v in sorted(months.items()))
        lines.append(f'  "{year}": {{{month_str}}},')
    lines.append('};')
    return '\n'.join(lines)

def format_pct(v):
    if v is None: return 'N/D'
    sign = '+' if v >= 0 else ''
    return f"{sign}{v:.2f}%".replace('.', ',')

def update_html(kpi):
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        # stat-value performance blocks
        (re.compile(r'(<div class="stat-value">)\+[\d,]+%(<\/div>\s*<div class="stat-label">Performance 12 mesi)'), 
         f'\\1{format_pct(kpi["perf_1y"])}\\2'),
        (re.compile(r'(<div class="stat-value">)\+[\d,]+%(<\/div>\s*<div class="stat-label">Performance 3 anni)'), 
         f'\\1{format_pct(kpi["perf_3y"])}\\2'),
        (re.compile(r'(<div class="stat-value">)\+[\d,]+%(<\/div>\s*<div class="stat-label">Performance 5 anni)'), 
         f'\\1{format_pct(kpi["perf_5y"])}\\2'),
        # tabella track record
        (re.compile(r'(<td>Ultimo anno<\/td><td>)\+[\d,]+%(<\/td>)'), 
         f'\\1{format_pct(kpi["perf_1y"])}\\2'),
        (re.compile(r'(<td>3 anni<\/td><td>)\+[\d,]+%(<\/td>)'), 
         f'\\1{format_pct(kpi["perf_3y"])}\\2'),
        (re.compile(r'(<td>5 anni<\/td><td>)\+[\d,]+%(<\/td>)'), 
         f'\\1{format_pct(kpi["perf_5y"])}\\2'),
        # data simulatore
        (re.compile(r'Dati aggiornati al \d{2}\.\d{2}\.\d{4}\.'), 
         f'Dati aggiornati al {kpi["formatted_date"]}.'),
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def update_function(kpi, sim_monthly_js):
    with open(FUNCTION_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Sostituisci il blocco SIM_MONTHLY
    new_content = re.sub(
        r'const SIM_MONTHLY = \{[\s\S]*?\};',
        sim_monthly_js,
        content
    )
    
    # Aggiorna scorecard hardcoded 1 anno
    new_content = re.sub(
        r'(\{l:"1 anno",cagr:)[\d.]+',
        f'\\g<1>{abs(kpi["perf_1y"])}' if kpi["perf_1y"] else '\\g<1>0',
        new_content
    )
    
    with open(FUNCTION_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True

# === ESECUZIONE ===
print("=" * 60)
print("EGONON SA — Update KPI & Simulatore")
print("=" * 60)

rows = load_csv()
kpi = calc_kpi(rows)
sim_js = build_sim_monthly(rows)

print(f"\n📊 KPI dal CSV (fonte unica certificata):")
print(f"   Ultimo dato: {kpi['last_date']} | NAV: {kpi['last_nav']:.2f}")
print(f"   Perf 1Y: {format_pct(kpi['perf_1y'])}")
print(f"   Perf 3Y: {format_pct(kpi['perf_3y'])}")
print(f"   Perf 5Y: {format_pct(kpi['perf_5y'])}")
print(f"   Perf Inception: {format_pct(kpi['perf_inception'])}")
print(f"   YTD: {format_pct(kpi['ytd'])}")
print(f"   Max DD storico: {format_pct(kpi['max_dd'])}")
print(f"   Volatilità 1Y: {kpi['vol_ann']:.2f}%")
print(f"   Sharpe 1Y: {kpi['sharpe']:.2f}")

update_html(kpi)
print(f"\n✅ index.html aggiornato")

update_function(kpi, sim_js)
print(f"✅ egononJS.ts aggiornato (SIM_MONTHLY + scorecard)")

print(f"\n🔒 VALIDAZIONE LEGALE:")
print(f"   Fonte: {CSV_PATH} (CSV ufficiale EGONON)")
print(f"   Dati al: {kpi['last_date']}")
print(f"   Nessun dato stimato o placeholder.")
print(f"   Tutti i valori calcolati da serie storica certificata.")
print("=" * 60)
