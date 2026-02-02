<template>
  <aside class="sidebar" :class="{ collapsed: !isSidebarOpen }">
    <div class="sidebar-header">
      <h3 v-if="isSidebarOpen">我的视频</h3>
      <button class="toggle-btn" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="video-list" v-if="isSidebarOpen">
      <div
        v-for="video in videos"
        :key="video.id"
        class="video-item"
        :class="{ active: video.id === currentVideoId }"
        @click="selectVideo(video.id)"
      >
        <div class="video-thumbnail">
          <img v-if="video.thumbnail" :src="video.thumbnail" alt="缩略图" />
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
        <div class="video-info">
          <div class="video-name">{{ video.name }}</div>
          <div class="video-meta">{{ formatDuration(video.duration) }}</div>
        </div>
        <button class="delete-btn" @click.stop="deleteVideo(video.id)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="sidebar-footer">
      <button class="add-video-btn" @click="$emit('openUpload')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span v-if="isSidebarOpen">添加视频</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useVideoStore } from '~/stores/video';

const emit = defineEmits<{
  (e: 'openUpload'): void
}>();

const videoStore = useVideoStore();
const { videos, currentVideoId, isSidebarOpen } = storeToRefs(videoStore);
const { selectVideo, removeVideo, toggleSidebar } = videoStore;

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const deleteVideo = (id: string) => {
  if (confirm('确定要删除这个视频吗？')) {
    removeVideo(id);
  }
};
</script>
