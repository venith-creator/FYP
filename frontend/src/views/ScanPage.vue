<script setup>
import { QrcodeStream } from "vue-qrcode-reader";
import API from "../services/api";

const onDecode = async (result) => {
  try {
    const data = JSON.parse(result);

    // ATTENDANCE
    if (data.scheduleId) {
      await API.post("/attendance/scan", {
        scheduleId: data.scheduleId
      });

      alert("Attendance recorded");
    }

    // ASSET
    if (data.assetTag) {
      await API.post("/assets/borrow", {
        assetTag: data.assetTag
      });

      alert("Asset borrowed");
    }

  } catch (err) {
    alert("Invalid QR or error");
  }
};
</script>

<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center">

    <h2 class="mb-4">Scan QR Code</h2>

    <qrcode-stream @decode="onDecode" />

  </div>
</template>