<script setup>
import { ref } from "vue";
import API from "../services/api";

const name = ref("");
const password = ref("");
const secret = ref("");
const email = ref("");

const signup = async () => {
  try {
    const res = await API.post("/auth/admin/signup", {
      name: name.value,
      email: email.value,
      password: password.value,
      secret: secret.value
    });

    localStorage.setItem("token", res.data.token);

    alert("Admin created");

  } catch (err) {
    alert(err.response?.data?.message || "Error");
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-black text-white">

    <div class="bg-gray-900 p-8 rounded-xl w-full max-w-md">

      <h2 class="text-xl font-bold mb-6 text-center">
        Admin Access
      </h2>

      <input v-model="name" placeholder="Name" class="w-full p-3 mb-4 bg-gray-800 rounded" />
      <input v-model="email" placeholder="Email" class="w-full p-3 mb-4 bg-gray-800 rounded" />
      <input v-model="password" type="password" placeholder="Password" class="w-full p-3 mb-4 bg-gray-800 rounded" />
      <input v-model="secret" placeholder="Secret Code" class="w-full p-3 mb-6 bg-gray-800 rounded" />

      <button @click="signup" class="w-full bg-green-600 py-3 rounded">
        Create Admin
      </button>

    </div>

  </div>
</template>