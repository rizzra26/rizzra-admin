export const API_BASE = process.env.NUXT_PUBLIC_API_BASE_URL;

export function authHeader(): Record<string, string> {
  if (!import.meta.client) return {};
  const tok = localStorage.getItem("access_token");
  if (!tok) return {};
  return { Authorization: `Bearer ${tok}` };
}
