<template>
  <div class="bg-gray-900 text-white min-h-screen">

    <!-- NAV -->
    <header class="flex justify-between items-center px-8 py-6">
      <h1 class="text-xl font-bold">QR Smart System</h1>

      <router-link to="/login" class="bg-green-500 px-4 py-2 rounded">
        Login
      </router-link>
    </header>

    <!-- HERO -->
    <section class="text-center mt-20 px-6">
      <h2 class="text-4xl md:text-6xl font-bold leading-tight">
        Smart Attendance & <span class="text-green-400">Asset Tracking</span>
      </h2>

      <p class="mt-6 text-gray-300 max-w-2xl mx-auto">
        A QR-powered system that eliminates attendance fraud and tracks
        institutional assets in real-time.
      </p>

      <div class="mt-10 flex justify-center gap-4">
        <router-link
          to="/login"
          class="bg-green-500 px-6 py-3 rounded-lg font-semibold"
        >
          Get Started
        </router-link>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="mt-24 px-6 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-semibold">QR Attendance</h3>
        <p class="text-gray-400 mt-2">
          Scan and record attendance instantly with secure QR validation.
        </p>
      </div>

      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-semibold">Asset Tracking</h3>
        <p class="text-gray-400 mt-2">
          Monitor equipment usage and prevent loss or misuse.
        </p>
      </div>

      <div class="bg-gray-800 p-6 rounded-xl">
        <h3 class="text-xl font-semibold">Real-time Analytics</h3>
        <p class="text-gray-400 mt-2">
          Get insights into attendance and asset usage patterns.
        </p>
      </div>

    </section>

  </div>
</template>