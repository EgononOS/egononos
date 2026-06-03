import os
import json
import urllib.request
import urllib.error
from datetime import datetime

token = os.environ["OUTLOOK_ACCESS_TOKEN"]

DISCLAIMER_HTML = """
<hr>
<p style="font-size:11px; color:#666;">
Il presente messaggio ha finalità esclusivamente informative e promozionali e non costituisce consulenza personalizzata in investimenti, raccomandazione personale, offerta, invito o sollecitazione all'acquisto, alla vendita o alla sottoscrizione di strumenti finanziari o servizi di gestione patrimoniale.<br><br>
I dati relativi a performance e drawdown sono storici, riferiti a specifici periodi di osservazione e non sono indicativi né garanzia di risultati futuri. Ogni investimento comporta rischi, inclusa la possibile perdita parziale o totale del capitale investito. EGONON SA non garantisce capitale, rendimento o protezione da perdite future.<br><br>
Eventuali servizi di consulenza o gestione patrimoniale potranno essere prestati esclusivamente previa classificazione del cliente, verifica di appropriatezza e/o adeguatezza ove applicabile, e accettazione della relativa documentazione contrattuale.<br><br>
Per non ricevere ulteriori comunicazioni commerciali da EGONON SA, puoi scrivere a <a href="mailto:info@egonon.ch">info@egonon.ch</a>.
</p>
"""

CORPO_BASE = """
<p>molti portafogli sembrano solidi quando i mercati salgono. Il vero test arriva quando tutto scende.</p>
<p>Durante lo shock COVID, l'MSCI World ha perso circa -34%. Nello stesso periodo, l'indice flagship EGONON Global Macro Index ha contenuto il drawdown massimo a circa -15%.</p>
<p>Dall'emissione, la strategia ha generato una performance cumulata di +40,63%.</p>
<p>Questi numeri non sono una promessa. Sono però una traccia concreta del nostro approccio: misurare il rischio in profondità, costruire portafogli resilienti e reagire agli shock di mercato con disciplina.</p>
<p>Per questo EGONON SA, gestore patrimoniale svizzero autorizzato FINMA, mette a disposizione di un numero selezionato di investitori una <strong>analisi gratuita del rischio di portafoglio</strong>.</p>
<p>L'analisi permette di capire:</p>
<ul>
  <li>quanto rischio sta realmente assumendo;</li>
  <li>quanto potrebbe perdere in uno scenario di stress;</li>
  <li>se il portafoglio è coerente con i suoi obiettivi;</li>
  <li>dove si concentrano eventuali rischi nascosti.</li>
</ul>
<p>Può richiederla qui: <a href="https://egononos.polsia.app/rischio">https://egononos.polsia.app/rischio</a><br>
Per conoscere EGONON SA: <a href="https://egonon.ch">https://egonon.ch</a></p>
<p>Cordiali saluti,<br>
<strong>Client Relations Team EGONON SA</strong><br>
Via della Posta 7, 6900 Lugano<br>
+41 (0)58 666 00 69<br>
<a href="mailto:info@egonon.ch">info@egonon.ch</a><br>
<a href="https://egonon.ch">https://egonon.ch</a></p>
"""

APERTURE = {
    "PMI industria / pharma / export": "Lei gestisce ogni giorno rischi operativi complessi. Ma il suo patrimonio personale è costruito per resistere agli stessi shock che affronta la sua azienda?",
    "Costruzioni / immobiliare / architettura": "Chi opera nel settore delle costruzioni e dell'immobiliare accumula spesso un'esposizione concentrata. Il portafoglio personale dovrebbe bilanciare quel rischio — non amplificarlo.",
    "Hotel / hospitality / ristorazione premium": "Il settore hospitality conosce bene la volatilità stagionale. Ma quanto è resiliente il suo patrimonio personale di fronte a uno shock di mercato globale?",
    "Farmacie / farmacisti titolari": "Gestire una farmacia significa bilanciare ogni giorno capitale operativo e investimenti. Ma il suo patrimonio personale è davvero separato e protetto?",
    "Medici specialisti / cliniche": "I professionisti con redditi elevati raramente ricevono una seconda opinione indipendente sul proprio rischio patrimoniale. Eppure è proprio qui che si fanno le differenze nel lungo termine.",
    "Dentisti / ortodontisti / implantologia": "Lo studio dentistico genera redditi importanti ma richiede investimenti significativi. Separare liquidità operativa, previdenza e patrimonio investibile è una scelta che molti rimandano — a costo di esporsi inutilmente.",
    "Cliniche veterinarie / veterinari titolari": "Gestire una struttura veterinaria richiede visione imprenditoriale. Ma il suo patrimonio personale è mai stato analizzato con strumenti istituzionali indipendenti?",
    "Orologeria / gioielleria / lusso / design": "Chi opera nel settore del lusso conosce il valore della precisione. EGONON SA applica la stessa precisione alla gestione patrimoniale — senza dipendenze bancarie, senza opinioni di parte.",
    "Scuole private / education business": "Chi dirige una scuola privata gestisce capitale, reputazione e relazioni internazionali. Il patrimonio personale merita la stessa cura riservata all'istituzione.",
    "Sportivi / ex sportivi / agenti / dirigenti": "La carriera sportiva è concentrata nel tempo. Il capitale che genera deve durare molto più a lungo — e va protetto con un approccio indipendente e rigoroso fin da subito.",
}

# Load prospects from file
with open("prospects.json", "r") as f:
    prospects = json.load(f)

sent = []
failed = []
today = datetime.now().strftime("%Y-%m-%d")

for p in prospects:
    categoria = p.get("categoria", "")
    email = p.get("email", "")
    azienda = p.get("azienda", "")
    prospect_id = p.get("id", "")

    if not email:
        failed.append({"azienda": azienda, "motivo": "email mancante"})
        continue

    # Find matching apertura
    apertura = ""
    for key, val in APERTURE.items():
        if key.lower() in categoria.lower():
            apertura = val
            break

    html_body = f"""
<p>Gentile Cliente,</p>
<p>{apertura}</p>
{CORPO_BASE}
{DISCLAIMER_HTML}
"""

    payload = {
        "message": {
            "subject": "Quando i mercati crollano, il vero valore è perdere meno",
            "body": {
                "contentType": "HTML",
                "content": html_body
            },
            "from": {
                "emailAddress": {
                    "name": "EGONON SA",
                    "address": "info@egonon.ch"
                }
            },
            "toRecipients": [
                {"emailAddress": {"address": email}}
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
            if resp.status == 202:
                sent.append({"id": prospect_id, "azienda": azienda, "email": email, "categoria": categoria})
                print(f"✅ {azienda} → {email}")
            else:
                failed.append({"azienda": azienda, "email": email, "motivo": f"status {resp.status}"})
                print(f"⚠️ {azienda} → status {resp.status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        failed.append({"azienda": azienda, "email": email, "motivo": f"HTTP {e.code}: {body[:100]}"})
        print(f"❌ {azienda} → {e.code}: {body[:100]}")

# Save results
results = {
    "date": today,
    "sent_count": len(sent),
    "failed_count": len(failed),
    "sent": sent,
    "failed": failed
}

with open("campaign_results.json", "w") as f:
    json.dump(results, f, indent=2)

print(f"\n=== RIEPILOGO ===")
print(f"Inviate: {len(sent)}")
print(f"Fallite: {len(failed)}")
if failed:
    print("\nFallite:")
    for f in failed:
        print(f"  - {f['azienda']}: {f['motivo']}")
