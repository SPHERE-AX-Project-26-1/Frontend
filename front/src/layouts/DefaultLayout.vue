<template>
  <div class="min-h-screen flex flex-col bg-[#F9FCFF]">
    <Header />

    <div class="flex-1">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import Header from '../components/common/Header.vue'
</script>
