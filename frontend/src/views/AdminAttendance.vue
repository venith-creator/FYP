<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

const isSidebarOpen = ref(false);
const attendees = ref([]);

const fetchAttendance = async () => {
  if (!selectedSchedule.value) return;

  const res = await API.get(`/attendance/schedule/${selectedSchedule.value}`);
  attendees.value = res.data;
};

setInterval(fetchAttendance, 5000);

const schedules = ref([]);
const selectedSchedule = ref(null);

const qr = ref(null);
const code = ref(null);
const expires = ref(null);
const location = ref(null);

// fetch schedules (you’ll add backend route later)
const fetchSchedules = async () => {
  const res = await API.get("/schedule"); // create later
  schedules.value = res.data;
};

onMounted(fetchSchedules);

// generate attendance
const generate = async () => {
  const res = await API.post("/schedule/generate-qr", {
    scheduleId: selectedSchedule.value
  });

  qr.value = res.data.qrCode;
  expires.value = res.data.expires;

  code.value = Math.floor(100000 + Math.random() * 900000);

  navigator.geolocation.getCurrentPosition((pos) => {
    location.value = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };
  });
};
</script>

<template>
  <div class="flex bg-gray-950 min-h-screen text-white">

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">

      <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="p-6 md:p-8 space-y-8 overflow-auto">

        <!-- HEADER -->
        <div>
          <h1 class="text-3xl font-bold">Attendance Control</h1>
          <p class="text-gray-400">
            Generate QR, Code and track live attendance
          </p>
        </div>

        <!-- SELECT SCHEDULE -->
        <div class="bg-gray-900 border border-gray-800 p-6 rounded-2xl">

          <label class="text-gray-400 text-sm">Select Class</label>

          <select
            v-model="selectedSchedule"
            class="w-full mt-2 p-3 bg-gray-800 rounded"
          >
            <option disabled value="">Select schedule</option>
            <option v-for="s in schedules" :key="s._id" :value="s._id">
              {{ s.course?.courseCode }} • {{ s.dayOfWeek }} ({{ s.startTime }})
            </option>
          </select>

          <button
            @click="generate"
            class="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg"
          >
            Generate Attendance Session
          </button>

        </div>

        <!-- GRID OUTPUT -->
        <div class="grid md:grid-cols-3 gap-6">

          <!-- QR -->
          <div v-if="qr" class="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
            <h2 class="mb-3 text-lg font-semibold">QR Code</h2>
            <img :src="qr" class="mx-auto w-40" />
            <p class="text-xs text-gray-400 mt-3">
              Expires: {{ new Date(expires).toLocaleTimeString() }}
            </p>
          </div>

          <div class="card mt-6">
            <h2>Live Attendance</h2>

            <div v-for="a in attendees" :key="a._id">
                {{ a.student.name }} • {{ a.status }}
            </div>
          </div>
          <!-- CODE -->
          <div v-if="code" class="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
            <h2 class="mb-3 text-lg font-semibold">Manual Code</h2>
            <p class="text-4xl font-bold text-yellow-400 tracking-widest">
              {{ code }}
            </p>
          </div>

          <!-- LOCATION -->
          <div v-if="location" class="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center">
            <h2 class="mb-3 text-lg font-semibold">Class Location</h2>
            <p class="text-sm text-gray-400">
              {{ location.lat }} <br />
              {{ location.lng }}
            </p>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>