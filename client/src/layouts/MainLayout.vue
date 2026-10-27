<script setup>
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <AppNavbar />
  <main><RouterView /></main>
  <AppFooter />
</template>
