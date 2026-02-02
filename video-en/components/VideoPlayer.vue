<template>
  <div class="video-section">
    <div class="video-player-container" @click="togglePlay">
      <video
        ref="videoElement"
        :src="videoUrl"
        @click.stop
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @ended="onEnded"
        @play="onPlay"
        @pause="onPause"
      ></video>
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    </div>

    <div class="video-controls">
      <button class="control-btn" @click="skip(-5)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 19 2 12 11 5 11 19"></polygon>
          <polygon points="22 19 13 12 22 5 22 19"></polygon>
        </svg>
      </button>

      <button class="control-btn" @click.stop="togglePlay">
        <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>

      <button class="control-btn" @click="skip(5)">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 19 22 12 13 5 13 19"></polygon>
          <polygon points="2 19 11 12 2 5 2 19"></polygon>
        </svg>
      </button>

      <div class="progress-bar" @click="handleProgressClick">
        <div class="progress-fill" :style="{ width: progress + '%' }"></div>
      </div>

      <span class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

      <button class="control-btn" @click="toggleMute">
        <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore } from '~/stores/video';

const videoStore = useVideoStore();
const { currentVideo } = storeToRefs(videoStore);

const videoElement = ref<HTMLVideoElement | null>(null);
const isLoading = ref(true);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isMuted = ref(false);
const progress = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const videoUrl = computed(() => currentVideo.value?.filePath || '');

const formatTime = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const togglePlay = () => {
  if (!videoElement.value) return;
  if (isPlaying.value) {
    videoElement.value.pause();
  } else {
    videoElement.value.play();
  }
};

const skip = (seconds: number) => {
  if (!videoElement.value) return;
  videoElement.value.currentTime += seconds;
};

const handleProgressClick = (e: MouseEvent) => {
  if (!videoElement.value) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  videoElement.value.currentTime = percent * duration.value;
};

const toggleMute = () => {
  if (!videoElement.value) return;
  isMuted.value = !isMuted.value;
  videoElement.value.muted = isMuted.value;
};

const onTimeUpdate = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime;
  }
};

const onLoadedMetadata = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration;
    isLoading.value = false;
  }
};

const onEnded = () => {
  isPlaying.value = false;
};

const onPlay = () => { isPlaying.value = true; };
const onPause = () => { isPlaying.value = false; };

watch(videoUrl, () => {
  isLoading.value = true;
  isPlaying.value = false;
});
</script>
