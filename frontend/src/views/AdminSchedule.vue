<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

const schedules = ref([]);
const courses = ref([]);

const form = ref({
  course: "",
  dayOfWeek: "",
  startTime: "",
  endTime: ""
});

const fetchData = async () => {
  schedules.value = (await API.get("/schedule")).data;
  courses.value = (await API.get("/courses")).data;
};

onMounted(fetchData);

const createSchedule = async () => {
  await API.post("/schedule/create", form.value);
  fetchData();
};
</script>

<template>
  <div class="p-6 text-white">

    <h1 class="text-2xl mb-6">Schedule Management</h1>

    <!-- CREATE -->
    <div class="card mb-6">
      <select v-model="form.course">
        <option v-for="c in courses" :value="c._id">
          {{ c.courseCode }}
        </option>
      </select>

      <input v-model="form.dayOfWeek" placeholder="Day" />
      <input v-model="form.startTime" placeholder="Start" />
      <input v-model="form.endTime" placeholder="End" />

      <button @click="createSchedule">Create</button>
    </div>

    <!-- LIST -->
    <div v-for="s in schedules" :key="s._id" class="card">
      <p>{{ s.course.courseCode }}</p>
      <p>{{ s.dayOfWeek }} | {{ s.startTime }}</p>

      <button @click="API.post('/schedule/generate-qr', { scheduleId: s._id })">
        Generate QR
      </button>
    </div>

  </div>
</template>