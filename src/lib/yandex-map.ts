export interface GeoPoint {
  lat: number;
  lon: number;
}

/** https://yandex.ru/map-widget/v1/?ll=27.542084%2C53.902189&z=16&pt=27.542084%2C53.902189%2Cpm2rdm */
export function getYandexMapWidgetUrl(geo: GeoPoint, zoom = 16): string {
  return buildUrl('https://yandex.ru/map-widget/v1/', geo, zoom);
}

/** https://yandex.ru/maps/?ll=27.542084%2C53.902189&z=17&pt=27.542084%2C53.902189%2Cpm2rdm */
export function getYandexMapsUrl(geo: GeoPoint, zoom = 17): string {
  return buildUrl('https://yandex.ru/maps/', geo, zoom);
}

function buildUrl(base: string, geo: GeoPoint, zoom: number): string {
  const ll = `${geo.lon},${geo.lat}`;
  const params = new URLSearchParams({ ll, z: String(zoom), pt: `${ll},pm2rdm` });
  return `${base}?${params.toString()}`;
}
