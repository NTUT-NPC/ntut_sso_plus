<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  label?: string;
  description?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <div class="toggle-container" @click="toggle" :class="{ 'is-active': modelValue }">
    <div class="toggle-info" v-if="label || description">
      <div v-if="label" class="toggle-label">{{ label }}</div>
      <div v-if="description" class="toggle-description">{{ description }}</div>
    </div>
    <div class="toggle-track">
      <div class="toggle-thumb"></div>
    </div>
  </div>
</template>

<style scoped>
.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: 10px 14px;
  background: var(--bg-main);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;
  min-height: 56px;
}

.toggle-container:hover {
  border-color: var(--primary);
  background: var(--bg-hover, rgba(0, 0, 0, 0.02));
}

body[data-theme="dark"] .toggle-container:hover {
  background: rgba(255, 255, 255, 0.03);
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.toggle-description {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.3;
}

.toggle-track {
  position: relative;
  width: 40px;
  height: 22px;
  background: var(--border);
  border-radius: 11px;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all var(--transition-normal);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.toggle-container.is-active .toggle-track {
  background: var(--accent);
}

/* Light mode primary for active state if accent is too subtle */
body:not([data-theme="dark"]) .toggle-container.is-active .toggle-track {
  background: var(--primary);
}

.toggle-container.is-active .toggle-thumb {
  transform: translateX(18px);
}

/* GNOME/iOS feel: thumb slightly larger on active is often nice, but let's keep it simple first */
</style>
