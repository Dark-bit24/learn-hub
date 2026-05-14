<template>
  <div class="max-w-7xl mx-auto px-4 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">All Resources</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-wrap gap-4">
      <input v-model="filters.search" @input="fetchResources"
        type="text" placeholder="🔍 Search resources..."
        class="input-field flex-1 min-w-[200px]" />

      <select v-model="filters.subject" @change="fetchResources" class="input-field w-auto">
        <option value="">All Subjects</option>
        <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
      </select>

      <select v-model="filters.type" @change="fetchResources" class="input-field w-auto">
        <option value="">All Types</option>
        <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
      </select>

      <button @click="clearFilters" class="btn-secondary text-sm">Clear</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="card p-5 animate-pulse">
        <div class="h-4 bg-gray-200 rounded mb-3 w-1/3"></div>
        <div class="h-5 bg-gray-200 rounded mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- Results -->
    <div v-else>
      <p class="text-sm text-gray-500 mb-4">{{ resources.length }} resource(s) found</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="r in resources" :key="r._id" :resource="r" />
      </div>
      <div v-if="resources.length === 0" class="text-center py-20">
        <p class="text-gray-400 text-lg">No resources found.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ResourceCard from '../components/ResourceCard.vue'
import api from '../services/api'

const route = useRoute()
const resources = ref([])
const loading = ref(true)

const filters = reactive({
  search: '',
  subject: route.query.subject || '',
  type: ''
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

onMounted(fetchResources)
</script>
