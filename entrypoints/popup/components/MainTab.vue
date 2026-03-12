<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref, onMounted } from 'vue';
import { SERVICES, DEFAULT_FAVORITES } from '../constants';
import { startSSO } from '../sso';

const favorites = ref<string[]>([]);

onMounted(async () => {
  const result = await browser.storage.local.get({ custom_favorites: DEFAULT_FAVORITES });
  favorites.value = result.custom_favorites as string[];
});

const getServiceName = (code: string) => {
  for (const cat in SERVICES) {
    const category = SERVICES[cat as keyof typeof SERVICES];
    for (const [name, c] of Object.entries(category)) {
      if (c === code) return name;
    }
  }
  return code;
};

const handleSSO = (code: string) => {
  startSSO(code);
};
</script>

<template>
  <div id="service-container">
    <div class="category-title">
      <span>常用服務</span>
    </div>
    
    <div v-if="favorites.length === 0" class="empty-favorites-msg glass-card">
      尚未設定常用服務
    </div>
    <div v-else class="grid-layout">
      <div 
        v-for="code in favorites" 
        :key="code" 
        class="grid-item glass-card active"
        @click="handleSSO(code)"
      >
        {{ getServiceName(code) }}
      </div>
    </div>

    <div v-for="(items, category) in SERVICES" :key="category">
      <div class="category-title">
        {{ category }}
      </div>
      <div class="grid-layout">
        <div 
          v-for="(code, name) in items" 
          :key="code" 
          class="grid-item glass-card active"
          @click="handleSSO(code)"
        >
          {{ name }}
        </div>
      </div>
    </div>
    
    <a 
      class="repo-link" 
      href="https://github.com/NTUT-NPC/ntut_sso_plus" 
      target="_blank" 
      rel="noopener noreferrer"
    >
      GitHub Repository
    </a>
  </div>
</template>

<style scoped>
#service-container {
    padding: var(--spacing-xs) 0;
}

.repo-link {
    display: block;
    text-align: center;
    margin-top: var(--spacing-xl);
    padding: var(--spacing-md);
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: none;
    transition: color var(--transition-fast);
}

.repo-link:hover {
    color: var(--text-main);
    text-decoration: underline;
}

.empty-favorites-msg {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-sub);
    font-size: 14px;
    margin-bottom: var(--spacing-md);
}
</style>
