<template>
  <div class="flex flex-col h-full bg-slate-50 border-l border-slate-200 relative overflow-hidden text-slate-800">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white relative z-10 shadow-xs">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-[#0063cf] flex items-center justify-center text-white shadow-sm">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-[#090e40] tracking-tight leading-none">Curriculum Study Assistant</h3>
          <span class="text-[10px] text-emerald-600 font-bold tracking-wider uppercase mt-1 inline-flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Official AI Guide Active
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Voice Toggle -->
        <button 
          @click="toggleVoice" 
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-semibold"
          :class="voiceEnabled ? 'bg-blue-50 border border-[#0063cf] text-[#0063cf]' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'"
          title="Toggle audio response">
          <span v-if="voiceEnabled" class="text-sm">🔊</span>
          <span v-else class="text-sm">🔇</span>
        </button>
      </div>
    </div>

    <!-- Chat Conversation -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 bg-[#f4f6fc]">
      <!-- Welcome Message if empty -->
      <div v-if="messages.length === 0" class="text-center py-5 px-4 space-y-3">
        <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto border border-slate-200 shadow-sm text-[#0063cf]">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>
        <div class="max-w-xs mx-auto">
          <h4 class="text-sm font-bold text-[#090e40]">Interactive Document Assistant</h4>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Inquire directly about concepts, derivations, and summaries derived from this verified document.
          </p>
        </div>

        <!-- Verified Breakdown & Key Topics Badge -->
        <div v-if="resource?.shortDescription || resource?.keyTopics?.length" class="text-left bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 mt-2 shadow-xs">
          <div v-if="resource.shortDescription">
            <span class="text-[10px] font-bold text-[#0063cf] uppercase tracking-wider block mb-0.5">Verified Document Summary</span>
            <p class="text-xs text-slate-600 leading-relaxed">{{ resource.shortDescription }}</p>
          </div>
          <div v-if="resource.keyTopics?.length" class="flex flex-wrap gap-1.5 pt-1">
            <span v-for="t in resource.keyTopics" :key="t" class="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[10px] text-[#0063cf] font-semibold">
              #{{ t }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div v-if="messages.length === 0" class="grid grid-cols-1 gap-2 pt-2">
        <button @click="triggerAction('explain')" class="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-[#0063cf] transition-all text-left shadow-xs group">
          <div class="w-8 h-8 rounded-lg bg-blue-50 text-[#0063cf] flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-[#090e40] group-hover:text-[#0063cf] transition-colors">Core Concepts Overview</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Clear breakdown structured for exam preparation</p>
          </div>
        </button>
        <button @click="triggerAction('summarize')" class="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-[#0063cf] transition-all text-left shadow-xs group">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-[#090e40] group-hover:text-[#0063cf] transition-colors">Executive Summary</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Essential takeaways and highlighted formulas</p>
          </div>
        </button>
        <button @click="triggerAction('quiz')" class="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-[#0063cf] transition-all text-left shadow-xs group">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-[#090e40] group-hover:text-[#0063cf] transition-colors">Assessment Evaluation</p>
            <p class="text-[10px] text-slate-500 mt-0.5">Test comprehension with verified answer key</p>
          </div>
        </button>
      </div>

      <!-- Messages Loop -->
      <div v-for="(msg, index) in messages" :key="index" class="flex flex-col" :class="msg.sender === 'user' ? 'items-end' : 'items-start'">
        <div class="flex items-start gap-2 max-w-[85%]" :class="msg.sender === 'user' ? 'flex-row-reverse' : ''">
          <!-- Avatar -->
          <div class="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-1" 
            :class="msg.sender === 'user' ? 'bg-[#0063cf] text-white' : 'bg-[#090e40] text-white'">
            <template v-if="msg.sender === 'user'">U</template>
            <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>

          <!-- Message Card -->
          <div class="p-3.5 rounded-xl text-xs leading-relaxed" 
            :class="msg.sender === 'user' ? 'bg-[#0063cf] text-white rounded-tr-none shadow-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'">
            
            <!-- Audio Playback if available -->
            <div v-if="msg.audio" class="mb-2 flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <button @click="playAudio(msg.audio)" class="w-6 h-6 rounded-md bg-[#0063cf] flex items-center justify-center text-[10px] text-white hover:bg-blue-700">
                ▶
              </button>
              <span class="text-[10px] text-slate-700 font-semibold">Listen to audio narration</span>
            </div>

            <!-- Main text (formatted) -->
            <div v-html="renderMarkdown(msg.text)" class="space-y-2 tutor-markdown"></div>
          </div>
        </div>
        <span class="text-[9px] text-slate-400 mt-1 mx-8">{{ msg.time }}</span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-start gap-2 max-w-[80%]">
        <div class="w-6 h-6 rounded-md bg-[#090e40] flex items-center justify-center text-white shrink-0">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="p-3 rounded-xl bg-white border border-slate-200 rounded-tl-none flex items-center gap-1.5 shadow-xs">
          <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-1.5 h-1.5 bg-[#0063cf] rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
      </div>
    </div>

    <!-- Audio Element -->
    <audio ref="audioPlayer" class="hidden"></audio>

    <!-- Footer Input -->
    <div class="p-3 border-t border-slate-200 bg-white relative z-10">
      <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
        <input 
          v-model="inputMessage" 
          type="text" 
          placeholder="Ask curriculum assistant a question..." 
          class="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
          :disabled="loading"
        />
        <button 
          type="submit" 
          class="bg-[#0063cf] hover:bg-[#0051ab] disabled:opacity-40 text-white rounded-xl p-2 w-8 h-8 flex items-center justify-center shadow-xs transition-all shrink-0"
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
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, '<li class="list-disc ml-4 my-1 text-slate-700">$1</li>');
  html = html.replace(/(<li class="list-disc ml-4 my-1 text-slate-700">.*<\/li>)/gs, '<ul class="space-y-1 my-2">$1</ul>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#090e40]">$1</strong>');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-[#0063cf] uppercase tracking-wider mt-3 mb-1">$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4 class="text-sm font-bold text-[#090e40] mt-3 mb-1.5">$1</h4>');

  // Paragraphs
  html = html.replace(/^(?!<h|<li|<ul|<ol)(.+)$/gm, '<p class="my-1.5 text-slate-700">$1</p>');

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
.tutor-markdown ul {
  list-style-type: disc !important;
  margin-left: 1.25rem !important;
}
.tutor-markdown strong {
  color: #090e40 !important;
}
</style>
