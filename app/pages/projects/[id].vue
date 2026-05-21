<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const store = useProjectsStore()
const router = useRouter()
const route = useRoute()

const isNew = computed(() => route.params.id === 'new')

const name = ref('')
const description = ref('')
const techInput = ref('')
const tech = ref<string[]>([])
const github_url = ref('')
const demo_url = ref('')
const cover_url = ref('')
const category = ref<'ai' | 'pure'>('pure')
const saving = ref(false)
const loading = ref(false)
const uploading = ref(false)

onMounted(async () => {
  if (!isNew.value) {
    loading.value = true
    try {
      await store.fetchOne(route.params.id as string)
      if (store.current) {
        name.value = store.current.name
        description.value = store.current.description
        tech.value = store.current.tech || []
        techInput.value = (store.current.tech || []).join(', ')
        github_url.value = store.current.github_url || ''
        demo_url.value = store.current.demo_url || ''
        cover_url.value = store.current.cover_url || ''
        category.value = store.current.category as any
      }
    } catch {} finally {
      loading.value = false
    }
  }
})

function updateTech() {
  tech.value = techInput.value.split(',').map((t) => t.trim()).filter(Boolean)
}

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const result = await store.uploadCover(file)
    cover_url.value = result.url
    toast.success('Cover uploaded')
  } catch {
    toast.error('Upload failed')
  } finally {
    uploading.value = false
  }
}

async function handleSave() {
  saving.value = true
  try {
    const payload = {
      name: name.value,
      description: description.value,
      tech: tech.value,
      github_url: github_url.value || null,
      demo_url: demo_url.value || null,
      cover_url: cover_url.value || null,
      category: category.value,
    }
    if (isNew.value) {
      await store.create(payload)
      toast.success('Project created')
    } else {
      await store.update(route.params.id as string, payload)
      toast.success('Project updated')
    }
    router.push('/projects')
  } catch (e: any) {
    toast.error(e.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

const techList = computed(() => tech.value)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <NuxtLink to="/projects" class="text-sm text-text-muted hover:text-text">&larr; Back</NuxtLink>
      <h2 class="text-lg font-semibold">{{ isNew ? 'New Project' : 'Edit Project' }}</h2>
    </div>

    <div v-if="loading" class="py-8 text-center text-sm text-text-muted">Loading...</div>

    <div v-else class="space-y-4 rounded-xl border border-border bg-surface p-6">
      <div>
        <label class="mb-1 block text-sm font-medium">Name</label>
        <input v-model="name" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Description</label>
        <textarea v-model="description" rows="3" class="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Tech Stack (comma separated)</label>
        <input v-model="techInput" @input="updateTech" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" placeholder="Go, React, TypeScript" />
        <div v-if="techList.length" class="mt-2 flex flex-wrap gap-1">
          <span v-for="t in techList" :key="t" class="rounded-full bg-bg px-2 py-0.5 text-xs">{{ t }}</span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1 block text-sm font-medium">GitHub URL</label>
          <input v-model="github_url" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium">Demo URL</label>
          <input v-model="demo_url" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        </div>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Category</label>
        <select v-model="category" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent">
          <option value="pure">Pure</option>
          <option value="ai">AI</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium">Cover Image</label>
        <div class="flex items-center gap-3">
          <label class="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg">
            {{ uploading ? 'Uploading...' : 'Choose File' }}
            <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="handleUpload" :disabled="uploading" />
          </label>
          <span v-if="cover_url" class="text-sm text-text-muted">Uploaded</span>
        </div>
        <img v-if="cover_url" :src="cover_url" class="mt-3 h-32 rounded-lg object-cover" />
      </div>
      <button @click="handleSave" :disabled="saving" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>
