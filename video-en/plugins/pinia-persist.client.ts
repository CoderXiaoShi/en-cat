import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  const persistState = () => {
    const videoStore = useVideoStore();

    watch(
      () => videoStore.videos,
      (videos) => {
        localStorage.setItem('video-store', JSON.stringify({
          videos: videos,
          currentVideoId: videoStore.currentVideoId,
          notes: videoStore.notes,
          isSidebarOpen: videoStore.isSidebarOpen
        }));
      },
      { deep: true }
    );

    const saved = localStorage.getItem('video-store');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.videos) videoStore.videos = data.videos;
        if (data.currentVideoId) videoStore.currentVideoId = data.currentVideoId;
        if (data.notes) videoStore.notes = data.notes;
        if (typeof data.isSidebarOpen === 'boolean') videoStore.isSidebarOpen = data.isSidebarOpen;
      } catch (e) {
        console.error('恢复存储数据失败:', e);
      }
    }
  };

  persistState();
});
