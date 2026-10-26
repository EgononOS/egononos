#!/usr/bin/env python3
"""
EGONON — aggiornamento mensile del database del simulatore.

Fonte: Börse Düsseldorf, storico prezzi del certificato DE000A2UG4F2
(Opus-Chartered Issuances, EGONON Global Macro Index).

Metodo (rebase sulla serie storica totale del simulatore):
  - si scaricano le chiusure giornaliere disponibili (circa 12 mesi);
  - si prende l'ultima chiusura di ogni mese;
  - per ogni mese COMPLETO per cui esiste anche la chiusura del mese precedente
    si calcola il rendimento mensile = close(m) / close(m-1) - 1;
  - quel rendimento sostituisce o aggiunge il mese nella serie totale
    (egonon_site/sim_data.js). I mesi più vecchi non coperti dalla fonte
    restano invariati, quindi la serie dal 2010 resta continua.

Uso:
  python3 scripts/update_sim_data.py               # scarica da Börse Düsseldorf
  python3 scripts/update_sim_data.py --json f.json # usa un file già scaricato
"""
import argparse
import datetime as dt
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ISIN = "DE000A2UG4F2"
PAGE = ("https://www.boerse-duesseldorf.de/etc/DE000A2UG4F2/"
        "opus-charter-iss-s-a-c-162-tr-z1920-unl-egonon-index/")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")
ROOT = Path(__file__).resolve().parents[1]
DATA_JS = ROOT / "egonon_site" / "sim_data.js"
HEAD = "// GENERATO DA scripts/update_sim_data.py — non modificare a mano\nwindow.EGONON_SIM = "
MAX_JUMP = 15.0  # % mensile oltre cui il dato è sospetto e l'aggiornamento si ferma


def http_get(url, referer=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*",
                                               **({"Referer": referer} if referer else {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def fetch_history():
    html = http_get(PAGE)
    m = re.search(r"var instrument_data\s*=\s*(\{.*?\});", html, re.S)
    if not m:
        sys.exit("ERRORE: blocco instrument_data non trovato nella pagina Börse Düsseldorf")
    cfg = json.loads(m.group(1))
    endpoint = cfg.get("client_request_endpoint") or "https://www.boerse-duesseldorf.de/wp-admin/admin-ajax.php"
    q = {"action": "client_instrument_data", "data_type": "historie", "isin": ISIN,
         "boerse": "dus", "instrument_type": "etc", "einheitscode": "1", "nonce": cfg["nonce"]}
    raw = http_get(endpoint + "?" + urllib.parse.urlencode(q), referer=PAGE)
    j = json.loads(raw)
    if not j.get("success"):
        sys.exit("ERRORE: risposta Börse Düsseldorf non valida")
    return j["data"]


def num(s):
    return float(str(s).replace(".", "").replace(",", "."))


def month_end_closes(rows):
    rows = sorted(((r["date_orderable"], num(r["letzter"])) for r in rows if r.get("letzter")),
                  key=lambda x: x[0])
    me = {}
    for d, c in rows:
        me[f"{d[:4]}-{d[4:6]}"] = (d, c)
    return me, rows[-1]


def load_data():
    txt = DATA_JS.read_text(encoding="utf-8")
    return json.loads(txt[txt.index("{"): txt.rindex("}") + 1])


def save_data(data):
    DATA_JS.write_text(HEAD + json.dumps(data, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", help="file JSON con la risposta 'historie' già scaricata")
    ap.add_argument("--today", help="data di riferimento YYYY-MM-DD (test)")
    a = ap.parse_args()

    rows = json.load(open(a.json))["data"] if a.json else fetch_history()
    me, last = month_end_closes(rows)
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    current = f"{today.year:04d}-{today.month:02d}"

    keys = sorted(me)
    data = load_data()
    changes = []
    for prev, cur in zip(keys, keys[1:]):
        if cur >= current:  # mese non ancora chiuso
            continue
        r = round((me[cur][1] / me[prev][1] - 1) * 100, 2)
        if abs(r) > MAX_JUMP:
            sys.exit(f"ERRORE: rendimento {cur} = {r}% fuori soglia, controllo manuale richiesto")
        y, m = cur.split("-")
        mk = str(int(m))
        old = data["monthly"].get(y, {}).get(mk)
        if old is None or abs(old - r) > 1e-9:
            data["monthly"].setdefault(y, {})[mk] = r
            changes.append((cur, old, r))

    complete = [k for k in keys if k < current]
    if complete:
        d, c = me[complete[-1]]
        data["asOf"] = f"{d[:4]}-{d[4:6]}-{d[6:]}"
        data["lastClose"] = c
        data["lastCloseDate"] = data["asOf"]
    data["monthly"] = {y: dict(sorted(v.items(), key=lambda kv: int(kv[0])))
                       for y, v in sorted(data["monthly"].items())}

    for cur, old, r in changes:
        print(f"{cur}: {old} -> {r}")
    if not changes:
        print("Nessuna variazione: serie già aggiornata a", data["asOf"])
        return
    data["updatedAt"] = today.isoformat()
    save_data(data)
    print("Aggiornato sim_data.js, dati al", data["asOf"], "ultima chiusura", data["lastClose"])


if __name__ == "__main__":
    main()
