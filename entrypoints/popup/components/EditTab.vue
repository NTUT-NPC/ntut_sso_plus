<script setup lang="ts">
import { browser } from 'wxt/browser';
import { ref, onMounted } from 'vue';
import { SERVICES, DEFAULT_FAVORITES } from '../constants';

const emit = defineEmits(['favorites-changed']);

const selectedSet = ref(new Set<string>());
const statusMsg = ref('');
const isError = ref(false);
const showStatus = ref(false);

onMounted(async () => {
  const result = await browser.storage.local.get({ custom_favorites: DEFAULT_FAVORITES });
  selectedSet.value = new Set(result.custom_favorites as string[]);
});

let timeout: any;
const triggerStatus = (msg: string, err = false) => {
  statusMsg.value = msg;
  isError.value = err;
  showStatus.value = true;
  clearTimeout(timeout);
  timeout = setTimeout(() => showStatus.value = false, 2000);
};

const toggleFavorite = async (code: string, name: string) => {
  if (selectedSet.value.has(code)) {
    selectedSet.value.delete(code);
    triggerStatus(`已移除：${name}`);
  } else {
    if (selectedSet.value.size >= 12) {
      triggerStatus("最多只能設定 12 個常用服務", true);
      return;
    }
    selectedSet.value.add(code);
    triggerStatus(`已新增：${name}`);
  }

  await browser.storage.local.set({ custom_favorites: Array.from(selectedSet.value) });
  emit('favorites-changed');
};
</script>

<template>
  <div id="edit-view" class="animate-fade-in">
    <Transition name="slide">
      <div 
        v-if="showStatus"
        class="status-msg glass-card" 
        :class="{ 'status-error': isError }"
      >
        {{ statusMsg }}
      </div>
    </Transition>
    
    <div id="edit-list">
      <div v-for="(items, category) in SERVICES" :key="category">
        <div class="category-title">{{ category }}</div>
        <div class="grid-layout">
          <div 
            v-for="(code, name) in items" 
            :key="code" 
            class="grid-item glass-card"
            :class="{ active: selectedSet.has(code) }"
            @click="toggleFavorite(code, name)"
          >
            {{ name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#edit-view {
  padding: var(--spacing-xs) 0;
}

.status-msg {
    position: fixed;
    top: var(--spacing-md);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    min-width: 200px;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    pointer-events: none;
    background: var(--primary);
    color: var(--text-on-primary);
    border-color: var(--primary);
}

.status-error {
    background-color: var(--error);
    border-color: var(--error);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translate(-50%, -20px);
  opacity: 0;
}
</style>
