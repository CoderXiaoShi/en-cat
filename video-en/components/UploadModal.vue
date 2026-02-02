<template>
  <div class="upload-modal" v-if="isOpen" @click.self="$emit('close')">
    <div class="modal-content">
      <h3>添加视频</h3>

      <div
        class="upload-area"
        :class="{ dragging: isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p>拖拽视频到这里，或点击选择文件</p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 8px;">
          支持 MP4, MOV, AVI 格式
        </p>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          @change="handleFileSelect"
        />
      </div>

      <div v-if="selectedFile" class="selected-file">
        <div class="file-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
      </div>

      <div v-if="isProcessing" class="processing-status">
        <div class="spinner"></div>
        <span>正在识别字幕，请稍候...</span>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" @click="$emit('close')">取消</button>
        <button
          class="submit-btn"
          :disabled="!selectedFile || isProcessing"
          @click="uploadVideo"
        >
          {{ isProcessing ? '处理中...' : '开始识别' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVideoStore } from '~/stores/video';
import { useSubtitleRecognition } from '~/composables/useSubtitleRecognition';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'uploaded', videoId: string): void
}>();

const videoStore = useVideoStore();
const { recognizeSubtitles, generateSubtitles } = useSubtitleRecognition();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const isProcessing = ref(false);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0];
    if (file.type.startsWith('video/')) {
      selectedFile.value = file;
    }
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const uploadVideo = async () => {
  if (!selectedFile.value) return;

  isProcessing.value = true;

  try {
    const videoUrl = URL.createObjectURL(selectedFile.value);
    const videoId = `video-${Date.now()}`;

    videoStore.addVideo({
      id: videoId,
      name: selectedFile.value.name,
      filePath: videoUrl,
      duration: 0,
      subtitles: [],
      createdAt: new Date()
    });

    const results = await recognizeSubtitles(selectedFile.value);
    const subtitles = generateSubtitles(results, 0);

    videoStore.addSubtitles(videoId, subtitles);

    emit('uploaded', videoId);
    emit('close');

    selectedFile.value = null;
  } catch (error) {
    console.error('上传失败:', error);
    alert('字幕识别失败，请重试');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped lang="scss">
.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal-content {
    background: #1a1a2e;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 500px;

    h3 {
      color: #fff;
      font-size: 18px;
      margin-bottom: 20px;
    }

    .upload-area {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #e94560;
        background: rgba(233, 69, 96, 0.05);
      }

      &.dragging {
        border-color: #e94560;
        background: rgba(233, 69, 96, 0.1);
      }

      svg {
        width: 48px;
        height: 48px;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 12px;
      }

      p {
        color: rgba(255, 255, 255, 0.6);
        font-size: 14px;
      }

      input {
        display: none;
      }
    }

    .selected-file {
      margin-top: 16px;
      padding: 12px;
      background: rgba(233, 69, 96, 0.1);
      border: 1px solid rgba(233, 69, 96, 0.3);
      border-radius: 8px;

      .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fff;

        svg {
          color: #e94560;
        }

        .file-size {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          margin-left: auto;
        }
      }
    }

    .processing-status {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top-color: #e94560;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;

      button {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .cancel-btn {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }

      .submit-btn {
        background: #e94560;
        color: #fff;

        &:hover {
          background: #d63d56;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
