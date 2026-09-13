<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          Free & Open Access • Read, Download & Like Freely
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Learning Resources</h1>
        <p class="text-xs text-slate-500 mt-1">Browse notes, study guides, and files contributed by educators and peers.</p>
      </div>

      <RouterLink v-if="authStore.isLoggedIn" to="/upload" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto">
        + Upload Notes
      </RouterLink>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap gap-3 items-center">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[240px]">
        <input 
          v-model="filters.search" 
          @input="fetchResources"
          type="text" 
          placeholder="Search resources by title or keywords..."
          class="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <div class="absolute left-3 top-3 text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      <!-- Subject Select -->
      <div class="relative">
        <select 
          v-model="filters.subject" 
          @change="fetchResources" 
          class="appearance-none bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Subjects</option>
          <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
        </select>
        <div class="pointer-events-none absolute right-2.5 top-3 text-slate-400">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <!-- Type Select -->
      <div class="relative">
        <select 
          v-model="filters.type" 
          @change="fetchResources" 
          class="appearance-none bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
        </select>
        <div class="pointer-events-none absolute right-2.5 top-3 text-slate-400">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>

      <button 
        @click="clearFilters" 
        class="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
      >
        Reset Filters
      </button>
    </div>

    <!-- Results Status -->
    <div class="flex items-center justify-between text-xs text-slate-500 px-1">
      <p><strong class="text-slate-800">{{ resources.length }}</strong> resources available</p>
      <span v-if="filters.search || filters.subject || filters.type" class="text-indigo-600 font-medium">Filtered results</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="p-5 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 rounded w-1/3"></div>
        <div class="h-5 bg-slate-200 rounded w-4/5"></div>
        <div class="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Results Grid -->
    <div v-else>
      <div v-if="resources.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="r in resources" :key="r._id" :resource="r" />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-3xl border border-slate-200">
        <div class="text-4xl mb-3">🔍</div>
        <h3 class="text-base font-bold text-slate-800 mb-1">No matching resources found</h3>
        <p class="text-xs text-slate-400 mb-4">Try clearing filters or searching for different topics.</p>
        <button @click="clearFilters" class="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors">
          Clear All Filters
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ResourceCard from '../components/ResourceCard.vue'
import api from '../services/api'

const route = useRoute()
const authStore = useAuthStore()
const resources = ref([])
const loading = ref(true)

const filters = reactive({
  search: route.query.search || '',
  subject: route.query.subject || '',
  type: route.query.type || ''
})

const subjects = ['Mathematics','Science','Technology','Programming','History','Language','Arts','Business','Other']
const types = ['PDF','Video','Article','Tutorial','Link','Notes']

const fetchResources = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.search) params.search = filters.search
    if (filters.subject) params.subject = filters.subject
    if (filters.type) params.type = filters.type
    const { data } = await api.get('/resources', { params })
    resources.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const clearFilters = () => {
  filters.search = ''
  filters.subject = ''
  filters.type = ''
  fetchResources()
}

watch(() => route.query, (newQuery) => {
  if (newQuery.search !== undefined) filters.search = newQuery.search
  if (newQuery.subject !== undefined) filters.subject = newQuery.subject
  if (newQuery.type !== undefined) filters.type = newQuery.type
  fetchResources()
})

onMounted(fetchResources)
</script>
