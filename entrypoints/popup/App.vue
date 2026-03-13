<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref, onMounted } from 'vue';
import Login from './components/Login.vue';
import MainView from './components/MainView.vue';

const isLoggedIn = ref(false);
const isLoading = ref(true);

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
    <Login v-else-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    <MainView v-else @logout="handleLogout" />
  </div>
</template>

<style scoped>
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
