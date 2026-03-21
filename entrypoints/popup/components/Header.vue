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
    <a class="brand-wrapper" href="https://github.com/NTUT-NPC/ntut_sso_plus" target="_blank">
      <h3 class="brand-logo">NTUT SSO<span class="plus-sign">+</span></h3>
      <div class="npc-tag">v{{ browser.runtime.getManifest().version }} BY NPC</div>
    </a>
    <div class="header-actions">
      <a class="icon-btn" href="https://nportal.ntut.edu.tw" target="_blank" title="校園入口網站">
        <div class="icon portal"></div>
      </a>
      <a class="icon-btn" href="https://github.com/NTUT-NPC/ntut_sso_plus" target="_blank" title="GitHub 專案">
        <div class="icon github"></div>
      </a>
      <button class="icon-btn" title="開啟分頁" @click="openInNewTab">
        <div class="icon external-link"></div>
      </button>
      <button class="icon-btn" title="視窗模式" @click="openInNewWindow">
        <div class="icon maximize"></div>
      </button>
      <button v-if="showLogout" class="modern-btn sm" @click="handleLogout">登出</button>
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
  text-decoration: none;
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

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-main);
  color: var(--text-sub);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.icon-btn:hover {
  background: var(--border);
  color: var(--text-main);
  border-color: var(--primary);
}

.icon {
  width: 20px;
  height: 20px;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.portal {
  mask-image: url('/icons/school.svg');
  -webkit-mask-image: url('/icons/school.svg');
}
.github {
  mask-image: url('/icons/github.svg');
  -webkit-mask-image: url('/icons/github.svg');
}

.external-link {
  mask-image: url('/icons/open_in_browser.svg');
  -webkit-mask-image: url('/icons/open_in_browser.svg');
}

.maximize {
  mask-image: url('/icons/open_in_new_down.svg');
  -webkit-mask-image: url('/icons/open_in_new_down.svg');
}

.modern-btn.sm {
  padding: 8.5px 17px;
  font-size: 12px;
}
</style>
