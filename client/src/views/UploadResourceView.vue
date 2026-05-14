<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="card p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">📤 Upload Resource</h1>
      <p class="text-gray-500 text-sm mb-8">Share your learning materials with the community</p>

      <div v-if="success"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
        ✅ Resource uploaded successfully!
        <RouterLink to="/resources" class="underline ml-1">View Resources</RouterLink>
      </div>

      <div v-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
          <input v-model="form.title" type="text" placeholder="e.g. Introduction to Calculus Notes"
            class="input-field" required maxlength="100" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
          <textarea v-model="form.description" rows="4"
            placeholder="Describe what this resource covers..."
            class="input-field resize-none" required></textarea>
        </div>

        <!-- Subject + Type -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
            <select v-model="form.subject" class="input-field" required>
              <option value="">Select subject</option>
              <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
            <select v-model="form.type" class="input-field" required>
              <option value="">Select type</option>
              <option v-for="t in types" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
        </div>

        <!-- URL -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">External URL (optional)</label>
          <input v-model="form.url" type="url" placeholder="https://example.com/resource"
            class="input-field" />
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Upload File (optional)</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input type="file" @change="handleFile" accept=".pdf,.doc,.docx,.txt,.png,.jpg"
              class="hidden" ref="fileInput" />
            <button type="button" @click="$refs.fileInput.click()"
              class="text-blue-600 font-medium hover:underline text-sm">
              📎 Choose file
            </button>
            <p class="text-gray-400 text-xs mt-1">PDF, DOC, Images — Max 10MB</p>
            <p v-if="selectedFile" class="text-green-600 text-sm mt-2 font-medium">
              ✅ {{ selectedFile.name }}
            </p>
          </div>
        </div>

        <button type="submit" :disabled="uploading"
          class="btn-primary w-full py-3 text-base disabled:opacity-60">
          {{ uploading ? 'Uploading...' : 'Upload Resource' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import api from '../services/api'

const form = reactive({ title: '', description: '', subject: '', type: '', url: '' })
const selectedFile = ref(null)
const uploading = ref(false)
const success = ref(false)
const error = ref('')
const fileInput = ref(null)

const subjects = ['Mathematics','Science','Technology','Programming','History','Language','Arts','Business','Other']
const types = ['PDF','Video','Article','Tutorial','Link','Notes']

const handleFile = (e) => { selectedFile.value = e.target.files[0] }

const handleSubmit = async () => {
  uploading.value = true
  error.value = ''
  success.value = false
  try {
    const formData = new FormData()
    Object.keys(form).forEach(k => formData.append(k, form[k]))
    if (selectedFile.value) formData.append('file', selectedFile.value)

    await api.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    success.value = true
    Object.keys(form).forEach(k => form[k] = '')
    selectedFile.value = null
  } catch (err) {
    error.value = err.response?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>
