<script setup>
import { ref } from "vue";
import API from "../services/api";
import { useRouter } from "vue-router";

const studentId = ref("");
const password = ref("");
const loading = ref(false);
const identifier = ref("");

const router = useRouter();

const login = async () => {
  loading.value = true;

  try {
    const res = await API.post("/auth/login", {
      email: identifier.value.includes("@") ? identifier.value : undefined,
        studentId: !identifier.value.includes("@") ? identifier.value : undefined,
        password: password.value
    });

    const { user } = res.data;

    localStorage.setItem("token", res.data.token);

    alert("Login successful");

    if (user.role === "admin") {
        router.push("/admin/dashboard");
    } else {
        router.push("/student/dashboard");
    }

  } catch (err) {
    alert(err.response?.data?.message || "Error");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 text-white">

    <div class="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-lg">

      <h2 class="text-2xl font-bold mb-6 text-center">
        Login to System
      </h2>

      <input
        v-model="identifier"
        placeholder="Email or student ID"
        class="w-full p-3 mb-4 rounded bg-gray-700 outline-none"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full p-3 mb-6 rounded bg-gray-700 outline-none"
      />

      <button
        @click="login"
        class="w-full bg-green-500 py-3 rounded font-semibold"
      >
        {{ loading ? "Logging in..." : "Login" }}
      </button>

    </div>

  </div>
</template>