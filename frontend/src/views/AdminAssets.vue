<script setup>
import { ref, computed, onMounted } from "vue";
import API from "../services/api";

import Sidebar from "../components/admin/Sidebar.vue";
import Header from "../components/admin/Header.vue";

const isSidebarOpen = ref(false);

const assets = ref([]);
const logs = ref([]);

// UI STATE
const search = ref("");
const filterStatus = ref("all");

const showLogsModal = ref(false);
const selectedAssetLogs = ref([]);
const selectedAsset = ref(null);

const isOverdue = (log) => {
  if (!log || log.returnedAt) return false;

  const borrowedTime = new Date(log.borrowedAt).getTime();
  const now = Date.now();

  const days = (now - borrowedTime) / (1000 * 60 * 60 * 24);

  return days > 7; // 7 days rule
};
// ---------------- FETCH ----------------

const fetchAssets = async () => {
  const res = await API.get("/assets");
  assets.value = res.data;
};

const fetchLogs = async () => {
  const res = await API.get("/admin/asset-logs");
  logs.value = res.data;
};

onMounted(() => {
  fetchAssets();
  fetchLogs();
});

// CREATE ASSET MODAL
const showCreateModal = ref(false);

const assetName = ref("");
const assetDescription = ref("");

const createAsset = async () => {
  try {
    const res = await API.post("/assets/create", {
      name: assetName.value,
      description: assetDescription.value
    });

    // add instantly to UI
    assets.value.unshift(res.data);
    downloadQR(res.data.qrCode, res.data.assetTag);

    // reset
    assetName.value = "";
    assetDescription.value = "";
    showCreateModal.value = false;

  } catch (err) {
    console.log(err);
  }
};

const showAssetDetail = ref(false);

const openAssetDetail = (asset) => {
  selectedAsset.value = asset;
  selectedAssetLogs.value = logs.value.filter(
    l => l.asset?._id === asset._id
  );
  showAssetDetail.value = true;
};

// ---------------- COMPUTED ----------------

// Filter + Search
const filteredAssets = computed(() => {
  return assets.value.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(search.value.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(search.value.toLowerCase());

    const matchesFilter =
      filterStatus.value === "all" ||
      asset.status === filterStatus.value;

    return matchesSearch && matchesFilter;
  });
});

// Current holder
const getCurrentHolder = (assetId) => {
  return logs.value.find(
    l => l.asset?._id === assetId && !l.returnedAt
  ) || null;
};

// ---------------- ACTIONS ----------------

// VIEW LOGS
const viewLogs = (asset) => {
  selectedAsset.value = asset;

  selectedAssetLogs.value = logs.value.filter(
    l => l.asset?._id === asset._id
  );

  showLogsModal.value = true;
};

// APPROVE RETURN
const approveReturn = async (logId) => {
  if (!logId) return;

  await API.post("/assets/approve-return", { logId });

  await fetchAssets();
  await fetchLogs();
};

// DOWNLOAD QR
const downloadQR = (qr, tag) => {
  const link = document.createElement("a");
  link.href = qr;
  link.download = `${tag}.png`;
  link.click();
};
</script>

<template>
<div class="flex bg-gray-950 min-h-screen text-white">

  <Sidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

  <div class="flex-1 flex flex-col overflow-hidden">
    <Header @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

    <div class="p-6 md:p-8 space-y-6 overflow-auto">

      <!-- HEADER -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">Assets</h1>
          <p class="text-gray-400">Manage all school assets</p>
        </div>

        <button
            @click="showCreateModal = true"
            class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
        >
            + Add Asset
    </button>    
      </div>

      <!-- SEARCH + FILTER -->
      <div class="flex gap-4">
        <input
          v-model="search"
          placeholder="Search by name or tag..."
          class="bg-gray-800 px-4 py-2 rounded w-full"
        />

        <select
          v-model="filterStatus"
          class="bg-gray-800 px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="borrowed">Borrowed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <!-- TABLE -->
      <div class="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table class="w-full text-sm">

          <thead class="bg-gray-800 text-gray-400">
            <tr>
              <th class="p-4 text-left">Asset</th>
              <th class="p-4 text-left">Tag</th>
              <th class="p-4 text-left">Status</th>
              <th class="p-4 text-left">Holder</th>
              <th class="p-4 text-left">QR</th>
              <th class="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="asset in filteredAssets"
              :key="asset._id"
              class="border-t border-gray-800 hover:bg-gray-800"
            >
              <!-- NAME -->
              <td class="p-4 font-medium">
                {{ asset.name }}
              </td>

              <!-- TAG -->
              <td class="p-4 text-green-400">
                {{ asset.assetTag }}
              </td>

              <!-- STATUS -->
              <td class="p-4">
                <span v-if="asset.status === 'available'" class="text-green-400">
                  Available
                </span>

                <span v-else-if="asset.status === 'borrowed'" class="text-red-400">
                  Borrowed
                </span>

                <span v-else class="text-yellow-400">
                  Pending Approval
                </span>
              </td>

              <!-- HOLDER -->
              <td class="p-4 text-sm">
                  <template v-if="getCurrentHolder(asset._id)">
                    {{ getCurrentHolder(asset._id)?.student?.name }}

                    <span
                    v-if="isOverdue(getCurrentHolder(asset._id))"
                    class="text-red-500 text-xs ml-2"
                    >
                    🔴 Overdue
                    </span>
                </template>
                <span v-else class="text-gray-500">
                  In Store
                </span>
              </td>

              <!-- QR -->
              <td class="p-4">
                <img :src="asset.qrCode" class="w-12 h-12" />
              </td>

              <!-- ACTIONS -->
              <td class="p-4 flex flex-col gap-2 items-center">

                <!-- VIEW LOGS -->
                <button
                  @click="viewLogs(asset)"
                  class="bg-blue-600 px-3 py-1 rounded"
                >
                  Logs
                </button>

                <!-- DOWNLOAD QR -->
                <button
                  @click="downloadQR(asset.qrCode, asset.assetTag)"
                  class="bg-gray-700 px-3 py-1 rounded"
                >
                  Print QR
                </button>

                <!-- APPROVE -->
                <button
                  v-if="asset.status === 'pending'"
                  @click="approveReturn(
                    logs.find(l => l.asset?._id === asset._id && !l.approvedReturn)?._id
                  )"
                  class="bg-green-600 px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                @click="openAssetDetail(asset)"
                class="bg-purple-600 px-3 py-1 rounded"
                >
                Details
                </button>

              </td>
            </tr>
          </tbody>

        </table>
      </div>

    </div>
  </div>

  <!-- LOGS MODAL -->
  <div
    v-if="showLogsModal"
    class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
  >
    <div class="bg-gray-900 p-6 rounded-xl w-full max-w-2xl">

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl">
          {{ selectedAsset?.name }} History
        </h2>

        <button @click="showLogsModal = false">✕</button>
      </div>

      <div
        v-for="log in selectedAssetLogs"
        :key="log._id"
        class="border-b py-3"
      >
        <p class="text-green-400">
          {{ log.student?.name }}
        </p>

        <p class="text-gray-400 text-sm">
          Borrowed: {{ new Date(log.borrowedAt).toLocaleString() }}
        </p>

        <p v-if="log.returnedAt" class="text-yellow-400 text-sm">
          Returned: {{ new Date(log.returnedAt).toLocaleString() }}
        </p>

        <p v-else class="text-red-400 text-sm">
          Not returned
        </p>

        <p v-if="log.approvedReturn" class="text-blue-400 text-xs">
          ✔ Approved
        </p>

        <!-- Approve inside modal -->
        <button
          v-if="log.returnedAt && !log.approvedReturn"
          @click="approveReturn(log._id)"
          class="mt-2 bg-green-600 px-3 py-1 rounded"
        >
          Approve Return
        </button>
      </div>

      <button
        @click="showLogsModal = false"
        class="mt-4 w-full bg-gray-700 py-2 rounded"
      >
        Close
      </button>

    </div>
  </div>

  <!-- CREATE ASSET MODAL -->
        <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
        <div class="bg-gray-900 p-6 rounded-2xl w-full max-w-md space-y-4">

            <!-- HEADER -->
            <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Create Asset</h2>
            <button @click="showCreateModal = false">✕</button>
            </div>

            <!-- FORM -->
            <input
            v-model="assetName"
            placeholder="Asset Name"
            class="w-full p-3 bg-gray-800 rounded"
            />

            <textarea
            v-model="assetDescription"
            placeholder="Description (optional)"
            class="w-full p-3 bg-gray-800 rounded"
            ></textarea>

            <!-- ACTIONS -->
            <div class="flex gap-3 pt-2">
            <button
                @click="createAsset"
                class="flex-1 bg-green-600 py-2 rounded"
            >
                Create
            </button>

            <button
                @click="showCreateModal = false"
                class="flex-1 bg-gray-700 py-2 rounded"
            >
                Cancel
            </button>
            </div>

        </div>
        </div>

        <div v-if="showAssetDetail" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">

        <div class="bg-gray-900 p-6 rounded-xl w-full max-w-3xl">

            <h2 class="text-xl mb-4">{{ selectedAsset?.name }} Analytics</h2>

            <p>Total Borrows: {{ selectedAssetLogs.length }}</p>

            <p>
            Last Borrower:
            {{
                selectedAssetLogs[selectedAssetLogs.length - 1]?.student?.name || "None"
            }}
            </p>

            <div class="mt-4">
            <h3 class="text-lg">Condition History</h3>

            <div v-for="log in selectedAssetLogs" :key="log._id">
                <p class="text-sm">
                {{ log.conditionOnReturn || "No condition recorded" }}
                </p>
            </div>
            </div>

            <button
            @click="showAssetDetail = false"
            class="mt-4 bg-gray-700 px-4 py-2 rounded"
            >
            Close
            </button>

        </div>

        </div>

</div>
</template>