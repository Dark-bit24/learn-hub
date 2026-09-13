<template>
  <transition name="fade">
    <div v-if="isOpen" ref="modalContainer" class="fixed inset-0 z-50 flex flex-col bg-slate-900 w-screen h-screen overflow-hidden">
      <!-- Ambient light decorative circle in top right -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[96px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md relative z-10 text-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <span v-if="isPdf" class="text-[10px] tracking-wider font-extrabold">PDF</span>
            <span v-else-if="isImage" class="text-[10px] tracking-wider font-extrabold">IMG</span>
            <span v-else class="text-[10px] tracking-wider font-extrabold">DOC</span>
          </div>
          <div>
            <h3 class="text-base font-extrabold text-slate-100 tracking-tight leading-tight">{{ title }}</h3>
            <p class="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">{{ type }} Document</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Open in New Tab Button (Guaranteed to work in all browsers) -->
          <a :href="directViewUrl" target="_blank" rel="noopener noreferrer"
            class="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 hover:text-white transition-all text-xs font-semibold"
            title="Open document in a new browser tab">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            <span class="hidden sm:inline">New Tab</span>
          </a>

          <!-- Google Viewer Toggle (if PDF) -->
          <button v-if="isPdf" @click="useGoogleViewer = !useGoogleViewer"
            class="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl border transition-all text-xs font-semibold"
            :class="useGoogleViewer ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700/50 text-slate-300 hover:text-white'"
            :title="useGoogleViewer ? 'Switching to Google Docs Viewer' : 'Use Google Docs Viewer if native preview is blocked'">
            <span class="hidden sm:inline">{{ useGoogleViewer ? 'Standard Viewer' : 'Google Viewer' }}</span>
            <span class="sm:hidden">G-View</span>
          </button>

          <!-- Toggle AI Tutor Sidebar Button (available to all visitors) -->
          <button @click="showTutorSidebar = !showTutorSidebar" 
            class="h-10 px-3.5 flex items-center justify-center gap-2 rounded-xl border transition-all text-xs font-bold"
            :class="showTutorSidebar ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30' : 'bg-slate-800 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700'">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
              <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/>
              <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/>
              <path d="M9.5 14.5c.83.83 2.17 1.5 2.5 1.5s1.67-.67 2.5-1.5"/>
            </svg>
            <span class="hidden sm:inline">{{ showTutorSidebar ? 'Hide AI Tutor' : 'Ask AI Tutor' }}</span>
          </button>

          <!-- Fullscreen Toggle Button -->
          <button @click="toggleFullscreen" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 hover:text-white transition-all" :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'">
            <svg v-if="isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4"></path>
            </svg>
          </button>
          
          <!-- Close Button -->
          <button @click="$emit('close')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 hover:text-white transition-all" title="Close Preview">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Content Area (Side-by-Side Flex Layout) -->
      <div class="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
        
        <!-- Left Side: File Viewer -->
        <div class="flex-1 h-full overflow-hidden p-3 sm:p-5 flex flex-col items-center justify-center relative">
          <!-- PDF Viewer (supports direct stream + Google Docs Viewer fallback) -->
          <div v-if="isPdf" class="w-full h-full flex flex-col">
            <iframe 
              :src="currentViewerUrl" 
              class="w-full h-full rounded-xl shadow-2xl border border-slate-800 bg-white"
              frameborder="0"
              allowfullscreen>
            </iframe>
          </div>

          <!-- Image Viewer -->
          <div v-else-if="isImage" class="w-full h-full flex items-center justify-center p-2">
            <img 
              :src="directViewUrl" 
              class="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800/50 bg-slate-900" 
              alt="Note preview" />
          </div>

          <!-- Fallback -->
          <div v-else class="text-center p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl max-w-sm">
            <div class="text-6xl mb-4">📄</div>
            <h4 class="text-lg font-bold text-slate-200 mb-2">No Preview Available</h4>
            <p class="text-sm text-slate-400 mb-6">Preview is not supported for this file type. You can download the file to view it locally.</p>
            <a :href="`${BASE_URL}/api/resources/${resourceId}/download`" class="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all">
              Download File
            </a>
          </div>
        </div>

        <!-- Right Side: AI Tutor sidebar panel -->
        <div v-if="showTutorSidebar" class="w-full lg:w-[400px] h-full shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-slate-900">
          <AITutorPanel :resourceId="resourceId" />
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md flex justify-between items-center gap-3 relative z-10">
        <div class="text-xs text-slate-400 flex items-center gap-2">
          <span>Having trouble viewing?</span>
          <a :href="directViewUrl" target="_blank" class="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Open in new tab
          </a>
        </div>
        <div class="flex items-center gap-3">
          <button @click="$emit('close')" class="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">Close</button>
          <a :href="`${BASE_URL}/api/resources/${resourceId}/download`" class="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download Document
          </a>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { BASE_URL } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import AITutorPanel from './AITutorPanel.vue'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  fileUrl: String,
  type: String,
  resourceId: String
})

const emit = defineEmits(['close'])

const authStore = useAuthStore()
const showTutorSidebar = ref(true)
const useGoogleViewer = ref(false)

const directViewUrl = computed(() => {
  if (props.resourceId) {
    return `${BASE_URL}/api/resources/${props.resourceId}/view`
  }
  const clean = props.fileUrl?.startsWith('/') ? props.fileUrl : `/${props.fileUrl || ''}`
  return `${BASE_URL}${clean}`
})

const currentViewerUrl = computed(() => {
  if (useGoogleViewer.value) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(directViewUrl.value)}&embedded=true`
  }
  return directViewUrl.value
})

const isPdf = computed(() => props.fileUrl?.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => {
  const ext = props.fileUrl?.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
})

const modalContainer = ref(null)
const isFullscreen = ref(false)

const requestFullscreen = async () => {
  if (modalContainer.value) {
    try {
      if (modalContainer.value.requestFullscreen) {
        await modalContainer.value.requestFullscreen()
      } else if (modalContainer.value.webkitRequestFullscreen) {
        await modalContainer.value.webkitRequestFullscreen()
      } else if (modalContainer.value.msRequestFullscreen) {
        await modalContainer.value.msRequestFullscreen()
      }
    } catch (err) {
      console.warn('Failed to enter fullscreen:', err)
    }
  }
}

const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.warn('Failed to exit fullscreen:', err)
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    exitFullscreen()
  } else {
    requestFullscreen()
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    requestFullscreen()
  } else {
    if (document.fullscreenElement) {
      exitFullscreen()
    }
  }
})

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleKeyDown)
  if (document.fullscreenElement) {
    exitFullscreen()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
