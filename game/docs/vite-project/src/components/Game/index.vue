<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import GameCanvas from './GameCanvas.vue'

type Mode = 'practice' | 'dictation'
const mode = ref<Mode>('practice')
onMounted(() => {
  const v = localStorage.getItem('game.mode')
  if (v === 'practice' || v === 'dictation') mode.value = v
})
const modeLabel = computed(() => (mode.value === 'practice' ? '练习模式' : '默写模式'))
</script>
<template>
  <div class="game">
    <div class="top-left">
      <a href="#/settings" class="settings-top-left">设置</a>
      <span class="mode-chip">{{ modeLabel }}</span>
    </div>
    <GameCanvas />
  </div>
</template> 
<style lang="scss">
.game {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.top-left {
  position: fixed;
  left: 12px;
  top: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
}
.settings-top-left {
  background: rgba(255, 255, 255, 0.92);
  color: rgba(0, 0, 0, 0.86);
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 5px;
  padding: 8px 12px;
  text-decoration: none;
  font-size: 13px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
}
.mode-chip {
  background: transparent;
  color: #fff;
  border: none;
  border-radius: 0;
  padding: 6px 0;
  font-size: 12px;
  box-shadow: none;
}
</style>
