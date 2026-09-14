<template>
  <div class="bg-white rounded-xl border border-slate-200 hover:border-[#0063cf] shadow-xs hover:shadow-md transition-all duration-150 flex flex-col justify-between p-5 group">
    <div>
      <!-- Header: Official Type Badge & Like Tracker -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-1.5">
          <span :class="badgeClass" class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border">
            {{ resource.type }}
          </span>
          <span class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {{ resource.subject }}
          </span>
        </div>

        <!-- Like Toggle -->
        <button 
          @click.stop.prevent="toggleLike"
          :class="isLiked ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50/50 border-slate-200'"
          class="flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-semibold transition-colors"
          :title="isLiked ? 'Marked as helpful' : 'Mark as helpful (No account needed)'"
        >
          <svg class="w-3.5 h-3.5" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <span>{{ likesCount }}</span>
        </button>
      </div>

      <!-- Title Link -->
      <RouterLink :to="`/resources/${resource._id}`" class="block">
        <h3 class="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[#0063cf] transition-colors line-clamp-2 leading-snug">
          {{ resource.title }}
        </h3>
      </RouterLink>

      <!-- Description / Educational Abstract -->
      <p class="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
        {{ resource.shortDescription || resource.description }}
      </p>
    </div>

    <!-- Metadata & Action Footer -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
      <!-- Verified Contributor Attribution -->
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded-full bg-[#0063cf] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
          {{ resource.uploadedBy?.username?.charAt(0).toUpperCase() || 'L' }}
        </div>
        <div class="truncate">
          <p class="text-xs font-semibold text-slate-700 truncate leading-tight">
            {{ resource.uploadedBy?.username || 'Verified Educator' }}
          </p>
          <p class="text-[10px] text-slate-400 leading-tight">
            {{ resource.views || 0 }} views
          </p>
        </div>
      </div>

      <!-- Direct Action Buttons (Download & View) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Direct File Download -->
        <a 
          v-if="resource.file"
          :href="`${BASE_URL}/api/resources/${resource._id}/download`" 
          @click.stop
          class="p-2 text-slate-600 hover:text-[#0063cf] bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
          title="Download official file"
          download
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </a>

        <!-- Quick Delete Button for Admins & Owners -->
        <button 
          v-if="canDelete"
          @click.stop.prevent="handleDelete"
          class="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
          title="Delete Resource (Admin / Owner)"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>

        <!-- Read Online Button -->
        <RouterLink 
          :to="`/resources/${resource._id}`" 
          class="px-3 py-1.5 bg-[#0063cf] hover:bg-[#0051ab] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
        >
          View Details
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BASE_URL } from '../services/api'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { isResourceLikedByGuest, toggleGuestLikedResource } from '../services/guestService'

const props = defineProps({
  resource: { type: Object, required: true }
})

const authStore = useAuthStore()

const emit = defineEmits(['deleted'])

const likesCount = ref(
  (props.resource.saves?.length || 0) + (props.resource.guestLikes?.length || 0)
)
const isLiked = ref(false)

const canDelete = computed(() => {
  if (!authStore.isLoggedIn) return false
  if (authStore.isAdmin) return true
  const uploaderId = typeof props.resource.uploadedBy === 'object' 
    ? (props.resource.uploadedBy._id || props.resource.uploadedBy)
    : props.resource.uploadedBy
  return uploaderId?.toString() === authStore.currentUser?._id?.toString()
})

const handleDelete = async () => {
  if (!confirm(`Are you sure you want to delete "${props.resource.title}"?`)) return
  try {
    if (authStore.isAdmin) {
      await api.delete(`/admin/resources/${props.resource._id}`)
    } else {
      await api.delete(`/resources/${props.resource._id}`)
    }
    emit('deleted', props.resource._id)
  } catch (err) {
    console.error('Delete resource error:', err)
    alert(err.response?.data?.message || 'Failed to delete resource')
  }
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    isLiked.value = props.resource.saves?.some(id => id === authStore.currentUser?._id || id?._id === authStore.currentUser?._id)
  } else {
    isLiked.value = isResourceLikedByGuest(props.resource._id)
  }
})

const toggleLike = async () => {
  try {
    const { data } = await api.post(`/resources/${props.resource._id}/save`)
    isLiked.value = data.saved
    likesCount.value = data.savesCount
    if (!authStore.isLoggedIn) {
      toggleGuestLikedResource(props.resource._id, data.saved)
    }
  } catch (err) {
    console.error('Failed to toggle like:', err)
  }
}

const badgeClass = computed(() => {
  const colors = {
    PDF: 'bg-red-50 text-red-700 border-red-200',
    Video: 'bg-purple-50 text-purple-700 border-purple-200',
    Article: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Tutorial: 'bg-amber-50 text-amber-700 border-amber-200',
    Link: 'bg-blue-50 text-[#0063cf] border-blue-200',
    Notes: 'bg-slate-50 text-slate-700 border-slate-200'
  }
  return colors[props.resource.type] || 'bg-slate-50 text-slate-700 border-slate-200'
})
</script>
