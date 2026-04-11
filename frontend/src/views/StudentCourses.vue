<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

const courses = ref([]);

onMounted(async () => {
  courses.value = (await API.get("/student/courses")).data;
});
</script>

<template>
  <div class="p-6 text-white">
    <h1>My Courses</h1>

    <div v-for="c in courses" :key="c._id" class="card">
      {{ c.courseCode }} - {{ c.courseTitle }}
    </div>
  </div>
</template>