const DEFAULT_LOCAL_ORIGIN = 'http://127.0.0.1:8091';

function localReturnUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const transactionId = String(requestUrl.searchParams.get('id') || '').trim();
  const localOrigin = String(Deno.env.get('ACADEMIAQA_ORIGIN') || DEFAULT_LOCAL_ORIGIN).replace(/\/$/, '');
  const destination = new URL('/mi-cuenta/', localOrigin);
  destination.searchParams.set('certificado', 'pago');
  if (/^[A-Za-z0-9-]{8,100}$/.test(transactionId)) {
    destination.searchParams.set('id', transactionId);
  }
  return destination.toString();
}

Deno.serve((request: Request) => {
  if (request.method !== 'GET') {
    return new Response('Método no permitido.', {
      status: 405,
      headers: { Allow: 'GET', 'Cache-Control': 'no-store' }
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: localReturnUrl(request),
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer'
    }
  });
});
