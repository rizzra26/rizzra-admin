<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: ['auth'] })

const store = useStackStore()

onMounted(async () => {
  try { await store.fetchAll() } catch { toast.error('Failed to load stack') }
})

// New category
const showNewCategory = ref(false)
const newName = ref('')
const newSlug = ref('')
const newDesc = ref('')

async function createCategory() {
  if (!newName.value.trim()) return
  try {
    await store.createCategory({ name: newName.value.trim(), slug: newSlug.value.trim() || undefined, description: newDesc.value.trim() || null })
    toast.success('Category created')
    showNewCategory.value = false
    newName.value = ''
    newSlug.value = ''
    newDesc.value = ''
    await store.fetchAll()
  } catch {
    toast.error('Failed to create category')
  }
}

async function deleteCategory(id: string, name: string) {
  if (!confirm(`Delete category "${name}" and all its items?`)) return
  try {
    await store.removeCategory(id)
    toast.success('Category deleted')
  } catch {
    toast.error('Failed to delete')
  }
}

// New item per category
const addingTo = ref<string | null>(null)
const itemName = ref('')
const itemDesc = ref('')

async function addItem(categoryId: string) {
  if (!itemName.value.trim()) return
  try {
    await store.createItem({ category_id: categoryId, name: itemName.value.trim(), description: itemDesc.value.trim() || null })
    toast.success('Item added')
    itemName.value = ''
    itemDesc.value = ''
    addingTo.value = null
    await store.fetchAll()
  } catch {
    toast.error('Failed to add item')
  }
}

async function deleteItem(itemId: string, categoryId: string, name: string) {
  if (!confirm(`Delete "${name}"?`)) return
  try {
    await store.removeItem(itemId, categoryId)
    toast.success('Item deleted')
  } catch {
    toast.error('Failed to delete')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold">Stack Management</h2>
      <button @click="showNewCategory = !showNewCategory" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">
        + New Category
      </button>
    </div>

    <div v-if="store.loading" class="py-8 text-center text-sm text-text-muted">Loading...</div>

    <!-- New Category Form -->
    <div v-if="showNewCategory" class="rounded-xl border border-border bg-surface p-5">
      <h3 class="mb-3 text-sm font-semibold">New Category</h3>
      <div class="space-y-3">
        <input v-model="newName" placeholder="Name" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        <input v-model="newSlug" placeholder="Slug (auto-generated if empty)" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        <input v-model="newDesc" placeholder="Description (optional)" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        <button @click="createCategory" class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover">Create</button>
      </div>
    </div>

    <!-- Categories -->
    <div v-if="store.categories.length === 0 && !store.loading" class="rounded-xl border border-border bg-surface py-8 text-center text-sm text-text-muted">
      No categories yet. Create one above.
    </div>

    <div v-for="cat in store.categories" :key="cat.id" class="rounded-xl border border-border bg-surface p-5">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h3 class="font-semibold">{{ cat.name }}</h3>
          <p class="text-xs text-text-muted">slug: {{ cat.slug }}</p>
        </div>
        <button @click="deleteCategory(cat.id, cat.name)" class="rounded px-2 py-1 text-xs text-red-400 hover:bg-border">Delete</button>
      </div>

      <div class="space-y-1">
        <div v-if="cat.items.length === 0" class="py-2 text-center text-xs text-text-muted">No items yet</div>
        <div v-for="item in cat.items" :key="item.id" class="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-bg">
          <div>
            <span>{{ item.name }}</span>
            <span v-if="item.description" class="ml-2 text-xs text-text-muted">{{ item.description }}</span>
          </div>
          <button @click="deleteItem(item.id, cat.id, item.name)" class="text-xs text-red-400">Remove</button>
        </div>
      </div>

      <div v-if="addingTo === cat.id" class="mt-3 space-y-2 border-t border-border pt-3">
        <input v-model="itemName" placeholder="Item name" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        <input v-model="itemDesc" placeholder="Description (optional)" class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent" />
        <div class="flex gap-2">
          <button @click="addItem(cat.id)" class="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-accent-hover">Add</button>
          <button @click="addingTo = null" class="rounded-lg px-3 py-1 text-xs hover:bg-border">Cancel</button>
        </div>
      </div>
      <button v-else @click="addingTo = cat.id" class="mt-3 text-xs text-accent hover:underline">+ Add item</button>
    </div>
  </div>
</template>
