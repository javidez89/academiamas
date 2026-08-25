const PRODUCTION_ORIGIN = 'https://academiaqaoficial.com';

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin === PRODUCTION_ORIGIN || origin === 'https://www.academiaqaoficial.com') return true;
  return /^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin);
}

export function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : PRODUCTION_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

export function jsonResponse(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
