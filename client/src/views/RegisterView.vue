<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <div class="text-center mb-8">
        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-xl">L</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Create account</h1>
        <p class="text-gray-500 mt-1">Join LearnHub today</p>
      </div>

      <!-- Success Message -->
      <div v-if="successMsg"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
        {{ successMsg }}
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
        {{ authStore.error }}
      </div>

      <form v-if="!successMsg" @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
          <input v-model="form.username" type="text" placeholder="johndoe123"
            class="input-field" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input v-model="form.email" type="email" placeholder="you@example.com"
            class="input-field" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input v-model="form.password" type="password" placeholder="Min 6 characters"
            class="input-field" required minlength="6" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">I am a...</label>
          <div class="flex gap-4">
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.role" value="student" class="sr-only peer" />
              <div class="p-3 text-center rounded-lg border border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all">
                Student
              </div>
            </label>
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.role" value="teacher" class="sr-only peer" />
              <div class="p-3 text-center rounded-lg border border-gray-200 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all">
                Teacher
              </div>
            </label>
          </div>
        </div>

        <button type="submit" :disabled="authStore.loading"
          class="btn-primary w-full py-3 text-base disabled:opacity-60">
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div v-if="successMsg" class="mt-6">
        <RouterLink to="/login" class="btn-primary w-full py-3 text-center inline-block">
          Go to Login
        </RouterLink>
      </div>

      <p v-else class="text-center text-sm text-gray-500 mt-6">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline font-medium">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const successMsg = ref('')

const form = reactive({ 
  username: '', 
  email: '', 
  password: '',
  role: 'student'
})

const handleRegister = async () => {
  const result = await authStore.register(form.username, form.email, form.password, form.role)
  if (result.success) {
    if (result.message) {
      successMsg.value = result.message
    } else {
      router.push('/')
    }
  }
}
</script>
