import { defineStore } from "pinia";

export interface Letter {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content?: string;
  reading_time: number;
  created_at: string;
  updated_at: string;
}

interface LettersState {
  letters: Letter[];
  current: Letter | null;
  loading: boolean;
}

function token() {
  return localStorage.getItem("access_token") || "";
}

function baseUrl() {
  return useRuntimeConfig().public.apiBaseUrl as string;
}

async function api(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token()) headers["Authorization"] = `Bearer ${token()}`;
  const resp = await fetch(`${baseUrl()}${path}`, { ...opts, headers });
  if (resp.status === 204) return undefined;
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message || json.error || "API error");
  return json.data !== undefined ? json.data : json;
}

export const useLettersStore = defineStore("letters", {
  state: (): LettersState => ({
    letters: [],
    current: null,
    loading: false,
  }),

  actions: {
    async fetchAll(page = 1, perPage = 20) {
      this.loading = true;
      try {
        this.letters = await api(`/letters?page=${page}&per_page=${perPage}`);
      } finally {
        this.loading = false;
      }
    },

    async fetchOne(id: string) {
      this.current = await api(`/letters/${id}`);
    },

    async create(data: { title: string; subtitle: string; content: string }) {
      this.current = await api("/letters", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async update(
      id: string,
      data: { title: string; subtitle: string; content: string },
    ) {
      this.current = await api(`/letters/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async remove(id: string) {
      await api(`/letters/${id}`, { method: "DELETE" });
      this.letters = this.letters.filter((l) => l.id !== id);
    },
  },
});
