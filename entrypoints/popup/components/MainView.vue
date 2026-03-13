<script setup lang="ts">
import { ref } from 'vue';
import Header from './Header.vue';
import Tabs from './Tabs.vue';
import MainTab from './MainTab.vue';
import EditTab from './EditTab.vue';
import ExperimentalTab from './ExperimentalTab.vue';

const emit = defineEmits(['logout']);

const tabs = [
  { id: 'main', label: '校園入口' },
  { id: 'edit', label: '編輯常用' },
  { id: 'other', label: '實驗性' },
];

const handleLogout = () => {
  emit('logout');
};

const refreshMainTab = ref(0);
const handleFavoritesChanged = () => {
  refreshMainTab.value++;
};
</script>

<template>
  <div id="main-view" class="animate-fade-in">
    <Header show-logout @logout="handleLogout" />

    <div class="main-content">
      <Tabs :tabs="tabs">
        <template #main>
          <MainTab :key="refreshMainTab" />
        </template>
        <template #edit>
          <EditTab @favorites-changed="handleFavoritesChanged" />
        </template>
        <template #other>
          <ExperimentalTab is-logged-in />
        </template>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
#main-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* for flex child scroll */
}
</style>
