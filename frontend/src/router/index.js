import { createRouter, createWebHistory } from 'vue-router'

// basic pages (you will create these)
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminSignup from '@/views/AdminSignup.vue'
import ScanPage from '@/views/ScanPage.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import StudentDashboard from '@/views/StudentDashboard.vue'
import AdminStudents from '@/views/AdminStudents.vue'
import AdminCourses from '@/views/AdminCourses.vue'
import AdminAttendance from '@/views/AdminAttendance.vue'
import AdminAssets from '@/views/AdminAssets.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    { path: "/adminSignup", component: AdminSignup },
    { path: "/admin/dashboard", component: AdminDashboard },
    { path: "/student/dashboard", component: StudentDashboard },
    { path: "/scan", component: ScanPage },
    { path: "/admin/students", component: AdminStudents},
    { path: "/admin/Courses", component: AdminCourses},
    { path: "/admin/attendance", component: AdminAttendance },
    { path: "/admin/assets", component: AdminAssets}
  ],
})

export default router