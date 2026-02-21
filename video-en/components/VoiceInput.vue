<template>
  <div class="voice-message">
    <div class="voice-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      </svg>
      <span>{{ isRecording ? '录音中...' : '语音识别结果' }}</span>
    </div>

    <div v-if="isRecording" class="voice-wave">
      <div
        v-for="i in 20"
        :key="i"
        class="wave-bar"
        :style="{ animationDelay: `${i * 0.05}s` }"
      ></div>
    </div>

    <div v-else class="voice-text">{{ transcript }}</div>

    <div class="voice-actions">
      <button v-if="isRecording" class="stop-btn" @click="stopRecording">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
        停止
      </button>
      <button v-if="!isRecording && transcript" class="confirm-btn" @click="confirmResult">
        确认
      </button>
      <button v-if="!isRecording" class="cancel-btn" @click="$emit('close')">
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const emit = defineEmits<{
  (e: 'result', text: string): void;
  (e: 'close'): void
}>();

const isRecording = ref(false);
const transcript = ref('');
let recognition: any = null;

const startRecording = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('您的浏览器不支持语音识别');
    return;
  }

  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let result = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        result += event.results[i][0].transcript;
      }
    }
    if (result) {
      transcript.value = result.trim();
    }
  };

  recognition.onerror = (event: any) => {
    console.error('语音识别错误:', event.error);
    if (event.error !== 'no-speech') {
      isRecording.value = false;
    }
  };

  recognition.onend = () => {
    if (isRecording.value) {
      recognition.start();
    } else {
      isRecording.value = false;
    }
  };

  recognition.start();
  isRecording.value = true;
};

const stopRecording = () => {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  isRecording.value = false;
};

const confirmResult = () => {
  if (transcript.value) {
    emit('result', transcript.value);
  }
};

onUnmounted(() => {
  if (recognition) {
    recognition.stop();
  }
});

startRecording();
</script>

<style scoped lang="scss">
@use "sass:math";

.voice-message {
  background: rgba(233, 69, 96, 0.1);
  border: 1px solid rgba(233, 69, 96, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;

  .voice-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;

    svg {
      color: #e94560;
    }
  }

  .voice-wave {
    height: 32px;
    background: rgba(233, 69, 96, 0.1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 0 8px;

    .wave-bar {
      width: 3px;
      background: #e94560;
      border-radius: 2px;
      animation: wave 0.5s ease-in-out infinite;

      @for $i from 1 through 20 {
        &:nth-child(#{$i}) {
          height: 8px + math.random(16) + px;
          animation-delay: #{$i * 0.05}s;
        }
      }
    }
  }

  .voice-text {
    color: #fff;
    font-size: 14px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .voice-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    justify-content: flex-end;

    button {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }

    .stop-btn {
      background: #ff4757;
      color: #fff;
    }

    .confirm-btn {
      background: #e94560;
      color: #fff;
    }

    .cancel-btn {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }
}

@keyframes wave {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.5); }
}
</style>
