/** 32 → '32 BYN' */
export function formatPrice(price: number): string {
  return `${price} BYN`;
}

/** '250г' → '250 г'; уже отформатированный вес не меняется */
export function formatWeight(weight: string): string {
  return weight.trim().replace(/^(\d+)\s*г$/u, '$1 г');
}

/** '+375 (29) 123-45-67' → 'tel:+375291234567' */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
