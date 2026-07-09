<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount
} from "vue";

import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

// =========================
// LAYOUT
// =========================
const isSidebarOpen = ref(false);

// =========================
// DATA
// =========================
const analytics = ref({});
const attendanceRecords = ref([]);
const sessions = ref([]);
const loading = ref(false);

// =========================
// FILTERS
// =========================
const selectedCourse = ref("all");
const selectedStatus = ref("all");
const selectedDate = ref("");
const searchQuery = ref("");

// =========================
// SESSION MODAL
// =========================
const showSessionModal = ref(false);

const currentSession = ref(null);

const sessionAttendance = ref([]);

const loadingSession = ref(false);

// =========================
// OPEN SESSION
// =========================
const openSession = async (session) => {

  try {

    loadingSession.value = true;

    // fetch full session
    const sessionRes = await API.get(
      `/session/${session._id}`
    );

    currentSession.value =
      sessionRes.data;

    // fetch attendance
    const attendanceRes =
      await API.get(
        `/attendance/session/${session._id}`
      );

    sessionAttendance.value =
      attendanceRes.data;

    showSessionModal.value = true;

  } catch (err) {

    console.log(err);

  } finally {

    loadingSession.value = false;
  }
};

// =========================
// FETCH DATA
// =========================
const fetchAttendanceData = async () => {
  try {
    loading.value = true;

    const [
      analyticsRes,
      attendanceRes,
      sessionsRes
    ] = await Promise.all([
      API.get("/attendance/analytics"),
      API.get("/attendance/all"),
      API.get("/session/all")
    ]);

    analytics.value = analyticsRes.data;
    attendanceRecords.value =
      attendanceRes.data;

    sessions.value = sessionsRes.data;

  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

// =========================
// LIVE REFRESH
// =========================
let interval;

onMounted(() => {
  fetchAttendanceData();

  interval = setInterval(() => {
    fetchAttendanceData();
  }, 10000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});

// =========================
// SESSION STATUS
// =========================
const getSessionStatus = (session) => {

  const now = new Date();

  const start = new Date(session.date);

  const [h, m] =
    session.startTime.split(":");

  start.setHours(h, m);

  const end = new Date(session.date);

  const [eh, em] =
    session.endTime.split(":");

  end.setHours(eh, em);

  const openTime = new Date(start);

  openTime.setMinutes(
    openTime.getMinutes() - 15
  );

  if (now < openTime) {
    return "upcoming";
  }

  if (now >= openTime && now <= end) {
    return "active";
  }

  return "closed";
};

// =========================
// LIVE SESSIONS
// =========================
const liveSessions = computed(() => {
  return sessions.value.filter(
    (s) =>
      getSessionStatus(s) === "active"
  );
});

// =========================
// FILTERED ATTENDANCE
// =========================
const filteredAttendance =
  computed(() => {

    return attendanceRecords.value.filter(
      (record) => {

        // course
        const courseMatch =
          selectedCourse.value === "all" ||
          record.course?._id ===
            selectedCourse.value;

        // search
        const query =
          searchQuery.value.toLowerCase();

        const searchMatch =
          !query ||
          record.student?.name
            ?.toLowerCase()
            .includes(query) ||
          record.student?.studentId
            ?.toLowerCase()
            .includes(query) ||
          record.course?.courseCode
            ?.toLowerCase()
            .includes(query);

        // date
        const dateMatch =
          !selectedDate.value ||
          new Date(record.createdAt)
            .toISOString()
            .split("T")[0] ===
            selectedDate.value;

        // status
        const statusMatch =
          selectedStatus.value === "all" ||
          selectedStatus.value ===
            "present";

        return (
          courseMatch &&
          searchMatch &&
          dateMatch &&
          statusMatch
        );
      }
    );
  });

// =========================
// UNIQUE COURSES
// =========================
const uniqueCourses = computed(() => {

  const map = new Map();

  attendanceRecords.value.forEach(
    (record) => {

      if (record.course?._id) {

        map.set(
          record.course._id,
          record.course
        );
      }
    }
  );

  return [...map.values()];
});

// =========================
// ATTENDANCE TODAY
// =========================
const attendanceToday = computed(() => {

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return attendanceRecords.value.filter(
    (record) =>
      new Date(record.createdAt)
        .toISOString()
        .split("T")[0] === today
  ).length;
});
</script>

<template>
<div class="flex bg-black min-h-screen text-white">

  <!-- SIDEBAR -->
  <Sidebar
    :is-open="isSidebarOpen"
    @close="isSidebarOpen = false"
  />

  <!-- MAIN -->
  <div class="flex-1 flex flex-col">

    <Header
      @toggle-sidebar="
        isSidebarOpen =
        !isSidebarOpen
      "
    />

    <div class="p-6 space-y-8">

      <!-- HEADER -->
      <div>

        <h1
          class="text-3xl font-bold"
        >
          Attendance Analytics
        </h1>

        <p
          class="text-gray-400 mt-1"
        >
          Monitor attendance,
          live sessions,
          analytics and
          student participation.
        </p>

      </div>

      <!-- ANALYTICS -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
      >

        <!-- TOTAL -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p
            class="text-gray-400 text-sm"
          >
            Total Attendance
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-green-400"
          >
            {{
              analytics.totalAttendance || 0
            }}
          </h2>

        </div>

        <!-- TODAY -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p
            class="text-gray-400 text-sm"
          >
            Attendance Today
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-blue-400"
          >
            {{ attendanceToday }}
          </h2>

        </div>

        <!-- LIVE -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p
            class="text-gray-400 text-sm"
          >
            Active Sessions
          </p>

          <h2
            class="text-4xl font-bold mt-3 text-yellow-400"
          >
            {{ liveSessions.length }}
          </h2>

        </div>

        <!-- RATE -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
        >

          <p
            class="text-gray-400 text-sm"
          >
            System Status
          </p>

          <h2
            class="text-2xl font-bold mt-4 text-purple-400"
          >
            Live Monitoring
          </h2>

        </div>

      </div>

      <!-- LIVE SESSIONS -->
      <div>

        <div
          class="flex items-center justify-between mb-4"
        >

          <h2
            class="text-2xl font-bold"
          >
            Live Sessions
          </h2>

          <span
            class="text-gray-400"
          >
            {{
              liveSessions.length
            }} active
          </span>

        </div>

        <div
          v-if="liveSessions.length"
          class="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >

          <div
            v-for="session in liveSessions"
            :key="session._id"
            class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
          >

            <div
              class="flex items-start justify-between"
            >

              <div>

                <h3
                  class="text-xl font-bold text-green-400"
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

              </div>

              <span
                class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
              >
                LIVE
              </span>

            </div>

            <div
              class="mt-5 space-y-2 text-sm"
            >

              <p
                class="text-gray-300"
              >
                Time:
                <span
                  class="text-white"
                >
                  {{
                    session.startTime
                  }}
                  -
                  {{
                    session.endTime
                  }}
                </span>
              </p>

              <p
                class="text-gray-300"
              >
                Location:
                <span
                  class="text-white"
                >
                  {{
                    session.location?.name ||
                    "No location"
                  }}
                </span>
              </p>

              <p
                class="text-gray-300"
              >
                QR Status:
                <span
                  class="text-green-400 font-semibold"
                >
                  {{
                    session.qrCode
                      ? "Active"
                      : "Not Generated"
                  }}
                </span>
              </p>

            </div>

            <div
              class="mt-5 flex gap-3"
            >

              <button
                @click="openSession(session)"
                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm"
              >
                Open Session
              </button>

              <button
                @click="openSession(session)"
                class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm"
              >
                View Attendance
              </button>

            </div>

          </div>

        </div>

        <div
          v-else
          class="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center text-gray-500"
        >
          No active sessions currently
        </div>

      </div>

      <!-- FILTERS -->
      <div
        class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
      >

        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >

          <!-- SEARCH -->
          <input
            v-model="searchQuery"
            placeholder="Search student, ID or course..."
            class="bg-gray-800 p-3 rounded-xl outline-none"
          />

          <!-- COURSE -->
          <select
            v-model="selectedCourse"
            class="bg-gray-800 p-3 rounded-xl"
          >

            <option value="all">
              All Courses
            </option>

            <option
              v-for="course in uniqueCourses"
              :key="course._id"
              :value="course._id"
            >
              {{
                course.courseCode
              }}
            </option>

          </select>

          <!-- STATUS -->
          <select
            v-model="selectedStatus"
            class="bg-gray-800 p-3 rounded-xl"
          >

            <option value="all">
              All Status
            </option>

            <option value="present">
              Present
            </option>

          </select>

          <!-- DATE -->
          <input
            type="date"
            v-model="selectedDate"
            class="bg-gray-800 p-3 rounded-xl"
          />

        </div>

      </div>

      <!-- ATTENDANCE TABLE -->
      <div
        class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
      >

        <div
          class="p-5 border-b border-gray-800 flex items-center justify-between"
        >

          <h2
            class="text-2xl font-bold"
          >
            Attendance Records
          </h2>

          <span
            class="text-gray-400"
          >
            {{
              filteredAttendance.length
            }} records
          </span>

        </div>

        <div
          class="overflow-x-auto"
        >

          <table
            class="w-full"
          >

            <thead
              class="bg-gray-950"
            >

              <tr
                class="text-left text-gray-400 text-sm"
              >

                <th class="p-4">
                  Student
                </th>

                <th class="p-4">
                  Student ID
                </th>

                <th class="p-4">
                  Course
                </th>

                <th class="p-4">
                  Date
                </th>

                <th class="p-4">
                  Time
                </th>

                <th class="p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              <tr
                v-for="record in filteredAttendance"
                :key="record._id"
                class="border-t border-gray-800 hover:bg-gray-800/40"
              >

                <td class="p-4">
                  {{
                    record.student?.name
                  }}
                </td>

                <td class="p-4 text-gray-400">
                  {{
                    record.student?.studentId
                  }}
                </td>

                <td class="p-4">
                  {{
                    record.course?.courseCode
                  }}
                </td>

                <td class="p-4 text-gray-400">
                  {{
                    new Date(
                      record.createdAt
                    ).toLocaleDateString()
                  }}
                </td>

                <td class="p-4 text-gray-400">
                  {{
                    new Date(
                      record.createdAt
                    ).toLocaleTimeString()
                  }}
                </td>

                <td class="p-4">

                  <span
                    class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
                  >
                    Present
                  </span>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

      <!-- LOW ATTENDANCE ALERTS -->
      <div
        class="bg-gray-900 border border-gray-800 rounded-2xl p-6"
      >

        <div
          class="flex items-center justify-between mb-5"
        >

          <h2
            class="text-2xl font-bold text-red-400"
          >
            Attendance Alerts
          </h2>

          <span
            class="text-gray-500 text-sm"
          >
            AI & reporting ready
          </span>

        </div>

        <div
          class="space-y-4"
        >

          <div
            class="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >

            <h3
              class="font-semibold text-red-400"
            >
              Low Attendance Detection
            </h3>

            <p
              class="text-gray-400 text-sm mt-1"
            >
              Students below required
              attendance percentage
              will appear here.
            </p>

          </div>

          <div
            class="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          >

            <h3
              class="font-semibold text-yellow-400"
            >
              Poor Performing Courses
            </h3>

            <p
              class="text-gray-400 text-sm mt-1"
            >
              Courses with weak
              attendance trends will
              appear here.
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>
<!-- SESSION MODAL -->
<div
  v-if="showSessionModal"
  class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
>

  <div
    class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
  >

    <!-- HEADER -->
    <div
      class="flex items-center justify-between p-6 border-b border-gray-800"
    >

      <div>

        <h2 class="text-2xl font-bold">
          Session Monitoring
        </h2>

        <p class="text-gray-400 text-sm mt-1">
          Live attendance & session details
        </p>

      </div>

      <button
        @click="showSessionModal = false"
        class="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl"
      >
        Close
      </button>

    </div>

    <!-- CONTENT -->
    <div
      v-if="currentSession"
      class="p-6 space-y-6"
    >

      <!-- SESSION INFO -->
      <div
        class="grid grid-cols-1 md:grid-cols-3 gap-4"
      >

        <!-- COURSE -->
        <div
          class="bg-gray-800 rounded-xl p-5"
        >

          <p class="text-gray-400 text-sm">
            Course
          </p>

          <h3
            class="text-xl font-bold text-green-400 mt-2"
          >
            {{
              currentSession.course?.courseCode
            }}
          </h3>

          <p class="text-gray-400 text-sm mt-1">
            {{
              currentSession.course?.courseTitle
            }}
          </p>

        </div>

        <!-- TIME -->
        <div
          class="bg-gray-800 rounded-xl p-5"
        >

          <p class="text-gray-400 text-sm">
            Session Time
          </p>

          <h3
            class="text-lg font-bold mt-2"
          >
            {{
              currentSession.startTime
            }}
            -
            {{
              currentSession.endTime
            }}
          </h3>

          <p class="text-gray-400 text-sm mt-1">
            {{
              new Date(
                currentSession.date
              ).toDateString()
            }}
          </p>

        </div>

        <!-- ATTENDANCE -->
        <div
          class="bg-gray-800 rounded-xl p-5"
        >

          <p class="text-gray-400 text-sm">
            Students Present
          </p>

          <h3
            class="text-3xl font-bold text-blue-400 mt-2"
          >
            {{
              sessionAttendance.length
            }}
          </h3>

        </div>

      </div>

      <!-- QR -->
      <div
        v-if="currentSession.qrCode"
        class="bg-gray-800 rounded-2xl p-6 text-center"
      >

        <h3
          class="text-xl font-bold mb-4"
        >
          Active Attendance QR
        </h3>

        <img
          :src="currentSession.qrCode"
          class="w-48 mx-auto rounded-xl"
        />

        <h2
          class="text-4xl font-bold text-yellow-400 mt-5 tracking-widest"
        >
          {{
            currentSession.sessionCode
          }}
        </h2>

        <p
          class="text-gray-400 text-sm mt-3"
        >
          Expires:
          {{
            new Date(
              currentSession.qrExpiresAt
            ).toLocaleTimeString()
          }}
        </p>

      </div>

      <!-- ATTENDANCE LIST -->
      <div
        class="bg-gray-800 rounded-2xl overflow-hidden"
      >

        <div
          class="p-5 border-b border-gray-700 flex items-center justify-between"
        >

          <h3 class="text-xl font-bold">
            Live Attendance
          </h3>

          <span class="text-gray-400 text-sm">
            {{
              sessionAttendance.length
            }} present
          </span>

        </div>

        <div
          v-if="sessionAttendance.length"
          class="divide-y divide-gray-700"
        >

          <div
            v-for="attendance in sessionAttendance"
            :key="attendance._id"
            class="p-4 flex items-center justify-between"
          >

            <div>

              <h4 class="font-semibold">
                {{
                  attendance.student?.name
                }}
              </h4>

              <p
                class="text-sm text-gray-400 mt-1"
              >
                {{
                  attendance.student?.studentId
                }}
              </p>

            </div>

            <span
              class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
            >
              Present
            </span>

          </div>

        </div>

        <div
          v-else
          class="p-10 text-center text-gray-500"
        >
          No attendance recorded yet
        </div>

      </div>

    </div>

  </div>

</div>
</template>