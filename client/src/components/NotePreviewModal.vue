<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
    <div class="bg-white w-full h-full flex flex-col overflow-hidden">
      
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
          <p class="text-sm text-gray-500">{{ type }} File</p>
        </div>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="text-2xl leading-none">&times;</span>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="flex-1 bg-gray-50 overflow-auto p-4 flex items-center justify-center">
        <!-- PDF Viewer -->
        <iframe v-if="isPdf" 
          :src="`${BASE_URL}${fileUrl}#toolbar=0`" 
          class="w-full h-full rounded-lg shadow-sm border border-gray-200"
          frameborder="0">
        </iframe>

        <!-- Image Viewer -->
        <img v-else-if="isImage" 
          :src="`${BASE_URL}${fileUrl}`" 
          class="max-w-full max-h-full object-contain rounded-lg shadow-sm" 
          alt="Note preview" />

        <!-- Fallback -->
        <div v-else class="text-center">
          <div class="text-6xl mb-4">📄</div>
          <p class="text-gray-500">Preview not available for this file type.</p>
          <a :href="`${BASE_URL}/api/resources/${resourceId}/download`" class="btn-primary mt-4 inline-block">
            Download to View
          </a>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button @click="$emit('close')" class="btn-secondary">Close</button>
        <a :href="`${BASE_URL}/api/resources/${resourceId}/download`" class="btn-primary">
          Download File
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BASE_URL } from '../services/api'

const props = defineProps({
  isOpen: Boolean,
  title: String,
  fileUrl: String,
  type: String,
  resourceId: String
})

defineEmits(['close'])

const isPdf = computed(() => props.fileUrl?.toLowerCase().endsWith('.pdf'))
const isImage = computed(() => {
  const ext = props.fileUrl?.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
})
</script>
