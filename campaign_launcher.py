import os
import json
import urllib.request
import urllib.error
from datetime import datetime

# Template aperture per categoria
CATEGORY_OPENINGS = {
    "PMI / Industria / Pharma / Export": "Lei gestisce ogni giorno rischi operativi complessi. Ma il suo patrimonio personale è costruito per resistere agli stessi shock che affronta la sua azienda?",
    "Costruzioni / Immobiliare / Architettura": "Chi opera nel settore delle costruzioni e dell'immobiliare accumula spesso un'esposizione concentrata. Il portafoglio personale dovrebbe bilanciare quel rischio — non amplificarlo.",
    "Hotel / hospitality / ristorazione premium": "Il settore hospitality conosce bene la volatilità stagionale. Ma quanto è resiliente il suo patrimonio personale di fronte a uno shock di mercato globale?",
    "Farmacie / farmacisti titolari": "Gestire una farmacia significa bilanciare ogni giorno capitale operativo e investimenti. Ma il suo patrimonio personale è davvero separato e protetto?",
    "Medici specialisti / cliniche": "I professionisti con redditi elevati raramente ricevono una seconda opinione indipendente sul proprio rischio patrimoniale. Eppure è proprio qui che si fanno le differenze nel lungo termine.",
    "Dentisti / ortodontisti / implantologia": "Lo studio dentistico genera redditi importanti ma richiede investimenti significativi. Separare liquidità operativa, previdenza e patrimonio investibile è una scelta che molti rimandano — a costo di esporsi inutilmente.",
    "Cliniche veterinarie / veterinari titolari": "Gestire una struttura veterinaria richiede visione imprenditoriale. Ma il suo patrimonio personale è mai stato analizzato con strumenti istituzionali indipendenti?",
    "Orologeria / gioielleria / lusso / design": "Chi opera nel settore del lusso conosce il valore della precisione. EGONON SA applica la stessa precisione alla gestione patrimoniale — senza dipendenze bancarie, senza opinioni di parte.",
    "Scuole private / education business": "Chi dirige una scuola privata gestisce capitale, reputazione e relazioni internazionali. Il patrimonio personale merita la stessa cura riservata all'istituzione.",
    "Sportivi / ex sportivi / agenti / dirigenti": "La carriera sportiva è concentrata nel tempo. Il capitale che genera deve durare molto più a lungo — e va protetto con un approccio indipendente e rigoroso fin da subito."
}

BODY = """molti portafogli sembrano solidi quando i mercati salgono. Il vero test arriva quando tutto scende.

Durante lo shock COVID, l'MSCI World ha perso circa -34%. Nello stesso periodo, l'indice flagship EGONON Global Macro Index ha contenuto il drawdown massimo a circa -15%.

Dall'emissione, la strategia ha generato una performance cumulata di +40,63%.

Questi numeri non sono una promessa. Sono però una traccia concreta del nostro approccio: misurare il rischio in profondità, costruire portafogli resilienti e reagire agli shock di mercato con disciplina.

Per questo EGONON SA, gestore patrimoniale svizzero autorizzato FINMA, mette a disposizione di un numero selezionato di investitori una analisi gratuita del rischio di portafoglio.

L'analisi permette di capire:
- quanto rischio sta realmente assumendo;
- quanto potrebbe perdere in uno scenario di stress;
- se il portafoglio è coerente con i suoi obiettivi;
- dove si concentrano eventuali rischi nascosti.

Può richiederla qui: https://egononos.polsia.app/rischio
Per conoscere EGONON SA: https://egonon.ch

Cordiali saluti,
Client Relations Team EGONON SA
Via della Posta 7, 6900 Lugano
+41 (0)58 666 00 69
info@egonon.ch
https://egonon.ch"""

DISCLAIMER = """<hr>
<p style="font-size:11px; color:#666;">
Il presente messaggio ha finalità esclusivamente informative e promozionali e non costituisce consulenza personalizzata in investimenti, raccomandazione personale, offerta, invito o sollecitazione all'acquisto, alla vendita o alla sottoscrizione di strumenti finanziari o servizi di gestione patrimoniale.<br><br>
I dati relativi a performance e drawdown sono storici, riferiti a specifici periodi di osservazione e non sono indicativi né garanzia di risultati futuri. Ogni investimento comporta rischi, inclusa la possibile perdita parziale o totale del capitale investito. EGONON SA non garantisce capitale, rendimento o protezione da perdite future.<br><br>
Eventuali servizi di consulenza o gestione patrimoniale potranno essere prestati esclusivamente previa classificazione del cliente, verifica di appropriatezza e/o adeguatezza ove applicabile, e accettazione della relativa documentazione contrattuale.<br><br>
Per non ricevere ulteriori comunicazioni commerciali da EGONON SA, puoi scrivere a <a href="mailto:info@egonon.ch">info@egonon.ch</a>.
</p>"""

def build_html_body(opening, category):
    body_html = f"""<p>Gentile [Nome],</p>

<p>{opening}</p>

<p>{BODY.replace(chr(10), '</p><p>')}</p>

{DISCLAIMER}"""
    return body_html.replace('</p><p>-', '</p><ul><li>').replace('</p><p>Per', '</li></ul><p>Per')

def send_email(to_email, prospect_name, category, token):
    opening = CATEGORY_OPENINGS.get(category, "")
    if not opening:
        print(f"❌ Categoria sconosciuta: {category}")
        return False
    
    html_body = build_html_body(opening, category)
    
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
                {"emailAddress": {"address": to_email}}
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
                print(f"✅ {prospect_name} ({to_email})")
                return True
            else:
                print(f"⚠️ Status {resp.status}: {prospect_name}")
                return False
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ {prospect_name} ({to_email}): {e.code}")
        return False

# Leggi dal file JSON i prospect
try:
    with open("prospects.json", "r") as f:
        prospects = json.load(f)
except:
    print("Nessun file prospects.json trovato")
    prospects = []

if not prospects:
    print("Nessun prospect da inviare")
    exit(1)

token = os.environ.get("OUTLOOK_ACCESS_TOKEN", "")
if not token:
    print("Token Outlook non disponibile")
    exit(1)

# Conta per categoria
category_counts = {}
sent_count = 0
failed_count = 0

print(f"\n🚀 Lancio campagna EGONON SA — {len(prospects)} prospect")
print(f"Data/Ora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

for prospect in prospects:
    category = prospect.get("categoria", "")
    email = prospect.get("email", "")
    azienda = prospect.get("azienda", "")
    
    if not email or not category:
        continue
    
    if category not in category_counts:
        print(f"\n📧 Categoria: {category}")
        category_counts[category] = {"sent": 0, "failed": 0}
    
    if send_email(email, azienda, category, token):
        category_counts[category]["sent"] += 1
        sent_count += 1
    else:
        category_counts[category]["failed"] += 1
        failed_count += 1

print(f"\n{'='*60}")
print(f"✅ CAMPAGNA COMPLETATA")
print(f"{'='*60}")
print(f"📊 Totale inviati: {sent_count}")
print(f"❌ Errori: {failed_count}")
print(f"\n📈 Riepilogo per categoria:")
for cat, counts in category_counts.items():
    print(f"  {cat}: {counts['sent']} inviati, {counts['failed']} errori")
