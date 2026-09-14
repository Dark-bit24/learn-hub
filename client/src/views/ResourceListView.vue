<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0063cf] text-xs font-bold mb-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Official Repository • Public & Guest Access Permitted
        </div>
        <h1 class="text-3xl font-extrabold text-[#090e40] tracking-tight">Academic Resource Directory</h1>
        <p class="text-xs text-slate-500 mt-1">Browse, view, download, and review verified lecture notes, curricula, and syllabi.</p>
      </div>

      <RouterLink v-if="authStore.isLoggedIn" to="/upload" class="px-5 py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white rounded-xl text-xs font-bold shadow-xs transition-all self-start sm:self-auto flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Submit New Document
      </RouterLink>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap gap-3 items-center">
      <!-- Search Input -->
      <div class="relative flex-1 min-w-[240px]">
        <input 
          v-model="filters.search" 
          @input="fetchResources"
          type="text" 
          placeholder="Search documents by title, curriculum code or keywords..."
          class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
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
          class="appearance-none bg-slate-50 border border-slate-200 focus:border-[#0063cf] rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Academic Disciplines</option>
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
          class="appearance-none bg-slate-50 border border-slate-200 focus:border-[#0063cf] rounded-xl px-4 py-2.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="">All Format Types</option>
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
        Reset Criteria
      </button>
    </div>

    <!-- Results Status -->
    <div class="flex items-center justify-between text-xs text-slate-500 px-1">
      <p><strong class="text-[#090e40]">{{ resources.length }}</strong> resources catalogued</p>
      <span v-if="filters.search || filters.subject || filters.type" class="text-[#0063cf] font-semibold">Active Filter Applied</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="p-5 bg-white border border-slate-200 rounded-xl animate-pulse space-y-3">
        <div class="h-4 bg-slate-200 rounded w-1/3"></div>
        <div class="h-5 bg-slate-200 rounded w-4/5"></div>
        <div class="h-4 bg-slate-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Results Grid -->
    <div v-else>
      <div v-if="resources.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="r in resources" :key="r._id" :resource="r" @deleted="fetchResources" />
      </div>

      <div v-else class="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div class="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto text-slate-400 mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <h3 class="text-base font-bold text-[#090e40] mb-1">No matching documents catalogued</h3>
        <p class="text-xs text-slate-500 mb-4">No published resources match your current filter criteria.</p>
        <button @click="clearFilters" class="px-5 py-2.5 bg-blue-50 text-[#0063cf] font-bold rounded-xl text-xs hover:bg-blue-100 transition-colors">
          Clear Search Criteria
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
