<script setup lang="ts">
import { browser } from 'wxt/browser';

defineProps<{
  showLogout?: boolean;
}>();

const emit = defineEmits(['logout']);

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

const handleLogout = () => {
  emit('logout');
};
</script>

<template>
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
      <button v-if="showLogout" class="modern-btn" @click="handleLogout">登出</button>
    </div>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-md);
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
</style>
