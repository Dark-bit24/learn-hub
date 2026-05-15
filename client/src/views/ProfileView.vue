<template>
  <div class="max-w-5xl mx-auto px-4 py-10">

    <!-- Profile Header -->
    <div class="card p-8 mb-8 relative overflow-hidden">
      <!-- Background Accents -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
      
      <div class="relative flex flex-col md:flex-row items-center md:items-start gap-8">
        <!-- Avatar Section -->
        <div class="relative group">
          <div class="w-32 h-32 rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-blue-50 flex items-center justify-center">
            <img v-if="authStore.currentUser?.avatar" 
              :src="getAvatarUrl(authStore.currentUser.avatar)" 
              class="w-full h-full object-cover" 
              alt="Avatar" />
            <span v-else class="text-blue-600 font-bold text-4xl">
              {{ authStore.currentUser?.username?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <button @click="showEditModal = true" 
            class="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          </button>
        </div>

        <div class="text-center md:text-left flex-1">
          <h1 class="text-3xl font-extrabold text-slate-900 mb-1">{{ authStore.currentUser?.username }}</h1>
          <p class="text-blue-600 font-semibold mb-4">{{ authStore.currentUser?.email }}</p>
          <div class="inline-flex px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">
            {{ authStore.currentUser?.role }}
          </div>
          <p v-if="authStore.currentUser?.bio" class="text-slate-600 max-w-xl mx-auto md:mx-0 leading-relaxed">
            {{ authStore.currentUser?.bio }}
          </p>
          <p v-else class="text-slate-400 italic">No bio added yet.</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-100">
        <div class="text-center group">
          <p class="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{{ uploads.length }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Uploads</p>
        </div>
        <div class="text-center group">
          <p class="text-3xl font-black text-slate-900 group-hover:text-pink-500 transition-colors">{{ savedResources.length }}</p>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Saved</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex p-1 bg-slate-100 rounded-2xl mb-8 w-fit mx-auto md:mx-0">
      <button @click="activeTab = 'uploads'"
        :class="activeTab === 'uploads' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
        class="px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300">
        📤 My Uploads
      </button>
      <button @click="activeTab = 'saved'"
        :class="activeTab === 'saved' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
        class="px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300">
        ❤️ Saved
      </button>
    </div>

    <!-- My Uploads -->
    <transition name="fade" mode="out-in">
      <div v-if="activeTab === 'uploads'" key="uploads">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p class="text-slate-400 font-medium">Loading your resources...</p>
        </div>
        <div v-else-if="uploads.length === 0" class="card p-16 text-center bg-slate-50 border-dashed border-2 border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          </div>
          <p class="text-slate-500 font-semibold mb-6">You haven't shared any knowledge yet.</p>
          <RouterLink to="/upload" class="btn-primary px-8 py-3">Start Uploading</RouterLink>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ResourceCard v-for="r in uploads" :key="r._id" :resource="r" />
        </div>
      </div>

      <!-- Saved Resources -->
      <div v-else-if="activeTab === 'saved'" key="saved">
        <div v-if="savedResources.length === 0" class="card p-16 text-center bg-slate-50 border-dashed border-2 border-slate-200">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          </div>
          <p class="text-slate-500 font-semibold mb-6">No saved gems found.</p>
          <RouterLink to="/resources" class="btn-primary px-8 py-3">Explore Now</RouterLink>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <ResourceCard v-for="r in savedResources" :key="r._id" :resource="r" />
        </div>
      </div>
    </transition>

    <!-- Logout -->
    <div class="mt-20 pt-10 border-t border-slate-100 flex justify-center">
      <button @click="handleLogout" class="group flex items-center gap-2 text-slate-400 hover:text-rose-500 font-bold transition-all">
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        Sign Out
      </button>
    </div>

    <!-- Edit Profile Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showEditModal = false"></div>
        <div class="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <h2 class="text-2xl font-black text-slate-900 mb-6">Edit Profile</h2>
          
          <form @submit.prevent="handleUpdateProfile" class="space-y-6">
            <!-- Avatar Upload -->
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Profile Photo</label>
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
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
              <input v-model="editForm.username" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" required />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio</label>
              <textarea v-model="editForm.bio" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none" placeholder="Tell us about yourself..."></textarea>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" @click="showEditModal = false" class="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" :disabled="updating" class="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50">
                {{ updating ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
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
  @apply bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
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
  transform: scale(0.9) translateY(20px);
}
.modal-leave-to .relative {
  transform: scale(0.9) translateY(-20px);
}
</style>
