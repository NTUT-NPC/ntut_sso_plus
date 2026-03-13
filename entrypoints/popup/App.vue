<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref, onMounted } from 'vue';
import Login from './components/Login.vue';
import MainView from './components/MainView.vue';
import Tabs from './components/Tabs.vue';
import ExperimentalTab from './components/ExperimentalTab.vue';
import Header from './components/Header.vue';

const isLoggedIn = ref(false);
const isLoading = ref(true);

const guestTabs = [
  { id: 'login', label: '登入' },
  { id: 'other', label: '快捷功能' },
];

onMounted(async () => {
  const result = await browser.storage.local.get(['uid', 'pwd', 'theme']);
  if (result.theme) {
    document.body.setAttribute('data-theme', result.theme as string);
  }
  
  if (result.uid && result.pwd) {
    isLoggedIn.value = true;
  }
  isLoading.value = false;
});

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
};

const handleLogout = async () => {
  await browser.storage.local.remove(['uid', 'pwd']);
  isLoggedIn.value = false;
};
</script>

<template>
  <div class="container">
    <div v-if="isLoading" class="loading-screen">
      載入中...
    </div>
    <template v-else>
      <MainView v-if="isLoggedIn" @logout="handleLogout" />
      <div v-else class="guest-view">
        <Header />
        <Tabs :tabs="guestTabs">
          <template #login>
            <Login @login-success="handleLoginSuccess" />
          </template>
          <template #other>
            <ExperimentalTab />
          </template>
        </Tabs>
      </div>
    </template>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  background: var(--bg-sub);
}

.guest-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.loading-screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
  background: var(--bg-sub);
  gap: var(--spacing-md);
}

.loading-screen::after {
  content: "";
  width: 40px;
  height: 40px;
  border: 4px solid var(--primary-glow);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
