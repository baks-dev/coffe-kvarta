import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Lead } from '@/lib/lead-schema';
import { SUBMIT_TIMEOUT_MS, submitLead } from '@/lib/submit-lead';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const lead: Lead = { name: 'Аня', phone: '+375291234567', interest: 'order', comment: '' };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// timeout: fetch that never answers but rejects on abort
const hangingFetch = vi.fn((...args: Parameters<typeof fetch>) => {
  const { promise, reject } = Promise.withResolvers<Response>();
  args[1]?.signal?.addEventListener('abort', () =>
    reject(new DOMException('The operation was aborted.', 'AbortError')),
  );
  return promise;
});

describe('submitLead', () => {
  // @scenario: Request body with product
  it('отправляет заявку с productId', async () => {
    const leadWithProduct: Lead = {
      name: 'Аня',
      phone: '+375291234567',
      interest: 'order',
      comment: 'Позвоните после 18:00',
      productId: 'colombia',
    };
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(200, { status: 'ok', id: 'lead_1' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(leadWithProduct);

    expect(fetchStub).toHaveBeenCalledTimes(1);
    const callArgs = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(callArgs[0]).toBe('/api/lead');
    expect(callArgs[1].method).toBe('POST');
    expect(callArgs[1].headers).toEqual({ 'Content-Type': 'application/json' });
    expect(callArgs[1].body).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}',
    );
    expect(callArgs[1].signal).toBeTypeOf('object');
    expect(result).toEqual({ kind: 'ok' });
  });

  // @scenario: Request body without product
  it('отправляет заявку без productId', async () => {
    const leadWithoutProduct: Lead = {
      name: 'Аня',
      phone: '+375291234567',
      interest: 'question',
      comment: '',
    };
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(200, { status: 'ok', id: 'lead_1' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    await submitLead(leadWithoutProduct);

    const callArgs = fetchStub.mock.calls[0] as [string, RequestInit];
    expect(callArgs[1].body).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}',
    );
  });

  // @scenario: Success response
  it('возвращает ok при успешном ответе', async () => {
    vi.useFakeTimers();
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(200, { status: 'ok', id: 'lead_1' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'ok' });
    expect(vi.getTimerCount()).toBe(0);
  });

  // @scenario: Duplicate response
  it('возвращает duplicate при дубликате', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(200, { status: 'duplicate' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'duplicate' });
  });

  // @scenario: Validation response
  it('возвращает invalid при валидационной ошибке', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse(400, { status: 'invalid', fieldErrors: { phone: 'Номер не принят' } }),
      ),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'invalid', fieldErrors: { phone: 'Номер не принят' } });
  });

  // @scenario: Unexpected responses are failures
  it('классифицирует 500 как server failure', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(500, { status: 'error' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });

  it('классифицирует 404 HTML как server failure', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        new Response('<!DOCTYPE html><html><body>Not Found</body></html>', {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });

  it('классифицирует 200 с status "queued" как server failure', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(200, { status: 'queued' })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });

  it('классифицирует не-JSON ответ как server failure', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response('not json', { status: 200 })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });

  it('классифицирует invalid с полем email как server failure', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(jsonResponse(400, { status: 'invalid', fieldErrors: { email: 'x' } })),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });

  // @scenario: Network failure
  it('возвращает network при ошибке сети', async () => {
    const fetchStub = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'network' });
  });

  // @scenario: Request timeout
  it('возвращает timeout по истечении времени', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', hangingFetch);

    const settled = { flag: false };
    const promise = submitLead(lead).then(
      () => (settled.flag = true),
      () => (settled.flag = true),
    );

    await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS - 1);
    expect(settled.flag).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await vi.runAllTimersAsync(); // Ensure all timers are executed
    await promise;

    expect(settled.flag).toBe(true);
    const result = await submitLead(lead); // Fixed: get actual result
    expect(result).toEqual({ kind: 'failed', reason: 'timeout' });
    expect(hangingFetch.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  // @scenario: Server failure
  it('возвращает server при ошибке сервера в теле ответа', async () => {
    const fetchStub = vi.fn<typeof fetch>(() =>
      Promise.resolve(
        jsonResponse(500, { status: 'error', message: 'Не удалось сохранить заявку' }),
      ),
    );
    vi.stubGlobal('fetch', fetchStub);

    const result = await submitLead(lead);

    expect(result).toEqual({ kind: 'failed', reason: 'server' });
  });
});
