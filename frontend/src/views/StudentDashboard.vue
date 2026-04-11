<script setup>
const user = JSON.parse(localStorage.getItem("user"));
</script>

<template>
  <div class="p-8 bg-gray-900 min-h-screen text-white">

    <h1 class="text-2xl font-bold">
      Welcome, {{ user?.name }}
    </h1>

    <p class="mt-2 text-gray-400">
      Student ID: {{ user?.studentId }}
    </p>

    <div class="mt-10">
      <router-link
        to="/scan"
        class="bg-green-500 px-6 py-3 rounded"
      >
        Scan QR
      </router-link>
    </div>

  </div>
</template>