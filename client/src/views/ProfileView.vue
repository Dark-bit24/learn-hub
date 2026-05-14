<template>
  <div class="max-w-5xl mx-auto px-4 py-10">

    <!-- Profile Header -->
    <div class="card p-8 mb-8">
      <div class="flex items-center gap-6">
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 font-bold text-3xl">
            {{ authStore.currentUser?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">{{ authStore.currentUser?.username }}</h1>
          <p class="text-gray-500">{{ authStore.currentUser?.email }}</p>
          <p v-if="authStore.currentUser?.bio" class="text-gray-600 mt-1 text-sm">
            {{ authStore.currentUser?.bio }}
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">{{ uploads.length }}</p>
          <p class="text-sm text-gray-500">Uploads</p>
        </div>
        <div class="text-center">
          <p class="text-2xl font-bold text-blue-600">{{ savedResources.length }}</p>
          <p class="text-sm text-gray-500">Saved</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
      <button @click="activeTab = 'uploads'"
        :class="activeTab === 'uploads' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        class="px-5 py-2 rounded-md text-sm font-medium transition-all">
        📤 My Uploads
      </button>
      <button @click="activeTab = 'saved'"
        :class="activeTab === 'saved' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'"
        class="px-5 py-2 rounded-md text-sm font-medium transition-all">
        ❤️ Saved
      </button>
    </div>

    <!-- My Uploads -->
    <div v-if="activeTab === 'uploads'">
      <div v-if="loading" class="text-center py-10 text-gray-400">Loading...</div>
      <div v-else-if="uploads.length === 0" class="card p-10 text-center">
        <p class="text-gray-400 mb-4">You haven't uploaded anything yet.</p>
        <RouterLink to="/upload" class="btn-primary">Upload Resource</RouterLink>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="r in uploads" :key="r._id" :resource="r" />
      </div>
    </div>

    <!-- Saved Resources -->
    <div v-if="activeTab === 'saved'">
      <div v-if="savedResources.length === 0" class="card p-10 text-center">
        <p class="text-gray-400">No saved resources yet.</p>
        <RouterLink to="/resources" class="btn-primary mt-4 inline-block">Browse Resources</RouterLink>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ResourceCard v-for="r in savedResources" :key="r._id" :resource="r" />
      </div>
    </div>

    <!-- Logout -->
    <div class="mt-10 pt-6 border-t border-gray-200">
      <button @click="handleLogout" class="btn-danger text-sm">Logout</button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ResourceCard from '../components/ResourceCard.vue'
import api from '../services/api'

const authStore = useAuthStore()
const router = useRouter()
const activeTab = ref('uploads')
const uploads = ref([])
const savedResources = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/users/profile')
    uploads.value = data.uploads
    savedResources.value = data.user.savedResources || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
