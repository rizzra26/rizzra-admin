import { defineStore } from "pinia";

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  github_url?: string | null;
  demo_url?: string | null;
  cover_url?: string | null;
  category: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ProjectsState {
  projects: Project[];
  current: Project | null;
  loading: boolean;
}

function token() {
  return localStorage.getItem("access_token") || "";
}

function baseUrl() {
  return useRuntimeConfig().public.apiBaseUrl as string;
}

async function api(path: string, opts: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token()) headers["Authorization"] = `Bearer ${token()}`;
  // Don't set Content-Type for FormData
  if (opts.body instanceof FormData) delete headers["Content-Type"];
  const resp = await fetch(`${baseUrl()}${path}`, { ...opts, headers });
  if (resp.status === 204) return undefined;
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message || json.error || "API error");
  return json.data !== undefined ? json.data : json;
}

export const useProjectsStore = defineStore("projects", {
  state: (): ProjectsState => ({
    projects: [],
    current: null,
    loading: false,
  }),

  actions: {
    async fetchAll(page = 1, perPage = 20) {
      this.loading = true;
      try {
        this.projects = await api(`/projects?page=${page}&per_page=${perPage}`);
      } finally {
        this.loading = false;
      }
    },

    async fetchOne(id: string) {
      this.current = await api(`/projects/${id}`);
    },

    async create(data: Partial<Project>) {
      this.current = await api("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: Partial<Project>) {
      this.current = await api(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async remove(id: string) {
      await api(`/projects/${id}`, { method: "DELETE" });
      this.projects = this.projects.filter((p) => p.id !== id);
    },

    async reorder(order: { id: string; order_index: number }[]) {
      await api("/projects/reorder", {
        method: "POST",
        body: JSON.stringify({ order }),
      });
    },

    async uploadCover(file: File) {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch(`${baseUrl()}/upload/cover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const json = await resp.json();
      return json.data as { url: string; filename: string };
    },
  },
});
