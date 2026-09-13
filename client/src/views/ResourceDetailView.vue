<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

    <!-- Breadcrumb Navigation -->
    <div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
      <RouterLink to="/" class="hover:text-[#0063cf]">Home</RouterLink>
      <span>/</span>
      <RouterLink to="/resources" class="hover:text-[#0063cf]">Resources</RouterLink>
      <span>/</span>
      <span class="text-slate-800 font-semibold truncate max-w-xs">{{ resource?.title || 'Document Details' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="h-8 bg-slate-200 rounded-lg w-3/4"></div>
      <div class="h-4 bg-slate-200 rounded w-1/2"></div>
      <div class="h-64 bg-white rounded-xl border border-slate-200"></div>
    </div>

    <div v-else-if="resource" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Main Content (Left) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header Card -->
        <div class="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <span class="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-[#0063cf] text-xs font-bold rounded">
                  {{ resource.subject }}
                </span>
                <span class="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded">
                  {{ resource.type }}
                </span>
                <span v-if="resource.keyTopics?.length" class="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-1">
                  ✓ Verified Document
                </span>
              </div>
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">{{ resource.title }}</h1>
            </div>

            <!-- Owner / Admin Actions -->
            <div v-if="canManage" class="flex gap-2">
              <RouterLink v-if="isOwner" :to="`/upload?edit=${resource._id}`" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors">
                Edit
              </RouterLink>
              <button @click="handleDelete" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors">
                Delete
              </button>
            </div>
          </div>

          <!-- Metadata Summary Row -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-100">
            <span class="flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              {{ resource.views }} views
            </span>
            <span class="flex items-center gap-1 text-rose-600 font-semibold">
              <svg class="w-3.5 h-3.5 fill-rose-500" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {{ totalLikesCount }} helpful marks
            </span>
            <span>Date: {{ formatDate(resource.createdAt) }}</span>
            <span>Uploaded by: <strong class="text-slate-800">{{ resource.uploadedBy?.username || 'Verified Contributor' }}</strong></span>
          </div>

          <!-- Academic Summary -->
          <div v-if="resource.shortDescription" class="mb-6 p-4 rounded-lg bg-blue-50/60 border border-blue-200/80">
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#0063cf] mb-1">
              Curriculum Abstract
            </h4>
            <p class="text-slate-700 text-sm leading-relaxed">{{ resource.shortDescription }}</p>
          </div>

          <!-- Full Description -->
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-900">Document Overview</h3>
            <p class="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{{ resource.description }}</p>
          </div>

          <!-- External Reference Link -->
          <div v-if="resource.url" class="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p class="text-xs font-semibold text-slate-700 mb-1">Official Reference URL:</p>
            <a :href="resource.url" target="_blank" class="text-[#0063cf] hover:underline break-all text-xs font-medium">
              {{ resource.url }}
            </a>
          </div>

          <!-- Document Access Action Box (Free for all) -->
          <div v-if="resource.file" class="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p class="text-xs font-bold text-[#090e40] uppercase tracking-wide mb-0.5">Attached Educational Document</p>
                <p class="text-xs text-slate-500">Public material available for online reading or offline file download.</p>
              </div>
              <div class="flex flex-wrap gap-2.5 items-center">
                <button @click="showPreview = true" class="px-4 py-2 text-xs font-semibold text-[#0063cf] bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs transition-colors">
                  Read Online
                </button>
                <a :href="`${BASE_URL}/api/resources/${resource._id}/download`"
                  class="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#0063cf] hover:bg-[#0051ab] rounded-lg shadow-2xs transition-colors"
                  download
                >
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  Download Document
                </a>
              </div>
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

          <!-- Helpful Button Bar -->
          <div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button 
                @click="handleSave"
                :class="isLiked ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-colors shadow-2xs"
              >
                <svg class="w-4 h-4" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span>{{ isLiked ? 'Marked as Helpful' : 'Mark as Helpful' }}</span>
                <span class="ml-1 px-1.5 py-0.2 rounded bg-white text-[10px] font-bold border">{{ totalLikesCount }}</span>
              </button>
            </div>

            <RouterLink to="/resources" class="text-xs font-semibold text-[#0063cf] hover:underline">
              ← Return to Directory
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Right Column: Institutional Study Partner Panel -->
      <div class="lg:col-span-1 h-[680px] rounded-xl overflow-hidden border border-slate-200 shadow-xs flex flex-col bg-white">
        <AITutorPanel :resourceId="resource._id" :resource="resource" />
      </div>

    </div>

    <div v-else class="text-center py-20 bg-white rounded-xl border border-slate-200">
      <p class="text-slate-500 text-sm">Requested educational resource not found.</p>
      <RouterLink to="/resources" class="px-4 py-2 bg-[#0063cf] text-white rounded-lg text-xs font-semibold mt-4 inline-block">Return to Directory</RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import api, { BASE_URL } from '../services/api'
import NotePreviewModal from '../components/NotePreviewModal.vue'
import AITutorPanel from '../components/AITutorPanel.vue'
import { isResourceLikedByGuest, toggleGuestLikedResource } from '../services/guestService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const resource = ref(null)
const loading = ref(true)
const isLiked = ref(false)
const totalLikesCount = ref(0)
const showPreview = ref(false)

const isOwner = computed(() =>
  authStore.isLoggedIn &&
  resource.value?.uploadedBy?._id === authStore.currentUser?._id
)

const canManage = computed(() =>
  authStore.isLoggedIn && (
    resource.value?.uploadedBy?._id === authStore.currentUser?._id ||
    authStore.isAdmin
  )
)

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
})

onMounted(async () => {
  try {
    const { data } = await api.get(`/resources/${route.params.id}`)
    resource.value = data
    totalLikesCount.value = (data.saves?.length || 0) + (data.guestLikes?.length || 0)

    if (authStore.isLoggedIn) {
      isLiked.value = data.saves?.includes(authStore.currentUser?._id)
    } else {
      isLiked.value = isResourceLikedByGuest(data._id)
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  try {
    const { data } = await api.post(`/resources/${resource.value._id}/save`)
    isLiked.value = data.saved
    totalLikesCount.value = data.savesCount
    if (!authStore.isLoggedIn) {
      toggleGuestLikedResource(resource.value._id, data.saved)
    }
  } catch (err) {
    console.error('Failed to save resource:', err)
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
