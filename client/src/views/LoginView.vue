<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-xl">L</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p class="text-gray-500 mt-1">Sign in to your account</p>
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
        {{ authStore.error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input v-model="form.email" type="email" placeholder="you@example.com"
            class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••"
            class="input-field" required />
        </div>

        <button type="submit" :disabled="authStore.loading"
          class="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Register link -->
      <p class="text-center text-sm text-gray-500 mt-6">
        Don't have an account?
        <RouterLink to="/register" class="text-blue-600 hover:underline font-medium">Sign up</RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })

const handleLogin = async () => {
  const success = await authStore.login(form.email, form.password)
  if (success) router.push('/')
}
</script>
