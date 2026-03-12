<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref } from 'vue';
import Tabs from './Tabs.vue';
import MainTab from './MainTab.vue';
import EditTab from './EditTab.vue';
import ExperimentalTab from './ExperimentalTab.vue';

const emit = defineEmits(['logout']);

const tabs = [
  { id: 'main', label: '校園入口' },
  { id: 'edit', label: '編輯常用' },
  { id: 'other', label: '實驗性' },
];

const handleLogout = () => {
  emit('logout');
};

const openInNewTab = () => {
  browser.tabs.create({ url: (browser.runtime as any).getURL('/popup.html') });
};

const openInNewWindow = () => {
  browser.windows.create({
    url: (browser.runtime as any).getURL('/popup.html'),
    type: 'popup',
    width: 720,
    height: 640,
  });
  window.close();
};

const refreshMainTab = ref(0);
const handleFavoritesChanged = () => {
  refreshMainTab.value++;
};
</script>

<template>
  <div id="main-view" class="animate-fade-in">
    <header class="glass-card">
      <div class="brand-wrapper">
        <h3 class="brand-logo">NTUT SSO<span class="plus-sign">+</span></h3>
        <div class="npc-tag">BY NPC</div>
      </div>
      <div class="header-actions">
        <button class="modern-btn secondary" title="在新分頁開啟" @click="openInNewTab">
          新分頁
        </button>
        <button class="modern-btn secondary" title="在新視窗開啟" @click="openInNewWindow">
          新視窗
        </button>
        <button class="modern-btn" @click="handleLogout">登出</button>
      </div>
    </header>

    <div class="main-content">
      <Tabs :tabs="tabs">
        <template #main>
          <MainTab :key="refreshMainTab" />
        </template>
        <template #edit>
          <EditTab @favorites-changed="handleFavoritesChanged" />
        </template>
        <template #other>
          <ExperimentalTab />
        </template>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
#main-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-md);
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
}

.brand-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.brand-logo {
  font-size: 1.2rem;
  font-weight: 900;
  margin: 0;
  color: var(--text-main);
}

.plus-sign {
  color: var(--primary);
  margin-left: 2px;
}

.npc-tag {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* for flex child scroll */
}
</style>
