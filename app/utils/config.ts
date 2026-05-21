export function useApiBase() {
  const config = useRuntimeConfig()
  return config.public.apiBaseUrl as string
}

export function authHeader(): Record<string, string> {
  if (!import.meta.client) return {};
  const tok = localStorage.getItem("access_token");
  if (!tok) return {};
  return { Authorization: `Bearer ${tok}` };
}
