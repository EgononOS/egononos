Deno.serve(async (req) => {
  const { codici, stato, data_primo_contatto } = await req.json();

  const APP_ID = "6a1ef83138e7426bdf474b25";
  const API_BASE = `https://app.base44.com/api/apps/${APP_ID}/entities/Prospect`;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": Deno.env.get("BASE44_API_KEY") || "",
  };

  const results = [];

  for (const codice of codici) {
    try {
      // Cerca il record per codice
      const searchRes = await fetch(`${API_BASE}?codice=${encodeURIComponent(codice)}`, { headers });
      const records = await searchRes.json();
      const arr = Array.isArray(records) ? records : (records.records || []);

      if (arr.length === 0) {
        results.push({ codice, status: "non trovato" });
        continue;
      }

      const id = arr[0].id;
      const updateRes = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ stato, data_primo_contatto }),
      });

      if (updateRes.ok) {
        results.push({ codice, status: "aggiornato" });
      } else {
        const err = await updateRes.text();
        results.push({ codice, status: `errore: ${err.slice(0, 80)}` });
      }
    } catch (e) {
      results.push({ codice, status: `eccezione: ${e.message}` });
    }
  }

  const ok = results.filter(r => r.status === "aggiornato").length;
  return Response.json({ aggiornati: ok, totale: codici.length, results });
});
