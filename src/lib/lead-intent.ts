export const LEAD_INTERESTS = ['subscription', 'order', 'question'] as const;
export type LeadInterest = (typeof LEAD_INTERESTS)[number];

export interface LeadIntent {
  interest: LeadInterest;
  /** id товара из products.json; отсутствует, если намерение без товара */
  productId?: string;
}

export type LeadIntentListener = (intent: LeadIntent) => void;

// Модульное состояние: без React и DOM, чтобы модуль проверялся в Node.
const listeners = new Set<LeadIntentListener>();
let pendingIntent: LeadIntent | null = null;

/**
 * Передаёт намерение. Если есть подписчики — вызывает каждого ровно один раз
 * и НЕ сохраняет намерение как отложенное. Если подписчиков нет — сохраняет
 * его как отложенное, перезаписывая предыдущее.
 */
export function requestLeadIntent(intent: LeadIntent): void {
  if (listeners.size === 0) {
    pendingIntent = intent;
    return;
  }
  for (const listener of listeners) {
    listener(intent);
  }
}

/** Подписывает слушателя. Возвращает функцию отписки (идемпотентна). */
export function subscribeLeadIntent(listener: LeadIntentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Возвращает отложенное намерение и очищает его; если его нет — null. */
export function takePendingLeadIntent(): LeadIntent | null {
  const intent = pendingIntent;
  pendingIntent = null;
  return intent;
}
