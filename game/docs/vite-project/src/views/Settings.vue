<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Mode = 'practice' | 'dictation'
const mode = ref<Mode>('practice')

function load() {
  const v = localStorage.getItem('game.mode')
  if (v === 'practice' || v === 'dictation') mode.value = v
}

function save() {
  localStorage.setItem('game.mode', mode.value)
  localStorage.setItem('game.restart', '1')
  location.hash = '#/'
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="title">设置</div>
      <a class="link" href="#/">返回游戏</a>
    </header>
    <main class="content">
      <section class="card">
        <div class="card-title">游戏模式</div>
        <div class="btns">
          <button
            class="mode-btn"
            :class="{ active: mode === 'practice' }"
            @click="mode = 'practice'; save()"
          >
            练习模式
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'dictation' }"
            @click="mode = 'dictation'; save()"
          >
            默写模式
          </button>
        </div>
        <div class="tip">当前：{{ mode === 'practice' ? '练习模式' : '默写模式' }}</div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #f5f5f7;
}
.topbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.title {
  font-weight: 700;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.86);
}
.link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
}
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 16px;
}
.card {
  width: min(520px, 92vw);
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  padding: 16px;
}
.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}
.btns {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 10px;
}
@media (min-width: 480px) {
  .btns {
    flex-direction: row;
  }
}
.mode-btn {
  width: 100%;
  min-height: 52px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #ffffff;
  color: rgba(0, 0, 0, 0.86);
  font-size: 16px;
  font-weight: 600;
  padding: 12px 16px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}
.mode-btn.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}
.mode-btn:active {
  transform: translateY(1px);
}
.tip {
  margin-top: 12px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
}
</style>
