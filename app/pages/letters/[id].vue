<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const store = useLettersStore()
const router = useRouter()
const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const title = ref('')
const subtitle = ref('')
const content = ref('')
const saving = ref(false)
const loading = ref(false)

onMounted(async () => {
  if (!isNew.value) {
    loading.value = true
    try {
      await store.fetchOne(route.params.id as string)
      if (store.current) {
        title.value = store.current.title
        subtitle.value = store.current.subtitle
        content.value = store.current.content || ''
      }
    } catch {} finally {
      loading.value = false
    }
  }
})

async function handleSave() {
  saving.value = true
  try {
    const payload = { title: title.value, subtitle: subtitle.value, content: content.value }
    if (isNew.value) {
      await store.create(payload)
      toast.success('Letter created')
    } else {
      await store.update(route.params.id as string, payload)
      toast.success('Letter updated')
    }
    router.push('/letters')
  } catch (e: any) {
    toast.error(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <NuxtLink to="/letters" class="text-sm text-text-muted hover:text-text">&larr; Back</NuxtLink>
      <h2 class="text-lg font-semibold">{{ isNew ? 'New Letter' : 'Edit Letter' }}</h2>
    </div>

    <div v-if="loading" class="py-8 text-center text-sm text-text-muted">Loading...</div>

    <div v-else class="space-y-4 rounded-xl border border-border bg-surface p-6">
      <div>
        <label class="mb-1 block text-sm font-medium">Title</label>
        <input v-model="title" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Subtitle</label>
        <input v-model="subtitle" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Content (Markdown)</label>
        <MdxEditor v-model="content" />
      </div>
      <button @click="handleSave" :disabled="saving" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>
