export function getAppUrl() {
  let url = process?.env?.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  url = url.trim();

  // Make sure to include `https://` when not localhost
  if (!url.startsWith('http')) {
    url = url.includes('localhost') ? `http://${url}` : `https://${url}`;
  }

  // Remove trailing slash if present
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
}
