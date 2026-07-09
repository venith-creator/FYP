<script setup>
const user =
  JSON.parse(
    localStorage.getItem("user") || "{}"
  );

const emit =
  defineEmits(["toggle-sidebar"]);
</script>

<template>
<div
  class="bg-gray-950 border-b border-gray-800 px-6 py-4 flex justify-between items-center"
>

  <!-- LEFT -->
  <div class="flex items-center gap-4">

    <button
      @click="emit('toggle-sidebar')"
      class="lg:hidden text-gray-400 hover:text-white"
    >
      ☰
    </button>

    <div>

      <h1
        class="text-lg font-semibold"
      >
        Student Portal
      </h1>

      <p
        class="text-xs text-gray-500"
      >
        Smart attendance & asset tracking
      </p>

    </div>

  </div>

  <!-- RIGHT -->
  <div
    class="flex items-center gap-3"
  >

    <div
      class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold"
    >
      {{
        user?.name?.charAt(0) || "S"
      }}
    </div>

    <div class="hidden sm:block">

      <p
        class="text-sm font-medium"
      >
        {{
          user?.name || "Student"
        }}
      </p>

      <p
        class="text-xs text-gray-500"
      >
        {{
          user?.studentId
        }}
      </p>

    </div>

  </div>

</div>
</template>