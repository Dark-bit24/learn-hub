<template>
  <div class="space-y-16 pb-20">
    <!-- Hero Section (Executive Dark/Gradient Mesh) -->
    <section class="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white py-24 px-4">
      <!-- Ambient Glow Orbs -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div class="max-w-5xl mx-auto text-center relative z-10">
        <!-- Open Access Badge -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold mb-6 shadow-inner">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100% Open Access • View, Read & Download Without An Account</span>
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Explore, Share & Master <br class="hidden sm:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Every Subject with AI
          </span>
        </h1>

        <p class="text-slate-300 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Access curated lecture notes, exam guides, PDFs, and interactive tutorials shared by students and educators worldwide.
        </p>

        <!-- Search Bar in Hero -->
        <div class="max-w-xl mx-auto mb-10">
          <form @submit.prevent="$router.push(`/resources?search=${encodeURIComponent(heroSearch)}`)" class="relative flex items-center">
            <input 
              v-model="heroSearch" 
              type="text" 
              placeholder="Search by topic, course title, or subject..."
              class="w-full bg-white/10 backdrop-blur-xl border border-white/20 focus:border-indigo-400 rounded-2xl py-4 pl-12 pr-32 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xl"
            />
            <div class="absolute left-4 text-slate-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button type="submit" class="absolute right-2.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
              Search
            </button>
          </form>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex flex-wrap gap-3.5 justify-center items-center">
          <RouterLink to="/resources" class="px-7 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all transform hover:-translate-y-0.5">
            Browse All Resources →
          </RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/register"
            class="px-7 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition-all">
            Join Platform
          </RouterLink>
          <RouterLink v-else to="/upload"
            class="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all">
            + Upload Notes
          </RouterLink>
        </div>

        <!-- Feature Highlights Bar -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-16 pt-10 border-t border-white/10 text-left">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">📖</div>
            <div>
              <p class="text-xs font-bold text-white">Instant Preview</p>
              <p class="text-[11px] text-slate-400">Read notes online for free</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">⚡</div>
            <div>
              <p class="text-xs font-bold text-white">Direct Downloads</p>
              <p class="text-[11px] text-slate-400">One-click file downloads</p>
            </div>
          </div>
          <div class="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">🤖</div>
            <div>
              <p class="text-xs font-bold text-white">AI Study Partner</p>
              <p class="text-[11px] text-slate-400">Ask questions about notes</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Browse by Subject</h2>
          <p class="text-slate-500 text-xs mt-1">Explore lecture notes and study material categorized by field</p>
        </div>
        <RouterLink to="/resources" class="text-xs font-bold text-indigo-600 hover:text-indigo-700">
          All Subjects →
        </RouterLink>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button v-for="cat in categories" :key="cat.name"
          @click="$router.push(`/resources?subject=${cat.name}`)"
          class="p-5 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-300 rounded-2xl text-center cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-indigo-500/5">
          <div class="text-3xl mb-2.5 transform group-hover:scale-110 transition-transform duration-200">{{ cat.icon }}</div>
          <p class="font-bold text-slate-800 group-hover:text-indigo-600 text-xs">{{ cat.name }}</p>
          <span class="text-[10px] text-slate-400 font-medium">Explore field</span>
        </button>
      </div>
    </section>

    <!-- Featured Resources -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Featured Resources</h2>
          <p class="text-slate-500 text-xs mt-1">Top-rated notes, tutorials, and documents from our community</p>
        </div>
        <RouterLink to="/resources" class="text-xs font-bold text-indigo-600 hover:text-indigo-700">
          View All Resources →
        </RouterLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="p-5 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-3">
          <div class="h-4 bg-slate-200 rounded w-1/3"></div>
          <div class="h-5 bg-slate-200 rounded w-4/5"></div>
          <div class="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Resources Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="resource in featuredResources" :key="resource._id" :resource="resource" />
      </div>

      <!-- Empty state -->
      <div v-if="!loading && featuredResources.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <p class="text-slate-400 text-base">No resources found yet.</p>
        <RouterLink to="/upload" class="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold inline-block shadow-md">
          Upload First Resource
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import ResourceCard from '../components/ResourceCard.vue'
import api from '../services/api'

const authStore = useAuthStore()
const featuredResources = ref([])
const loading = ref(true)
const heroSearch = ref('')

const categories = [
  { name: 'Mathematics', icon: '📐' },
  { name: 'Science', icon: '🔬' },
  { name: 'Programming', icon: '💻' },
  { name: 'Technology', icon: '⚙️' },
  { name: 'History', icon: '📜' },
  { name: 'Language', icon: '📝' },
  { name: 'Arts', icon: '🎨' },
  { name: 'Business', icon: '💼' },
]

onMounted(async () => {
  try {
    const { data } = await api.get('/resources/featured')
    featuredResources.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>
