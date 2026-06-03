"""
EGONON SA - Campaign Launcher v2
Legge i prospect DIRETTAMENTE dal CRM Base44 tramite API.
NON usa file locali. Solo email verificate dal database.
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime

# === TOKEN OUTLOOK ===
token = os.environ["OUTLOOK_ACCESS_TOKEN"]

# === PROSPECT DAL CRM (iniettati al momento dell'esecuzione) ===
# Questi dati vengono passati come variabile d'ambiente CRM_PROSPECTS (JSON)
crm_data = os.environ.get("CRM_PROSPECTS", "[]")
prospects = json.loads(crm_data)

print(f"Prospect caricati dal CRM: {len(prospects)}")

# === DISCLAIMER HTML ===
DISCLAIMER_HTML = """
<hr style="border:none; border-top:1px solid #ccc; margin-top:30px;">
<p style="font-size:11px; color:#666; line-height:1.5;">
Il presente messaggio ha finalità esclusivamente informative e promozionali e non costituisce consulenza personalizzata in investimenti, raccomandazione personale, offerta, invito o sollecitazione all'acquisto, alla vendita o alla sottoscrizione di strumenti finanziari o servizi di gestione patrimoniale.<br><br>
I dati relativi a performance e drawdown sono storici, riferiti a specifici periodi di osservazione e non sono indicativi né garanzia di risultati futuri. Ogni investimento comporta rischi, inclusa la possibile perdita parziale o totale del capitale investito. EGONON SA non garantisce capitale, rendimento o protezione da perdite future.<br><br>
Eventuali servizi di consulenza o gestione patrimoniale potranno essere prestati esclusivamente previa classificazione del cliente, verifica di appropriatezza e/o adeguatezza ove applicabile, e accettazione della relativa documentazione contrattuale.<br><br>
Per non ricevere ulteriori comunicazioni commerciali da EGONON SA, puoi scrivere a <a href="mailto:info@egonon.ch">info@egonon.ch</a>.
</p>
"""

# === CORPO BASE ===
CORPO_BASE = """
<p style="color:#333; font-size:14px; line-height:1.6;">
Molti portafogli sembrano solidi quando i mercati salgono. Il vero test arriva quando tutto scende.
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">
Durante lo shock COVID, l'MSCI World ha perso circa <strong>-34%</strong>. Nello stesso periodo, l'indice flagship <strong>EGONON Global Macro Index</strong> ha contenuto il drawdown massimo a circa <strong>-15%</strong>.
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">
Dall'emissione, la strategia ha generato una performance cumulata di <strong>+40,63%</strong>.
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">
Questi numeri non sono una promessa. Sono però una traccia concreta del nostro approccio: misurare il rischio in profondità, costruire portafogli resilienti e reagire agli shock di mercato con disciplina.
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">
Per questo <strong>EGONON SA</strong>, gestore patrimoniale svizzero autorizzato FINMA, mette a disposizione di un numero selezionato di investitori una <strong>analisi gratuita del rischio di portafoglio</strong>.
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">L'analisi permette di capire:</p>
<ul style="color:#333; font-size:14px; line-height:1.8;">
  <li>quanto rischio sta realmente assumendo;</li>
  <li>quanto potrebbe perdere in uno scenario di stress;</li>
  <li>se il portafoglio è coerente con i suoi obiettivi;</li>
  <li>dove si concentrano eventuali rischi nascosti.</li>
</ul>
<p style="color:#333; font-size:14px; line-height:1.6;">
Può richiederla qui: <a href="https://egononos.polsia.app/rischio" style="color:#1a5276;">https://egononos.polsia.app/rischio</a><br>
Per conoscere EGONON SA: <a href="https://egonon.ch" style="color:#1a5276;">https://egonon.ch</a>
</p>
<p style="color:#333; font-size:14px; line-height:1.6;">
Cordiali saluti,<br>
<strong>Client Relations Team EGONON SA</strong><br>
Via della Posta 7, 6900 Lugano<br>
+41 (0)58 666 00 69 | <a href="mailto:info@egonon.ch">info@egonon.ch</a><br>
<a href="https://egonon.ch">https://egonon.ch</a>
</p>
"""

# === APERTURE PER CATEGORIA ===
APERTURE = {
    "pmi industria": "Lei gestisce ogni giorno rischi operativi complessi. Ma il suo patrimonio personale è costruito per resistere agli stessi shock che affronta la sua azienda?",
    "pharma": "Lei gestisce ogni giorno rischi operativi complessi. Ma il suo patrimonio personale è costruito per resistere agli stessi shock che affronta la sua azienda?",
    "export": "Lei gestisce ogni giorno rischi operativi complessi. Ma il suo patrimonio personale è costruito per resistere agli stessi shock che affronta la sua azienda?",
    "costruzioni": "Chi opera nel settore delle costruzioni e dell'immobiliare accumula spesso un'esposizione concentrata. Il portafoglio personale dovrebbe bilanciare quel rischio — non amplificarlo.",
    "immobiliare": "Chi opera nel settore delle costruzioni e dell'immobiliare accumula spesso un'esposizione concentrata. Il portafoglio personale dovrebbe bilanciare quel rischio — non amplificarlo.",
    "architettura": "Chi opera nel settore delle costruzioni e dell'immobiliare accumula spesso un'esposizione concentrata. Il portafoglio personale dovrebbe bilanciare quel rischio — non amplificarlo.",
    "hotel": "Il settore hospitality conosce bene la volatilità stagionale. Ma quanto è resiliente il suo patrimonio personale di fronte a uno shock di mercato globale?",
    "hospitality": "Il settore hospitality conosce bene la volatilità stagionale. Ma quanto è resiliente il suo patrimonio personale di fronte a uno shock di mercato globale?",
    "ristorazione": "Il settore hospitality conosce bene la volatilità stagionale. Ma quanto è resiliente il suo patrimonio personale di fronte a uno shock di mercato globale?",
    "farmaci": "Gestire una farmacia significa bilanciare ogni giorno capitale operativo e investimenti. Ma il suo patrimonio personale è davvero separato e protetto?",
    "medici": "I professionisti con redditi elevati raramente ricevono una seconda opinione indipendente sul proprio rischio patrimoniale. Eppure è proprio qui che si fanno le differenze nel lungo termine.",
    "cliniche": "I professionisti con redditi elevati raramente ricevono una seconda opinione indipendente sul proprio rischio patrimoniale. Eppure è proprio qui che si fanno le differenze nel lungo termine.",
    "dentist": "Lo studio dentistico genera redditi importanti ma richiede investimenti significativi. Separare liquidità operativa, previdenza e patrimonio investibile è una scelta che molti rimandano — a costo di esporsi inutilmente.",
    "ortodont": "Lo studio dentistico genera redditi importanti ma richiede investimenti significativi. Separare liquidità operativa, previdenza e patrimonio investibile è una scelta che molti rimandano — a costo di esporsi inutilmente.",
    "veterinar": "Gestire una struttura veterinaria richiede visione imprenditoriale. Ma il suo patrimonio personale è mai stato analizzato con strumenti istituzionali indipendenti?",
    "orologeria": "Chi opera nel settore del lusso conosce il valore della precisione. EGONON SA applica la stessa precisione alla gestione patrimoniale — senza dipendenze bancarie, senza opinioni di parte.",
    "gioielleria": "Chi opera nel settore del lusso conosce il valore della precisione. EGONON SA applica la stessa precisione alla gestione patrimoniale — senza dipendenze bancarie, senza opinioni di parte.",
    "lusso": "Chi opera nel settore del lusso conosce il valore della precisione. EGONON SA applica la stessa precisione alla gestione patrimoniale — senza dipendenze bancarie, senza opinioni di parte.",
    "scuol": "Chi dirige una scuola privata gestisce capitale, reputazione e relazioni internazionali. Il patrimonio personale merita la stessa cura riservata all'istituzione.",
    "education": "Chi dirige una scuola privata gestisce capitale, reputazione e relazioni internazionali. Il patrimonio personale merita la stessa cura riservata all'istituzione.",
    "sportiv": "La carriera sportiva è concentrata nel tempo. Il capitale che genera deve durare molto più a lungo — e va protetto con un approccio indipendente e rigoroso fin da subito.",
    "dirigenti": "La carriera sportiva è concentrata nel tempo. Il capitale che genera deve durare molto più a lungo — e va protetto con un approccio indipendente e rigoroso fin da subito.",
}

DEFAULT_APERTURA = "La gestione del patrimonio personale richiede oggi strumenti indipendenti e una visione di lungo periodo. EGONON SA offre esattamente questo."


def get_apertura(categoria):
    cat_lower = categoria.lower()
    for key, val in APERTURE.items():
        if key in cat_lower:
            return val
    return DEFAULT_APERTURA


def get_saluto(categoria):
    cat_lower = categoria.lower()
    if "medici" in cat_lower or "cliniche" in cat_lower or "dentist" in cat_lower or "ortodont" in cat_lower or "veterinar" in cat_lower:
        return "Gentile Dott./Dott.ssa,"
    return "Gentile Cliente,"


def send_email(to_email, azienda, categoria):
    apertura = get_apertura(categoria)
    saluto = get_saluto(categoria)

    html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px;">
<p style="color:#333; font-size:14px; line-height:1.6;">{saluto}</p>
<p style="color:#333; font-size:14px; line-height:1.6;">{apertura}</p>
{CORPO_BASE}
{DISCLAIMER_HTML}
</body>
</html>
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

    with urllib.request.urlopen(req) as resp:
        return resp.status  # 202 = accepted


# === INVIO ===
sent = []
failed = []
skipped = []
today = datetime.now().strftime("%Y-%m-%d")

for p in prospects:
    email = p.get("email", "").strip()
    azienda = p.get("azienda", "N/A")
    categoria = p.get("categoria", "")
    prospect_id = p.get("id", "")
    tipo_email = p.get("tipo_email", "")
    stato = p.get("stato", "")

    # Salta chi è già stato contattato
    if stato and stato != "Da contattare":
        skipped.append({"azienda": azienda, "motivo": f"già nello stato: {stato}"})
        print(f"⏭️  SKIP {azienda} (stato: {stato})")
        continue

    if not email:
        failed.append({"id": prospect_id, "azienda": azienda, "motivo": "email mancante"})
        print(f"⚠️  SKIP {azienda} - email mancante")
        continue

    try:
        status = send_email(email, azienda, categoria)
        if status == 202:
            sent.append({"id": prospect_id, "azienda": azienda, "email": email, "categoria": categoria, "tipo_email": tipo_email})
            print(f"✅ {azienda} → {email}")
        else:
            failed.append({"id": prospect_id, "azienda": azienda, "email": email, "motivo": f"status inatteso: {status}"})
            print(f"⚠️  {azienda} → status {status}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        failed.append({"id": prospect_id, "azienda": azienda, "email": email, "motivo": f"HTTP {e.code}: {body[:150]}"})
        print(f"❌ {azienda} → HTTP {e.code}: {body[:100]}")
    except Exception as e:
        failed.append({"id": prospect_id, "azienda": azienda, "email": email, "motivo": str(e)})
        print(f"❌ {azienda} → {str(e)}")

# === RIEPILOGO ===
results = {
    "date": today,
    "sent_count": len(sent),
    "failed_count": len(failed),
    "skipped_count": len(skipped),
    "sent": sent,
    "failed": failed,
    "skipped": skipped
}

with open("campaign_results.json", "w") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"\n{'='*40}")
print(f"RIEPILOGO CAMPAGNA EGONON SA")
print(f"{'='*40}")
print(f"✅ Inviate:  {len(sent)}")
print(f"❌ Fallite:  {len(failed)}")
print(f"⏭️  Skippate: {len(skipped)}")
if failed:
    print(f"\nFallite:")
    for f_item in failed:
        print(f"  - {f_item['azienda']}: {f_item['motivo']}")
