const TRM_URL = 'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC';

export type WompiCheckout = {
  checkoutUrl: string;
  amountInCents: number;
  amountCop: number;
  priceUsd: number;
  trm: number;
  trmDate: string;
  reference: string;
  expiresAt: string;
};

export function wompiEnvironment(): 'test' | 'prod' {
  return String(Deno.env.get('WOMPI_ENVIRONMENT') || 'prod').toLowerCase() === 'test' ? 'test' : 'prod';
}

export function wompiApiBase(): string {
  return wompiEnvironment() === 'test'
    ? 'https://sandbox.wompi.co/v1'
    : 'https://production.wompi.co/v1';
}

export function requiredEnvironment(name: string): string {
  const value = String(Deno.env.get(name) || '').trim();
  if (!value) throw new Error(`Configuración pendiente: ${name}`);
  return value;
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function currentTrm(): Promise<{ value: number; date: string }> {
  const response = await fetch(TRM_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) throw new Error('No fue posible consultar la TRM vigente.');
  const records = await response.json();
  const record = Array.isArray(records) ? records[0] : null;
  const value = Number(record?.valor);
  if (!Number.isFinite(value) || value <= 0) throw new Error('La TRM recibida no es válida.');
  return {
    value,
    date: String(record?.vigenciadesde || record?.vigenciahasta || '').slice(0, 10)
  };
}

export async function buildWompiCheckout(input: {
  reference: string;
  customerEmail: string;
  redirectUrl: string;
  priceUsd?: number;
  expiresAt: string;
  trm?: { value: number; date: string };
}): Promise<WompiCheckout> {
  const publicKey = requiredEnvironment('WOMPI_PUBLIC_KEY');
  const integritySecret = requiredEnvironment('WOMPI_INTEGRITY_SECRET');
  const priceUsd = Number(input.priceUsd || Deno.env.get('CERTIFICATE_PRICE_USD') || 25);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) throw new Error('El precio del certificado no es válido.');
  const trm = input.trm || await currentTrm();
  const amountCop = Math.max(1, Math.round(priceUsd * trm.value));
  const amountInCents = amountCop * 100;
  const integrity = await sha256Hex(
    `${input.reference}${amountInCents}COP${input.expiresAt}${integritySecret}`
  );
  const checkout = new URL('https://checkout.wompi.co/p/');
  checkout.searchParams.set('public-key', publicKey);
  checkout.searchParams.set('currency', 'COP');
  checkout.searchParams.set('amount-in-cents', String(amountInCents));
  checkout.searchParams.set('reference', input.reference);
  checkout.searchParams.set('signature:integrity', integrity);
  checkout.searchParams.set('redirect-url', input.redirectUrl);
  checkout.searchParams.set('expiration-time', input.expiresAt);
  checkout.searchParams.set('customer-data:email', input.customerEmail);
  checkout.searchParams.set('collect-customer-legal-id', 'true');

  return {
    checkoutUrl: checkout.toString(),
    amountInCents,
    amountCop,
    priceUsd,
    trm: trm.value,
    trmDate: trm.date,
    reference: input.reference,
    expiresAt: input.expiresAt
  };
}

export async function fetchWompiTransaction(transactionId: string): Promise<Record<string, unknown>> {
  const id = String(transactionId || '').trim();
  if (!/^[A-Za-z0-9-]{8,100}$/.test(id)) throw new Error('Identificador de transacción no válido.');
  const response = await fetch(`${wompiApiBase()}/transactions/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) throw new Error('Wompi aún no reporta esta transacción.');
  const payload = await response.json();
  const transaction = payload?.data;
  if (!transaction || typeof transaction !== 'object') throw new Error('Respuesta de Wompi no válida.');
  return transaction;
}

export function normalizedWompiStatus(value: unknown): string {
  const status = String(value || '').toUpperCase();
  return ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'].includes(status) ? status : 'ERROR';
}

function propertyValue(data: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[segment];
  }, data);
}

export async function verifyWompiEvent(payload: Record<string, unknown>, headerChecksum = ''): Promise<boolean> {
  const signature = payload.signature as Record<string, unknown> | undefined;
  const properties = Array.isArray(signature?.properties) ? signature.properties : [];
  const data = payload.data as Record<string, unknown> | undefined;
  const timestamp = payload.timestamp;
  const checksum = String(headerChecksum || signature?.checksum || '').trim().toLowerCase();
  if (!data || !properties.length || !checksum || timestamp === undefined) return false;
  const secret = requiredEnvironment('WOMPI_EVENTS_SECRET');
  const source = properties.map((path) => String(propertyValue(data, String(path)) ?? '')).join('')
    + String(timestamp)
    + secret;
  return (await sha256Hex(source)).toLowerCase() === checksum;
}
