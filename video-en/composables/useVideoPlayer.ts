import { ref, computed, onMounted, onUnmounted } from 'vue';

export function useVideoPlayer(videoRef: Ref<HTMLVideoElement | null>) {
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(1);
  const isMuted = ref(false);
  const playbackRate = ref(1);

  const progress = computed(() => {
    if (duration.value === 0) return 0;
    return (currentTime.value / duration.value) * 100;
  });

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.value) return;
    if (isPlaying.value) {
      videoRef.value.pause();
    } else {
      videoRef.value.play();
    }
  };

  const seek = (time: number) => {
    if (!videoRef.value) return;
    videoRef.value.currentTime = time;
  };

  const seekByProgress = (progress: number) => {
    seek(progress * duration.value / 100);
  };

  const setVolume = (vol: number) => {
    if (!videoRef.value) return;
    volume.value = vol;
    videoRef.value.volume = vol;
    isMuted.value = vol === 0;
  };

  const toggleMute = () => {
    if (!videoRef.value) return;
    isMuted.value = !isMuted.value;
    videoRef.value.muted = isMuted.value;
  };

  const setPlaybackRate = (rate: number) => {
    if (!videoRef.value) return;
    playbackRate.value = rate;
    videoRef.value.playbackRate = rate;
  };

  const skip = (seconds: number) => {
    seek(currentTime.value + seconds);
  };

  const updateTime = () => {
    if (videoRef.value) {
      currentTime.value = videoRef.value.currentTime;
    }
  };

  const updateDuration = () => {
    if (videoRef.value) {
      duration.value = videoRef.value.duration;
    }
  };

  const onPlay = () => { isPlaying.value = true; };
  const onPause = () => { isPlaying.value = false; };

  onMounted(() => {
    if (videoRef.value) {
      videoRef.value.addEventListener('timeupdate', updateTime);
      videoRef.value.addEventListener('loadedmetadata', updateDuration);
      videoRef.value.addEventListener('play', onPlay);
      videoRef.value.addEventListener('pause', onPause);
    }
  });

  onUnmounted(() => {
    if (videoRef.value) {
      videoRef.value.removeEventListener('timeupdate', updateTime);
      videoRef.value.removeEventListener('loadedmetadata', updateDuration);
      videoRef.value.removeEventListener('play', onPlay);
      videoRef.value.removeEventListener('pause', onPause);
    }
  });

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    progress,
    formatTime,
    togglePlay,
    seek,
    seekByProgress,
    setVolume,
    toggleMute,
    setPlaybackRate,
    skip
  };
}
