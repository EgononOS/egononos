Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  const HTML_URL = 'https://base44.app/api/apps/6a1ef83138e7426bdf474b25/files/mp/public/6a1ef83138e7426bdf474b25/8ac977900_index.html';

  try {
    const response = await fetch(HTML_URL);
    if (!response.ok) {
      return new Response('Service temporarily unavailable', { status: 503 });
    }
    const html = await response.text();

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 500 });
  }
});
