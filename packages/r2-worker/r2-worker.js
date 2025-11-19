export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove leading slash
    if (!key) return new Response('Not found', { status: 404 });

    // Try to get the object from R2
    const object = await env.BUCKET.get(key);
    if (!object) return new Response('Not found', { status: 404 });

    // Set cache and CORS headers
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }
};
