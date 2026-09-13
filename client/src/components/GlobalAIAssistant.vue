<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans">
    <!-- Floating Trigger Button -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="group relative flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-3 rounded-full shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
      title="Open LearnHub AI Navigator & Assistant"
    >
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
        🤖
      </div>
      <div class="text-left pr-1 hidden sm:block">
        <p class="text-xs font-bold leading-tight">AI Assistant</p>
        <p class="text-[10px] text-blue-200 leading-tight">Ask anything & navigate</p>
      </div>
      <span class="absolute -top-1 -right-1 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
      </span>
    </button>

    <!-- Chat Modal Window -->
    <transition name="assistant-slide">
      <div
        v-if="isOpen"
        class="w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 relative"
      >
        <!-- Background Ambient Glow -->
        <div class="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full filter blur-[48px] pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-[48px] pointer-events-none"></div>

        <!-- Header -->
        <div class="px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-md shadow-blue-500/20">
              🤖
            </div>
            <div>
              <h3 class="text-xs font-bold text-slate-100 leading-tight">LearnHub Navigator</h3>
              <p class="text-[10px] text-emerald-400 font-medium">● Connected to Backend</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Voice synthesis toggle -->
            <button
              @click="voiceEnabled = !voiceEnabled"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs"
              :class="voiceEnabled ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'"
              :title="voiceEnabled ? 'Voice enabled' : 'Voice muted'"
            >
              {{ voiceEnabled ? '🔊' : '🔇' }}
            </button>

            <!-- Close button -->
            <button
              @click="isOpen = false"
              class="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold hover:bg-slate-700 transition-colors"
              title="Close Assistant"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Conversation Scroll Area -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3.5 relative z-10 text-xs">
          <!-- Initial Welcome -->
          <div v-if="messages.length === 0" class="space-y-4 py-2">
            <div class="text-center px-3">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-2xl">
                🧭
              </div>
              <h4 class="font-bold text-slate-100 text-sm">Need help navigating LearnHub?</h4>
              <p class="text-slate-400 text-[11px] mt-1 leading-relaxed">
                I can help you explore learning resources, upload notes, or guide you anywhere on the platform!
              </p>
            </div>

            <!-- Suggestion Chips -->
            <div class="grid grid-cols-1 gap-2 pt-1">
              <button
                v-for="chip in quickChips"
                :key="chip.label"
                @click="sendQuickPrompt(chip.prompt)"
                class="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 text-left transition-all flex items-center gap-2.5 group"
              >
                <span class="text-base">{{ chip.icon }}</span>
                <div>
                  <p class="text-slate-200 group-hover:text-blue-400 font-semibold text-[11px] leading-tight">
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
            <div
              class="max-w-[88%] rounded-2xl p-3 leading-relaxed"
              :class="msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'"
            >
              <!-- Audio Player Button -->
              <div v-if="msg.audio" class="mb-2 flex items-center gap-2 p-1 bg-slate-900/60 rounded-lg border border-slate-700/40">
                <button
                  @click="playAudio(msg.audio)"
                  class="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[9px] hover:bg-blue-700"
                >
                  ▶
                </button>
                <span class="text-[10px] text-slate-300">Play voice response</span>
              </div>

              <!-- Message Markdown Content -->
              <div
                @click="handleContentClick"
                v-html="renderMarkdown(msg.text)"
                class="space-y-1.5 assistant-markdown"
              ></div>
            </div>
            <span class="text-[9px] text-slate-500 mt-1 mx-2">{{ msg.time }}</span>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="flex items-start gap-2 max-w-[80%]">
            <div class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-blue-400 animate-pulse">
              🤖
            </div>
            <div class="p-2.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 rounded-tl-none flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Hidden Audio Element -->
        <audio ref="audioPlayer" class="hidden"></audio>

        <!-- Input Bar -->
        <div class="p-3 border-t border-slate-800 bg-slate-900/95 relative z-10">
          <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
            <input
              v-model="inputQuery"
              type="text"
              placeholder="Ask about website navigation, notes, or topics..."
              class="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-all"
              :disabled="loading"
            />
            <button
              type="submit"
              :disabled="!inputQuery.trim() || loading"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl p-2 w-8 h-8 flex items-center justify-center shadow-md shadow-blue-600/30 transition-all shrink-0"
            >
              <svg class="w-3.5 h-3.5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
