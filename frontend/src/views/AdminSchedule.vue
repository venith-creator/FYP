<script setup>
import { ref, onMounted, computed } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

const isSidebarOpen = ref(false);

const schedules = ref([]);
const sessions = ref([]);
const courses = ref([]);

const loading = ref(false);

const currentSession = ref(null);
const showSessionModal = ref(false);
const sessionAttendance = ref([]);
const newNote = ref("");
const creatingWeekly = ref(false);
const creatingImpromptu = ref(false);
const addingNote = ref(false);
const generatingQR = ref(null);

// =========================
// SESSION FILTERS
// =========================
const selectedStatus = ref("all");
const selectedType = ref("all");
const selectedCourse = ref("all");
const searchQuery = ref("");

// =========================
// FILTERED SESSIONS
// =========================
const filteredSessions = computed(() => {
  return sessions.value.filter((session) => {

    // status filter
    const statusMatch =
      selectedStatus.value === "all" ||
      getSessionStatus(session) === selectedStatus.value;

    // type filter
    const typeMatch =
      selectedType.value === "all" ||
      (
        selectedType.value === "weekly"
          ? session.schedule
          : !session.schedule
      );

    // course filter
    const courseMatch =
      selectedCourse.value === "all" ||
      session.course?._id === selectedCourse.value;

    // search filter
    const query =
      searchQuery.value.toLowerCase();

    const searchMatch =
      !query ||
      session.course?.courseCode
        ?.toLowerCase()
        .includes(query) ||
      session.course?.courseTitle
        ?.toLowerCase()
        .includes(query) ||
      session.location?.name
        ?.toLowerCase()
        .includes(query);

    return (
      statusMatch &&
      typeMatch &&
      courseMatch &&
      searchMatch
    );
  });
});

// =========================
// WEEKLY FORM
// =========================
const weeklyForm = ref({
  course: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  weeks: 1,
  location: {
    name: "",
    lat: "",
    lng: ""
  }
});

// =========================
// IMPROMPTU FORM
// =========================
const impromptuForm = ref({
  course: "",
  date: "",
  startTime: "",
  endTime: "",
  location: {
    name: "",
    lat: "",
    lng: ""
  }
});

// =========================
// FETCH DATA
// =========================
const fetchData = async () => {
  try {
    loading.value = true;

    const [scheduleRes, courseRes] = await Promise.all([
      API.get("/schedule"),
      API.get("/courses")
    ]);

    schedules.value = scheduleRes.data;
    courses.value = courseRes.data;

    await loadAllSessions();
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

// =========================
// LOAD ALL SESSIONS
// =========================
const loadAllSessions = async () => {
  try {
    let allSessions = [];

    for (const schedule of schedules.value) {
      const res = await API.get(
        `/session/by-schedule/${schedule._id}`
      );

      allSessions.push(...res.data);
    }

    // impromptu sessions
    const impromptuRes = await API.get(
      "/session/impromptu"
    );
      allSessions.push(...impromptuRes.data);

    // remove duplicates
    const unique = [
      ...new Map(allSessions.map((s) => [s._id, s])).values()
    ];

    sessions.value = unique.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  } catch (err) {
    console.log(err);
  }
};

onMounted(fetchData);

// =========================
// CREATE WEEKLY SCHEDULE
// =========================
const createWeeklySchedule = async () => {
  try {
    creatingWeekly.value = true;

    const f = weeklyForm.value;

    // 1. create schedule
    const scheduleRes = await API.post("/schedule/create", {
      course: f.course,
      dayOfWeek: f.dayOfWeek,
      startTime: f.startTime,
      endTime: f.endTime
    });

    const schedule = scheduleRes.data;

    const daysMap = {
          sunday: 0,
          sun: 0,

          monday: 1,
          mon: 1,

          tuesday: 2,
          tue: 2,

          wednesday: 3,
          wed: 3,

          thursday: 4,
          thu: 4,
          thur: 4,

          friday: 5,
          fri: 5,

          saturday: 6,
          sat: 6
        };

        const targetDay =
        daysMap[f.dayOfWeek.toLowerCase()];

        const today = new Date();

        const currentDay = today.getDay();

        let diff = targetDay - currentDay;

        if (diff < 0) {
        diff += 7;
        }

        const firstClassDate = new Date(today);

        firstClassDate.setDate(
        today.getDate() + diff
        );

    await API.post("/session/create", {
      scheduleId: schedule._id,
      date: firstClassDate,
      startTime: f.startTime,
      endTime: f.endTime,
      location: f.location,
      weeks: f.weeks
    });

    // reset form
    weeklyForm.value = {
      course: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      weeks: 1,
      location: {
        name: "",
        lat: "",
        lng: ""
      }
    };

    await fetchData();

    alert("Weekly schedule created successfully");
  } catch (err) {
    console.log(err);
    alert(err.response?.data || "Failed to create schedule");
  } finally {
    creatingWeekly.value = false;
  }
};

// =========================
// CREATE IMPROMPTU CLASS
// =========================
const createImpromptuClass = async () => {
  try {
    creatingImpromptu.value = true;
    const f = impromptuForm.value;

    await API.post("/session/create-impromptu", {
      course: f.course,
      date: f.date,
      startTime: f.startTime,
      endTime: f.endTime,
      location: f.location
    });

    impromptuForm.value = {
      course: "",
      date: "",
      startTime: "",
      endTime: "",
      location: {
        name: "",
        lat: "",
        lng: ""
      }
    };

    await fetchData();

    alert("Impromptu class created");
  } catch (err) {
    console.log(err);
    alert(err.response?.data || "Failed");
  } finally {
    creatingImpromptu.value = false;
  }
};

// =========================
// GET LOCATION
// =========================
const useLocation = (target) => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      target.location.lat = pos.coords.latitude;
      target.location.lng = pos.coords.longitude;
    },
    () => {
      alert("Unable to fetch location");
    },
    {
      enableHighAccuracy: true
    }
  );
};

// =========================
// SESSION STATUS
// =========================
const getSessionStatus = (session) => {
  const now = new Date();

  const start = new Date(session.date);

  const [h, m] = session.startTime.split(":");

  start.setHours(h, m);

  const end = new Date(session.date);

  const [eh, em] = session.endTime.split(":");

  end.setHours(eh, em);

  // session opens 15 mins before
  const openTime = new Date(start);
  openTime.setMinutes(openTime.getMinutes() - 15);

  if (now < openTime) {
    return "upcoming";
  }

  if (now >= openTime && now <= end) {
    return "active";
  }

  return "closed";
};

// =========================
// QR RULE
// =========================
const canGenerateQR = (session) => {
  const now = new Date();

  const start = new Date(session.date);

  const [h, m] = session.startTime.split(":");
  start.setHours(h, m);

  const open = new Date(start);
  open.setMinutes(open.getMinutes() - 30);

  const close = new Date(start);
  close.setMinutes(close.getMinutes() + 30);

  return now >= open && now <= close;
};

// =========================
// GENERATE QR
// =========================
const generateQR = async (session) => {
  try {
    generatingQR.value = session._id;
    // prevent duplicate QR generation
    if (session.qrCode) {
      return alert("QR already generated");
    }

    const res = await API.post(
      "/schedule/generate-session-qr",
      {
        sessionId: session._id
      }
    );

    session.qrCode = res.data.qrCode;
    session.sessionCode = res.data.sessionCode;
    session.qrExpiresAt = res.data.expires;

    alert("QR generated");
  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Failed");
  } finally {
    generatingQR.value = null;
  }
};

// =========================
// PRINT QR
// =========================
const printQR = (session) => {
  const win = window.open("", "_blank");

  win.document.write(`
    <html>
      <head>
        <title>Print QR</title>
      </head>

      <body style="font-family:sans-serif;text-align:center;padding:40px;">
        <h2>${session.course?.courseCode || "Session QR"}</h2>

        <img
          src="${session.qrCode}"
          style="width:350px;margin-top:20px;"
        />

        <h1 style="margin-top:20px;">
          ${session.sessionCode}
        </h1>

        <p>
          Expires:
          ${new Date(
            session.qrExpiresAt
          ).toLocaleTimeString()}
        </p>
      </body>
    </html>
  `);

  win.document.close();
  win.print();
};

// =========================
// OPEN SESSION
// =========================
const openSession = async (session) => {
  try {
    const resSession = await API.get(
      `/session/${session._id}`
    );

    currentSession.value = resSession.data;

    const resAttendance = await API.get(
      `/attendance/session/${session._id}`
    );

    sessionAttendance.value =
      resAttendance.data;

    showSessionModal.value = true;
  } catch (err) {
    console.log(err);
  }
};

// =========================
// ADD NOTE
// =========================
const addNote = async () => {
  if (!newNote.value.trim()) return;

  try {
    addingNote.value = true;

    await API.post("/session/add-note", {
      sessionId: currentSession.value._id,
      text: newNote.value
    });

    newNote.value = "";

    await openSession(currentSession.value);
  } catch (err) {
    console.log(err);

  } finally {
    addingNote.value = false;
  }
};
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
        isSidebarOpen = !isSidebarOpen
      "
    />

    <div class="p-6 space-y-8">

      <!-- PAGE TITLE -->
      <div>
        <h1 class="text-3xl font-bold">
          Schedule & Sessions
        </h1>

        <p class="text-gray-400 mt-1">
          Manage weekly schedules,
          impromptu classes, QR attendance,
          notes and session monitoring.
        </p>
      </div>

      <!-- FORMS -->
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >

        <!-- WEEKLY -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <h2
            class="text-xl font-bold text-green-400 mb-5"
          >
            Weekly Schedule
          </h2>

          <div class="space-y-4">

            <select
              v-model="weeklyForm.course"
              class="w-full bg-gray-800 p-3 rounded-xl"
            >
              <option disabled value="">
                Select Course
              </option>

              <option
                v-for="c in courses"
                :key="c._id"
                :value="c._id"
              >
                {{ c.courseCode }}
              </option>
            </select>

            <input
              v-model="weeklyForm.dayOfWeek"
              placeholder="Day (e.g Tuesday)"
              class="w-full bg-gray-800 p-3 rounded-xl"
            />

            <div class="grid grid-cols-2 gap-3">

              <input
                type="time"
                v-model="weeklyForm.startTime"
                class="bg-gray-800 p-3 rounded-xl"
              />

              <input
                type="time"
                v-model="weeklyForm.endTime"
                class="bg-gray-800 p-3 rounded-xl"
              />

            </div>

            <input
              type="number"
              min="1"
              v-model="weeklyForm.weeks"
              placeholder="Weeks"
              class="w-full bg-gray-800 p-3 rounded-xl"
            />

            <input
              v-model="
                weeklyForm.location.name
              "
              placeholder="Location Name"
              class="w-full bg-gray-800 p-3 rounded-xl"
            />

            <div
              class="grid grid-cols-2 gap-3"
            >
              <input
                v-model="
                  weeklyForm.location.lat
                "
                placeholder="Latitude"
                class="bg-gray-800 p-3 rounded-xl"
              />

              <input
                v-model="
                  weeklyForm.location.lng
                "
                placeholder="Longitude"
                class="bg-gray-800 p-3 rounded-xl"
              />
            </div>

            <button
              @click="useLocation(weeklyForm)"
              class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"
            >
              Use My Location
            </button>

            <button
              :disabled="creatingWeekly"
              @click="createWeeklySchedule"
              class="w-full bg-green-600 hover:bg-green-700 p-3 rounded-xl font-semibold"
            >
              {{ creatingWeekly
                ? "Creating..."
                : "Create Weekly Schedule"
                }}
            </button>

          </div>
        </div>

        <!-- IMPROMPTU -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-2xl p-6"
        >
          <h2
            class="text-xl font-bold text-yellow-400 mb-5"
          >
            Impromptu Class
          </h2>

          <div class="space-y-4">

            <select
              v-model="impromptuForm.course"
              class="w-full bg-gray-800 p-3 rounded-xl"
            >
              <option disabled value="">
                Select Course
              </option>

              <option
                v-for="c in courses"
                :key="c._id"
                :value="c._id"
              >
                {{ c.courseCode }}
              </option>
            </select>

            <input
              type="date"
              v-model="impromptuForm.date"
              class="w-full bg-gray-800 p-3 rounded-xl"
            />

            <div class="grid grid-cols-2 gap-3">

              <input
                type="time"
                v-model="impromptuForm.startTime"
                class="bg-gray-800 p-3 rounded-xl"
              />

              <input
                type="time"
                v-model="impromptuForm.endTime"
                class="bg-gray-800 p-3 rounded-xl"
              />

            </div>

            <input
              v-model="
                impromptuForm.location.name
              "
              placeholder="Location Name"
              class="w-full bg-gray-800 p-3 rounded-xl"
            />

            <div
              class="grid grid-cols-2 gap-3"
            >
              <input
                v-model="
                  impromptuForm.location.lat
                "
                placeholder="Latitude"
                class="bg-gray-800 p-3 rounded-xl"
              />

              <input
                v-model="
                  impromptuForm.location.lng
                "
                placeholder="Longitude"
                class="bg-gray-800 p-3 rounded-xl"
              />
            </div>

            <button
              @click="useLocation(impromptuForm)"
              class="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-xl font-semibold"
            >
              Use My Location
            </button>

            <button
              :disabled="creatingImpromptu"
              @click="createImpromptuClass"
              class="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded-xl font-semibold"
            >
              {{ creatingImpromptu
                ? "Creating..."
                : "Create Impromptu Class"
                }}
            </button>

          </div>
        </div>

      </div>

      <!-- SESSIONS -->
      <div>

        <div
          class="flex items-center justify-between mb-4"
        >
          <h2 class="text-2xl font-bold">
            All Sessions
          </h2>

          <span class="text-gray-400">
            {{ filteredSessions.length }} sessions
          </span>
        </div>
        <!-- FILTERS -->
            <div
            class="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-5"
            >

            <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >

                <!-- SEARCH -->
                <input
                v-model="searchQuery"
                placeholder="Search course or location..."
                class="bg-gray-800 p-3 rounded-xl"
                />

                <!-- STATUS -->
                <select
                v-model="selectedStatus"
                class="bg-gray-800 p-3 rounded-xl"
                >
                <option value="all">
                    All Status
                </option>

                <option value="upcoming">
                    Upcoming
                </option>

                <option value="active">
                    Active
                </option>

                <option value="closed">
                    Closed
                </option>
                </select>

                <!-- TYPE -->
                <select
                v-model="selectedType"
                class="bg-gray-800 p-3 rounded-xl"
                >
                <option value="all">
                    All Types
                </option>

                <option value="weekly">
                    Weekly Classes
                </option>

                <option value="impromptu">
                    Impromptu Classes
                </option>
                </select>

                <!-- COURSE -->
                <select
                v-model="selectedCourse"
                class="bg-gray-800 p-3 rounded-xl"
                >
                <option value="all">
                    All Courses
                </option>

                <option
                    v-for="c in courses"
                    :key="c._id"
                    :value="c._id"
                >
                    {{ c.courseCode }}
                </option>
                </select>

            </div>

            </div>

        <div class="space-y-4">

          <div
            v-for="session in filteredSessions"
            :key="session._id"
            class="bg-gray-900 border border-gray-800 rounded-2xl p-5"
          >

            <div
              class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >

              <div class="space-y-1">

                <h3
                  class="text-lg font-bold text-green-400"
                >
                  {{ session.course?.courseCode }}
                </h3>

                <p class="text-gray-300">
                  {{
                    new Date(
                      session.date
                    ).toDateString()
                  }}
                </p>

                <p class="text-gray-400 text-sm">
                  {{ session.startTime }}
                  -
                  {{ session.endTime }}
                </p>

                <p
                  class="text-xs text-gray-500"
                >
                  📍
                  {{
                    session.location?.name ||
                    "No location"
                  }}
                </p>

                <p
                  class="text-xs text-gray-400"
                >
                  {{
                    session.schedule
                      ? "Weekly Class"
                      : "Impromptu Class"
                  }}
                </p>

              </div>

              <div
                class="flex flex-wrap gap-2"
              >

                <span
                  v-if="
                    getSessionStatus(
                      session
                    ) === 'upcoming'
                  "
                  class="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs"
                >
                  Upcoming
                </span>

                <span
                  v-if="
                    getSessionStatus(
                      session
                    ) === 'active'
                  "
                  class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs"
                >
                  Active
                </span>

                <span
                  v-if="
                    getSessionStatus(
                      session
                    ) === 'closed'
                  "
                  class="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs"
                >
                  Closed
                </span>

              </div>

            </div>

            <!-- ACTIONS -->
            <div
            class="flex flex-wrap gap-3 mt-5"
            >

            <!-- GENERATE QR -->
            <button
                v-if="
                getSessionStatus(session) !== 'closed' &&
                !session.qrCode &&
                canGenerateQR(session)
                "
                :disabled="generatingQR === session._id"
                @click="generateQR(session)"
                class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl text-sm"
            >
                {{
                generatingQR === session._id
                    ? "Generating..."
                    : "Generate QR"
                }}
            </button>

            <!-- VIEW SESSION -->
            <button
                v-if="
                session.qrCode ||
                getSessionStatus(session) === 'closed'
                "
                @click="openSession(session)"
                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm"
            >
                View Session
            </button>

            <!-- PRINT QR -->
            <button
                v-if="
                session.qrCode &&
                getSessionStatus(session) !== 'closed'
                "
                @click="printQR(session)"
                class="bg-white text-black px-4 py-2 rounded-xl text-sm"
            >
                Print QR
            </button>

            </div>

            <!-- QR -->
            <div
              v-if="session.qrCode"
              class="mt-6 border-t border-gray-800 pt-5 text-center"
            >

              <img
                :src="session.qrCode"
                class="w-72 mx-auto "
              />

              <h2
                class="text-3xl font-bold text-yellow-400 mt-4"
              >
                {{ session.sessionCode }}
              </h2>

              <p
                class="text-gray-400 text-sm mt-2"
              >
                Expires:
                {{
                  new Date(
                    session.qrExpiresAt
                  ).toLocaleTimeString()
                }}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

  <!-- MODAL -->
  <div
    v-if="showSessionModal"
    class="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50"
  >

    <div
      class="bg-gray-900 w-full max-w-3xl rounded-2xl p-6 border border-gray-800 max-h-[90vh] overflow-y-auto"
    >

      <div
        class="flex items-center justify-between"
      >
        <h2 class="text-2xl font-bold">
          Session Details
        </h2>

        <button
          @click="
            showSessionModal = false
          "
          class="bg-gray-800 px-4 py-2 rounded-xl"
        >
          Close
        </button>
      </div>

      <!-- ATTENDANCE -->
      <div class="mt-6">

        <h3
          class="text-lg font-semibold mb-3"
        >
          Attendance
        </h3>

        <div
          class="bg-gray-800 rounded-xl p-4"
        >

          <p class="mb-4 text-gray-300">
            Total Present:
            <span
              class="font-bold text-green-400"
            >
              {{
                sessionAttendance.length
              }}
            </span>
          </p>

          <div
            v-if="
              sessionAttendance.length
            "
            class="space-y-2"
          >

            <div
              v-for="a in sessionAttendance"
              :key="a._id"
              class="bg-gray-900 rounded-lg p-3"
            >
              {{ a.student.name }}
              ({{ a.student.studentId }})
            </div>

          </div>

          <p
            v-else
            class="text-gray-500"
          >
            No attendance yet
          </p>

        </div>

      </div>

      <!-- NOTES -->
      <div class="mt-6">

        <h3
          class="text-lg font-semibold mb-3"
        >
          Session Notes
        </h3>

        <textarea
          v-model="newNote"
          placeholder="Add session note..."
          class="w-full bg-gray-800 rounded-xl p-4 min-h-[120px]"
        />

        <button
          :disabled="addingNote"
          @click="addNote"
          class="mt-3 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl"
        >
          {{ addingNote
            ? "Adding..."
            : "Add Note"
            }}
        </button>

        <div class="space-y-3 mt-6">

          <div
            v-for="note in currentSession?.notes"
            :key="note._id"
            class="bg-gray-800 rounded-xl p-4"
          >

            <p>{{ note.text }}</p>

            <p
              class="text-xs text-gray-500 mt-2"
            >
              {{
                new Date(
                  note.createdAt
                ).toLocaleString()
              }}
            </p>

          </div>

        </div>

      </div>

    </div>

  </div>

</div>
</template>