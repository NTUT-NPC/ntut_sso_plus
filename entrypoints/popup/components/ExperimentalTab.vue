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
const userCssSettings = ref<Record<string, boolean>>({ global: true });
const subdomains = ref<string[]>([]);

onMounted(async () => {
  const data = await browser.storage.local.get(['debugMode', 'userCssSettings', 'theme']) as { debugMode?: boolean, userCssSettings?: Record<string, boolean>, theme?: string };
  debugMode.value = !!data.debugMode;
  isDarkMode.value = data.theme === 'dark';

  // Discover subdomains with CSS files
  const cssModules = import.meta.glob('../../user-css/*.css', { eager: true });
  if (debugMode.value) {
    console.log('[ExperimentalTab] Discovered CSS modules:', cssModules);
  }
  subdomains.value = Object.keys(cssModules).map(path => 
    path.split('/').pop()!.replace('.css', '')
  );

  // Filter userCssSettings to only valid subdomains and 'global'
  const validKeys = new Set(['global', ...subdomains.value]);
  if (data.userCssSettings) {
    const cleaned = Object.fromEntries(
      Object.entries(data.userCssSettings).filter(([k]) => validKeys.has(k))
    );
    userCssSettings.value = cleaned;
    // Save cleaned settings if any keys were removed
    if (Object.keys(cleaned).length !== Object.keys(data.userCssSettings).length) {
      if (debugMode.value) {
        console.log('[ExperimentalTab] Cleaned userCssSettings:', cleaned);
      }
      await browser.storage.local.set({ userCssSettings: cleaned });
    }
  } else {
    userCssSettings.value = { global: true };
    await browser.storage.local.set({ userCssSettings: { global: true } });
  }
});

const saveSettings = async () => {
  // Only save settings for valid subdomains and 'global'
  const validKeys = new Set(['global', ...subdomains.value]);
  const rawData = Object.fromEntries(
    Object.entries(toRaw(userCssSettings.value)).filter(([k]) => validKeys.has(k))
  );
  userCssSettings.value = rawData;
  if (debugMode.value) {
    console.log('[ExperimentalTab] Saving userCssSettings:', rawData);
  }
  await browser.storage.local.set({ userCssSettings: rawData });
};

const toggleDebugMode = async () => {
  await browser.storage.local.set({ debugMode: debugMode.value });
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
        <div class="category-title">網站特製樣式</div>
        <div class="exp-card-desc">管理各子網域的樣式。若要套用變更，請重新整理網頁。</div>
        <div class="toggle-list">
          <ToggleSwitch 
            v-model="userCssSettings.global"
            label="全域樣式"
            description="關閉後將停用所有子網域的自訂 CSS 樣式。"
            @update:modelValue="saveSettings"
          />
          <ToggleSwitch 
            v-for="sub in subdomains" 
            :key="sub"
            v-model="userCssSettings[sub]"
            :label="`${sub} 樣式`"
            description="切換該子網域的特定樣式。"
            @update:modelValue="saveSettings"
          />
        </div>
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
