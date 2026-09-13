<template>
  <div class="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden p-5">
    <!-- Ambient top corner accent -->
    <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none"></div>

    <div>
      <!-- Type Badge & Actions Header -->
      <div class="flex items-center justify-between gap-2 mb-3">
        <span :class="badgeClass" class="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-2xs">
          {{ resource.type }}
        </span>

        <div class="flex items-center gap-1.5 text-xs text-slate-400">
          <span class="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            {{ resource.views || 0 }}
          </span>

          <!-- Like / Heart Button (works for both guests & logged in users) -->
          <button 
            @click.stop.prevent="toggleLike"
            :class="isLiked ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50/50 border-slate-200'"
            class="flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all duration-200 ml-1"
            :title="isLiked ? 'Liked' : 'Like resource (no account needed)'"
          >
            <svg class="w-3.5 h-3.5 transition-transform active:scale-125" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span>{{ likesCount }}</span>
          </button>
        </div>
      </div>

      <!-- Title & Link to Detail -->
      <RouterLink :to="`/resources/${resource._id}`" class="block">
        <h3 class="font-bold text-slate-900 text-base mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
          {{ resource.title }}
        </h3>
      </RouterLink>

      <!-- Short verified description or full description -->
      <p class="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed">
        {{ resource.shortDescription || resource.description }}
      </p>
    </div>

    <!-- Card Footer -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
      <!-- Author info -->
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-6 h-6 rounded-md bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0">
          {{ resource.uploadedBy?.username?.charAt(0).toUpperCase() || 'L' }}
        </div>
        <span class="text-xs font-medium text-slate-600 truncate max-w-[90px]">
          {{ resource.uploadedBy?.username || 'Contributor' }}
        </span>
      </div>

      <!-- Action Buttons: Read & Download for Guests & Users -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Direct Download Button for Guests -->
        <a 
          v-if="resource.file"
          :href="`${BASE_URL}/api/resources/${resource._id}/download`" 
          @click.stop
          class="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Download file (Free & Instant)"
          download
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
        </a>

        <!-- Read / View Details Button -->
        <RouterLink 
          :to="`/resources/${resource._id}`" 
          class="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all duration-200"
        >
          Read →
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

const likesCount = ref(
  (props.resource.saves?.length || 0) + (props.resource.guestLikes?.length || 0)
)
const isLiked = ref(false)

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
    PDF: 'bg-rose-50 text-rose-700 border-rose-200/60',
    Video: 'bg-purple-50 text-purple-700 border-purple-200/60',
    Article: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    Tutorial: 'bg-amber-50 text-amber-700 border-amber-200/60',
    Link: 'bg-blue-50 text-blue-700 border-blue-200/60',
    Notes: 'bg-slate-100 text-slate-700 border-slate-200/60'
  }
  return colors[props.resource.type] || 'bg-slate-100 text-slate-700 border-slate-200'
})
</script>
