<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

const isSidebarOpen = ref(false);

const courses = ref([]);
const loading = ref(false);

// form
const showModal = ref(false);
const courseCode = ref("");
const courseTitle = ref("");
const department = ref("");
const level = ref("");

// fetch
const fetchCourses = async () => {
  loading.value = true;
  try {
    const res = await API.get("/courses");
    courses.value = res.data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchCourses);

// create
const createCourse = async () => {
  const res = await API.post("/courses/create", {
    courseCode: courseCode.value,
    courseTitle: courseTitle.value,
    department: department.value,
    level: level.value
  });

  courses.value.unshift(res.data);

  showModal.value = false;

  courseCode.value = "";
  courseTitle.value = "";
  department.value = "";
  level.value = "";
};
</script>

<template>
  <div class="flex bg-gray-950 min-h-screen text-white">

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">

      <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="p-6 md:p-8 space-y-8 overflow-auto">

        <!-- HEADER -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Courses</h1>
            <p class="text-gray-400">Manage courses & schedules</p>
          </div>

          <button
            @click="showModal = true"
            class="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
          >
            + Add Course
          </button>
        </div>

        <!-- GRID -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          <div
            v-for="c in courses"
            :key="c._id"
            class="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition"
          >
            <h2 class="text-xl font-semibold">
              {{ c.courseCode }}
            </h2>

            <p class="text-gray-400 mt-1">
              {{ c.courseTitle }}
            </p>

            <div class="mt-4 text-sm text-gray-500">
              <p>{{ c.department }} • {{ c.level }}</p>
              <p v-if="c.lecturer">👨‍🏫 {{ c.lecturer.name }}</p>
            </div>

            <button
              class="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-2 rounded"
              @click="$router.push(`/admin/attendance?course=${c._id}`)"
            >
              Manage Attendance
            </button>
          </div>

        </div>

        <!-- EMPTY -->
        <div v-if="!loading && courses.length === 0" class="text-center text-gray-500">
          No courses yet
        </div>

      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

      <div class="bg-gray-900 p-6 rounded-2xl w-full max-w-md space-y-4">

        <h2 class="text-xl font-semibold">Create Course</h2>

        <input v-model="courseCode" placeholder="Course Code"
          class="w-full p-3 bg-gray-800 rounded" />

        <input v-model="courseTitle" placeholder="Course Title"
          class="w-full p-3 bg-gray-800 rounded" />

        <input v-model="department" placeholder="Department"
          class="w-full p-3 bg-gray-800 rounded" />

        <input v-model="level" placeholder="Level"
          class="w-full p-3 bg-gray-800 rounded" />

        <div class="flex gap-3">
          <button @click="createCourse" class="flex-1 bg-green-600 py-2 rounded">
            Create
          </button>

          <button @click="showModal = false" class="flex-1 bg-gray-700 py-2 rounded">
            Cancel
          </button>
        </div>

      </div>

    </div>
  </div>
</template>