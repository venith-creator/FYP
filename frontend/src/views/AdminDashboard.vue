<script setup>
import { onMounted, ref } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

const stats = ref({});
const isSidebarOpen = ref(false);

onMounted(async () => {
  try {
    const res = await API.get("/admin/dashboard");
    stats.value = res.data;
  } catch (err) {
    console.log(err);
  }
});
</script>

<template>
  <div class="flex bg-gray-950 min-h-screen text-white">

    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Header -->
      <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Content -->
      <div class="p-6 md:p-8 space-y-8 overflow-auto">

        <!-- PAGE HEADER -->
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p class="text-gray-400 mt-1">
            Monitor attendance, students, and assets in real time
          </p>
        </div>

        <!-- STATS GRID -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <!-- CARD -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p class="text-gray-400 text-sm">Total Students</p>
            <h2 class="text-3xl font-bold mt-2">
              {{ stats.totalStudents || 0 }}
            </h2>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p class="text-gray-400 text-sm">Attendance Records</p>
            <h2 class="text-3xl font-bold mt-2">
              {{ stats.totalAttendance || 0 }}
            </h2>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p class="text-gray-400 text-sm">Borrowed Assets</p>
            <h2 class="text-3xl font-bold mt-2 text-yellow-400">
              {{ stats.borrowedAssets || 0 }}
            </h2>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow hover:shadow-lg transition">
            <p class="text-gray-400 text-sm">Returned Assets</p>
            <h2 class="text-3xl font-bold mt-2 text-green-400">
              {{ stats.returnedAssets || 0 }}
            </h2>
          </div>

        </div>

        <!-- QUICK ACTIONS -->
        <div class="grid md:grid-cols-3 gap-6">

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition cursor-pointer"
               @click="$router.push('/admin/students')">
            <h3 class="font-semibold text-lg">Manage Students</h3>
            <p class="text-gray-400 text-sm mt-2">
              Create and manage student records
            </p>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition cursor-pointer"
               @click="$router.push('/admin/courses')">
            <h3 class="font-semibold text-lg">Manage Courses</h3>
            <p class="text-gray-400 text-sm mt-2">
              Add courses and assign lecturers
            </p>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition cursor-pointer"
               @click="$router.push('/admin/assets')">
            <h3 class="font-semibold text-lg">Manage Assets</h3>
            <p class="text-gray-400 text-sm mt-2">
              Track and control asset usage
            </p>
          </div>

        </div>

        <!-- SYSTEM INFO PANEL -->
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          <h2 class="text-xl font-semibold mb-4">
            System Summary
          </h2>

          <p class="text-gray-400 leading-relaxed">
            This system provides real-time monitoring of student attendance 
            through QR-based validation and enables efficient tracking of 
            institutional assets. Admins can manage students, courses, 
            and equipment seamlessly from this dashboard.
          </p>

        </div>

      </div>

    </div>

  </div>
</template>