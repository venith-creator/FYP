<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

defineProps({
  isOpen: Boolean
});

const emit =
  defineEmits(["close"]);

const closeSidebar = () => {
  emit("close");
};

const logout = () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  router.push("/login");
};
</script>

<template>

<!-- MOBILE OVERLAY -->
<div
  v-if="isOpen"
  @click="closeSidebar"
  class="fixed inset-0 bg-black/60 z-40 lg:hidden"
></div>

<!-- SIDEBAR -->
<div
  :class="[
    'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gray-950 border-r border-gray-800 p-6 transform transition-transform duration-300',
    isOpen
      ? 'translate-x-0'
      : '-translate-x-full lg:translate-x-0'
  ]"
>

  <!-- HEADER -->
  <div
    class="flex justify-between items-center mb-10"
  >

    <div>

      <h2
        class="text-2xl font-bold text-white"
      >
        Student Hub
      </h2>

      <p
        class="text-gray-500 text-sm mt-1"
      >
        QR Attendance System
      </p>

    </div>

    <button
      class="lg:hidden text-gray-400"
      @click="closeSidebar"
    >
      ✕
    </button>

  </div>

  <!-- NAVIGATION -->
  <nav class="space-y-3">

    <button
      @click="$router.push('/student/dashboard')"
      class="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition"
    >
      Dashboard
    </button>

    <button
      @click="$router.push('/student/attendance')"
      class="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition"
    >
      Attendance
    </button>

    <button
      @click="$router.push('/student/courses')"
      class="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition"
    >
      My Courses
    </button>

    <button
      @click="$router.push('/student/assets')"
      class="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-800 transition"
    >
      Assets
    </button>

  </nav>

  <!-- QUICK INFO -->
  <div
    class="mt-10 bg-gray-900 border border-gray-800 rounded-2xl p-4"
  >

    <p
      class="text-sm text-gray-400"
    >
      Quick Access
    </p>

    <div class="mt-4 space-y-3">

      <button
        @click="$router.push('/student/dashboard')"
        class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-sm"
      >
        Scan Attendance
      </button>

      <button
        @click="$router.push('/student/assets')"
        class="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl text-sm"
      >
        Borrow Asset
      </button>

    </div>

  </div>

  <!-- LOGOUT -->
  <div
    class="absolute bottom-6 left-6 right-6"
  >

    <button
      @click="logout"
      class="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold"
    >
      Logout
    </button>

  </div>

</div>

</template>