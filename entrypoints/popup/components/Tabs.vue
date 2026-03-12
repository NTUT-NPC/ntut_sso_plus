<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
  tabs: Tab[];
  defaultTab?: string;
}>();

const activeTab = ref(props.defaultTab || props.tabs[0].id);

const setActiveTab = (id: string) => {
  activeTab.value = id;
};

defineExpose({
  activeTab,
  setActiveTab
});
</script>

<template>
  <div class="tabs-wrapper">
    <div class="tabs-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-trigger"
        :class="{ active: activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="tab-content-area">
      <template v-for="tab in tabs" :key="tab.id">
        <div v-if="activeTab === tab.id" class="animate-fade-in">
          <slot :name="tab.id"></slot>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tab-icon {
  margin-right: 6px;
}
</style>
