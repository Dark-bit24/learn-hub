<template>
  <div class="min-h-screen bg-[#f4f6fc] flex items-center justify-center p-4 font-sans">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 w-full max-w-md">

      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-[#0063cf] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          <span class="text-white font-black text-xl">L</span>
        </div>
        <h1 class="text-2xl font-extrabold text-[#090e40] tracking-tight">Institutional Portal</h1>
        <p class="text-xs text-slate-500 mt-1">Sign in to access your courses, repository, and AI tutor</p>
      </div>

      <!-- Error / Approval Notice -->
      <div v-if="authStore.error"
        class="border px-4 py-3 rounded-xl mb-5 text-xs font-medium leading-relaxed"
        :class="authStore.error.includes('pending') 
          ? 'bg-amber-50 border-amber-200 text-amber-800' 
          : 'bg-rose-50 border-rose-200 text-rose-700'">
        <div class="flex items-start gap-2">
          <span v-if="authStore.error.includes('pending')" class="text-base">⏳</span>
          <span v-else class="text-base">⚠️</span>
          <div>
            <strong v-if="authStore.error.includes('pending')" class="block font-bold">Account Under Review</strong>
            {{ authStore.error }}
          </div>
        </div>
      </div>

      <!-- Google Sign In Integration -->
      <div class="mb-5">
        <GoogleAuthButton mode="login" @error="onGoogleError" />
      </div>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-slate-200"></div>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or email & password</span>
        <div class="flex-1 h-px bg-slate-200"></div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
          <input v-model="form.email" type="email" placeholder="you@example.com"
            class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 transition-all outline-none" required />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
          <input v-model="form.password" type="password" placeholder="••••••••"
            class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 transition-all outline-none" required />
        </div>

        <button type="submit" :disabled="authStore.loading"
          class="w-full py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {{ authStore.loading ? 'Authenticating...' : 'Sign In to Portal' }}
        </button>
      </form>

      <!-- Register link -->
      <p class="text-center text-xs text-slate-500 mt-6">
        Don't have an authorized account?
        <RouterLink to="/register" class="text-[#0063cf] hover:underline font-bold">Register here</RouterLink>
      </p>

    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import GoogleAuthButton from '../components/GoogleAuthButton.vue'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({ email: '', password: '' })

const onGoogleError = (errMsg) => {
  authStore.error = errMsg
}

const handleLogin = async () => {
  const success = await authStore.login(form.email, form.password)
  if (success) router.push('/')
}
</script>
