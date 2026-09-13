<template>
  <div class="flex flex-col h-full bg-slate-900 border-l border-slate-800 relative overflow-hidden text-slate-100">
    <!-- Ambient light decoration -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[64px] pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[64px] pointer-events-none"></div>

    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
          <span class="text-white text-base font-bold">🤖</span>
        </div>
        <div>
          <h3 class="text-sm font-extrabold text-slate-100 tracking-tight leading-none">LearnHub AI Tutor</h3>
          <span class="text-[10px] text-green-400 font-semibold tracking-wider uppercase mt-1 inline-block">● Study Partner Active</span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Voice Toggle -->
        <button 
          @click="toggleVoice" 
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          :class="voiceEnabled ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400' : 'bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-200'"
          title="Toggle AI voice response">
          <span v-if="voiceEnabled" class="text-sm">🔊</span>
          <span v-else class="text-sm">🔇</span>
        </button>
      </div>
    </div>

    <!-- Chat Conversation -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
      <!-- Welcome Message if empty -->
      <div v-if="messages.length === 0" class="text-center py-5 px-4 space-y-3">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30 shadow-inner">
          <span class="text-2xl">🎓</span>
        </div>
        <div class="max-w-xs mx-auto">
          <h4 class="text-sm font-bold text-slate-200">Welcome to your AI Classroom!</h4>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            I can help you master this material. Choose a study strategy below or type any question!
          </p>
        </div>

        <!-- Verified Breakdown & Key Topics Badge -->
        <div v-if="resource?.shortDescription || resource?.keyTopics?.length" class="text-left bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2 mt-2">
          <div v-if="resource.shortDescription">
            <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">🎯 Verified Breakdown</span>
            <p class="text-[11px] text-slate-300 leading-relaxed">{{ resource.shortDescription }}</p>
          </div>
          <div v-if="resource.keyTopics?.length" class="flex flex-wrap gap-1.5 pt-1">
            <span v-for="t in resource.keyTopics" :key="t" class="px-2 py-0.5 bg-blue-900/40 border border-blue-700/50 rounded-md text-[10px] text-blue-300 font-medium">
              #{{ t }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div v-if="messages.length === 0" class="grid grid-cols-1 gap-2 pt-2">
        <button @click="triggerAction('explain')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 transition-all text-left group">
          <span class="text-lg">💡</span>
          <div>
            <p class="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Explain Simply</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Simplify the main ideas like I am 10</p>
          </div>
        </button>
        <button @click="triggerAction('summarize')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 transition-all text-left group">
          <span class="text-lg">🧠</span>
          <div>
            <p class="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Key Takeaways</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Extract the 5 most critical insights</p>
          </div>
        </button>
        <button @click="triggerAction('quiz')" class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/40 transition-all text-left group">
          <span class="text-lg">📝</span>
          <div>
            <p class="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">Quiz Me</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Generate a custom test with spoiler keys</p>
          </div>
        </button>
      </div>

      <!-- Messages Loop -->
      <div v-for="(msg, index) in messages" :key="index" class="flex flex-col" :class="msg.sender === 'user' ? 'items-end' : 'items-start'">
        <div class="flex items-start gap-2 max-w-[85%]" :class="msg.sender === 'user' ? 'flex-row-reverse' : ''">
          <!-- Avatar -->
          <div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-md mt-1 shrink-0" 
            :class="msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'">
            {{ msg.sender === 'user' ? 'U' : '🤖' }}
          </div>

          <!-- Message Card -->
          <div class="p-3 rounded-2xl text-xs leading-relaxed" 
            :class="msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none backdrop-blur-sm'">
            
            <!-- Audio Playback if available -->
            <div v-if="msg.audio" class="mb-2 flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <button @click="playAudio(msg.audio)" class="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-[10px] text-white hover:bg-blue-700">
                ▶
              </button>
              <span class="text-[10px] text-slate-300 font-medium">Listen to AI Tutor explanation</span>
            </div>

            <!-- Main text (formatted) -->
            <div v-html="renderMarkdown(msg.text)" class="space-y-2 markdown-body"></div>
          </div>
        </div>
        <span class="text-[9px] text-slate-500 mt-1 mx-8">{{ msg.time }}</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-start gap-2 max-w-[80%]">
        <div class="w-6 h-6 rounded-lg bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center text-xs animate-pulse">🤖</div>
        <div class="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/80 rounded-tl-none backdrop-blur-sm flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio ref="audioPlayer" class="hidden"></audio>

    <!-- Footer Input -->
    <div class="p-3 border-t border-slate-800 bg-slate-900/95 relative z-10">
      <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
        <input 
          v-model="inputMessage" 
          type="text" 
          placeholder="Ask me anything..." 
          class="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all"
          :disabled="loading"
        />
        <button 
          type="submit" 
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl p-2 w-8 h-8 flex items-center justify-center shadow-md shadow-blue-600/20 transition-all shrink-0"
          :disabled="!inputMessage.trim() || loading">
          <svg class="w-3.5 h-3.5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import api from '../services/api'

const props = defineProps({
  resourceId: String,
  resource: Object
})

const messages = ref([])
const inputMessage = ref('')
const loading = ref(false)
const voiceEnabled = ref(false)
const chatContainer = ref(null)
const audioPlayer = ref(null)

const toggleVoice = () => {
  voiceEnabled.value = !voiceEnabled.value
}

// Simple and highly effective regex-based markdown parser for rich study answers
const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text;

  // Escape HTML characters
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bullet points
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li class="list-disc ml-4 my-1 text-slate-300">$1</li>');
  html = html.replace(/(<li class="list-disc ml-4 my-1 text-slate-300">.*<\/li>)/gs, '<ul class="space-y-1 my-2">$1</ul>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-sm font-bold text-blue-400 mt-3 mb-1">$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4 class="text-base font-extrabold text-indigo-300 mt-4 mb-2">$1</h4>');

  // Paragraphs
  html = html.replace(/^(?!<h|<li|<ul|<ol)(.+)$/gm, '<p class="my-2 text-slate-300">$1</p>');

  return html;
}

const triggerAction = (actionType) => {
  handleAIRequest({ action: actionType })
}

const sendMessage = () => {
  if (!inputMessage.value.trim()) return
  const userText = inputMessage.value
  inputMessage.value = ''
  
  messages.value.push({
    sender: 'user',
    text: userText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  scrollDown()
  handleAIRequest({ message: userText })
}

const handleAIRequest = async ({ message, action = 'chat' }) => {
  loading.value = true
  try {
    const chatHistoryPayload = messages.value.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }))

    const { data } = await api.post('/ai/ask', {
      resourceId: props.resourceId,
      message,
      action,
      chatHistory: chatHistoryPayload,
      voiceEnabled: voiceEnabled.value
    })

    if (data.success) {
      messages.value.push({
        sender: 'ai',
        text: data.text,
        audio: data.audio,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })

      // Auto-play synthesized voice response if received
      if (data.audio && voiceEnabled.value) {
        playAudio(data.audio)
      }
    }
  } catch (err) {
    console.error('AI Tutor request failed:', err)
    messages.value.push({
      sender: 'ai',
      text: '⚠️ Oh no! I am having some trouble thinking right now. Please make sure your API key is correctly configured and try again!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  } finally {
    loading.value = false
    scrollDown()
  }
}

const playAudio = (base64Audio) => {
  if (!audioPlayer.value) return
  const audioBlob = base64ToBlob(base64Audio, 'audio/mpeg')
  const audioUrl = URL.createObjectURL(audioBlob)
  audioPlayer.value.src = audioUrl
  audioPlayer.value.play().catch(e => console.warn('Audio auto-play failed:', e))
}

const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

const scrollDown = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}
</script>

<style>
.markdown-body ul {
  list-style-type: disc !important;
  margin-left: 1.5rem !important;
}
.markdown-body strong {
  color: #ffffff !important;
}
</style>
