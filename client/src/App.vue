<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    <main>
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
</script>
