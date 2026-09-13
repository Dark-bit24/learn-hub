<template>
  <div class="space-y-12 pb-20">
    <!-- Official Institutional Hero Banner (Irembo Style) -->
    <section class="bg-[#090e40] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative">
      <div class="max-w-5xl mx-auto text-center">
        <!-- Subtitle Pill -->
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-[#0099e8] text-xs font-semibold uppercase tracking-wider mb-4">
          Public Academic Repository
        </span>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          Find Curated Academic Notes, Lecture Guides & Study Materials
        </h1>

        <p class="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Access verified educational documents, past exam guides, and reference resources contributed by verified educators and institutions. Free and open to all citizens.
        </p>

        <!-- Enterprise Search Card (Irembo Search Pattern) -->
        <div class="max-w-3xl mx-auto bg-white rounded-xl p-2.5 sm:p-3 shadow-lg border border-slate-200 text-left">
          <form @submit.prevent="handleSearch" class="flex flex-col sm:flex-row gap-2">
            <!-- Search Keyword Input -->
            <div class="relative flex-1">
              <input 
                v-model="heroSearch" 
                type="text" 
                placeholder="Enter title, subject, course code, or topic..."
                class="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0063cf] rounded-lg text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors"
              />
              <div class="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>

            <!-- Subject Category Dropdown -->
            <div class="sm:w-52">
              <select 
                v-model="heroSubject" 
                class="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-[#0063cf] rounded-lg text-sm text-slate-700 outline-none font-medium cursor-pointer"
              >
                <option value="">All Disciplines</option>
                <option v-for="cat in categories" :key="cat.name" :value="cat.name">{{ cat.name }}</option>
              </select>
            </div>

            <!-- Search Action Button -->
            <button 
              type="submit" 
              class="px-6 py-3 bg-[#0063cf] hover:bg-[#0051ab] text-white font-semibold text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Search</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>

          <!-- Popular Searches / Quick Tags -->
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500 px-1">
            <span class="font-semibold text-slate-600">Quick Searches:</span>
            <button @click="quickSearch('Mathematics')" class="text-[#0063cf] hover:underline font-medium">Mathematics</button>
            <span>•</span>
            <button @click="quickSearch('Programming')" class="text-[#0063cf] hover:underline font-medium">Computer Science</button>
            <span>•</span>
            <button @click="quickSearch('Science')" class="text-[#0063cf] hover:underline font-medium">Natural Sciences</button>
            <span>•</span>
            <button @click="quickSearch('Business')" class="text-[#0063cf] hover:underline font-medium">Economics & Business</button>
          </div>
        </div>

        <!-- Quick Access Stat Badges -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl mx-auto mt-12 text-left border-t border-slate-800/80 pt-8">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-[#0099e8] shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-white uppercase tracking-wider">Open Directory</p>
              <p class="text-[11px] text-slate-300">Instant viewing without login</p>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-[#0099e8] shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-white uppercase tracking-wider">Free Downloads</p>
              <p class="text-[11px] text-slate-300">Direct PDF & document export</p>
            </div>
          </div>

          <div class="flex items-start gap-3 col-span-2 md:col-span-1">
            <div class="w-9 h-9 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-[#0099e8] shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-white uppercase tracking-wider">Virtual Assistant</p>
              <p class="text-[11px] text-slate-300">24/7 Portal navigator & tutor</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Academic Disciplines & Categories (Structured Enterprise Grid) -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Academic Disciplines & Faculties</h2>
          <p class="text-xs text-slate-500">Browse verified educational materials grouped by department</p>
        </div>
        <RouterLink to="/resources" class="text-xs font-bold text-[#0063cf] hover:text-[#0051ab] flex items-center gap-1">
          <span>View All Disciplines</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          v-for="cat in categories" 
          :key="cat.name"
          @click="$router.push(`/resources?subject=${encodeURIComponent(cat.name)}`)"
          class="p-5 bg-white border border-slate-200 hover:border-[#0063cf] rounded-xl text-left transition-all duration-150 hover:shadow-sm group flex items-start gap-4"
        >
          <div class="w-11 h-11 rounded-lg bg-blue-50 text-[#0063cf] flex items-center justify-center shrink-0 group-hover:bg-[#0063cf] group-hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="cat.svgPath"></path>
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-slate-900 text-sm group-hover:text-[#0063cf] transition-colors leading-tight">
              {{ cat.name }}
            </h3>
            <p class="text-[11px] text-slate-500 mt-1 leading-snug">{{ cat.desc }}</p>
            <span class="inline-block mt-2 text-[10px] font-semibold text-[#0063cf] uppercase tracking-wider">Access Collection →</span>
          </div>
        </button>
      </div>
    </section>

    <!-- Featured & Recent Materials -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-slate-200">
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Featured Resources & Study Documents</h2>
          <p class="text-xs text-slate-500">Recently verified materials recommended for public access</p>
        </div>
        <RouterLink to="/resources" class="text-xs font-bold text-[#0063cf] hover:text-[#0051ab] flex items-center gap-1">
          <span>Complete Catalog</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </RouterLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="i in 6" :key="i" class="p-5 bg-white border border-slate-200 rounded-xl animate-pulse space-y-3">
          <div class="h-4 bg-slate-200 rounded w-1/4"></div>
          <div class="h-5 bg-slate-200 rounded w-3/4"></div>
          <div class="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Resources Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <ResourceCard v-for="resource in featuredResources" :key="resource._id" :resource="resource" />
      </div>

      <!-- Empty state -->
      <div v-if="!loading && featuredResources.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200">
        <p class="text-slate-500 text-sm">No featured materials currently available.</p>
        <RouterLink to="/upload" class="mt-4 px-5 py-2.5 bg-[#0063cf] text-white rounded-lg text-xs font-semibold inline-block">
          Submit Academic Document
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ResourceCard from '../components/ResourceCard.vue'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()
const featuredResources = ref([])
const loading = ref(true)
const heroSearch = ref('')
const heroSubject = ref('')

const categories = [
  {
    name: 'Mathematics',
    desc: 'Calculus, algebra, statistics & applied math',
    svgPath: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
  },
  {
    name: 'Programming',
    desc: 'Algorithms, full-stack development & databases',
    svgPath: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    name: 'Science',
    desc: 'Physics, chemistry, biology & laboratory guides',
    svgPath: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
  },
  {
    name: 'Technology',
    desc: 'Networks, cybersecurity, hardware & cloud',
    svgPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
  },
  {
    name: 'Business',
    desc: 'Finance, economics, management & commerce',
    svgPath: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    name: 'History',
    desc: 'World history, civilizations, heritage & politics',
    svgPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'Language',
    desc: 'Linguistics, grammar, foreign languages & literature',
    svgPath: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'
  },
  {
    name: 'Arts',
    desc: 'Design, architecture, fine arts & humanities',
    svgPath: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
  }
]

const handleSearch = () => {
  const query = {}
  if (heroSearch.value.trim()) query.search = heroSearch.value.trim()
  if (heroSubject.value) query.subject = heroSubject.value
  router.push({ path: '/resources', query })
}

const quickSearch = (subject) => {
  router.push({ path: '/resources', query: { subject } })
}

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
