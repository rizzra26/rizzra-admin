<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const store = useProjectsStore()
const loading = ref(true)

onMounted(async () => {
  try { await store.fetchAll(1, 50) } catch {} finally { loading.value = false }
})

async function handleDelete(id: string, name: string) {
  if (!confirm(`Delete "${name}"?`)) return
  try {
    await store.remove(id)
    toast.success('Project deleted')
  } catch {
    toast.error('Failed to delete')
  }
}

const categoryLabel = (c: string) => c === 'ai' ? 'AI' : 'Pure'
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">All Projects</h2>
      <NuxtLink to="/projects/new" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
        + New Project
      </NuxtLink>
    </div>

    <div v-if="loading" class="py-8 text-center text-sm text-text-muted">Loading...</div>

    <div v-else-if="store.projects.length === 0" class="rounded-xl border border-border bg-surface py-8 text-center text-sm text-text-muted">
      No projects yet. Create your first one!
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-border bg-surface">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="px-4 py-3 font-medium">Name</th>
            <th class="px-4 py-3 font-medium">Category</th>
            <th class="px-4 py-3 font-medium">Order</th>
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in store.projects" :key="project.id" class="border-b border-border last:border-0 hover:bg-bg">
            <td class="px-4 py-3">{{ project.name }}</td>
            <td class="px-4 py-3">
              <span class="rounded-full px-2 py-0.5 text-xs" :class="project.category === 'ai' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'">
                {{ categoryLabel(project.category) }}
              </span>
            </td>
            <td class="px-4 py-3 text-text-muted">{{ project.order_index }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <NuxtLink :to="`/projects/${project.id}`" class="rounded px-2 py-1 text-xs hover:bg-border">Edit</NuxtLink>
                <button @click="handleDelete(project.id, project.name)" class="rounded px-2 py-1 text-xs text-red-400 hover:bg-border">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
