<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-bold mb-4">Share & Discover Learning Resources</h1>
        <p class="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Access notes, tutorials, PDFs and more shared by students and educators worldwide.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink to="/resources" class="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition">
            Browse Resources
          </RouterLink>
          <RouterLink v-if="!authStore.isLoggedIn" to="/register"
            class="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg border border-blue-400 transition">
            Get Started Free
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Browse by Subject</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button v-for="cat in categories" :key="cat.name"
            @click="$router.push(`/resources?subject=${cat.name}`)"
            class="card p-5 text-center cursor-pointer hover:border-blue-200 group">
            <div class="text-3xl mb-2">{{ cat.icon }}</div>
            <p class="font-medium text-gray-700 group-hover:text-blue-600 text-sm">{{ cat.name }}</p>
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Resources -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Featured Resources</h2>
          <RouterLink to="/resources" class="text-blue-600 hover:underline text-sm font-medium">
            View all →
          </RouterLink>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card p-5 animate-pulse">
            <div class="h-4 bg-gray-200 rounded mb-3 w-1/3"></div>
            <div class="h-5 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <!-- Resources Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ResourceCard v-for="resource in featuredResources" :key="resource._id" :resource="resource" />
        </div>

        <!-- Empty state -->
        <div v-if="!loading && featuredResources.length === 0" class="text-center py-16">
          <p class="text-gray-400 text-lg">No resources yet.</p>
          <RouterLink to="/upload" class="btn-primary mt-4 inline-block">Upload First Resource</RouterLink>
        </div>
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
