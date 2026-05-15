<template>
  <div class="min-h-screen bg-slate-50/50 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-1">
            {{ greeting }}, {{ authStore.currentUser?.username }}!
          </h1>
          <p class="text-slate-500 font-medium">{{ currentDate }} — Here's what's happening today.</p>
        </div>
        <div class="flex items-center gap-4">
          <button @click="showEditModal = true" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all font-bold text-slate-700 text-sm">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            Edit Profile
          </button>
          <RouterLink to="/upload" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all font-bold text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            New Upload
          </RouterLink>
        </div>
      </div>

      <!-- Overview Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="card p-6 flex items-center gap-5 group hover:border-blue-500/30 transition-colors">
          <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Uploads</p>
            <p class="text-3xl font-black text-slate-900">{{ uploads.length }}</p>
          </div>
        </div>
        
        <div class="card p-6 flex items-center gap-5 group hover:border-pink-500/30 transition-colors">
          <div class="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Saved Items</p>
            <p class="text-3xl font-black text-slate-900">{{ savedResources.length }}</p>
          </div>
        </div>

        <div class="card p-6 flex items-center gap-5 group hover:border-amber-500/30 transition-colors">
          <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Views</p>
            <p class="text-3xl font-black text-slate-900">{{ totalViews }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-8">
          <!-- Profile Card -->
          <div class="card overflow-hidden">
            <div class="h-20 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
            <div class="px-6 pb-8 -mt-10 text-center">
              <div class="inline-block relative">
                <div class="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-white">
                  <img v-if="authStore.currentUser?.avatar" 
                    :src="getAvatarUrl(authStore.currentUser.avatar)" 
                    class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black text-3xl">
                    {{ authStore.currentUser?.username?.charAt(0).toUpperCase() }}
                  </div>
                </div>
              </div>
              <h2 class="mt-4 text-xl font-black text-slate-900">{{ authStore.currentUser?.username }}</h2>
              <p class="text-sm font-bold text-blue-600 mb-4">{{ authStore.currentUser?.role }}</p>
              <p class="text-slate-500 text-sm leading-relaxed mb-6 px-2">
                {{ authStore.currentUser?.bio || 'No bio yet. Tell the community about yourself!' }}
              </p>
              <div class="pt-6 border-t border-slate-50">
                <button @click="handleLogout" class="text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-2 mx-auto">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3 space-y-10">
          
          <!-- Activity Tabs -->
          <div class="card p-2 w-fit mb-8">
            <div class="flex gap-1">
              <button @click="activeTab = 'uploads'"
                :class="activeTab === 'uploads' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'"
                class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                My Uploads
              </button>
              <button @click="activeTab = 'saved'"
                :class="activeTab === 'saved' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'"
                class="px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                Saved Library
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'uploads'" key="uploads">
              <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div v-for="i in 2" :key="i" class="h-64 bg-white rounded-3xl animate-pulse"></div>
              </div>
              <div v-else-if="uploads.length === 0" class="card p-20 text-center border-dashed border-2 bg-slate-50/50">
                <p class="text-slate-400 font-bold mb-4">No uploads yet</p>
                <RouterLink to="/upload" class="text-blue-600 font-black text-sm hover:underline">Click here to share your first resource →</RouterLink>
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResourceCard v-for="r in uploads" :key="r._id" :resource="r" />
              </div>
            </div>

            <div v-else-if="activeTab === 'saved'" key="saved">
              <div v-if="savedResources.length === 0" class="card p-20 text-center border-dashed border-2 bg-slate-50/50">
                <p class="text-slate-400 font-bold mb-4">Your library is empty</p>
                <RouterLink to="/resources" class="text-blue-600 font-black text-sm hover:underline">Explore featured resources →</RouterLink>
              </div>
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ResourceCard v-for="r in savedResources" :key="r._id" :resource="r" />
              </div>
            </div>
          </transition>

        </div>
      </div>

    </div>

    <!-- Edit Profile Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showEditModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
          
          <h2 class="text-2xl font-black text-slate-900 mb-6 relative">Account Settings</h2>
          
          <form @submit.prevent="handleUpdateProfile" class="space-y-6 relative">
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Avatar</label>
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img v-if="previewUrl" :src="previewUrl" class="w-full h-full object-cover" />
                  <img v-else-if="authStore.currentUser?.avatar" :src="getAvatarUrl(authStore.currentUser.avatar)" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-slate-300 font-bold">?</div>
                </div>
                <input type="file" @change="onFileChange" accept="image/*" class="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name / Username</label>
              <input v-model="editForm.username" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</label>
              <textarea v-model="editForm.bio" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none" placeholder="Share a bit about your expertise..."></textarea>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" @click="showEditModal = false" class="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" :disabled="updating" class="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50">
                {{ updating ? 'Saving...' : 'Update' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
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

// Dashboard Extras
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

const totalViews = computed(() => {
  return uploads.value.reduce((sum, r) => sum + (r.views || 0), 0)
})

// Edit Profile State
const showEditModal = ref(false)
const updating = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const editForm = reactive({
  username: authStore.currentUser?.username || '',
  bio: authStore.currentUser?.bio || ''
})

const getAvatarUrl = (path) => {
  if (!path) return null
  return `${import.meta.env.VITE_API_URL || 'https://learn-hub-x0ol.onrender.com'}${path}`
}

onMounted(async () => {
  try {
    const { data } = await api.get('/users/profile')
    uploads.value = data.uploads
    savedResources.value = data.user.savedResources || []
    
    // Update local store with latest data
    authStore.user = data.user
    localStorage.setItem('user', JSON.stringify(data.user))
    
    // Sync form
    editForm.username = data.user.username
    editForm.bio = data.user.bio
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleUpdateProfile = async () => {
  updating.value = true
  try {
    const formData = new FormData()
    formData.append('username', editForm.username)
    formData.append('bio', editForm.bio)
    if (selectedFile.value) {
      formData.append('avatar', selectedFile.value)
    }

    const { data } = await api.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    // Update store
    authStore.user = data
    localStorage.setItem('user', JSON.stringify(data))
    
    showEditModal.value = false
    previewUrl.value = null
    selectedFile.value = null
    alert('Profile updated successfully!')
  } catch (err) {
    console.error(err)
    alert('Failed to update profile')
  } finally {
    updating.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.card {
  @apply bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-white;
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.modal-enter-active, .modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative, .modal-leave-active .relative {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-enter-from .relative {
  transform: scale(0.95) translateY(20px);
}
.modal-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}
</style>
