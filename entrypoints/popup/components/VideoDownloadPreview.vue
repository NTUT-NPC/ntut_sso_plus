<script setup lang="ts">
import { ref } from 'vue';

const downloadingCh = ref<string | null>(null);
const videoGifUrl = new URL('/assets/video.gif', import.meta.url).href;

const simulateDownload = (ch: string) => {
  downloadingCh.value = ch;
  setTimeout(() => {
    downloadingCh.value = null;
  }, 2000);
};
</script>

<template>
  <div class="simulation-wrapper video-player-sim">
    <!-- Mock Video Player with Background GIF -->
    <div 
      class="mock-player" 
      :style="{ backgroundImage: `url(${videoGifUrl})` }"
    >
      <!-- Injected Download Bar -->
      <div id="ntut-sso-dl-bar" class="preview-mode">
        <div class="ntut-sso-dl-top">
          <span class="ntut-sso-dl-label">下載影片</span>
          <span class="ntut-sso-dl-hint">請先播放影片再下載</span>
        </div>
        <div class="ntut-sso-dl-btns">
          <button 
            class="ntut-sso-dl-btn" 
            :class="{ 'ntut-sso-dl-btn--started': downloadingCh === '講師' }"
            @click.prevent="simulateDownload('講師')"
          >
            {{ downloadingCh === '講師' ? '下載中... 45%' : '講師' }}
          </button>
          <button 
            class="ntut-sso-dl-btn" 
            :class="{ 'ntut-sso-dl-btn--started': downloadingCh === '簡報' }"
            @click.prevent="simulateDownload('簡報')"
          >
            {{ downloadingCh === '簡報' ? '下載中... 12%' : '簡報' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../video-download.css";

.simulation-wrapper.video-player-sim {
    background: #000;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    aspect-ratio: 16 / 9;
}

.mock-player {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

/* Override fixed positioning for preview */
#ntut-sso-dl-bar.preview-mode {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    cursor: default;
    border: 1px solid rgba(255,255,255,0.1);
}

/* Ensure variables are defined even if bar is nested differently */
#ntut-sso-dl-bar.preview-mode {
  --primary: #000;
  --bg: #f3f4f6;
  --card-bg: #ffffff;
  --btn-bg: #000000;
  --text-btn: #ffffff;
  --border: #000000;
}
</style>
