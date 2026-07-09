<script setup>

import { ref, onMounted } from "vue";
import API from "../services/api";

import StudentSidebar from "../components/student/StudentSidebar.vue";
import StudentHeader from "../components/student/StudentHeader.vue";

const isSidebarOpen = ref(false);

const attendance = ref([]);
const upcoming = ref([]);
const summary = ref([]);
const analytics = ref({});

const loading = ref(false);

const fetchAttendance = async () => {

    try{

        loading.value = true;

        const res =
        await API.get(
            "/student/attendance-summary"
        );

        attendance.value =
        res.data.attendance;

        upcoming.value =
        res.data.upcoming;

        summary.value =
        res.data.summary;

        analytics.value =
        res.data.analytics;

    }

    finally{

        loading.value=false;

    }

};

onMounted(fetchAttendance);

const progressColor=(percentage)=>{

    if(percentage>=90)
        return "bg-green-500";

    if(percentage>=75)
        return "bg-blue-500";

    if(percentage>=60)
        return "bg-yellow-500";

    return "bg-red-500";

};

const classType=(session)=>{

    return session?.schedule
    ? "Regular Class"
    : "Impromptu Class";

};

</script>
<template>
  <div class="flex bg-black min-h-screen text-white">

    <!-- Sidebar -->
    <StudentSidebar
      :is-open="isSidebarOpen"
      @close="isSidebarOpen = false"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col">

      <!-- Header -->
      <StudentHeader
        @toggle-sidebar="
          isSidebarOpen = !isSidebarOpen
        "
      />

      <!-- Page Content -->
      <div class="p-6 space-y-8">

        <!-- Hero -->
        <div
          class="rounded-3xl bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 p-8"
        >
          <h1 class="text-4xl font-bold">
            Attendance Centre
          </h1>

          <p class="mt-3 text-blue-100">
            Monitor attendance history, upcoming classes,
            attendance performance and course statistics.
          </p>
        </div>

        <!-- Statistics -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
        >
          <div class="bg-gray-900 rounded-2xl p-6">
            <p class="text-gray-400">
              Attendance
            </p>

            <h2
              class="mt-3 text-4xl font-bold text-green-400"
            >
              {{ analytics.totalAttendance }}
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6">
            <p class="text-gray-400">
              Upcoming Classes
            </p>

            <h2
              class="mt-3 text-4xl font-bold text-blue-400"
            >
              {{ analytics.upcomingClasses }}
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6">
            <p class="text-gray-400">
              Overall Attendance
            </p>

            <h2
              class="mt-3 text-4xl font-bold text-yellow-400"
            >
              {{ analytics.overallPercentage }}%
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl p-6">
            <p class="text-gray-400">
              Courses
            </p>

            <h2
              class="mt-3 text-4xl font-bold text-purple-400"
            >
              {{ analytics.totalCourses }}
            </h2>
          </div>
        </div>

        <!-- Attendance Performance -->
        <div
          class="bg-gray-900 rounded-3xl p-6 border border-gray-800"
        >
          <h2 class="text-2xl font-bold">
            Attendance Performance
          </h2>

          <div
            v-for="course in summary"
            :key="course.course._id"
            class="mt-6"
          >
            <div class="flex justify-between mb-2">
              <span>
                {{ course.course.courseCode }}
              </span>

              <span>
                {{ course.percentage }}%
              </span>
            </div>

            <div
              class="w-full h-3 bg-gray-800 rounded-full"
            >
              <div
                :class="[
                  progressColor(course.percentage),
                  'h-3 rounded-full'
                ]"
                :style="{
                  width: course.percentage + '%'
                }"
              />
            </div>
          </div>
        </div>

        <!-- Upcoming Classes -->
        <div>
          <h2 class="text-2xl font-bold mb-5">
            Upcoming Classes
          </h2>

          <div
            class="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            <div
              v-for="session in upcoming"
              :key="session._id"
              class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
            >
              <span
                class="inline-block px-3 py-1 rounded-full bg-indigo-700 text-sm"
              >
                {{ classType(session) }}
              </span>

              <h3
                class="mt-4 text-2xl font-bold text-blue-400"
              >
                {{ session.course.courseCode }}
              </h3>

              <p class="text-gray-400">
                {{ session.course.courseTitle }}
              </p>

              <div class="mt-5 space-y-2 text-sm">
                <p>
                  {{ new Date(session.date).toLocaleDateString() }}
                </p>

                <p>
                  {{ session.startTime }} - {{ session.endTime }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance History -->
        <div
          class="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden"
        >
          <div class="p-6">
            <h2 class="text-2xl font-bold">
              Attendance History
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-800">
                <tr class="text-left">
                  <th class="p-4">Date</th>
                  <th class="p-4">Course</th>
                  <th class="p-4">Class Type</th>
                  <th class="p-4">Status</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="record in attendance"
                  :key="record._id"
                  class="border-t border-gray-800"
                >
                  <td class="p-4">
                    {{ new Date(record.createdAt).toLocaleDateString() }}
                  </td>

                  <td class="p-4">
                    {{ record.course.courseCode }}
                  </td>

                  <td class="p-4">
                    {{ classType(record.session) }}
                  </td>

                  <td class="p-4">
                    <span
                      class="bg-green-700 px-3 py-1 rounded-full"
                    >
                      Present
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Course Summary -->
        <div>
          <h2 class="text-2xl font-bold mb-5">
            Course Summary
          </h2>

          <div
            class="grid md:grid-cols-2 gap-5"
          >
            <div
              v-for="item in summary"
              :key="item.course._id"
              class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
            >
              <h3
                class="text-xl font-bold text-blue-400"
              >
                {{ item.course.courseCode }}
              </h3>

              <p class="text-gray-400">
                {{ item.course.courseTitle }}
              </p>

              <div
                class="grid grid-cols-3 gap-4 mt-6"
              >
                <div>
                  <p class="text-gray-500 text-sm">
                    Scheduled
                  </p>

                  <h4 class="text-2xl font-bold">
                    {{ item.totalSessions }}
                  </h4>
                </div>

                <div>
                  <p class="text-gray-500 text-sm">
                    Attended
                  </p>

                  <h4 class="text-2xl font-bold">
                    {{ item.attended }}
                  </h4>
                </div>

                <div>
                  <p class="text-gray-500 text-sm">
                    Rate
                  </p>

                  <h4
                    class="text-2xl font-bold text-green-400"
                  >
                    {{ item.percentage }}%
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>