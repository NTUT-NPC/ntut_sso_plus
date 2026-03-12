<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref } from 'vue';
import { encrypt } from '../cryptoUtils';
import { BASE_URL } from '../constants';

const emit = defineEmits(['login-success']);

const uid = ref('');
const pwd = ref('');
const isLoading = ref(false);

const handleSave = async () => {
  if (!uid.value || !pwd.value) {
    alert('請填寫帳號與密碼');
    return;
  }
  
  isLoading.value = true;
  try {
    const loginParams = new URLSearchParams({ 
      muid: uid.value, 
      mpassword: pwd.value 
    });
    
    const res = await fetch(`${BASE_URL}login.do?${loginParams.toString()}`, { 
      method: 'POST' 
    });
    const text = await res.text();
    const body = JSON.parse(text);

    if (body.success) {
      const encryptedPwd = await encrypt(pwd.value);
      await browser.storage.local.set({ uid: uid.value, pwd: encryptedPwd });
      emit('login-success');
    } else {
      alert('登入失敗，請檢查帳號密碼');
    }
  } catch (err) {
    console.error(err);
    alert('連線失敗，請檢查網路狀態');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div id="login-container" class="animate-fade-in">
    <div id="login-card" class="glass-card">
      <div class="login-header">
        <div class="login-icon">
          <img src="/icons/icon128.png" alt="SSO+ Logo" />
        </div>
        <h2 class="login-title">NTUT SSO<span class="plus-sign">+</span></h2>
        <p class="login-subtitle">請輸入您的門戶帳號密碼</p>
      </div>

      <div class="login-form">
        <div class="input-group">
          <label for="uid">帳號 (學號/身份證字號)</label>
          <input 
            id="uid" 
            v-model="uid" 
            class="input-field"
            type="text" 
            placeholder="請輸入帳號" 
            @keyup.enter="handleSave"
          />
        </div>

        <div class="input-group">
          <label for="pwd">密碼</label>
          <input 
            id="pwd" 
            v-model="pwd" 
            class="input-field"
            type="password" 
            placeholder="請輸入密碼" 
            @keyup.enter="handleSave"
          />
        </div>

        <button class="modern-btn" :disabled="isLoading" @click="handleSave">
          {{ isLoading ? '驗證中...' : '儲存並登入' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

#login-card {
  width: 100%;
  max-width: 360px;
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.login-icon {
  width: 80px;
  height: 80px;
}

.login-icon img {
  width: 100%;
  height: 100%;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
}

.plus-sign {
  color: var(--primary);
}

.login-subtitle {
  color: var(--text-sub);
  font-size: 14px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
</style>
