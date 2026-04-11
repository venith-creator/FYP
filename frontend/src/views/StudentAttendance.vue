<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

const attendance = ref([]);

onMounted(async () => {
  attendance.value = (await API.get("/student/attendance")).data;
});
</script>