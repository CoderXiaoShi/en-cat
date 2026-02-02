<template>
  <section class="notebook-section">
    <div class="notebook-header">
      <h2>字幕笔记</h2>
    </div>

    <div class="notebook-content">
      <div v-if="!currentVideo" class="empty-state">
        <p>请选择或添加一个视频</p>
      </div>
      <template v-else>
        <div
          v-for="subtitle in currentVideo.subtitles"
          :key="subtitle.id"
          class="subtitle-item"
          :class="{ active: isCurrentSubtitle(subtitle) }"
          @click="seekToSubtitle(subtitle)"
        >
          <div class="timestamp">{{ formatTime(subtitle.startTime) }}</div>
          <div class="subtitle-text">{{ subtitle.text }}</div>
        </div>
      </template>
    </div>

    <div class="notebook-input">
      <div class="input-container">
        <textarea
          v-model="noteContent"
          placeholder="添加笔记..."
          @keydown.ctrl.enter="submitNote"
        ></textarea>
        <div class="input-actions">
          <button
            class="voice-btn"
            :class="{ recording: isRecording }"
            @click="toggleRecording"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
            <span>{{ isRecording ? '录音中...' : '语音输入' }}</span>
          </button>
          <button
            class="submit-btn"
            :disabled="!noteContent.trim()"
            @click="submitNote"
          >
            添加
          </button>
        </div>
      </div>
    </div>

    <VoiceInput
      v-if="isRecording"
      @result="onVoiceResult"
      @close="isRecording = false"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useVideoStore, type Subtitle } from '~/stores/video';

const videoStore = useVideoStore();
const { currentVideo, currentVideoId } = storeToRefs(videoStore);

const noteContent = ref('');
const isRecording = ref(false);

const isCurrentSubtitle = (subtitle: Subtitle) => {
  if (!currentVideo.value) return false;
  return false;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const seekToSubtitle = (subtitle: Subtitle) => {
  console.log('跳转到:', subtitle.startTime);
};

const toggleRecording = () => {
  isRecording.value = !isRecording.value;
};

const onVoiceResult = (text: string) => {
  noteContent.value = text;
  isRecording.value = false;
};

const submitNote = () => {
  if (!noteContent.value.trim() || !currentVideoId.value) return;

  videoStore.addNote({
    id: `note-${Date.now()}`,
    videoId: currentVideoId.value,
    content: noteContent.value,
    isVoice: false,
    timestamp: new Date()
  });

  noteContent.value = '';
};
</script>
