<script setup>
import { ref, onMounted } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

// icons
import {
  PencilSquareIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  CubeIcon
} from "@heroicons/vue/24/outline";

const isSidebarOpen = ref(false);

const students = ref([]);
const courses = ref([]);

const loading = ref(false);

// modals
const showModal = ref(false);
const showAssignModal = ref(false);
const showAttendanceModal = ref(false);
const showAssetsModal = ref(false);

const closeAllModals = () => {
  showModal.value = false;
  showAssignModal.value = false;
  showAttendanceModal.value = false;
  showAssetsModal.value = false;
  showOverviewModal.value = false;
};

const showOverviewModal = ref(false);
const overviewData = ref({
  courses: [],
  attendance: [],
  assets: [],
  summary: [],
  upcoming: [],
  analytics: {
     totalAttendance: 0,
    upcomingClasses: 0,
    totalCourses: 0,
    overallPercentage: 0
  }
});

// selected
const selectedStudent = ref(null);
const selectedCourses = ref([]);

// data views
const attendanceRecords = ref([]);
const assetLogs = ref([]);

// form
const name = ref("");
const department = ref("");
const level = ref("");
const email = ref("");
const formMode = ref("create");

// ---------------- FETCH ----------------

const fetchStudents = async () => {
  const res = await API.get("/admin/students");
  students.value = res.data;
};

const fetchCourses = async () => {
  const res = await API.get("/courses");
  courses.value = res.data;
};

onMounted(() => {
  fetchStudents();
  fetchCourses();
});

// ---------------- CREATE ----------------
const saveStudent = async () => {

  if (formMode.value === "create") {

    const res = await API.post("/admin/create-student", {
      name: name.value,
      department: department.value,
      level: level.value,
      email: email.value
    });

    students.value.unshift(res.data.student);

  } else {

    const res = await API.put(
      `/admin/student/${selectedStudent.value._id}`,
      {
        name: name.value,
        department: department.value,
        level: level.value,
        email: email.value
      }
    );

    const index = students.value.findIndex(
      s => s._id === res.data._id
    );

    if (index !== -1) {
      students.value[index] = res.data;
    }

  }

  showModal.value = false;

  name.value = "";
  department.value = "";
  level.value = "";
  email.value = "";

};

// ---------------- ASSIGN COURSES ----------------

const openAssignModal = (studentId) => {
  selectedStudent.value = studentId;
  showAssignModal.value = true;
};

const assignCourses = async () => {
  await API.post("/admin/assign-courses", {
    studentId: selectedStudent.value,
    courseIds: selectedCourses.value
  });

  showAssignModal.value = false;
  selectedCourses.value = [];
};

// ---------------- VIEW ATTENDANCE ----------------
const viewAttendance = async (student) => {
  const res = await API.get("/attendance/all");

  attendanceRecords.value = res.data.filter(
    r => r.student?._id === student._id
  );

  showAttendanceModal.value = true;
};

// ---------------- VIEW ASSETS ----------------
const viewAssets = async (student) => {
  const res = await API.get("/admin/asset-logs");

  assetLogs.value = res.data.filter(
    log => log.student?._id === student._id
  );

  showAssetsModal.value = true;
};

const openStudentOverview = async (student) => {
  selectedStudent.value = student;

  try {
    const res = await API.get(
      `/admin/student-overview/${student._id}`
    );

    overviewData.value = res.data;

    showOverviewModal.value = true;

  } catch (err) {
    console.log(err);
  }
};

const openCreateModal = () => {
  formMode.value = "create";

  selectedStudent.value = null;

  name.value = "";
  department.value = "";
  level.value = "";
  email.value = "";

  showModal.value = true;
};

const openEditModal = (student) => {

  formMode.value = "edit";

  selectedStudent.value = student;

  name.value = student.name;

  department.value = student.department;

  level.value = student.level;

  email.value = student.email || "";

  showModal.value = true;

};

</script>

<template>
  <div class="flex bg-gray-950 min-h-screen text-white">

    <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex-1 flex flex-col overflow-hidden">

      <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <div class="p-6 md:p-8 space-y-8 overflow-auto">

        <!-- HEADER -->
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold">Students</h1>
            <p class="text-gray-400">Manage all students</p>
          </div>

          <button
            @click="openCreateModal"
            class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            + Add Student
          </button>
        </div>

        <!-- TABLE CARD -->
            <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">

            <!-- TABLE HEADER -->
            <div class="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 class="text-lg font-semibold">All Students</h2>

                <div class="text-sm text-gray-400">
                Total: {{ students.length }}
                </div>
            </div>

            <!-- TABLE -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">

                <thead class="bg-gray-800 text-gray-400">
                    <tr>
                    <th class="text-left p-4">Name</th>
                    <th class="text-left p-4">Student ID</th>
                    <th class="text-left p-4">Email</th>
                    <th class="text-left p-4">Department</th>
                    <th class="text-left p-4">Level</th>
                    <th class="p-4">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr
                    v-for="student in students"
                    :key="student._id"
                    class="border-t border-gray-800 hover:bg-gray-800 transition"
                    >
                    
                    <td
                    class="p-4 font-medium cursor-pointer text-blue-400 hover:underline"
                    @click="openStudentOverview(student)"
                    >
                    {{ student.name }}
                    </td>

                    <td class="p-4 text-green-400">
                        {{ student.studentId }}
                    </td>

                   <td class="p-4">

                      <span
                        v-if="student.email"
                        class="text-green-400"
                      >
                        {{ student.email }}
                      </span>

                      <span
                        v-else
                        class="text-red-400 italic"
                      >
                        No email
                      </span>

                    </td>
                    <td class="p-4 text-gray-300">
                        {{ student.department }}
                    </td>

                    <td class="p-4">
                        <span class="px-2 py-1 bg-gray-800 rounded text-xs">
                        {{ student.level }}
                        </span>
                    </td>
                    <td class="p-4 flex gap-4 items-center">

                       <div class="flex flex-col items-center text-xs">
                          <button
                            @click="openEditModal(student)"
                            class="p-2 bg-indigo-600 rounded hover:bg-indigo-700"
                            title="Edit Student"
                          >
                            <PencilSquareIcon class="w-5 h-5" />
                          </button>

                          <span class="text-gray-400 mt-1">
                            Edit
                          </span>
                        </div>

                        <!-- Assign -->
                        <div class="flex flex-col items-center text-xs">
                            <button
                            @click="openAssignModal(student._id)"
                            class="p-2 bg-blue-600 rounded hover:bg-blue-700"
                            title="Assign Courses"
                            >
                            <UserPlusIcon class="w-5 h-5" />
                            </button>
                            <span class="text-gray-400 mt-1">Assign</span>
                        </div>

                        <!-- Attendance -->
                        <div class="flex flex-col items-center text-xs">
                            <button
                            @click="viewAttendance(student)"
                            class="p-2 bg-green-600 rounded hover:bg-green-700"
                            title="View Attendance"
                            >
                            <ClipboardDocumentListIcon class="w-5 h-5" />
                            </button>
                            <span class="text-gray-400 mt-1">Attendance</span>
                        </div>

                        <!-- Assets -->
                        <div class="flex flex-col items-center text-xs">
                            <button
                            @click="viewAssets(student)"
                            class="p-2 bg-yellow-600 rounded hover:bg-yellow-700"
                            title="View Assets"
                            >
                            <CubeIcon class="w-5 h-5" />
                            </button>
                            <span class="text-gray-400 mt-1">Assets</span>
                        </div>

                        </td>
                    </tr>

                    <tr v-if="students.length === 0">
                    <td colspan="4" class="p-10 text-center text-gray-500">
                        No students yet — create your first student
                    </td>
                    </tr>

                </tbody>
                </table>
            </div>
            

        </div>
      </div>

    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
    >
      <div
        class="bg-gray-900 p-6 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto space-y-6"
      >

        <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold"> {{ formMode === "create"
                  ? "Create Student"
                  : "Edit Student"
              }}</h2>
            <button @click="closeAllModals" class="text-gray-400 hover:text-white">✕</button>
        </div>

        <input v-model="name" placeholder="Name"
          class="w-full p-3 bg-gray-800 rounded" />

        <input v-model="department" placeholder="Department"
          class="w-full p-3 bg-gray-800 rounded" />

        <input v-model="level" placeholder="Level"
          class="w-full p-3 bg-gray-800 rounded" />

          <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="w-full p-3 bg-gray-800 rounded"
            />

        <div class="flex gap-3 pt-2">
          <button
              @click="saveStudent"
              class="flex-1 bg-green-600 py-2 rounded"
            >
              {{ formMode === "create" ? "Create Student" : "Save Changes" }}
            </button>

          <button
            @click="showModal = false"
            class="flex-1 bg-gray-700 py-2 rounded"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>

    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div class="bg-gray-900 p-6 rounded-2xl w-full max-w-md">

            <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">Assign Courses</h2>
            <button @click="closeAllModals" class="text-gray-400 hover:text-white">✕</button>
            </div>

            <div class="max-h-60 overflow-y-auto space-y-2">
            <label v-for="c in courses" :key="c._id" class="flex items-center gap-2">
                <input type="checkbox" :value="c._id" v-model="selectedCourses" />
                {{ c.courseCode }} - {{ c.courseTitle }}
            </label>
            </div>

            <button
            @click="assignCourses"
            class="mt-4 w-full bg-green-600 py-2 rounded"
            >
            Save
            </button>
            <button
            @click="closeAllModals"
            class="mt-2 w-full bg-gray-700 py-2 rounded"
            >
            Cancel
            </button>

        </div>
        </div>
        <div v-if="showAttendanceModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div class="bg-gray-900 p-6 rounded-2xl w-full max-w-2xl">

            <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl">Attendance Records</h2>
            <button @click="closeAllModals">✕</button>
            </div>

            <div v-for="a in attendanceRecords" :key="a._id" class="border-b border-gray-800 py-2">
            <p class="text-green-400">
                {{ a.student?.name }} ({{ a.student?.studentId }})
            </p>

            <p class="text-gray-400 text-sm">
                {{ a.course?.courseCode }} • {{ new Date(a.createdAt).toLocaleString() }}
            </p>
            </div>
            <button
                @click="closeAllModals"
                class="mt-4 w-full bg-gray-700 py-2 rounded"
                >
                Close
                </button>

        </div>
        </div>
        <div v-if="showAssetsModal" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div class="bg-gray-900 p-6 rounded-2xl w-full max-w-2xl">

            <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl">Asset Logs</h2>
            <button @click="closeAllModals">✕</button>
            </div>

            <div
            v-for="log in assetLogs"
            :key="log._id"
            class="border-b border-gray-800 py-3"
            >
            <p class="text-yellow-400 font-semibold">
                {{ log.asset?.name }}
            </p>

            <p class="text-gray-400 text-sm">
                Borrowed: {{ new Date(log.borrowedAt).toLocaleString() }}
            </p>

            <p v-if="log.returnedAt" class="text-green-400 text-sm">
                Returned: {{ new Date(log.returnedAt).toLocaleString() }}
            </p>

            <p v-else class="text-red-400 text-sm">
                Still with student
            </p>

            <p v-if="log.approvedReturn" class="text-blue-400 text-xs">
                ✔ Approved by admin
            </p>
            </div>

        </div>
        </div>

        <!-- STUDENT OVERVIEW MODAL -->
        <div
        v-if="showOverviewModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
        <div
            class="bg-gray-900 p-6 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto space-y-6"
          >

            <!-- HEADER -->
            <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">
                {{ selectedStudent?.name }} Overview
            </h2>
            <button @click="closeAllModals">✕</button>
            </div>

            <!-- COURSES -->
            <div>
            <h3 class="text-lg font-semibold mb-2 text-blue-400">Courses</h3>
            <div v-if="overviewData.courses.length">
                <p
                v-for="c in overviewData.courses"
                :key="c._id"
                class="text-sm text-gray-300"
                >
                {{ c.courseCode }} - {{ c.courseTitle }}
                </p>
            </div>
            <p v-else class="text-gray-500">No courses</p>
            </div>

            <!-- ATTENDANCE -->
            <div class="grid grid-cols-4 gap-4">

                  <div class="bg-gray-800 rounded-xl p-4">
                      <p class="text-gray-400 text-sm">
                          Attendance
                      </p>

                      <h2 class="text-3xl font-bold text-green-400">
                          {{ overviewData.analytics.totalAttendance }}
                      </h2>
                  </div>

                  <div class="bg-gray-800 rounded-xl p-4">
                      <p class="text-gray-400 text-sm">
                          Upcoming
                      </p>

                      <h2 class="text-3xl font-bold text-blue-400">
                          {{ overviewData.analytics.upcomingClasses }}
                      </h2>
                  </div>

                  <div class="bg-gray-800 rounded-xl p-4">
                      <p class="text-gray-400 text-sm">
                          Attendance %
                      </p>

                      <h2 class="text-3xl font-bold text-yellow-400">
                          {{ overviewData.analytics.overallPercentage }}%
                      </h2>
                  </div>

                  <div class="bg-gray-800 rounded-xl p-4">
                      <p class="text-gray-400 text-sm">
                          Courses
                      </p>

                      <h2 class="text-3xl font-bold text-purple-400">
                          {{ overviewData.analytics.totalCourses }}
                      </h2>
                  </div>

              </div>

              <!-- Attendance Performance -->
              <div class="mt-8">
                <h3 class="text-lg font-semibold mb-4 text-green-400">
                  Attendance Performance
                </h3>

                <div
                  v-for="course in overviewData.summary"
                  :key="course.course._id"
                  class="mb-5"
                >
                  <div class="flex justify-between">
                    <span>{{ course.course.courseCode }}</span>

                    <span>{{ course.percentage }}%</span>
                  </div>

                  <div class="w-full bg-gray-800 rounded-full h-3 mt-2">
                    <div
                      class="bg-green-500 h-3 rounded-full"
                      :style="{ width: course.percentage + '%' }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Upcoming Classes -->
            <div class="mt-8">

              <h3 class="text-lg font-semibold mb-4 text-blue-400">
                Upcoming Classes
              </h3>

              <div
                v-if="overviewData.upcoming.length"
                class="grid md:grid-cols-2 gap-4"
              >

                <div
                  v-for="session in overviewData.upcoming"
                  :key="session._id"
                  class="bg-gray-800 rounded-xl p-4"
                >

                  <p class="font-bold text-blue-400">
                    {{ session.course.courseCode }}
                  </p>

                  <p>{{ session.course.courseTitle }}</p>

                  <p class="text-sm text-gray-400">
                    {{ new Date(session.date).toLocaleDateString() }}
                  </p>

                </div>

              </div>

              <p
                v-else
                class="text-gray-500"
              >
                No upcoming classes.
              </p>

            </div>

            <!-- Attendance History -->
              <div class="mt-8">

                <h3 class="text-lg font-semibold mb-4 text-green-400">
                  Attendance History
                </h3>

                <div class="overflow-x-auto">

                  <table class="w-full">

                    <thead>

                      <tr class="text-left border-b border-gray-700">
                        <th class="py-2">Date</th>
                        <th>Course</th>
                        <th>Status</th>
                      </tr>

                    </thead>

                    <tbody>

                      <tr
                        v-for="record in overviewData.attendance"
                        :key="record._id"
                        class="border-b border-gray-800"
                      >

                        <td class="py-2">
                          {{ new Date(record.createdAt).toLocaleDateString() }}
                        </td>

                        <td>
                          {{ record.course.courseCode }}
                        </td>

                        <td>
                          <span class="text-green-400">
                            Present
                          </span>
                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

              </div>

            <!-- ASSETS -->
            <div>
            <h3 class="text-lg font-semibold mb-2 text-yellow-400">
                Assets
            </h3>

            <div v-if="overviewData.assets.length">
                <div
                v-for="log in overviewData.assets"
                :key="log._id"
                class="text-sm text-gray-300"
                >
                {{ log.asset?.name }} -
                <span v-if="log.returnedAt" class="text-green-400">
                    Returned
                </span>
                <span v-else class="text-red-400">
                    Borrowed
                </span>
                </div>
            </div>

            <p v-else class="text-gray-500">No assets</p>
            </div>

            <!-- FOOTER -->
            <button
            @click="closeAllModals"
            class="w-full bg-gray-700 py-2 rounded"
            >
            Close
            </button>

        </div>
        </div>

  </div>
</template>