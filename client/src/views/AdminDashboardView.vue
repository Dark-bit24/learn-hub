<template>
  <div class="relative min-h-screen bg-slate-50 overflow-hidden font-sans pb-20">
    <!-- Animated Background Orbs -->
    <div class="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
    <div class="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>

    <div class="relative max-w-7xl mx-auto px-6 py-12 z-10">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight mb-2">
            Admin Workspace
          </h1>
          <p class="text-slate-500 font-medium">Manage teacher requests, monitor users, and curate platform resources.</p>
        </div>
      </div>

      <!-- Segmented Control (Tabs) -->
      <div class="flex p-1 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/80 w-fit mb-10 relative z-20">
        <button @click="activeTab = 'accounts'" 
          class="relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out"
          :class="activeTab === 'accounts' ? 'text-indigo-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'">
          Account Requests
          <span v-if="pendingTeachers.length" class="ml-2 bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">{{ pendingTeachers.length }}</span>
        </button>
        <button @click="activeTab = 'resources'" 
          class="relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out"
          :class="activeTab === 'resources' ? 'text-indigo-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'">
          All Resources
          <span class="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{{ allResources.length }}</span>
        </button>
        <button @click="activeTab = 'users'" 
          class="relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ease-out"
          :class="activeTab === 'users' ? 'text-indigo-700 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'">
          All Users
          <span class="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">{{ allUsers.length }}</span>
        </button>
      </div>

      <!-- Content Area with Transition -->
      <transition name="fade-slide" mode="out-in">
        <!-- Account Requests Tab -->
        <div v-if="activeTab === 'accounts'" key="accounts" class="glass-panel">
          <div v-if="pendingTeachers.length === 0" class="flex flex-col items-center justify-center py-24 px-4">
            <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p class="text-slate-500 font-medium">You're all caught up! No pending requests.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200/50">
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher Profile</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested On</th>
                  <th class="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/50">
                <tr v-for="teacher in pendingTeachers" :key="teacher._id" class="group hover:bg-white/50 transition-colors duration-200">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                        {{ teacher.username.charAt(0).toUpperCase() }}
                      </div>
                      <div class="font-semibold text-slate-800">{{ teacher.username }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-500 font-medium">{{ teacher.email }}</td>
                  <td class="px-6 py-4 text-slate-400 text-sm">{{ formatDate(teacher.createdAt) }}</td>
                  <td class="px-6 py-4 text-right">
                    <button @click="handleApprove(teacher._id)" 
                      class="relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                      Approve
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resources Tab -->
        <div v-else-if="activeTab === 'resources'" key="resources" class="glass-panel">
          <div v-if="allResources.length === 0" class="flex flex-col items-center justify-center py-24 px-4">
            <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <p class="text-slate-500 font-medium">Platform is currently empty. No resources found.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200/50">
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Resource Details</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Author</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/50">
                <tr v-for="resource in allResources" :key="resource._id" class="group hover:bg-white/50 transition-colors duration-200">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800 mb-0.5">{{ resource.title }}</div>
                    <div class="text-xs font-medium text-indigo-500/80 bg-indigo-50 inline-flex px-2 py-0.5 rounded-md">{{ resource.subject }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                        {{ resource.uploadedBy?.username?.charAt(0).toUpperCase() || '?' }}
                      </div>
                      <span class="text-slate-600 font-medium text-sm">{{ resource.uploadedBy?.username || 'Unknown' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200/50">
                      {{ resource.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
                    <button v-if="resource.file" @click="openPreview(resource)" 
                      class="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View
                    </button>
                    <button @click="handleDeleteResource(resource._id)" 
                      class="text-sm font-semibold text-rose-500 hover:text-rose-700 transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-else-if="activeTab === 'users'" key="users">
          <div class="flex justify-end mb-6">
            <button @click="showAddUserModal = true" class="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl shadow-lg hover:shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
              Add New User
            </button>
          </div>

          <div class="glass-panel overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200/50">
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100/50">
                <tr v-for="user in allUsers" :key="user._id" class="group hover:bg-white/50 transition-colors duration-200">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm"
                        :class="user.role === 'admin' ? 'bg-gradient-to-br from-purple-100 to-fuchsia-100 text-purple-700' : 'bg-gradient-to-br from-slate-100 to-gray-200 text-slate-700'">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="font-semibold text-slate-800">{{ user.username }}</div>
                        <div class="text-xs font-medium text-slate-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="roleClass(user.role)" class="text-[10px] uppercase font-bold px-3 py-1 rounded-full border shadow-sm">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="user.isApproved" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Active
                    </div>
                    <div v-else class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Pending
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button @click="handleDeleteUser(user._id)" 
                      class="text-sm font-semibold text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      :disabled="user._id === authStore.currentUser?._id">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>

      <!-- Add User Modal (Glassmorphic) -->
      <transition name="modal-fade">
        <div v-if="showAddUserModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showAddUserModal = false"></div>
          <div class="relative bg-white/90 backdrop-blur-xl border border-white rounded-3xl shadow-2xl shadow-indigo-900/20 w-full max-w-md p-8 overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-[64px] opacity-70 -translate-y-1/2 translate-x-1/2"></div>
            
            <h2 class="text-2xl font-extrabold text-slate-800 mb-6 relative z-10">Invite New User</h2>
            
            <form @submit.prevent="handleAddUser" class="space-y-5 relative z-10">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Username</label>
                <input v-model="newUser.username" type="text" class="w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 transition-all outline-none shadow-sm" placeholder="johndoe123" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input v-model="newUser.email" type="email" class="w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 transition-all outline-none shadow-sm" placeholder="john@example.com" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Temporary Password</label>
                <input v-model="newUser.password" type="password" class="w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-slate-800 font-medium placeholder-slate-400 transition-all outline-none shadow-sm" placeholder="••••••••" required minlength="6" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">System Role</label>
                <div class="relative">
                  <select v-model="newUser.role" class="w-full appearance-none bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-3 text-slate-800 font-medium transition-all outline-none shadow-sm cursor-pointer">
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-4 mt-8 pt-4 border-t border-slate-100">
                <button type="button" @click="showAddUserModal = false" class="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      </transition>

      <!-- Preview Modal -->
      <NotePreviewModal 
        :is-open="showPreview" 
        :title="selectedResource?.title" 
        :file-url="selectedResource?.file" 
        :type="selectedResource?.type"
        @close="showPreview = false"
      />

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import NotePreviewModal from '../components/NotePreviewModal.vue'

const authStore = useAuthStore()
const activeTab = ref('accounts')
const pendingTeachers = ref([])
const allResources = ref([])
const allUsers = ref([])
const loading = ref(false)

// Add User state
const showAddUserModal = ref(false)
const newUser = reactive({
  username: '',
  email: '',
  password: '',
  role: 'student'
})

// Preview state
const showPreview = ref(false)
const selectedResource = ref(null)

const fetchData = async () => {
  try {
    const [teachersRes, resourcesRes, usersRes] = await Promise.all([
      api.get('/admin/pending-teachers'),
      api.get('/admin/resources'),
      api.get('/admin/users')
    ])
    pendingTeachers.value = teachersRes.data
    allResources.value = resourcesRes.data
    allUsers.value = usersRes.data
  } catch (err) {
    console.error('Failed to fetch admin data', err)
  }
}

onMounted(fetchData)

const handleApprove = async (id) => {
  if (!confirm('Approve this teacher account?')) return
  try {
    await api.put(`/admin/approve-teacher/${id}`)
    await fetchData()
  } catch (err) {
    alert('Failed to approve account')
  }
}

const handleDeleteResource = async (id) => {
  if (!confirm('Permanently delete this resource?')) return
  try {
    await api.delete(`/admin/resources/${id}`)
    await fetchData()
  } catch (err) {
    alert('Failed to delete resource')
  }
}

const handleDeleteUser = async (id) => {
  if (!confirm('Permanently delete this user account?')) return
  try {
    await api.delete(`/admin/users/${id}`)
    await fetchData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete user')
  }
}

const handleAddUser = async () => {
  try {
    await api.post('/admin/users', newUser)
    showAddUserModal.value = false
    // Reset form
    newUser.username = ''
    newUser.email = ''
    newUser.password = ''
    newUser.role = 'student'
    await fetchData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to create user')
  }
}

const openPreview = (resource) => {
  selectedResource.value = resource
  showPreview.value = true
}

const roleClass = (role) => {
  switch (role) {
    case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'teacher': return 'bg-blue-50 text-blue-700 border-blue-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

const formatDate = (d) => new Date(d).toLocaleDateString()
</script>

<style scoped>
.glass-panel {
  @apply bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-indigo-100/50 rounded-3xl p-2 sm:p-6;
}

/* Animations */
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.modal-fade-enter-from .relative {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.modal-fade-leave-to .relative {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
</style>
