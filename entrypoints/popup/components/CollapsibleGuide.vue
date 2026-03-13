<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
}>();

const isOpen = ref(false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="guide-container" :class="{ 'is-open': isOpen }">
    <button class="guide-header" @click="toggle">
      <span class="guide-title">{{ title }}</span>
      <span class="guide-icon">{{ isOpen ? '−' : '+' }}</span>
    </button>
    <div v-if="isOpen" class="guide-content animate-fade-in">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.guide-container {
  margin-top: var(--spacing-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-main);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.guide-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-sub);
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.guide-header:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
}

body[data-theme="dark"] .guide-header:hover {
    background: rgba(255, 255, 255, 0.05);
}

.guide-icon {
  font-family: monospace;
  font-size: 16px;
  color: var(--primary);
}

.guide-content {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-main);
}

.is-open {
  border-color: var(--primary-glow);
  box-shadow: 0 2px 8px var(--primary-glow);
}
</style>
