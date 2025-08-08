// Universal getURL helper for Vite/Vercel/Node/Browser
export const getURL = () => {
  let url =
    import.meta.env.VITE_APP_URL ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_VERCEL_URL) ||
    (typeof window !== 'undefined' && window.location.origin) ||
    'http://localhost:5174/';
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
};
