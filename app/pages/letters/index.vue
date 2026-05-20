<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const store = useLettersStore()
const loading = ref(true)

onMounted(async () => {
  try { await store.fetchAll(1, 50) } catch {} finally { loading.value = false }
})

async function handleDelete(id: string, title: string) {
  if (!confirm(`Delete "${title}"?`)) return
  try {
    await store.remove(id)
    toast.success('Letter deleted')
  } catch {
    toast.error('Failed to delete')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">All Letters</h2>
      <NuxtLink to="/letters/new" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
        + New Letter
      </NuxtLink>
    </div>

    <div v-if="loading" class="py-8 text-center text-sm text-text-muted">Loading...</div>

    <div v-else-if="store.letters.length === 0" class="rounded-xl border border-border bg-surface py-8 text-center text-sm text-text-muted">
      No letters yet. Create your first one!
    </div>

    <div v-else class="overflow-hidden rounded-xl border border-border bg-surface">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border text-left">
            <th class="px-4 py-3 font-medium">Title</th>
            <th class="px-4 py-3 font-medium">Slug</th>
            <th class="px-4 py-3 font-medium">Date</th>
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="letter in store.letters" :key="letter.id" class="border-b border-border last:border-0 hover:bg-bg">
            <td class="px-4 py-3">{{ letter.title }}</td>
            <td class="px-4 py-3 text-text-muted">{{ letter.slug }}</td>
            <td class="px-4 py-3 text-text-muted">{{ new Date(letter.created_at).toLocaleDateString() }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex justify-end gap-2">
                <NuxtLink :to="`/letters/${letter.id}`" class="rounded px-2 py-1 text-xs hover:bg-border">Edit</NuxtLink>
                <button @click="handleDelete(letter.id, letter.title)" class="rounded px-2 py-1 text-xs text-red-400 hover:bg-border">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
