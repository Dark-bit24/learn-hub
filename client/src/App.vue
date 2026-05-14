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
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import API from "./api";

onMounted(async () => {
  try {
    const res = await API.get("/");
    console.log("Backend response:", res.data);
  } catch (err) {
    console.log("Error:", err);
  }
})
</script>
