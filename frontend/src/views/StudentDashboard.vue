<script setup>
import {
  ref,
  computed,
  onMounted
} from "vue";

import API from "../services/api";

import StudentSidebar
from "../components/student/StudentSidebar.vue";

import StudentHeader
from "../components/student/StudentHeader.vue";

import { Html5QrcodeScanner }
from "html5-qrcode";

// ======================
// UI
// ======================
const isSidebarOpen = ref(false);

// ======================
// DATA
// ======================
const attendance = ref([]);
const assets = ref([]);
const courses = ref([]);
const schedules = ref([]);
const scannerOpen = ref(false);
const scannedSession = ref(null);

// ======================
// ACTION FORMS
// ======================
const attendanceCode = ref("");
const assetTag = ref("");
const returnTag = ref("");

const loading = ref(false);
const currentLocation = ref(null);
// ======================
// FETCH
// ======================
const fetchData = async () => {

  try {

    loading.value = true;

    const [
      attendanceRes,
      assetsRes,
      coursesRes,
      scheduleRes
    ] = await Promise.all([
      API.get("/student/attendance"),
      API.get("/student/assets"),
      API.get("/student/courses"),
      API.get("/session/student-sessions")
    ]);

    attendance.value =
      attendanceRes.data;

    assets.value =
      assetsRes.data;

    courses.value =
      coursesRes.data;

    schedules.value =
      scheduleRes.data;

  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const borrowAsset = async () => {
  if (!assetTag.value) {
    return alert("Enter asset tag");
  }

  try {
    const res = await API.post("/assets/borrow", {
      assetTag: assetTag.value
    });

    alert(res.data.message);

    assetTag.value = "";

    fetchData();

  } catch (err) {
    alert(
      err.response?.data?.message ||
      "Failed to borrow asset"
    );
  }
};

const returnAssetFn = async () => {
  if (!returnTag.value) {
    return alert("Enter asset tag");
  }

  try {

    const res = await API.post(
      "/assets/return",
      {
        assetTag: returnTag.value,
        condition: "Good"
      }
    );

    alert(res.data.message);

    returnTag.value = "";

    fetchData();

  } catch (err) {

    alert(
      err.response?.data?.message ||
      "Failed to return asset"
    );
  }
};

// ======================
// ANALYTICS
// ======================
const borrowedAssets =
  computed(() => {

    return assets.value.filter(
       a =>
      a.approvedBorrow &&
      !a.approvedReturn
    ).length;
  });

const attendanceCount =
  computed(() => {
    return attendance.value.length;
  });
let hasScanned = false;

const getLocation = () => {
  return new Promise((resolve, reject) => {

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        currentLocation.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        resolve();

      },
      (err) => {

        console.log(err);

        reject(err);

      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }
    );

  });
};

const startScanner = async () => {

  scannerOpen.value = true;
  currentLocation.value = null;

  try {

      await getLocation();

    } catch (err) {
      console.log(err);

      alert("Unable to get your location.");

    }

  setTimeout(() => {

    const scanner =
      new Html5QrcodeScanner(
        {
        fps: 10,
          qrbox: {
            width: 250,
            height: 250
          },
          rememberLastUsedCamera: true,
          aspectRatio: 1
        },
        false
      );

      hasScanned = false;
    scanner.render(
      async (decodedText) => {
        console.log("QR READ:", decodedText);

         if (hasScanned) return;

         hasScanned = true;
        try {

          const parsed =
            JSON.parse(decodedText);
            console.log(parsed);

          scannedSession.value =
            parsed;

          attendanceCode.value =
            parsed.code;

            
          await scanner.clear();

          scannerOpen.value = false;

          await submitAttendance(
            parsed.sessionId,
            parsed.code
          );

        } catch (err) {
          console.log(err);
           console.log(decodedText);
          alert("QR was detected but the data inside it is invalid.");
        }
      },
  
      (error) => {
        console.log(error);
      }
    );

  }, 200);
};
// ======================
// ATTENDANCE ACTION
// ======================
const submitAttendance = async (
  sessionIdFromQR = null,
  codeFromQR = null
) => {

  if (!attendanceCode.value) return;

  if (!currentLocation.value) {
    return alert("Waiting for GPS location...");
  }

  try {

    await API.post(
      "/attendance/scan",
      {
        sessionId: sessionIdFromQR,
        code: codeFromQR || attendanceCode.value,
        userLocation: currentLocation.value
      }
    );

    alert("Attendance recorded");

    attendanceCode.value = "";

    fetchData();

  } catch (err) {

    console.log(err);

    alert(
      err.response?.data?.message ||
      "Failed to record attendance"
    );

  }

};
</script>

<template>
<div
  class="flex bg-black min-h-screen text-white"
>

  <!-- SIDEBAR -->
  <StudentSidebar
    :is-open="isSidebarOpen"
    @close="isSidebarOpen = false"
  />

  <!-- MAIN -->
  <div class="flex-1 flex flex-col">

    <!-- HEADER -->
    <StudentHeader
      @toggle-sidebar="
        isSidebarOpen =
        !isSidebarOpen
      "
    />

    <!-- CONTENT -->
    <div class="p-6 space-y-8">

      <!-- HERO -->
      <div
        class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8"
      >

        <h1
          class="text-3xl font-bold"
        >
          Welcome Back
        </h1>

        <p
          class="mt-2 text-blue-100"
        >
          Access attendance,
          courses and assets
          from one portal.
        </p>

      </div>

      <!-- ANALYTICS -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-5"
      >

        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p class="text-gray-400">
            Attendance Records
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-green-400"
          >
            {{
              attendanceCount
            }}
          </h2>

        </div>

        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p class="text-gray-400">
            Active Courses
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-blue-400"
          >
            {{
              courses.length
            }}
          </h2>

        </div>

        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p class="text-gray-400">
            Borrowed Assets
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-yellow-400"
          >
            {{
              borrowedAssets
            }}
          </h2>

        </div>

      </div>

      <!-- QUICK ACTIONS -->
      <div
        class="grid lg:grid-cols-2 gap-6"
      >

        <!-- ATTENDANCE -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
        >

          <h2
            class="text-2xl font-bold"
          >
            Enter Class Attendance
          </h2>

          <p
            class="text-gray-400 mt-2"
          >
            Scan QR or enter manual code
          </p>

          <button
            @click="startScanner"
            class="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-semibold"
            >
            Scan Attendance QR
        </button>

          <input
            v-model="attendanceCode"
            placeholder="Enter session code"
            class="w-full mt-6 bg-gray-800 p-4 rounded-xl outline-none"
          />

          <button
            @click="() => submitAttendance()"
            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-semibold"
          >
            Submit Attendance
          </button>

        </div>

        <!-- ASSET -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
        >

          <h2
            class="text-2xl font-bold"
          >
            Asset Operations
          </h2>

          <p
            class="text-gray-400 mt-2"
          >
            Borrow or return institutional assets
          </p>

          <div class="space-y-4 mt-6">

            <input
                v-model="assetTag"
                placeholder="Asset tag to borrow"
                class="w-full bg-gray-800 p-4 rounded-xl"
                />

                <button
                @click="borrowAsset"
                class="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl"
                >
                Borrow Asset
                </button>

                <input
                v-model="returnTag"
                placeholder="Asset tag to return"
                class="w-full bg-gray-800 p-4 rounded-xl"
                />

                <button
                @click="returnAssetFn"
                class="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded-xl"
                >
                Return Asset
                </button>

          </div>

        </div>

      </div>

      <!-- UPCOMING CLASSES -->
      <div
        class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
      >

        <div
          class="flex items-center justify-between"
        >

          <h2
            class="text-2xl font-bold"
          >
            Current & Upcoming Classes
          </h2>

          <span
            class="text-gray-500"
          >
            {{
              schedules.length
            }} schedules
          </span>

        </div>

        <div
          class="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6"
        >

          <div
            v-for="session in schedules"
            :key="session._id"
            class="bg-black border border-gray-800 rounded-2xl p-5"
          >

            <h3
              class="text-lg font-bold text-blue-400"
            >
              {{
                session.course?.courseCode
              }}
            </h3>

            <p
              class="text-gray-400 mt-1"
            >
              {{
                session.course?.courseTitle
              }}
            </p>

            <div
              class="mt-4 text-sm space-y-2"
            >

              <p>
                Day:
                <span class="text-gray-300">
                  {{ new Date(session.date).toLocaleDateString() }}
                </span>
              </p>

              <p>
                Time:
                <span class="text-gray-300">
                  {{
                    session.startTime
                  }}
                  -
                  {{
                    session.endTime
                  }}
                </span>
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
  <div
  v-if="scannerOpen"
  class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
>

  <div
    class="bg-gray-900 p-6 rounded-3xl w-full max-w-lg"
  >

    <div
      class="flex justify-between items-center mb-4"
    >

      <h2 class="text-2xl font-bold">
        Scan QR Code
      </h2>

      <button
        @click="scannerOpen = false"
      >
        ✕
      </button>

    </div>

    <div
      id="reader"
      class="overflow-hidden rounded-2xl"
    ></div>

  </div>

</div>
</div>
</template>