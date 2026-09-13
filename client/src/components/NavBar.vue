<template>
  <header class="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
    <!-- Top Institutional Utility Bar -->
    <div class="bg-[#090e40] text-slate-300 text-[11px] py-1 px-4 sm:px-8 border-b border-slate-800">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="inline-block w-1.5 h-1.5 rounded-full bg-[#0099e8]"></span>
          <span class="font-medium tracking-wide">National Academic & Educational Materials Repository</span>
        </div>
        <div class="hidden sm:flex items-center gap-4 text-slate-300">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3 text-[#0099e8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            Support: 24/7 Helpline
          </span>
          <span>|</span>
          <span class="font-semibold text-white">English (EN)</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">

        <!-- Institutional Logo -->
        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-lg bg-[#0063cf] flex items-center justify-center text-white shadow-xs">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v18"></path>
              <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3H12v18H8.5A3.5 3.5 0 0 1 5 17.5v-11z"></path>
              <path d="M19 6.5A3.5 3.5 0 0 0 15.5 3H12v18h3.5A3.5 3.5 0 0 0 19 17.5v-11z"></path>
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-[#090e40] text-lg tracking-tight">LearnHub</span>
              <span class="text-[10px] font-bold text-[#0063cf] bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded uppercase">Portal</span>
            </div>
            <p class="text-[10px] text-slate-500 font-medium tracking-wider uppercase leading-none">Public Learning Directory</p>
          </div>
        </RouterLink>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium">
          <RouterLink to="/"
            class="text-slate-600 hover:text-[#0063cf] py-5 border-b-2 border-transparent transition-colors"
            active-class="!text-[#0063cf] !border-[#0063cf] font-semibold">
            Home
          </RouterLink>
          <RouterLink to="/resources"
            class="text-slate-600 hover:text-[#0063cf] py-5 border-b-2 border-transparent transition-colors"
            active-class="!text-[#0063cf] !border-[#0063cf] font-semibold">
            All Services & Resources
          </RouterLink>
          <RouterLink v-if="authStore.isLoggedIn" to="/upload"
            class="text-slate-600 hover:text-[#0063cf] py-5 border-b-2 border-transparent transition-colors"
            active-class="!text-[#0063cf] !border-[#0063cf] font-semibold">
            Upload Document
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin"
            class="text-slate-600 hover:text-[#0063cf] py-5 border-b-2 border-transparent transition-colors"
            active-class="!text-[#0063cf] !border-[#0063cf] font-semibold">
            Admin Workspace
          </RouterLink>
        </nav>

        <!-- Auth & Actions -->
        <div class="flex items-center gap-3">
          <template v-if="authStore.isLoggedIn">
            <RouterLink to="/profile"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <div class="w-7 h-7 rounded-full bg-[#0063cf] text-white flex items-center justify-center text-xs font-bold">
                {{ authStore.currentUser?.username?.charAt(0).toUpperCase() }}
              </div>
              <div class="hidden sm:block text-left">
                <span class="text-xs font-semibold text-slate-800 block leading-tight">{{ authStore.currentUser?.username }}</span>
                <span class="text-[10px] text-slate-500 capitalize">{{ authStore.currentUser?.role || 'Citizen' }}</span>
              </div>
            </RouterLink>
            <button @click="handleLogout"
              class="text-xs font-semibold text-slate-600 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-colors">
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-xs font-semibold text-slate-700 hover:text-[#0063cf] px-3.5 py-2 transition-colors">
              Sign In
            </RouterLink>
            <RouterLink to="/register" class="text-xs font-semibold text-white bg-[#0063cf] hover:bg-[#0051ab] px-4 py-2 rounded-lg transition-colors shadow-xs">
              Register Account
            </RouterLink>
          </template>
        </div>

      </div>
    </div>
  </header>
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
