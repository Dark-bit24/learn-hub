<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="card p-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ isEditMode ? '✏️ Edit Resource' : '📤 Upload Resource' }}
      </h1>
      <p class="text-gray-500 text-sm mb-8">
        {{ isEditMode ? 'Update your learning material details' : 'Share your learning materials with the community' }}
      </p>

      <div v-if="success"
        class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
        ✅ {{ isEditMode ? 'Resource updated successfully!' : 'Resource uploaded successfully!' }}
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
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-sm font-medium text-gray-700">Description *</label>
            <span class="text-xs" :class="descriptionLength >= 20 ? 'text-gray-400' : 'text-amber-600 font-medium'">
              {{ descriptionLength }} / 2000 chars (min. 20)
            </span>
          </div>
          <textarea v-model="form.description" rows="4"
            placeholder="Provide a meaningful description explaining the core topics, concepts, and key takeaways covered in this resource..."
            class="input-field resize-none"
            :class="{'border-amber-400 focus:border-amber-500': form.description.length > 0 && !isDescriptionValid, 'border-green-500 focus:border-green-600': isDescriptionValid}"
            required maxlength="2000"></textarea>
          
          <!-- Meaningful Description Feedback -->
          <div class="mt-1.5 text-xs flex items-center justify-between">
            <span v-if="form.description.length === 0" class="text-gray-400">
              💡 Explain the key concepts so students and the AI Tutor can understand and summarize this resource.
            </span>
            <span v-else-if="!isDescriptionValid" class="text-amber-600 flex items-center gap-1 font-medium">
              ⚠️ {{ descriptionValidationError }}
            </span>
            <span v-else class="text-green-600 flex items-center gap-1 font-medium">
              ✅ Meaningful description provided
            </span>
          </div>
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
              📎 {{ currentFileName ? 'Change file' : 'Choose file' }}
            </button>
            <p class="text-gray-400 text-xs mt-1">PDF, DOC, Images — Max 10MB</p>
            <p v-if="selectedFile" class="text-green-600 text-sm mt-2 font-medium">
              ✅ New file: {{ selectedFile.name }}
            </p>
            <p v-else-if="currentFileName" class="text-gray-600 text-sm mt-2 font-medium">
              📄 Current file: <span class="text-slate-800 font-semibold">{{ currentFileName }}</span>
            </p>
          </div>
        </div>

        <button type="submit" :disabled="uploading"
          class="btn-primary w-full py-3 text-base disabled:opacity-60">
          {{ uploading ? (isEditMode ? 'Updating...' : 'Uploading...') : (isEditMode ? 'Update Resource' : 'Upload Resource') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const isEditMode = ref(false)
const editId = ref(null)
const currentFileName = ref('')

const form = reactive({ title: '', description: '', subject: '', type: '', url: '' })
const selectedFile = ref(null)
const uploading = ref(false)
const success = ref(false)
const error = ref('')
const fileInput = ref(null)

const descriptionLength = computed(() => (form.description || '').trim().length)

const descriptionValidationError = computed(() => {
  const text = (form.description || '').trim()
  if (text.length < 20) {
    return `Add ${20 - text.length} more characters to describe the core concepts.`
  }
  const words = text.split(/\s+/).filter(w => w.length > 1)
  if (words.length < 4) {
    return 'Please include at least 4 descriptive words.'
  }
  if (/(.)\1{4,}/i.test(text)) {
    return 'Avoid repeated keystrokes. Please write a clear description.'
  }
  return ''
})

const isDescriptionValid = computed(() => {
  return descriptionLength.value >= 20 && !descriptionValidationError.value
})

const subjects = ['Mathematics','Science','Technology','Programming','History','Language','Arts','Business','Other']
const types = ['PDF','Video','Article','Tutorial','Link','Notes']

onMounted(async () => {
  if (route.query.edit) {
    isEditMode.value = true
    editId.value = route.query.edit
    try {
      const { data } = await api.get(`/resources/${editId.value}`)
      form.title = data.title
      form.description = data.description
      form.subject = data.subject
      form.type = data.type
      form.url = data.url
      if (data.file) {
        currentFileName.value = data.file.split('/').pop()
      }
    } catch (err) {
      error.value = 'Failed to load resource data for editing'
      console.error(err)
    }
  }
})

const handleFile = (e) => { selectedFile.value = e.target.files[0] }

const handleSubmit = async () => {
  error.value = ''
  success.value = false

  if (!isDescriptionValid.value) {
    error.value = descriptionValidationError.value || 'Please provide a meaningful description explaining what concepts this resource covers.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    Object.keys(form).forEach(k => {
      if (form[k] !== null && form[k] !== undefined) {
        formData.append(k, form[k])
      }
    })
    
    if (selectedFile.value) {
      formData.append('file', selectedFile.value)
    }

    if (isEditMode.value) {
      const { data } = await api.put(`/resources/${editId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      success.value = true
      if (data.file) {
        currentFileName.value = data.file.split('/').pop()
        selectedFile.value = null
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      success.value = true
      Object.keys(form).forEach(k => form[k] = '')
      selectedFile.value = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (err) {
    const backendError = err.response?.data?.error || err.response?.data?.message;
    error.value = backendError || (isEditMode.value ? 'Update failed' : 'Upload failed');
  } finally {
    uploading.value = false
  }
}
</script>
