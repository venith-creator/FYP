<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(["close"]);

const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

const closeSidebar = () => {
  emit("close");
};
</script>

<template>
  <!-- OVERLAY (mobile only) -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
    @click="closeSidebar"
  ></div>

  <!-- SIDEBAR -->
  <div
    :class="[
      'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 p-6 transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >

    <!-- HEADER -->
    <div class="flex justify-between items-center mb-10">
      <h2 class="text-2xl font-bold text-white">
        QR System
      </h2>

      <!-- CLOSE BUTTON (mobile) -->
      <button
        class="lg:hidden text-gray-400 hover:text-white"
        @click="closeSidebar"
      >
        ✕
      </button>
    </div>

    <!-- NAV -->
    <nav class="space-y-3">

      <button @click="$router.push('/admin/dashboard')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
        Dashboard
      </button>

      <button @click="$router.push('/admin/students')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
        Students
      </button>

      <button @click="$router.push('/admin/courses')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
        Courses
      </button>

      <button @click="$router.push('/admin/assets')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
        Assets
      </button>

      <button @click="$router.push('/admin/schedule')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
            Schedule
        </button>

      <button @click="$router.push('/admin/attendance')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800">
        Attendance
      </button>

    </nav>

    <!-- LOGOUT -->
    <div class="absolute bottom-6 left-6 right-6">
      <button
        @click="logout"
        class="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold"
      >
        Logout
      </button>
    </div>

  </div>
</template>