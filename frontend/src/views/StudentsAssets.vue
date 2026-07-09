<script setup>
import { ref, computed, onMounted } from "vue";
import API from "../services/api";

import StudentSidebar from "../components/student/StudentSidebar.vue";
import StudentHeader from "../components/student/StudentHeader.vue";

const isSidebarOpen = ref(false);

const assetLogs = ref([]);

const assetTag = ref("");
const returnTag = ref("");

const loading = ref(false);

const fetchAssets = async () => {
  try {
    loading.value = true;

    const res = await API.get("/assets/student-logs");

    assetLogs.value = res.data;

  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAssets);

const borrowAsset = async () => {

  if (!assetTag.value)
    return alert("Enter asset tag");

  try {

    const res = await API.post("/assets/borrow", {
      assetTag: assetTag.value
    });

    alert(res.data.message);

    assetTag.value = "";

    fetchAssets();

  } catch (err) {
    alert(err.response?.data?.message || "Failed");
  }

};

const returnAsset = async () => {

  if (!returnTag.value)
    return alert("Enter asset tag");

  try {

    const res = await API.post("/assets/return", {
      assetTag: returnTag.value,
      condition: "Good"
    });

    alert(res.data.message);

    returnTag.value = "";

    fetchAssets();

  } catch (err) {
    alert(err.response?.data?.message || "Failed");
  }

};

const activeAssets = computed(() =>
  assetLogs.value.filter(
    a => a.approvedBorrow && !a.approvedReturn
  ).length
);

const pendingBorrow = computed(() =>
  assetLogs.value.filter(
    a => !a.approvedBorrow && !a.borrowRejected
  ).length
);

const pendingReturn = computed(() =>
  assetLogs.value.filter(
    a =>
      a.approvedBorrow &&
      !a.approvedReturn &&
      a.returnedAt
  ).length
);

const historyCount = computed(() => assetLogs.value.length);

const status = (log) => {

  if (log.borrowRejected)
    return "Borrow Rejected";

  if (log.returnRejected)
    return "Return Rejected";

  if (!log.approvedBorrow)
    return "Pending Borrow";

  if (
    log.approvedBorrow &&
    !log.returnedAt
  )
    return "Borrowed";

  if (
    log.returnedAt &&
    !log.approvedReturn
  )
    return "Pending Return";

  if (log.approvedReturn)
    return "Returned";

  return "-";
};

const badgeClass = (log) => {

  if (log.borrowRejected)
    return "bg-red-600";

  if (log.returnRejected)
    return "bg-red-600";

  if (!log.approvedBorrow)
    return "bg-yellow-600";

  if (
    log.returnedAt &&
    !log.approvedReturn
  )
    return "bg-orange-600";

  if (log.approvedReturn)
    return "bg-green-600";

  return "bg-blue-600";
};
</script>

<template>
<div class="flex bg-black min-h-screen text-white">

    <StudentSidebar
        :is-open="isSidebarOpen"
        @close="isSidebarOpen=false"
    />

    <div class="flex-1 flex flex-col">

        <StudentHeader
            @toggle-sidebar="
                isSidebarOpen=!isSidebarOpen
            "
        />

        <div class="p-6 space-y-8">

            <!-- HERO -->

            <div
                class="bg-gradient-to-r from-purple-600 to-blue-700 rounded-3xl p-8"
            >
                <h1 class="text-3xl font-bold">
                    My Assets
                </h1>

                <p class="mt-2 text-blue-100">
                    Borrow assets, return assets and monitor your asset history.
                </p>
            </div>

            <!-- ANALYTICS -->

            <div class="grid md:grid-cols-4 gap-5">

                <div class="bg-gray-900 rounded-2xl p-5">
                    <p class="text-gray-400">
                        Active Assets
                    </p>

                    <h2 class="text-4xl font-bold text-green-400 mt-3">
                        {{ activeAssets }}
                    </h2>
                </div>

                <div class="bg-gray-900 rounded-2xl p-5">
                    <p class="text-gray-400">
                        Pending Borrow
                    </p>

                    <h2 class="text-4xl font-bold text-yellow-400 mt-3">
                        {{ pendingBorrow }}
                    </h2>
                </div>

                <div class="bg-gray-900 rounded-2xl p-5">
                    <p class="text-gray-400">
                        Pending Return
                    </p>

                    <h2 class="text-4xl font-bold text-orange-400 mt-3">
                        {{ pendingReturn }}
                    </h2>
                </div>

                <div class="bg-gray-900 rounded-2xl p-5">
                    <p class="text-gray-400">
                        Asset History
                    </p>

                    <h2 class="text-4xl font-bold text-blue-400 mt-3">
                        {{ historyCount }}
                    </h2>
                </div>

            </div>

            <!-- ACTIONS -->

            <div class="grid lg:grid-cols-2 gap-6">

                <div class="bg-gray-900 rounded-3xl p-6">

                    <h2 class="text-2xl font-bold">
                        Borrow Asset
                    </h2>

                    <input
                        v-model="assetTag"
                        placeholder="Enter Asset Tag"
                        class="w-full bg-gray-800 rounded-xl p-4 mt-6"
                    />

                    <button
                        @click="borrowAsset"
                        class="w-full mt-5 bg-green-600 hover:bg-green-700 rounded-xl py-4 font-semibold"
                    >
                        Borrow Asset
                    </button>

                </div>

                <div class="bg-gray-900 rounded-3xl p-6">

                    <h2 class="text-2xl font-bold">
                        Return Asset
                    </h2>

                    <input
                        v-model="returnTag"
                        placeholder="Enter Asset Tag"
                        class="w-full bg-gray-800 rounded-xl p-4 mt-6"
                    />

                    <button
                        @click="returnAsset"
                        class="w-full mt-5 bg-yellow-600 hover:bg-yellow-700 rounded-xl py-4 font-semibold"
                    >
                        Return Asset
                    </button>

                </div>

            </div>

            <!-- HISTORY -->

            <div class="bg-gray-900 rounded-3xl p-6">

                <h2 class="text-2xl font-bold mb-6">
                    Asset History
                </h2>

                <div class="overflow-auto">

                    <table class="w-full">

                        <thead>

                            <tr class="border-b border-gray-700">

                                <th class="text-left p-4">
                                    Asset
                                </th>

                                <th class="text-left p-4">
                                    Borrowed
                                </th>

                                <th class="text-left p-4">
                                    Due Date
                                </th>

                                <th class="text-left p-4">
                                    Returned
                                </th>

                                <th class="text-left p-4">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            <tr
                                v-for="log in assetLogs"
                                :key="log._id"
                                class="border-b border-gray-800"
                            >

                                <td class="p-4">
                                    {{ log.asset?.name }}
                                </td>

                                <td class="p-4">
                                    {{
                                        log.borrowedAt
                                        ? new Date(log.borrowedAt).toLocaleDateString()
                                        : "-"
                                    }}
                                </td>

                                <td class="p-4">
                                    {{
                                        log.dueDate
                                        ? new Date(log.dueDate).toLocaleDateString()
                                        : "-"
                                    }}
                                </td>

                                <td class="p-4">
                                    {{
                                        log.returnedAt
                                        ? new Date(log.returnedAt).toLocaleDateString()
                                        : "-"
                                    }}
                                </td>

                                <td class="p-4">

                                    <span
                                        :class="[
                                            badgeClass(log),
                                            'px-3 py-1 rounded-full text-sm'
                                        ]"
                                    >
                                        {{ status(log) }}
                                    </span>

                                </td>

                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    </div>

</div>
</template>