<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">L</span>
          </div>
          <span class="font-bold text-gray-900 text-lg">LearnHub</span>
        </RouterLink>

        <!-- Navigation Links -->
        <div class="hidden md:flex items-center gap-6">
          <RouterLink to="/"
            class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            active-class="text-blue-600">
            Home
          </RouterLink>
          <RouterLink to="/resources"
            class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            active-class="text-blue-600">
            Resources
          </RouterLink>
          <RouterLink v-if="authStore.isLoggedIn" to="/upload"
            class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            active-class="text-blue-600">
            Upload
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin"
            class="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            active-class="text-blue-600">
            Admin
          </RouterLink>
        </div>

        <!-- Auth Buttons -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.isLoggedIn">
            <RouterLink to="/profile"
              class="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 font-semibold text-sm">
                  {{ authStore.currentUser?.name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="hidden md:block font-medium text-sm">{{ authStore.currentUser?.name }}</span>
            </RouterLink>
            <button @click="handleLogout"
              class="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors">
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="btn-secondary text-sm py-1.5 px-4">Login</RouterLink>
            <RouterLink to="/register" class="btn-primary text-sm py-1.5 px-4">Sign Up</RouterLink>
          </template>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>
