<template>
  <div class="w-full">
    <!-- Google Auth Button -->
    <button
      type="button"
      @click="handleGoogleClick"
      :disabled="authStore.loading"
      class="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:border-slate-400"
    >
      <!-- Google Logo SVG -->
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>{{ buttonText }}</span>
    </button>

    <!-- Interactive Google Sign-In Dialog -->
    <transition name="modal-fade">
      <div v-if="showModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" @click="showModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden border border-slate-200">
          
          <!-- Dialog Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <h3 class="text-sm font-bold text-slate-800">Sign in with Google</h3>
            </div>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 p-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Dialog Body -->
          <div class="py-4 space-y-4">
            <p class="text-xs text-slate-600 leading-relaxed">
              Connect your Google Workspace or Gmail identity to access LearnHub instantly.
            </p>

            <form @submit.prevent="submitGoogleAuth" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Google Email Address</label>
                <input
                  v-model="googleEmail"
                  type="email"
                  placeholder="name@gmail.com"
                  required
                  class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Display Name</label>
                <input
                  v-model="googleName"
                  type="text"
                  placeholder="e.g., Alex Johnson"
                  required
                  class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 transition-all outline-none"
                />
              </div>

              <div v-if="mode === 'signup'">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Account Role</label>
                <div class="grid grid-cols-2 gap-2">
                  <label class="cursor-pointer">
                    <input type="radio" v-model="selectedRole" value="student" class="sr-only peer" />
                    <div class="p-2 text-center rounded-lg border border-slate-200 peer-checked:border-[#0063cf] peer-checked:bg-blue-50 peer-checked:text-[#0063cf] text-xs font-bold text-slate-700 transition-all">
                      Student
                    </div>
                  </label>
                  <label class="cursor-pointer">
                    <input type="radio" v-model="selectedRole" value="teacher" class="sr-only peer" />
                    <div class="p-2 text-center rounded-lg border border-slate-200 peer-checked:border-[#0063cf] peer-checked:bg-blue-50 peer-checked:text-[#0063cf] text-xs font-bold text-slate-700 transition-all">
                      Teacher
                    </div>
                  </label>
                </div>
                <p v-if="selectedRole === 'teacher'" class="text-[11px] text-amber-600 mt-1">
                  ⚠️ Teacher accounts require administrator approval before access is enabled.
                </p>
              </div>

              <!-- Quick Demo Account Options -->
              <div class="pt-2 border-t border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Quick Select Account:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    @click="fillQuickAccount('student.alex@gmail.com', 'Alex Johnson', 'student')"
                    class="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                  >
                    Alex (Student)
                  </button>
                  <button
                    type="button"
                    @click="fillQuickAccount('prof.sarah@gmail.com', 'Prof. Sarah Mitchell', 'teacher')"
                    class="text-[11px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors"
                  >
                    Sarah (Teacher)
                  </button>
                </div>
              </div>

              <div class="pt-3 flex gap-2">
                <button
                  type="button"
                  @click="showModal = false"
                  class="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="authStore.loading"
                  class="flex-1 py-2 text-xs font-bold text-white bg-[#0063cf] hover:bg-[#0051ab] rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {{ authStore.loading ? 'Authenticating...' : 'Authorize' }}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  mode: {
    type: String,
    default: 'login' // 'login' or 'signup'
  },
  role: {
    type: String,
    default: 'student'
  }
})

const emit = defineEmits(['success', 'pending-approval', 'error'])

const router = useRouter()
const authStore = useAuthStore()

const showModal = ref(false)
const googleEmail = ref('')
const googleName = ref('')
const selectedRole = ref(props.role || 'student')

const buttonText = computed(() => {
  return props.mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'
})

const handleGoogleClick = () => {
  // If GIS is mounted with a real client ID in the future, it can prompt.
  // Otherwise, open the interactive Google authorization dialog.
  showModal.value = true
}

const fillQuickAccount = (email, name, role) => {
  googleEmail.value = email
  googleName.value = name
  selectedRole.value = role
}

const submitGoogleAuth = async () => {
  if (!googleEmail.value) return

  const payload = {
    email: googleEmail.value,
    name: googleName.value || googleEmail.value.split('@')[0],
    role: selectedRole.value,
    picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName.value || googleEmail.value)}`
  }

  const result = await authStore.loginWithGoogle(payload)
  showModal.value = false

  if (result.success) {
    if (result.pendingApproval) {
      emit('pending-approval', result.message)
    } else {
      emit('success', result.user)
      router.push('/')
    }
  } else {
    emit('error', result.message || 'Google authentication failed')
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
