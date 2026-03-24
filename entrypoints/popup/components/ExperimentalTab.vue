<script setup lang="ts">
import { ref, onMounted, toRaw } from 'vue';
import { browser } from 'wxt/browser';
import { startSSO } from '../sso';
import CollapsibleGuide from './CollapsibleGuide.vue';
import FileDownloadPreview from './FileDownloadPreview.vue';
import CourseSelectorPreview from './CourseSelectorPreview.vue';
import VideoDownloadPreview from './VideoDownloadPreview.vue';
import ToggleSwitch from './ToggleSwitch.vue';

defineProps<{
  isLoggedIn?: boolean;
}>();

const isDarkMode = ref(false);
const debugMode = ref(false);
const isUserCssEnabled = ref(true);

onMounted(async () => {
  const data = await browser.storage.local.get(['debugMode', 'theme', 'isUserCssEnabled']) as { debugMode?: boolean, theme?: string, isUserCssEnabled?: boolean };
  debugMode.value = !!data.debugMode;
  isDarkMode.value = data.theme === 'dark';
  isUserCssEnabled.value = data.isUserCssEnabled !== false;
});

const toggleDebugMode = async () => {
  await browser.storage.local.set({ debugMode: debugMode.value });
};

const toggleCss = async () => {
  await browser.storage.local.set({ isUserCssEnabled: isUserCssEnabled.value });
};

const toggleDarkMode = async () => {
  const newTheme = isDarkMode.value ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  await browser.storage.local.set({ theme: newTheme });
};

const handleSSO = (code: string) => {
  startSSO(code);
};
</script>

<template>
  <div class="exp-section animate-fade-in">
    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">擴充功能樣式</div>
        <div class="exp-card-desc">切換深色模式以獲得更舒適的夜間使用體驗。</div>
        <ToggleSwitch 
          v-model="isDarkMode"
          label="深色模式"
          description="啟用深色背景與明亮文字的配色方案。"
          @update:modelValue="toggleDarkMode"
        />
      </div>
    </div>


    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">自訂網站樣式</div>
        <div class="exp-card-desc">全域開啟或關閉由本擴充功能提供的網站樣式優化。</div>
        <ToggleSwitch 
          v-model="isUserCssEnabled"
          label="啟用樣式優化"
          description="關閉此選項將停用所有自訂 CSS。變更後請重新整理網頁。"
          @update:modelValue="toggleCss"
        />
      </div>
    </div>

    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">加退選快速填課</div>
        <div class="exp-card-desc">在加退選頁面輸入課號，一鍵自動填入欄位並查詢。</div>
        
        <CollapsibleGuide title="使用方式">
          <div class="guide-split">
            <div class="guide-preview">
              <CourseSelectorPreview />
            </div>
            <div class="guide-info">
              <b>Step 1: 進入加退選</b>
              <p>進入學校的加退選系統頁面，外掛會自動新增一個課號輸入區。</p>
              <b>Step 2: 輸入課號</b>
              <p>在輸入區輸入您想要選的所有課號（可以用空白或逗號分開）。</p>
              <b>Step 3: 自動填表</b>
              <p>點擊「自動填入」，外掛會幫您填好頁面上所有的課號欄位並立刻送出查詢。</p>
            </div>
          </div>
        </CollapsibleGuide>

        <div class="exp-card-actions" v-if="isLoggedIn">
          <button class="modern-btn" @click="handleSSO('aa_030_oauth')">前往加退選一機</button>
          <button class="modern-btn" @click="handleSSO('aa_030_2_oauth')">前往加退選二機</button>
          <button class="modern-btn" @click="handleSSO('aa_030_3_oauth')">前往加退選三機</button>
        </div>
      </div>
    </div>

    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">i 學園檔案下載</div>
        <div class="exp-card-desc">在 i 學園下載檔案。</div>

        <CollapsibleGuide title="使用方式">
          <div class="guide-split">
            <div class="guide-preview">
              <FileDownloadPreview />
            </div>
            <div class="guide-info">
              <b>Step 1: 進入課程</b>
              <p>在 i 學園中進入課程。外掛會自動在側邊欄注入功能區塊。</p>
              <b>Step 2: 載入清單</b>
              <p>點擊左側模擬畫面中的「檔案下載」標題，系統將自動獲取該課程的所有教材檔案。</p>
              <b>Step 3: 一鍵下載</b>
              <p>載入完成後，直接點擊檔案名稱即可下載。</p>
            </div>
          </div>
        </CollapsibleGuide>

        <div class="exp-card-actions" v-if="isLoggedIn">
          <button class="modern-btn" @click="handleSSO('ischool_plus_oauth')">前往北科 i 學園</button>
        </div>
      </div>
    </div>

    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">i 學園影片下載</div>
        <div class="exp-card-desc">在 i 學園下載上課影片。</div>

        <CollapsibleGuide title="使用方式">
          <div class="guide-split">
            <div class="guide-preview">
              <VideoDownloadPreview />
            </div>
            <div class="guide-info">
              <b>Step 1: 進入課程</b>
              <p>在 i 學園中進入課程並播放想要下載的影片。外掛會自動在播放器左上角注入功能區塊。</p>
              <b>Step 2: 下載影片</b>
              <p>點擊左側模擬畫面中的「講師」或「簡報」按鈕，系統將自動下載對應軌道的影片。</p> 
            </div>
          </div>
        </CollapsibleGuide>

        <div class="exp-card-actions" v-if="isLoggedIn">
          <button class="modern-btn" @click="handleSSO('ischool_plus_oauth')">前往北科 i 學園</button>
        </div>
      </div>
    </div>
    <div class="glass-card exp-card">
      <div class="exp-card-body">
        <div class="category-title">偵錯模式</div>
        <div class="exp-card-desc">開啟後可在 console 查看 JSON。</div>
        <ToggleSwitch 
          v-model="debugMode"
          label="Debug Mode"
          description="記錄詳細的 API 請求與響應資訊到開發者主控台。"
          @update:modelValue="toggleDebugMode"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.exp-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-xl);
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
    margin-top: var(--spacing-md);
}

.guide-placeholder {
    color: var(--text-muted);
    font-style: italic;
    text-align: center;
    padding: var(--spacing-sm);
}

.guide-split {
    display: flex;
    gap: var(--spacing-md);
    align-items: flex-start;
}

.guide-preview {
    flex: 1;
    min-width: 0;
}

.guide-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    color: var(--text-main);
    font-size: 13px;
}

.guide-info b {
    color: var(--text-main);
    margin-top: var(--spacing-xs);
}

.guide-info p {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-sub);
    line-height: 1.6;
}

@media (max-width: 600px) {
    .guide-split {
        flex-direction: column;
    }
}

.toggle-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
