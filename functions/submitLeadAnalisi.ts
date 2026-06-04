import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { nome, cognome, email, telefono, professione, patrimonio_stimato, messaggio } = body;

    if (!nome || !cognome || !email) {
      return Response.json(
        { error: 'Nome, cognome ed email sono obbligatori.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const base44 = createClientFromRequest(req);

    // Salva lead nel CRM
    const lead = await base44.asServiceRole.entities.LeadAnalisi.create({
      nome,
      cognome,
      email,
      telefono: telefono || '',
      professione: professione || '',
      patrimonio_stimato: patrimonio_stimato || 'Preferisco non indicarlo',
      messaggio: messaggio || '',
      fonte: 'Sito EGONON SA',
      stato: 'Nuovo',
      data_contatto: new Date().toISOString().split('T')[0],
    });

    // Ottieni token Outlook fresco tramite connettore OAuth Base44
    let outlookToken = '';
    try {
      const tokenResp = await base44.asServiceRole.integrations.getToken('outlook');
      outlookToken = tokenResp?.access_token || '';
    } catch(e) {
      console.error('Token Outlook non disponibile:', e.message);
    }

    if (outlookToken) {
      const emailPayload = {
        message: {
          subject: `🔔 Nuova richiesta analisi — ${nome} ${cognome}`,
          body: {
            contentType: 'HTML',
            content: `
<p><strong>Nuova richiesta di analisi gratuita ricevuta da EgononOS.</strong></p>
<table style="border-collapse:collapse; font-family:Arial, sans-serif; font-size:14px;">
  <tr><td style="padding:6px 12px; font-weight:bold; color:#666;">Nome</td><td style="padding:6px 12px;">${nome} ${cognome}</td></tr>
  <tr style="background:#f9f9f9;"><td style="padding:6px 12px; font-weight:bold; color:#666;">Email</td><td style="padding:6px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
  <tr><td style="padding:6px 12px; font-weight:bold; color:#666;">Telefono</td><td style="padding:6px 12px;">${telefono || '—'}</td></tr>
  <tr style="background:#f9f9f9;"><td style="padding:6px 12px; font-weight:bold; color:#666;">Professione</td><td style="padding:6px 12px;">${professione || '—'}</td></tr>
  <tr><td style="padding:6px 12px; font-weight:bold; color:#666;">Patrimonio stimato</td><td style="padding:6px 12px;">${patrimonio_stimato || '—'}</td></tr>
  <tr style="background:#f9f9f9;"><td style="padding:6px 12px; font-weight:bold; color:#666;">Messaggio</td><td style="padding:6px 12px;">${messaggio || '—'}</td></tr>
  <tr><td style="padding:6px 12px; font-weight:bold; color:#666;">Data</td><td style="padding:6px 12px;">${new Date().toLocaleDateString('it-IT')}</td></tr>
</table>
<br>
<p>Il contatto è stato salvato automaticamente nel CRM EGONON SA con stato <strong>"Nuovo"</strong>.</p>
<p style="color:#888; font-size:12px;">Email automatica generata da EgononOS — ${new Date().toISOString()}</p>
`,
          },
          toRecipients: [{ emailAddress: { address: 'info@egonon.ch' } }],
        },
        saveToSentItems: true,
      };

      const sendResp = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${outlookToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!sendResp.ok) {
        const errText = await sendResp.text();
        console.error('Errore invio email Outlook:', sendResp.status, errText);
      }
    }

    return Response.json(
      { ok: true, id: lead.id, message: 'Richiesta ricevuta. La contatteremo entro 24 ore.' },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
