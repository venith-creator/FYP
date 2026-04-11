<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

const schedules = ref([]);

onMounted(async () => {
  schedules.value = (await API.get("/student/schedule")).data;
});
</script>

<template>
  <div class="p-6 text-white">
    <h1 class="text-2xl mb-6">My Schedule</h1>

    <div v-for="s in schedules" :key="s._id" class="card">
      <p>{{ s.course.courseCode }}</p>
      <p>{{ s.dayOfWeek }} {{ s.startTime }}</p>
    </div>
  </div>
</template>