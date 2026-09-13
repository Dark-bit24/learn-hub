<template>
  <div class="min-h-screen bg-[#f4f6fc] flex items-center justify-center p-4 font-sans">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 w-full max-w-md">

      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-[#0063cf] rounded-xl flex items-center justify-center mx-auto mb-3 shadow-xs">
          <span class="text-white font-black text-xl">L</span>
        </div>
        <h1 class="text-2xl font-extrabold text-[#090e40] tracking-tight">Create an Account</h1>
        <p class="text-xs text-slate-500 mt-1">Join LearnHub institutional learning community</p>
      </div>

      <!-- Success / Pending Approval Message -->
      <div v-if="successMsg"
        class="border px-4 py-3 rounded-xl mb-6 text-xs leading-relaxed"
        :class="successMsg.includes('approval') || successMsg.includes('pending')
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'">
        <div class="flex items-start gap-2">
          <span class="text-base">{{ successMsg.includes('approval') ? '⏳' : '✅' }}</span>
          <div>
            <strong class="block font-bold mb-0.5">
              {{ successMsg.includes('approval') ? 'Account Created — Pending Administrator Approval' : 'Registration Successful' }}
            </strong>
            {{ successMsg }}
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="authStore.error"
        class="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-xs font-medium">
        {{ authStore.error }}
      </div>

      <!-- Google Sign Up Option -->
      <div v-if="!successMsg" class="mb-5">
        <GoogleAuthButton 
          mode="signup" 
          :role="form.role" 
          @pending-approval="onPendingApproval"
          @error="onGoogleError" 
        />
      </div>

      <!-- Divider -->
      <div v-if="!successMsg" class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-slate-200"></div>
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or sign up with email</span>
        <div class="flex-1 h-px bg-slate-200"></div>
      </div>

      <form v-if="!successMsg" @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Username</label>
          <input v-model="form.username" type="text" placeholder="e.g., johndoe"
            class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 transition-all outline-none" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
          <input v-model="form.email" type="email" placeholder="you@institution.edu"
            class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 transition-all outline-none" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
          <input v-model="form.password" type="password" placeholder="At least 6 characters"
            class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 transition-all outline-none" required minlength="6" />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">I am registering as a...</label>
          <div class="flex gap-3">
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.role" value="student" class="sr-only peer" />
              <div class="p-2.5 text-center rounded-xl border border-slate-200 peer-checked:border-[#0063cf] peer-checked:bg-blue-50 peer-checked:text-[#0063cf] text-xs font-bold text-slate-700 transition-all">
                Student
              </div>
            </label>
            <label class="flex-1 cursor-pointer">
              <input type="radio" v-model="form.role" value="teacher" class="sr-only peer" />
              <div class="p-2.5 text-center rounded-xl border border-slate-200 peer-checked:border-[#0063cf] peer-checked:bg-blue-50 peer-checked:text-[#0063cf] text-xs font-bold text-slate-700 transition-all">
                Teacher / Educator
              </div>
            </label>
          </div>
          <p v-if="form.role === 'teacher'" class="text-[11px] text-amber-700 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
            ⚠️ Note: Educator registrations require approval from an institutional administrator before access is granted.
          </p>
        </div>

        <button type="submit" :disabled="authStore.loading"
          class="w-full py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-60">
          {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <div v-if="successMsg" class="mt-6">
        <RouterLink to="/login" class="w-full py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white font-bold rounded-xl text-xs shadow-xs text-center inline-block transition-colors">
          Return to Login
        </RouterLink>
      </div>

      <p v-else class="text-center text-xs text-slate-500 mt-6">
        Already have an account?
        <RouterLink to="/login" class="text-[#0063cf] hover:underline font-bold">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import GoogleAuthButton from '../components/GoogleAuthButton.vue'

const authStore = useAuthStore()
const router = useRouter()
const successMsg = ref('')

const form = reactive({ 
  username: '', 
  email: '', 
  password: '',
  role: 'student'
})

const onPendingApproval = (msg) => {
  successMsg.value = msg || 'Account created! Please wait for admin approval.'
}

const onGoogleError = (err) => {
  authStore.error = err
}

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
