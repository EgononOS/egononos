Deno.serve(async (req) => {
  try {
    const { createClientFromRequest } = await import("npm:@base44/sdk@0.8.31");
    const base44 = createClientFromRequest(req);

    let prospects: any[] = [];
    try {
      prospects = await base44.entities.Prospect.list();
    } catch (_e) {
      prospects = await base44.asServiceRole.entities.Prospect.list();
    }

    const byStato: Record<string, number> = {};
    const byCategoria: Record<string, number> = {};
    const byCategoriaDaContattare: Record<string, number> = {};
    const dates: string[] = [];
    let followupDue = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (const p of prospects) {
      byStato[p.stato || "sconosciuto"] = (byStato[p.stato || "sconosciuto"] || 0) + 1;
      byCategoria[p.categoria || "sconosciuta"] = (byCategoria[p.categoria || "sconosciuta"] || 0) + 1;
      if (p.stato === "Da contattare") {
        byCategoriaDaContattare[p.categoria || "sconosciuta"] =
          (byCategoriaDaContattare[p.categoria || "sconosciuta"] || 0) + 1;
      }
      if (p.data_primo_contatto) dates.push(p.data_primo_contatto);
      if (p.data_followup && p.data_followup <= today) followupDue++;
    }

    dates.sort();
    const lastContactDate = dates.length ? dates[dates.length - 1] : null;

    let leads: any[] = [];
    try {
      leads = await base44.entities.LeadAnalisi.list();
    } catch (_e) {
      leads = await base44.asServiceRole.entities.LeadAnalisi.list();
    }

    const leadsByStato: Record<string, number> = {};
    const realLeads = [];
    for (const l of leads) {
      leadsByStato[l.stato || "sconosciuto"] = (leadsByStato[l.stato || "sconosciuto"] || 0) + 1;
      const isTest = /test|verifica|egonon/i.test(`${l.nome || ""} ${l.cognome || ""} ${l.email || ""}`);
      if (!isTest) realLeads.push({ nome: l.nome, cognome: l.cognome, email: l.email, professione: l.professione, stato: l.stato, data: l.data_contatto });
    }

    return new Response(
      JSON.stringify({
        total: prospects.length,
        byStato,
        byCategoria,
        byCategoriaDaContattare,
        lastContactDate,
        firstContactDate: dates.length ? dates[0] : null,
        followupDue,
        leads: { total: leads.length, byStato: leadsByStato, realLeads },
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
