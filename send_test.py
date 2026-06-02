import os
import json
import urllib.request

token = os.environ["OUTLOOK_ACCESS_TOKEN"]

html_body = """<p>Gentile [Nome/Spett.le Direzione],</p>
<p>Lei gestisce ogni giorno rischi operativi complessi — forniture, margini, mercati esteri. Ma il suo patrimonio personale riflette quella stessa complessità, o la replica silenziosamente?</p>
<p>EGONON SA è un gestore patrimoniale indipendente, autorizzato FINMA dal 2022, con track record verificabile dal 2007. Non sostituiamo la sua banca. La affianchiamo con un'analisi indipendente del rischio che la maggior parte degli imprenditori non ha mai ricevuto davvero.</p>
<p><strong>Le offriamo un'analisi gratuita del rischio del suo portafoglio.</strong> Nessun trasferimento di fondi, nessun cambiamento di banca. Solo chiarezza.</p>
<p>→ Richieda l'analisi: <a href="https://egonon.ch/">https://egonon.ch/</a><br>
→ Scopra la nostra piattaforma: <a href="https://egononos.polsia.app">https://egononos.polsia.app</a></p>
<p>Cordiali saluti,<br>
<strong>EGONON SA</strong> | Lugano &amp; Appenzello<br>
+41 58 566 60 69 | info@egonon.ch<br>
<em>Autorizzata FINMA · Vigilanza OSFIN</em></p>
<hr>
<p><small>⚠️ EMAIL DI TEST — Template: PMI Industria/Pharma/Export</small></p>"""

payload = {
    "message": {
        "subject": "[TEST] Il suo portafoglio personale compensa il rischio della sua azienda? — EGONON SA",
        "body": {
            "contentType": "HTML",
            "content": html_body
        },
        "toRecipients": [
            {"emailAddress": {"address": "ebferreri@gmail.com"}},
            {"emailAddress": {"address": "ebferreri@egonon.ch"}}
        ]
    },
    "saveToSentItems": True
}

data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    "https://graph.microsoft.com/v1.0/me/sendMail",
    data=data,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(req) as resp:
        print(f"Inviato con successo. Status: {resp.status}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"Errore HTTP {e.code}: {body}")
