<template>
  <div class="max-w-4xl mx-auto px-4 py-10">

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-gray-200 rounded w-3/4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      <div class="h-40 bg-gray-200 rounded"></div>
    </div>

    <div v-else-if="resource">
      <!-- Header -->
      <div class="card p-8 mb-6">
        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div class="flex gap-2 mb-3">
              <span class="badge-blue text-sm">{{ resource.subject }}</span>
              <span class="badge text-sm bg-gray-100 text-gray-700">{{ resource.type }}</span>
            </div>
            <h1 class="text-3xl font-bold text-gray-900">{{ resource.title }}</h1>
          </div>

          <!-- Owner Actions -->
          <div v-if="isOwner" class="flex gap-2">
            <RouterLink :to="`/upload?edit=${resource._id}`" class="btn-secondary text-sm py-1.5">
              ✏️ Edit
            </RouterLink>
            <button @click="handleDelete" class="btn-danger text-sm py-1.5">
              🗑 Delete
            </button>
          </div>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>👁 {{ resource.views }} views</span>
          <span>❤️ {{ resource.saves?.length || 0 }} saves</span>
          <span>📅 {{ formatDate(resource.createdAt) }}</span>
          <span>By: <strong class="text-gray-700">{{ resource.uploadedBy?.name }}</strong></span>
        </div>

        <!-- Description -->
        <p class="text-gray-700 leading-relaxed text-base">{{ resource.description }}</p>

        <!-- Link -->
        <div v-if="resource.url" class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm font-medium text-blue-700 mb-1">🔗 External Link</p>
          <a :href="resource.url" target="_blank"
            class="text-blue-600 hover:underline break-all text-sm">
            {{ resource.url }}
          </a>
        </div>

        <!-- File -->
        <div v-if="resource.file" class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p class="text-sm font-medium text-green-700 mb-3">📎 Attached File</p>
          <div class="flex flex-wrap gap-3">
            <button @click="showPreview = true" class="btn-primary text-sm py-2">
              📖 Read Online
            </button>
            <a :href="`http://localhost:5000/api/resources/${resource._id}/download`"
              class="btn-secondary text-sm py-2 inline-block">
              Download File
            </a>
          </div>
        </div>

        <!-- Preview Modal -->
        <NotePreviewModal 
          :isOpen="showPreview" 
          :title="resource.title"
          :fileUrl="resource.file"
          :type="resource.type"
          :resourceId="resource._id"
          @close="showPreview = false"
        />

        <!-- Save Button -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <button v-if="authStore.isLoggedIn" @click="handleSave"
            :class="saved ? 'btn-danger' : 'btn-secondary'"
            class="text-sm">
            {{ saved ? '❤️ Saved' : '🤍 Save Resource' }}
          </button>
          <RouterLink v-else to="/login" class="btn-secondary text-sm">
            Login to Save
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-gray-400 text-xl">Resource not found.</p>
      <RouterLink to="/resources" class="btn-primary mt-4 inline-block">Back to Resources</RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import NotePreviewModal from '../components/NotePreviewModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const resource = ref(null)
const loading = ref(true)
const saved = ref(false)
const showPreview = ref(false)

const isOwner = computed(() =>
  authStore.isLoggedIn &&
  resource.value?.uploadedBy?._id === authStore.currentUser?._id
)

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

onMounted(async () => {
  try {
    const { data } = await api.get(`/resources/${route.params.id}`)
    resource.value = data
    saved.value = data.saves?.includes(authStore.currentUser?._id)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  try {
    const { data } = await api.post(`/resources/${resource.value._id}/save`)
    saved.value = data.saved
  } catch (err) {
    router.push('/login')
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this resource?')) return
  try {
    await api.delete(`/resources/${resource.value._id}`)
    router.push('/resources')
  } catch (err) {
    alert('Failed to delete resource')
  }
}
</script>
