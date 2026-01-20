<script setup lang="ts">
const emit = defineEmits<{
  (e: 'press', ch: string): void
  (e: 'space'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'delete'): void
}>()

const row1 = ['Q','W','E','R','T','Y','U','I','O','P']
const row2 = ['A','S','D','F','G','H','J','K','L']
const row3 = ['Z','X','C','V','B','N','M']
</script>

<template>
  <div class="kb">
    <div class="kb-row">
      <button v-for="k in row1" :key="k" class="kb-key" @click="emit('press', k)">{{ k }}</button>
      <button class="kb-key delete" @click="emit('delete')" aria-label="删除">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M6 7h12l-1.5 12.5c-.1.8-.8 1.5-1.6 1.5H9.1c-.8 0-1.5-.7-1.6-1.5L6 7zm4.5-3h3l1 2H9.5l1-2zM10 10v8m4-8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
    <div class="kb-row">
      <button v-for="k in row2" :key="k" class="kb-key" @click="emit('press', k)">{{ k }}</button>
    </div>
    <div class="kb-row">
      <button v-for="k in row3" :key="k" class="kb-key" @click="emit('press', k)">{{ k }}</button>
    </div>
    <div class="kb-row kb-bottom">
      <button class="kb-key cancel" @click="emit('cancel')">取消</button>
      <button class="kb-key space" @click="emit('space')">空格</button>
      <button class="kb-key confirm" @click="emit('confirm')">确认</button>
    </div>
  </div>
  <div class="kb-safe"></div>
</template>

<style scoped>
.kb {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  padding: 8px 10px;
  background: #f3f4f6;
  border-top: 1px solid rgba(0,0,0,0.08);
}
.kb-row {
  display: flex;
  gap: 2px;
  justify-content: center;
  margin-bottom: 8px;
}
.kb-key {
  min-width: 32px;
  height: 44px;
  padding: 0 10px;
  border-radius: 10px;
  background: #fff;
  color: rgba(0,0,0,0.86);
  border: 1px solid rgba(0,0,0,0.12);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 6px 14px rgba(0,0,0,0.08);
}
.kb-key:active {
  transform: translateY(1px);
}
.kb-bottom {
  gap: 8px;
}
.cancel {
  flex: 1;
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.space {
  flex: 2;
  text-align: center;
}
.confirm {
  flex: 1;
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.delete {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.kb-bottom .kb-key {
  font-size: 14px;
}
.icon {
  width: 20px;
  height: 20px;
}
.kb-safe {
  height: env(safe-area-inset-bottom);
}
</style>
