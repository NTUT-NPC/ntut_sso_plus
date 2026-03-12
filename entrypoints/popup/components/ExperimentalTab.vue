<script setup lang="ts">
import { browser } from 'wxt/browser';
import { startSSO } from '../sso';

const themes = [
  { name: '淺色', value: 'light' },
  { name: '深色', value: 'dark' },
];

const changeTheme = async (theme: string) => {
  document.body.setAttribute('data-theme', theme);
  await browser.storage.local.set({ theme });
};

const handleSSO = (code: string) => {
  startSSO(code);
};
</script>

<template>
  <div class="exp-section animate-fade-in">
    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">配色主題</div>
        <div class="exp-card-desc">選擇您喜愛的介面配色方案。</div>
        <div class="exp-card-actions">
          <button 
            v-for="theme in themes" 
            :key="theme.value" 
            class="modern-btn" 
            @click="changeTheme(theme.value)"
          >
            {{ theme.name }}
          </button>
        </div>
      </div>
    </div>

    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">加退選快速填課</div>
        <div class="exp-card-desc">在加退選頁面輸入課號，一鍵自動填入欄位並查詢。</div>
        <div class="exp-card-actions">
          <button class="modern-btn" @click="handleSSO('aa_030_oauth')">前往加退選一機</button>
          <button class="modern-btn" @click="handleSSO('aa_030_2_oauth')">前往加退選二機</button>
          <button class="modern-btn" @click="handleSSO('aa_030_3_oauth')">前往加退選三機</button>
        </div>
      </div>
    </div>

    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">北科 i 學園下載器</div>
        <div class="exp-card-desc">在 i 學園課程頁面自動偵測並提供影片與教材下載按鈕。</div>
        <div class="exp-card-actions">
          <button class="modern-btn" @click="handleSSO('ischool_plus_oauth')">前往北科 i 學園</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exp-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.exp-card-desc {
    font-size: 13px;
    color: var(--text-sub);
    margin-bottom: var(--spacing-md);
    line-height: 1.5;
}

.exp-card-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.theme-btn {
    padding: 6px 12px;
    font-size: 12px;
}
</style>
