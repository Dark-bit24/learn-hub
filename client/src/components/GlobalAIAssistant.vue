<template>
  <div class="fixed bottom-6 right-6 z-50 font-sans">
    <!-- Floating Trigger Button (IremboBot Circular / Pill Pattern) -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="group relative flex items-center gap-3 bg-[#0063cf] hover:bg-[#0051ab] text-white pl-4 pr-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border border-blue-400/40"
      title="Open Official Virtual Assistant"
    >
      <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      </div>
      <div class="text-left">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold leading-tight tracking-tight">Need Assistance?</span>
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        </div>
        <p class="text-[10px] text-blue-100 leading-tight">Virtual Portal Guide</p>
      </div>
    </button>

    <!-- Chat Modal Window (Official IremboBot Enterprise Style) -->
    <transition name="assistant-slide">
      <div
        v-if="isOpen"
        class="w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] bg-[#f4f6fc] border border-slate-300 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 relative"
      >
        <!-- Official Header (Irembo Navy #090e40) -->
        <div class="px-5 py-3.5 bg-[#090e40] text-white flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-[#0063cf] flex items-center justify-center text-white shadow-xs">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold text-white tracking-tight">LearnHub Assistant</h3>
                <span class="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-1.5 py-0.2 rounded-full">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                </span>
              </div>
              <p class="text-[10px] text-slate-300 font-normal">Official Directory Support Guide</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Clear Chat Button -->
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center transition-colors text-xs"
              title="Reset Conversation"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>

            <!-- Voice read-aloud toggle -->
            <button
              @click="voiceEnabled = !voiceEnabled"
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs"
              :class="voiceEnabled ? 'bg-[#0063cf] text-white border border-blue-400' : 'bg-white/10 text-slate-300 hover:text-white'"
              :title="voiceEnabled ? 'Voice enabled (read responses)' : 'Voice muted'"
            >
              {{ voiceEnabled ? '🔊' : '🔇' }}
            </button>

            <!-- Close button -->
            <button
              @click="isOpen = false"
              class="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 flex items-center justify-center text-sm font-bold transition-colors"
              title="Close Support Window"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Conversation Scroll Area (Clean Institutional Layout) -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          <!-- Initial Welcome Screen -->
          <div v-if="messages.length === 0" class="space-y-4 py-2">
            <div class="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-9 h-9 rounded-lg bg-blue-50 text-[#0063cf] flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-xs">Welcome to LearnHub Assistant</h4>
                  <p class="text-[11px] text-slate-500">Official guidance and automated academic tutoring</p>
                </div>
              </div>
              <p class="text-slate-600 text-[11px] leading-relaxed">
                How may I help you today? I can guide you through the platform, help you find and read learning materials, explain how to upload documents, or tutor you on any academic topic.
              </p>
            </div>

            <!-- Suggestion Questions / Quick Services -->
            <div class="space-y-2">
              <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">Common Inquiries</p>
              <div class="grid grid-cols-1 gap-1.5">
                <button
                  v-for="chip in quickChips"
                  :key="chip.label"
                  @click="sendQuickPrompt(chip.prompt)"
                  class="p-3 rounded-lg bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-[#0063cf] text-left transition-colors flex items-center justify-between group shadow-2xs"
                >
                  <div class="pr-2">
                    <p class="text-slate-800 group-hover:text-[#0063cf] font-semibold text-xs leading-tight transition-colors">
                      {{ chip.label }}
                    </p>
                    <p class="text-slate-500 text-[10px] leading-tight mt-0.5">{{ chip.desc }}</p>
                  </div>
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-[#0063cf] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Messages Stream -->
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="flex flex-col"
            :class="msg.sender === 'user' ? 'items-end' : 'items-start'"
          >
            <div class="flex items-start gap-2.5 max-w-[90%]" :class="msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'">
              <!-- Official Avatar -->
              <div v-if="msg.sender !== 'user'" class="w-6 h-6 rounded-md bg-[#0063cf] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                L
              </div>

              <!-- Message Bubble -->
              <div
                class="rounded-xl p-3.5 leading-relaxed text-xs"
                :class="msg.sender === 'user' 
                  ? 'bg-[#0063cf] text-white rounded-tr-none shadow-xs font-medium' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'"
              >
                <!-- Audio Player Bar -->
                <div v-if="msg.audio" class="mb-2.5 flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  <button
                    @click="playAudio(msg.audio)"
                    class="w-5 h-5 rounded bg-[#0063cf] text-white flex items-center justify-center text-[9px] hover:bg-[#0051ab]"
                  >
                    ▶
                  </button>
                  <span class="text-[10px] font-medium">Listen to response</span>
                </div>

                <!-- Message Content -->
                <div
                  @click="handleContentClick"
                  v-html="renderMarkdown(msg.text)"
                  class="space-y-1.5 assistant-markdown text-slate-800"
                ></div>
              </div>
            </div>

            <span class="text-[9px] text-slate-400 mt-1 mx-8">{{ msg.time }}</span>
          </div>

          <!-- Loading Indicator -->
          <div v-if="loading" class="flex items-start gap-2 max-w-[80%]">
            <div class="w-6 h-6 rounded-md bg-[#0063cf] text-white flex items-center justify-center text-[10px] font-bold">
              L
            </div>
            <div class="p-3 rounded-xl bg-white border border-slate-200 rounded-tl-none flex items-center gap-1.5 shadow-xs">
              <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 0ms"></span>
              <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 150ms"></span>
              <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Hidden Audio Element -->
        <audio ref="audioPlayer" class="hidden"></audio>

        <!-- Input Bar (Clean Enterprise White) -->
        <div class="p-3 border-t border-slate-200 bg-white">
          <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
            <input
              v-model="inputQuery"
              type="text"
              placeholder="Ask a question about resources, subjects, or portal guidance..."
              class="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-lg px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-colors"
              :disabled="loading"
            />
            <button
              type="submit"
              :disabled="!inputQuery.trim() || loading"
              class="bg-[#0063cf] hover:bg-[#0051ab] disabled:opacity-40 text-white rounded-lg px-3.5 py-2.5 flex items-center justify-center text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <span>Send</span>
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
    label: 'What is LearnHub and what can I do here?',
    desc: 'Platform overview, features, navigation guide, and user roles',
    prompt: 'What is LearnHub and how does it work? Show me around the platform.'
  },
  {
    label: 'How do I read notes and documents online?',
    desc: 'Step-by-step guide to using the built-in document viewer',
    prompt: 'How do I read notes and documents online on LearnHub?'
  },
  {
    label: 'How do I search and access learning resources?',
    desc: 'Guide to directory filtering, online preview, and free downloads',
    prompt: 'How do I search and access learning resources on LearnHub?'
  },
  {
    label: 'What are the document upload requirements?',
    desc: 'Verification standards, supported formats, and description guidelines',
    prompt: 'What are the document upload requirements and how can I share material?'
  },
  {
    label: 'Locate Computer Science & Engineering materials',
    desc: 'Browse programming tutorials, system architectures, and laboratory notes',
    prompt: 'Where can I find computer science, programming, and engineering notes?'
  },
  {
    label: 'How does guest access and document liking work?',
    desc: 'Learn about viewing, downloading, and bookmarking without an account',
    prompt: 'How does guest access and document liking work on LearnHub?'
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
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-slate-900 mt-2.5 mb-1">$1</h5>')
  html = html.replace(/^#### (.*$)/gim, '<h6 class="text-[11px] font-bold text-slate-800 mt-2 mb-0.5">$1</h6>')

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-600">$1</em>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-3 border-[#0063cf] pl-2.5 my-1.5 text-slate-700 text-[11px] italic bg-slate-50 py-1 rounded-r">$1</blockquote>')

  // Markdown links -> clickable router triggers
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" data-internal-link="$2" class="text-[#0063cf] hover:text-[#0051ab] underline font-semibold cursor-pointer">$1</a>')

  // Lists
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="list-disc ml-3.5 text-slate-700 my-0.5">$1</li>')
  html = html.replace(/(<li class="list-disc ml-3.5 text-slate-700 my-0.5">.*<\/li>)/gs, '<ul class="space-y-0.5 my-1.5">$1</ul>')

  // Paragraphs
  html = html.replace(/^(?!<h|<li|<ul|<ol|<blockquote)(.+)$/gm, '<p class="my-1.5 text-slate-700 text-xs leading-relaxed">$1</p>')

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
