<template>
  <RouterLink :to="`/resources/${resource._id}`" class="card block p-5 group">
    <!-- Type Badge -->
    <div class="flex items-center justify-between mb-3">
      <span :class="badgeClass" class="badge text-xs font-semibold px-2.5 py-1 rounded-full">
        {{ resource.type }}
      </span>
      <span class="text-xs text-gray-400">{{ resource.views }} views</span>
    </div>

    <!-- Title -->
    <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
      {{ resource.title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-500 text-sm mb-4 line-clamp-2">{{ resource.description }}</p>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
          <span class="text-blue-600 text-xs font-bold">
            {{ resource.uploadedBy?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <span class="text-xs text-gray-500">{{ resource.uploadedBy?.username }}</span>
      </div>
      <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
        {{ resource.subject }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  resource: { type: Object, required: true }
})

const badgeClass = computed(() => {
  const colors = {
    PDF: 'bg-red-100 text-red-700',
    Video: 'bg-purple-100 text-purple-700',
    Article: 'bg-green-100 text-green-700',
    Tutorial: 'bg-yellow-100 text-yellow-700',
    Link: 'bg-blue-100 text-blue-700',
    Notes: 'bg-gray-100 text-gray-700'
  }
  return colors[props.resource.type] || 'bg-gray-100 text-gray-700'
})
</script>
