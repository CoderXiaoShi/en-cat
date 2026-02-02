<template>
  <div class="app-container">
    <VideoList @openUpload="showUploadModal = true" />

    <div class="main-content">
      <VideoPlayer />
      <Notebook />
    </div>

    <UploadModal
      :is-open="showUploadModal"
      @close="showUploadModal = false"
      @uploaded="onVideoUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const showUploadModal = ref(false);

const onVideoUploaded = (videoId: string) => {
  console.log('视频上传完成:', videoId);
};
</script>
