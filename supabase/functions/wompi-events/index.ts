import { createClient } from 'npm:@supabase/supabase-js@2.112.3';
import { jsonResponse } from '../_shared/cors.ts';
import {
  normalizedWompiStatus,
  verifyWompiEvent,
  wompiEnvironment
} from '../_shared/wompi.ts';

type JsonObject = Record<string, unknown>;

function secretKey(): string {
  const configured = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (configured) {
    const parsed = JSON.parse(configured);
    if (parsed?.default) {
      const selected = String(parsed.default);
      return String(Deno.env.get(selected) || selected).trim();
    }
  }
  const legacy = String(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
  if (!legacy) throw new Error('Configuración pendiente: SUPABASE_SECRET_KEYS');
  return legacy;
}

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return jsonResponse(request, { received: false }, 405);

  try {
    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > 100_000) return jsonResponse(request, { received: false }, 413);
    const payload = await request.json() as JsonObject;
    const checksum = String(request.headers.get('x-event-checksum') || '');
    if (!await verifyWompiEvent(payload, checksum)) {
      return jsonResponse(request, { received: false }, 401);
    }
    if (String(payload.environment || '') !== wompiEnvironment()) {
      return jsonResponse(request, { received: false }, 409);
    }
    if (payload.event !== 'transaction.updated') return jsonResponse(request, { received: true });

    const data = payload.data as JsonObject | undefined;
    const transaction = data?.transaction as JsonObject | undefined;
    const reference = String(transaction?.reference || '');
    if (!reference.startsWith('ACQA-CERT-')) return jsonResponse(request, { received: true });

    const url = String(Deno.env.get('SUPABASE_URL') || '').trim();
    const admin = createClient(url, secretKey(), { auth: { persistSession: false, autoRefreshToken: false } });
    const orderResult = await admin.from('certificate_orders').select('*').eq('reference', reference).maybeSingle();
    if (orderResult.error) throw orderResult.error;
    const order = orderResult.data;
    if (!order) return jsonResponse(request, { received: true });

    if (Number(transaction?.amount_in_cents) !== Number(order.amount_in_cents)
      || String(transaction?.currency || '') !== String(order.currency)) {
      return jsonResponse(request, { received: false }, 409);
    }

    const status = normalizedWompiStatus(transaction?.status);
    if (order.status === 'APPROVED' && status !== 'APPROVED') {
      return jsonResponse(request, { received: true });
    }
    const now = new Date().toISOString();
    const update: JsonObject = {
      status,
      wompi_status: status,
      wompi_transaction_id: String(transaction?.id || ''),
      wompi_payment_method_type: String(transaction?.payment_method_type || ''),
      updated_at: now
    };
    if (status === 'APPROVED') update.approved_at = String(transaction?.finalized_at || now);
    const updated = await admin.from('certificate_orders').update(update).eq('id', order.id);
    if (updated.error) throw updated.error;
    return jsonResponse(request, { received: true });
  } catch (error) {
    console.error('wompi-events error', error instanceof Error ? error.message : 'unknown');
    const status = String((error as Error)?.message || '').startsWith('Configuración pendiente:') ? 503 : 500;
    return jsonResponse(request, { received: false }, status);
  }
});
