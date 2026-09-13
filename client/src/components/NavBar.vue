<template>
  <nav class="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 transition-all shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">

        <!-- Logo with Gradient Shield & Modern Font -->
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div>
            <span class="font-extrabold text-slate-900 text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text">LearnHub</span>
            <span class="hidden sm:inline-block ml-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Platform</span>
          </div>
        </RouterLink>

        <!-- Navigation Links with Pill Style -->
        <div class="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <RouterLink to="/"
            class="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-200"
            active-class="!text-blue-600 !bg-white !shadow-sm">
            Home
          </RouterLink>
          <RouterLink to="/resources"
            class="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-200"
            active-class="!text-blue-600 !bg-white !shadow-sm">
            Explore Resources
          </RouterLink>
          <RouterLink v-if="authStore.isLoggedIn" to="/upload"
            class="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all duration-200"
            active-class="!text-blue-600 !bg-white !shadow-sm">
            Upload Notes
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin"
            class="px-4 py-1.5 rounded-xl text-xs font-semibold text-purple-700 hover:text-purple-900 hover:bg-white/80 transition-all duration-200"
            active-class="!text-purple-700 !bg-white !shadow-sm">
            Admin Workspace
          </RouterLink>
        </div>

        <!-- Auth & Action Buttons -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.isLoggedIn">
            <RouterLink to="/profile"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {{ authStore.currentUser?.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-xs font-bold text-slate-800 leading-tight">{{ authStore.currentUser?.username }}</p>
                <p class="text-[10px] text-slate-500 capitalize leading-tight">{{ authStore.currentUser?.role || 'Member' }}</p>
              </div>
            </RouterLink>
            <button @click="handleLogout"
              class="text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
              Sign Out
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-xs font-bold text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all">
              Log In
            </RouterLink>
            <RouterLink to="/register" class="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
              Get Started Free
            </RouterLink>
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
