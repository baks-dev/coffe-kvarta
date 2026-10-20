import { LEAD_FIELDS, type Lead, type LeadField } from '@/lib/lead-schema';

export const LEAD_ENDPOINT = '/api/lead';
export const SUBMIT_TIMEOUT_MS = 15_000;

export type SubmitFailureReason = 'network' | 'timeout' | 'server';

export type SubmitLeadResult =
  | { kind: 'ok' }
  | { kind: 'duplicate' }
  | { kind: 'invalid'; fieldErrors: Partial<Record<LeadField, string>> }
  | { kind: 'failed'; reason: SubmitFailureReason };

/**
 * Отправляет заявку на POST /api/lead. Никогда не бросает: любой сбой → { kind: 'failed' }.
 */
export async function submitLead(lead: Lead): Promise<SubmitLeadResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    try {
      const response = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
        signal: controller.signal,
      });

      try {
        const body = await response.json();
        return interpretResponse(response.status, body);
      } catch (jsonError) {
        void jsonError;
        return { kind: 'failed', reason: 'server' };
      }
    } catch (fetchError) {
      void fetchError;
      return { kind: 'failed', reason: controller.signal.aborted ? 'timeout' : 'network' };
    }
  } finally {
    clearTimeout(timer);
  }
}

function interpretResponse(status: number, body: unknown): SubmitLeadResult {
  // Step 1: body must be a non-null object, not array
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { kind: 'failed', reason: 'server' };
  }

  // Safe to treat as object with known properties
  const obj = body as { [key: string]: unknown };

  // Step 3 & 4: check status and kind
  if (status === 200) {
    if (obj.status === 'ok') {
      return { kind: 'ok' };
    }
    if (obj.status === 'duplicate') {
      return { kind: 'duplicate' };
    }
  }

  // Step 5: validation response
  if (status === 400 && obj.status === 'invalid') {
    const raw = obj.fieldErrors;
    // raw must be a non-null object, not array
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return { kind: 'failed', reason: 'server' };
    }

    const fieldErrors: Partial<Record<LeadField, string>> = {};
    for (const field of LEAD_FIELDS) {
      const value = raw[field];
      if (typeof value === 'string' && value.trim() !== '') {
        fieldErrors[field] = value;
      }
    }

    if (Object.keys(fieldErrors).length === 0) {
      return { kind: 'failed', reason: 'server' };
    }

    return { kind: 'invalid', fieldErrors };
  }

  // Step 6: fallback
  return { kind: 'failed', reason: 'server' };
}
