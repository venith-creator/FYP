<script setup>
const user = JSON.parse(localStorage.getItem("user") || "{}");

const emit = defineEmits(["toggle-sidebar"]);
</script>

<template>
  <div class="bg-gray-950 border-b border-gray-800 px-6 py-4 flex justify-between items-center">

    <!-- LEFT -->
    <div class="flex items-center gap-4">
      <button @click="emit('toggle-sidebar')" class="lg:hidden text-gray-400 hover:text-white">
        ☰
      </button>

      <h1 class="text-lg font-semibold">
        Admin Dashboard
      </h1>
    </div>

    <!-- RIGHT -->
    <div class="text-sm text-gray-300">
      {{ user?.name || "Admin" }}
    </div>

  </div>
</template>