export const APP_VERSION = "alpha.2";

export function addCacheBuster(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${APP_VERSION}`;
}

export function addTimestamp(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

export async function fetchWithCacheBust(url, options = {}) {
  const bustedUrl = addCacheBuster(url);
  return fetch(bustedUrl, {
    ...options,
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      ...options.headers
    }
  });
}