<script setup>

import { ref, onMounted } from "vue";
import API from "../services/api";

import StudentSidebar from "../components/student/StudentSidebar.vue";
import StudentHeader from "../components/student/StudentHeader.vue";

const isSidebarOpen = ref(false);

const courses = ref([]);

const schedules = ref([]);

const summary = ref([]);

const stats = ref({});

const loading = ref(false);

const fetchDashboard = async () => {

    try{

        loading.value = true;

        const res =
        await API.get(
            "/student/course-dashboard"
        );

        courses.value =
        res.data.courses;

        schedules.value =
        res.data.schedules;

        summary.value =
        res.data.summary;

        stats.value =
        res.data.stats;

    }

    finally{

        loading.value = false;

    }

};

onMounted(fetchDashboard);

const progressColor=(percentage)=>{

    if(percentage>=90)
        return "bg-green-500";

    if(percentage>=75)
        return "bg-blue-500";

    if(percentage>=60)
        return "bg-yellow-500";

    return "bg-red-500";

};

const status=(p)=>{

    if(p>=90)
        return "Excellent";

    if(p>=75)
        return "Good";

    if(p>=60)
        return "Average";

    return "Needs Improvement";

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

    <!-- Page -->
    <div class="p-6 space-y-8">

      <!-- Hero -->
      <div
        class="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8"
      >
        <h1 class="text-4xl font-bold">
          My Courses
        </h1>

        <p class="mt-3 text-blue-100 max-w-2xl">
          View your enrolled courses,
          lecturers, weekly timetable and
          attendance performance all in one place.
        </p>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && courses.length===0"
        class="bg-gray-900 border border-gray-800 rounded-3xl p-16 text-center"
      >
        <div class="text-6xl">
          📚
        </div>

        <h2 class="mt-6 text-2xl font-bold">
          No Courses Assigned
        </h2>

        <p class="mt-3 text-gray-400">
          Please contact your department administrator.
        </p>
      </div>

      <template v-else>

        <!-- Statistics -->
        <div
          class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
        >

          <div class="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p class="text-gray-400">
              Total Courses
            </p>

            <h2 class="mt-3 text-4xl font-bold text-blue-400">
              {{ stats.totalCourses }}
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p class="text-gray-400">
              Classes This Week
            </p>

            <h2 class="mt-3 text-4xl font-bold text-green-400">
              {{ stats.classesThisWeek }}
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p class="text-gray-400">
              Overall Attendance
            </p>

            <h2 class="mt-3 text-4xl font-bold text-yellow-400">
              {{ stats.overallAttendance }}%
            </h2>
          </div>

          <div class="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <p class="text-gray-400">
              Today's Classes
            </p>

            <h2 class="mt-3 text-4xl font-bold text-purple-400">
              {{ stats.upcomingToday }}
            </h2>
          </div>

        </div>

        <!-- Course Cards -->
        <div>

          <h2 class="text-2xl font-bold mb-5">
            Enrolled Courses
          </h2>

          <div
            class="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
          >

            <div
              v-for="item in summary"
              :key="item.course._id"
              class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
            >

              <div class="flex justify-between">

                <div>

                  <h3 class="text-2xl font-bold text-blue-400">
                    {{ item.course.courseCode }}
                  </h3>

                  <p class="text-gray-300 mt-1">
                    {{ item.course.courseTitle }}
                  </p>

                </div>

                <span
                  class="px-3 py-1 rounded-full bg-indigo-700 text-sm h-fit"
                >
                  Level {{ item.course.level }}
                </span>

              </div>

              <div class="mt-5 space-y-2 text-sm">

                <p>
                  👨‍🏫
                  {{ item.course.lecturer?.name || "Not Assigned" }}
                </p>

                <p>
                  Department:
                  {{ item.course.department }}
                </p>

              </div>

              <div class="mt-6">

                <div class="flex justify-between mb-2">

                  <span>Attendance</span>

                  <span>
                    {{ item.percentage }}%
                  </span>

                </div>

                <div
                  class="w-full bg-gray-800 rounded-full h-3"
                >
                  <div
                    :class="[
                      progressColor(item.percentage),
                      'h-3 rounded-full'
                    ]"
                    :style="{
                      width:item.percentage+'%'
                    }"
                  ></div>
                </div>

              </div>

              <div class="mt-6">

                <p class="text-gray-400 text-sm">
                  Next Class
                </p>

                <div
                  v-if="item.nextClass"
                  class="mt-2"
                >

                  <p>
                    {{ new Date(item.nextClass.date).toLocaleDateString() }}
                  </p>

                  <p class="text-gray-300">
                    {{ item.nextClass.startTime }}
                    -
                    {{ item.nextClass.endTime }}
                  </p>

                </div>

                <p
                  v-else
                  class="mt-2 text-gray-500"
                >
                  No upcoming class
                </p>

              </div>

            </div>

          </div>

        </div>

        <!-- Weekly Timetable -->
        <div
          class="bg-gray-900 rounded-3xl border border-gray-800 p-6"
        >

          <h2 class="text-2xl font-bold">
            Weekly Timetable
          </h2>

          <div
            class="overflow-x-auto mt-6"
          >

            <table class="w-full">

              <thead class="bg-gray-800">

                <tr>

                  <th class="text-left p-4">
                    Day
                  </th>

                  <th class="text-left p-4">
                    Course
                  </th>

                  <th class="text-left p-4">
                    Time
                  </th>

                  <th class="text-left p-4">
                    Venue
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr
                  v-for="schedule in schedules"
                  :key="schedule._id"
                  class="border-t border-gray-800"
                >

                  <td class="p-4">
                    {{ schedule.day }}
                  </td>

                  <td class="p-4">
                    {{ schedule.course.courseCode }}
                  </td>

                  <td class="p-4">
                    {{ schedule.startTime }}
                    -
                    {{ schedule.endTime }}
                  </td>

                  <td class="p-4">
                    {{ schedule.location || "-" }}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

        <!-- Performance -->
        <div>

          <h2 class="text-2xl font-bold mb-5">
            Attendance Performance
          </h2>

          <div
            class="grid md:grid-cols-2 gap-5"
          >

            <div
              v-for="item in summary"
              :key="item.course._id"
              class="bg-gray-900 border border-gray-800 rounded-3xl p-6"
            >

              <div class="flex justify-between">

                <h3 class="font-bold text-lg">
                  {{ item.course.courseCode }}
                </h3>

                <span class="text-blue-400">
                  {{ item.percentage }}%
                </span>

              </div>

              <div
                class="w-full h-3 bg-gray-800 rounded-full mt-4"
              >

                <div
                  :class="[
                    progressColor(item.percentage),
                    'h-3 rounded-full'
                  ]"
                  :style="{
                    width:item.percentage+'%'
                  }"
                ></div>

              </div>

              <div
                class="grid grid-cols-2 gap-6 mt-6"
              >

                <div>

                  <p class="text-gray-500">
                    Present
                  </p>

                  <h4 class="text-2xl font-bold text-green-400">
                    {{ item.attended }}
                  </h4>

                </div>

                <div>

                  <p class="text-gray-500">
                    Missed
                  </p>

                  <h4 class="text-2xl font-bold text-red-400">
                    {{ item.missed }}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- Summary Table -->
        <div
          class="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden"
        >

          <div class="p-6">

            <h2 class="text-2xl font-bold">
              Course Summary
            </h2>

          </div>

          <div class="overflow-x-auto">

            <table class="w-full">

              <thead class="bg-gray-800">

                <tr>

                  <th class="text-left p-4">Code</th>

                  <th class="text-left p-4">Course</th>

                  <th class="text-left p-4">Lecturer</th>

                  <th class="text-left p-4">Attendance</th>

                  <th class="text-left p-4">Sessions</th>

                  <th class="text-left p-4">Status</th>

                </tr>

              </thead>

              <tbody>

                <tr
                  v-for="item in summary"
                  :key="item.course._id"
                  class="border-t border-gray-800"
                >

                  <td class="p-4">
                    {{ item.course.courseCode }}
                  </td>

                  <td class="p-4">
                    {{ item.course.courseTitle }}
                  </td>

                  <td class="p-4">
                    {{ item.course.lecturer?.name }}
                  </td>

                  <td class="p-4">
                    {{ item.percentage }}%
                  </td>

                  <td class="p-4">
                    {{ item.attended }} /
                    {{ item.totalSessions }}
                  </td>

                  <td class="p-4">

                    <span
                      class="px-3 py-1 rounded-full text-sm"
                      :class="{
                        'bg-green-700': item.percentage>=90,
                        'bg-blue-700': item.percentage>=75 && item.percentage<90,
                        'bg-yellow-700 text-black': item.percentage>=60 && item.percentage<75,
                        'bg-red-700': item.percentage<60
                      }"
                    >
                      {{ status(item.percentage) }}
                    </span>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </template>

    </div>

  </div>

</div>
</template>