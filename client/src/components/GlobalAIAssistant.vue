<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans">
    <!-- Floating Trigger Button (Modern Enterprise Pill) -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="group relative flex items-center gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 hover:from-slate-800 hover:via-indigo-900 hover:to-blue-900 text-white px-4.5 py-3 rounded-2xl shadow-2xl shadow-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 transform hover:-translate-y-0.5"
      title="Open LearnHub AI Navigator & Tutor"
    >
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
          <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/>
          <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/>
          <path d="M9.5 14.5c.83.83 2.17 1.5 2.5 1.5s1.67-.67 2.5-1.5"/>
          <path d="M12 2v-1M7 7H5M19 7h-2"/>
        </svg>
      </div>
      <div class="text-left pr-1 hidden sm:block">
        <div class="flex items-center gap-1.5">
          <p class="text-xs font-bold leading-tight tracking-tight text-white">LearnHub AI</p>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p class="text-[10px] text-indigo-200/80 leading-tight mt-0.5">Ask notes & navigate</p>
      </div>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border border-slate-900"></span>
      </span>
    </button>

    <!-- Chat Modal Window -->
    <transition name="assistant-slide">
      <div
        v-if="isOpen"
        class="w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden text-slate-100 relative"
      >
        <!-- Background Ambient Glow -->
        <div class="absolute top-0 right-0 w-56 h-56 bg-blue-500/10 rounded-full filter blur-[56px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full filter blur-[56px] pointer-events-none"></div>

        <!-- Header -->
        <div class="px-5 py-4 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md flex items-center justify-between relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg class="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/>
                <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/>
                <path d="M9.5 14.5c.83.83 2.17 1.5 2.5 1.5s1.67-.67 2.5-1.5"/>
                <path d="M12 2v-1M7 7H5M19 7h-2"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold text-slate-100 tracking-tight">LearnHub Navigator</h3>
                <span class="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded-full">
                  <span class="w-1 h-1 rounded-full bg-emerald-400"></span> Online
                </span>
              </div>
              <p class="text-[10px] text-slate-400">AI Platform Copilot & Learning Guide</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Clear Chat Button -->
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              class="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
              title="Clear Conversation"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>

            <!-- Voice synthesis toggle -->
            <button
              @click="voiceEnabled = !voiceEnabled"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs"
              :class="voiceEnabled ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'"
              :title="voiceEnabled ? 'Voice enabled (read aloud)' : 'Voice muted'"
            >
              {{ voiceEnabled ? '🔊' : '🔇' }}
            </button>

            <!-- Close button -->
            <button
              @click="isOpen = false"
              class="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold hover:bg-slate-700 transition-colors"
              title="Close Assistant"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Conversation Scroll Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 text-xs">
          <!-- Initial Welcome Screen -->
          <div v-if="messages.length === 0" class="space-y-4 py-2">
            <div class="text-center px-4 pt-2">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <svg class="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12l10-7 10 7-10 7z"/>
                  <path d="M22 12v5c0 1-2.5 3-10 3s-10-2-10-3v-5"/>
                  <path d="M22 12v4"/>
                  <circle cx="22" cy="17" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <h4 class="font-bold text-slate-100 text-sm tracking-tight">How can I assist you today?</h4>
              <p class="text-slate-400 text-[11px] mt-1.5 leading-relaxed max-w-xs mx-auto">
                Ask questions about courses, notes, exam preparation, or navigate anywhere across LearnHub.
              </p>
            </div>

            <!-- Suggestion Chips / Quick Actions -->
            <div class="grid grid-cols-1 gap-2 pt-2">
              <button
                v-for="chip in quickChips"
                :key="chip.label"
                @click="sendQuickPrompt(chip.prompt)"
                class="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500/50 text-left transition-all flex items-center gap-3 group"
              >
                <span class="text-lg p-1.5 rounded-xl bg-slate-800 border border-slate-750 shrink-0">{{ chip.icon }}</span>
                <div>
                  <p class="text-slate-200 group-hover:text-indigo-400 font-semibold text-[11px] leading-tight transition-colors">
                    {{ chip.label }}
                  </p>
                  <p class="text-slate-400 text-[10px] leading-tight mt-0.5">{{ chip.desc }}</p>
                </div>
              </button>
            </div>
          </div>

          <!-- Messages Stream -->
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="flex flex-col"
            :class="msg.sender === 'user' ? 'items-end' : 'items-start'"
          >
            <div class="flex items-end gap-2 max-w-[90%]" :class="msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'">
              <!-- Avatar icon for bot -->
              <div v-if="msg.sender !== 'user'" class="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mb-1">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                  <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/>
                  <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </div>

              <!-- Message Bubble -->
              <div
                class="rounded-2xl p-3.5 leading-relaxed text-xs relative group"
                :class="msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-blue-600/20' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'"
              >
                <!-- Audio Player Button -->
                <div v-if="msg.audio" class="mb-2 flex items-center gap-2 p-1.5 bg-slate-950/70 rounded-xl border border-slate-800">
                  <button
                    @click="playAudio(msg.audio)"
                    class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] hover:bg-indigo-700 transition-colors"
                  >
                    ▶
                  </button>
                  <span class="text-[10px] text-slate-300 font-medium">Listen to explanation</span>
                </div>

                <!-- Message Markdown Content -->
                <div
                  @click="handleContentClick"
                  v-html="renderMarkdown(msg.text)"
                  class="space-y-2 assistant-markdown"
                ></div>
              </div>
            </div>

            <span class="text-[9px] text-slate-500 mt-1 mx-8">{{ msg.time }}</span>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="flex items-start gap-2 max-w-[80%]">
            <div class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
              <svg class="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                <circle cx="9.5" cy="10" r="1" fill="currentColor" stroke="none"/>
                <circle cx="14.5" cy="10" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 rounded-tl-none flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Hidden Audio Element -->
        <audio ref="audioPlayer" class="hidden"></audio>

        <!-- Input Bar -->
        <div class="p-3 border-t border-slate-800/80 bg-slate-900/90 relative z-10">
          <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
            <input
              v-model="inputQuery"
              type="text"
              placeholder="Ask anything, find notes, or explore topics..."
              class="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              :disabled="loading"
            />
            <button
              type="submit"
              :disabled="!inputQuery.trim() || loading"
              class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl p-2.5 w-9 h-9 flex items-center justify-center shadow-md shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
            >
              <svg class="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const isOpen = ref(false)
const messages = ref([])
const inputQuery = ref('')
const loading = ref(false)
const voiceEnabled = ref(false)
const messagesContainer = ref(null)
const audioPlayer = ref(null)

const quickChips = [
  {
    icon: '🧭',
    label: 'How do I navigate LearnHub?',
    desc: 'Overview of courses, search, and sections',
    prompt: 'How do I navigate and find materials on LearnHub?'
  },
  {
    icon: '📤',
    label: 'How to upload notes & projects?',
    desc: 'Requirements for meaningful descriptions',
    prompt: 'How do I upload notes and what should I include in the description?'
  },
  {
    icon: '💻',
    label: 'Find Programming Resources',
    desc: 'Filter coding tutorials, guides, and notes',
    prompt: 'Where can I find programming and coding resources?'
  },
  {
    icon: '👤',
    label: 'Profile & Saved Library',
    desc: 'Track bookmarks, views, and uploads',
    prompt: 'How do I view my saved library and update my profile?'
  }
]

const sendQuickPrompt = (prompt) => {
  inputQuery.value = prompt
  sendMessage()
}

const clearChat = () => {
  messages.value = []
  if (audioPlayer.value) {
    audioPlayer.value.pause()
  }
}

const sendMessage = async () => {
  const text = inputQuery.value.trim()
  if (!text || loading.value) return

  inputQuery.value = ''
  messages.value.push({
    sender: 'user',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  scrollDown()
  loading.value = true

  try {
    const historyPayload = messages.value.map(m => ({
      sender: m.sender,
      text: m.text
    }))

    const { data } = await api.post('/ai/ask', {
      message: text,
      action: 'chat',
      chatHistory: historyPayload,
      voiceEnabled: voiceEnabled.value
    })

    if (data.success) {
      messages.value.push({
        sender: 'ai',
        text: data.text,
        audio: data.audio,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      if (data.audio && voiceEnabled.value) {
        playAudio(data.audio)
      }
    }
  } catch (err) {
    console.error('[GlobalAIAssistant] Request error:', err)
    messages.value.push({
      sender: 'ai',
      text: '⚠️ I encountered an issue connecting to the learning system. Please try again!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  } finally {
    loading.value = false
    scrollDown()
  }
}

// Convert markdown to clean HTML and support router links
const renderMarkdown = (text) => {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-blue-400 mt-2 mb-1">$1</h5>')
  html = html.replace(/^#### (.*$)/gim, '<h6 class="text-[11px] font-bold text-indigo-300 mt-2 mb-0.5">$1</h6>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-blue-500 pl-2 my-1 text-slate-300 text-[11px] italic bg-slate-800/50 py-1 rounded-r">$1</blockquote>')

  // Markdown links -> clickable router triggers
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" data-internal-link="$2" class="text-blue-400 hover:text-blue-300 underline font-semibold cursor-pointer">$1</a>')

  // Lists
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="list-disc ml-3 text-slate-300 my-0.5">$1</li>')
  html = html.replace(/(<li class="list-disc ml-3 text-slate-300 my-0.5">.*<\/li>)/gs, '<ul class="space-y-0.5 my-1.5">$1</ul>')

  // Paragraphs
  html = html.replace(/^(?!<h|<li|<ul|<ol|<blockquote)(.+)$/gm, '<p class="my-1.5 text-slate-300 text-xs leading-relaxed">$1</p>')

  return html
}

// Intercept clicks on links so Vue Router handles them smoothly
const handleContentClick = (e) => {
  const target = e.target.closest('a[data-internal-link]')
  if (target) {
    e.preventDefault()
    const path = target.getAttribute('data-internal-link')
    if (path.startsWith('/')) {
      router.push(path)
      // On mobile screens, close modal upon navigation
      if (window.innerWidth < 640) {
        isOpen.value = false
      }
    }
  }
}

const playAudio = (base64) => {
  if (!audioPlayer.value) return
  const byteChars = atob(base64)
  const byteNums = new Array(byteChars.length)
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i)
  }
  const blob = new Blob([new Uint8Array(byteNums)], { type: 'audio/mpeg' })
  audioPlayer.value.src = URL.createObjectURL(blob)
  audioPlayer.value.play().catch(e => console.warn('Audio auto-play blocked:', e))
}

const scrollDown = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.assistant-slide-enter-active,
.assistant-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.assistant-slide-enter-from,
.assistant-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.assistant-markdown strong {
  color: #f8fafc;
}
</style>
