<template>
  <div class="min-h-screen bg-[#f4f6fc] font-sans pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0063cf] text-xs font-bold mb-2">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Official Administrative Portal
          </div>
          <h1 class="text-3xl font-extrabold text-[#090e40] tracking-tight">
            Institutional Administration & Oversight
          </h1>
          <p class="text-xs text-slate-500 mt-1">Review educator credential applications, manage registered accounts, and audit public repository documents.</p>
        </div>

        <div class="flex items-center gap-3">
          <button v-if="activeTab === 'users'" @click="showAddUserModal = true" class="px-4 py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Provision User Account
          </button>
          <button v-if="activeTab === 'resources'" @click="showUploadModal = true" class="px-4 py-2.5 bg-[#0063cf] hover:bg-[#0051ab] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Upload New Document
          </button>
        </div>
      </div>

      <!-- Error Notice -->
      <div v-if="loadError" class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700 font-medium">
        <div class="flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ loadError }}</span>
        </div>
        <button @click="fetchData" class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors">
          Retry
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4 text-xs text-slate-500 font-semibold flex items-center justify-center gap-2">
        <span class="w-3 h-3 border-2 border-[#0063cf] border-t-transparent rounded-full animate-spin"></span>
        Syncing official records...
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block">Pending Applications</span>
            <span class="text-2xl font-extrabold text-[#090e40]">{{ pendingTeachers.length }}</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-50 text-[#0063cf] flex items-center justify-center font-bold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block">Catalogued Documents</span>
            <span class="text-2xl font-extrabold text-[#090e40]">{{ allResources.length }}</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-500 block">Registered Accounts</span>
            <span class="text-2xl font-extrabold text-[#090e40]">{{ allUsers.length }}</span>
          </div>
        </div>
      </div>

      <!-- Segmented Control (Tabs) -->
      <div class="flex p-1 bg-white rounded-xl border border-slate-200 w-fit shadow-xs">
        <button @click="activeTab = 'accounts'" 
          class="px-5 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTab === 'accounts' ? 'text-white bg-[#0063cf] shadow-xs' : 'text-slate-600 hover:text-slate-900'">
          Teacher Applications
          <span v-if="pendingTeachers.length" class="ml-2 bg-amber-400 text-slate-950 font-extrabold py-0.5 px-2 rounded-full text-[10px]">{{ pendingTeachers.length }}</span>
        </button>
        <button @click="activeTab = 'resources'" 
          class="px-5 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTab === 'resources' ? 'text-white bg-[#0063cf] shadow-xs' : 'text-slate-600 hover:text-slate-900'">
          Published Documents
          <span class="ml-2 py-0.5 px-2 rounded-full text-[10px]" :class="activeTab === 'resources' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">{{ allResources.length }}</span>
        </button>
        <button @click="activeTab = 'users'" 
          class="px-5 py-2 text-xs font-bold rounded-lg transition-all"
          :class="activeTab === 'users' ? 'text-white bg-[#0063cf] shadow-xs' : 'text-slate-600 hover:text-slate-900'">
          Registered Users
          <span class="ml-2 py-0.5 px-2 rounded-full text-[10px]" :class="activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'">{{ allUsers.length }}</span>
        </button>
      </div>

      <!-- Content Area with Transition -->
      <transition name="fade-slide" mode="out-in">
        <!-- Account Requests Tab -->
        <div v-if="activeTab === 'accounts'" key="accounts" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div v-if="pendingTeachers.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h4 class="text-sm font-bold text-[#090e40]">No Pending Applications</h4>
            <p class="text-xs text-slate-500 mt-0.5">All educator credential submissions have been approved or processed.</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Applicant Profile</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Official Email</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Submission Date</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Review Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="teacher in pendingTeachers" :key="teacher._id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg bg-blue-50 text-[#0063cf] flex items-center justify-center font-bold text-xs border border-blue-200">
                        {{ teacher.username?.charAt(0).toUpperCase() || '?' }}
                      </div>
                      <div class="font-bold text-slate-800 text-sm">{{ teacher.username || 'No Name' }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600 text-xs font-medium">{{ teacher.email }}</td>
                  <td class="px-6 py-4 text-slate-500 text-xs">{{ formatDate(teacher.createdAt) }}</td>
                  <td class="px-6 py-4 text-right space-x-2">
                    <button @click="handleApprove(teacher._id)" 
                      class="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all">
                      Grant Educator Status
                    </button>
                    <button @click="handleDeclineTeacher(teacher._id)" 
                      class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 rounded-lg shadow-xs transition-all">
                      Decline
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Resources Tab -->
        <div v-else-if="activeTab === 'resources'" key="resources" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div v-if="allResources.length === 0" class="flex flex-col items-center justify-center py-20 px-4">
            <div class="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h4 class="text-sm font-bold text-[#090e40]">No Documents Catalogued</h4>
            <p class="text-xs text-slate-500 mt-0.5">The platform repository is currently empty.</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Document Details</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contributor</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Format</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Administrative Controls</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="resource in allResources" :key="resource._id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-bold text-[#090e40] text-sm mb-0.5">{{ resource.title }}</div>
                    <div class="text-[10px] font-bold text-[#0063cf] bg-blue-50 border border-blue-200 inline-flex px-2 py-0.5 rounded">
                      {{ resource.subject }}
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {{ resource.uploadedBy?.username?.charAt(0).toUpperCase() || '?' }}
                      </div>
                      <span class="text-slate-700 text-xs font-medium">{{ resource.uploadedBy?.username || 'Unknown Contributor' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                      {{ resource.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button v-if="resource.file" @click="openPreview(resource)" 
                      class="text-xs font-bold text-[#0063cf] hover:text-[#0051ab] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 transition-colors">
                      Preview
                    </button>
                    <a v-if="resource.file" :href="`${BASE_URL}/api/resources/${resource._id}/download`" download
                      class="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 transition-colors inline-block">
                      Download
                    </a>
                    <button @click="handleDeleteResource(resource._id)" 
                      class="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 transition-colors">
                      Permanently Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-else-if="activeTab === 'users'" key="users" class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">User Account</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Access Clearance</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Account State</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="user in allUsers" :key="user._id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border"
                        :class="user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'">
                        {{ user.username?.charAt(0).toUpperCase() || '?' }}
                      </div>
                      <div>
                        <div class="font-bold text-[#090e40] text-sm">{{ user.username || 'No Name' }}</div>
                        <div class="text-xs text-slate-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="roleClass(user.role)" class="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div v-if="user.isApproved" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                    </div>
                    <div v-else class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                      <span class="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Pending Approval
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button @click="handleDeleteUser(user._id)" 
                      class="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-3 py-1 rounded border border-rose-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      :disabled="user._id === authStore.currentUser?._id">
                      Delete Account
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>

      <!-- Add User Modal -->
      <transition name="modal-fade">
        <div v-if="showAddUserModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" @click="showAddUserModal = false"></div>
          <div class="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h2 class="text-base font-bold text-[#090e40]">Provision User Account</h2>
                <p class="text-xs text-slate-500 mt-0.5">Register a student, educator, or institutional administrator.</p>
              </div>
              <button @click="showAddUserModal = false" class="text-slate-400 hover:text-slate-600 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form @submit.prevent="handleAddUser" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Username</label>
                <input v-model="newUser.username" type="text" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="e.g. j_doe" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                <input v-model="newUser.email" type="email" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="e.g. j_doe@institution.edu" required />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Initial Password</label>
                <input v-model="newUser.password" type="password" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="••••••••" required minlength="6" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Clearance Role</label>
                <div class="relative">
                  <select v-model="newUser.role" class="w-full appearance-none bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold transition-all outline-none cursor-pointer">
                    <option value="student">Student</option>
                    <option value="teacher">Educator / Teacher</option>
                    <option value="admin">System Administrator</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              
              <div class="flex gap-3 pt-3 border-t border-slate-200">
                <button type="button" @click="showAddUserModal = false" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0063cf] hover:bg-[#0051ab] shadow-xs transition-all">Authorize Account</button>
              </div>
            </form>
          </div>
        </div>
      </transition>

      <!-- Upload Document Modal (Admin Direct) -->
      <transition name="modal-fade">
        <div v-if="showUploadModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" @click="showUploadModal = false"></div>
          <div class="relative bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div class="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div>
                <h2 class="text-base font-bold text-[#090e40]">Upload Institutional Document</h2>
                <p class="text-xs text-slate-500 mt-0.5">Catalog a verified syllabus, lecture note, or learning resource.</p>
              </div>
              <button @click="showUploadModal = false" class="text-slate-400 hover:text-slate-600 p-1">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form @submit.prevent="handleUploadResource" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Title</label>
                <input v-model="newResource.title" type="text" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="e.g., Advanced Calculus Lecture Notes" required />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                  <select v-model="newResource.subject" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold transition-all outline-none cursor-pointer">
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="Programming">Programming</option>
                    <option value="History">History</option>
                    <option value="Language">Language</option>
                    <option value="Arts">Arts</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Format Type</label>
                  <select v-model="newResource.type" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold transition-all outline-none cursor-pointer">
                    <option value="PDF">PDF Document</option>
                    <option value="Notes">Handwritten / Typed Notes</option>
                    <option value="Article">Article</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Video">Video Guide</option>
                    <option value="Link">Web Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Meaningful Description (Min 20 characters)</label>
                <textarea v-model="newResource.description" rows="3" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="Provide a comprehensive summary of key formulas, principles, or syllabus units covered..." required minlength="20"></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attach File (PDF, DOCX, TXT, Image - Max 10MB)</label>
                <input type="file" @change="handleFileChange" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0063cf] file:text-white hover:file:bg-[#0051ab] cursor-pointer" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">External Link / URL (Optional)</label>
                <input v-model="newResource.url" type="url" class="w-full bg-slate-50 border border-slate-200 focus:border-[#0063cf] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 transition-all outline-none" placeholder="https://..." />
              </div>
              
              <div class="flex gap-3 pt-3 border-t border-slate-200">
                <button type="button" @click="showUploadModal = false" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" :disabled="uploadLoading" class="flex-1 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#0063cf] hover:bg-[#0051ab] shadow-xs transition-all disabled:opacity-50">
                  {{ uploadLoading ? 'Publishing...' : 'Upload & Catalog' }}
                </button>
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
import api, { BASE_URL } from '../services/api'
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

// Upload Document state (Admin)
const showUploadModal = ref(false)
const uploadLoading = ref(false)
const newResource = reactive({
  title: '',
  subject: 'Programming',
  type: 'PDF',
  description: '',
  url: '',
  file: null
})

const handleFileChange = (e) => {
  newResource.file = e.target.files[0] || null
}

// Preview state
const showPreview = ref(false)
const selectedResource = ref(null)

const loadError = ref('')

const fetchData = async () => {
  loading.value = true
  loadError.value = ''
  try {
    // If not marked as admin locally, sync with backend
    if (!authStore.isAdmin) {
      await authStore.fetchCurrentUser()
    }

    const results = await Promise.allSettled([
      api.get('/admin/pending-teachers'),
      api.get('/admin/resources'),
      api.get('/admin/users')
    ])

    const [teachersRes, resourcesRes, usersRes] = results

    if (teachersRes.status === 'fulfilled') {
      pendingTeachers.value = teachersRes.value.data || []
    } else {
      console.warn('Pending teachers fetch warning:', teachersRes.reason?.message)
    }

    if (resourcesRes.status === 'fulfilled') {
      allResources.value = resourcesRes.value.data || []
    } else {
      console.warn('Resources fetch warning:', resourcesRes.reason?.message)
    }

    if (usersRes.status === 'fulfilled') {
      allUsers.value = usersRes.value.data || []
    } else {
      console.warn('Users fetch warning:', usersRes.reason?.message)
    }

    // If all requests were rejected, check for authorization failure
    if (teachersRes.status === 'rejected' && resourcesRes.status === 'rejected' && usersRes.status === 'rejected') {
      const errReason = teachersRes.reason?.response?.data?.message || 'Access denied. Please confirm your administrator credentials.'
      loadError.value = errReason
    }
  } catch (err) {
    console.error('Failed to fetch admin data', err)
    loadError.value = err.response?.data?.message || 'Failed to connect to administrative workspace services.'
  } finally {
    loading.value = false
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

const handleDeclineTeacher = async (id) => {
  if (!confirm('Decline and remove this educator application?')) return
  try {
    await api.delete(`/admin/users/${id}`)
    await fetchData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to decline educator application')
  }
}

const handleUploadResource = async () => {
  if (newResource.description.trim().length < 20) {
    alert('Please provide a meaningful description of at least 20 characters.')
    return
  }

  uploadLoading.value = true
  try {
    const formData = new FormData()
    formData.append('title', newResource.title)
    formData.append('subject', newResource.subject)
    formData.append('type', newResource.type)
    formData.append('description', newResource.description)
    if (newResource.url) formData.append('url', newResource.url)
    if (newResource.file) formData.append('file', newResource.file)

    await api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    showUploadModal.value = false
    // Reset resource form
    newResource.title = ''
    newResource.subject = 'Programming'
    newResource.type = 'PDF'
    newResource.description = ''
    newResource.url = ''
    newResource.file = null

    await fetchData()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to upload document')
  } finally {
    uploadLoading.value = false
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
/* Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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
