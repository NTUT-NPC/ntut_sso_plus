<script setup lang="ts">
import { ref } from 'vue';

const downloadingIndex = ref<number | null>(null);

const simulateDownload = (index: number) => {
  downloadingIndex.value = index;
  // Reset after a short delay to simulate action
  setTimeout(() => {
    downloadingIndex.value = null;
  }, 1000);
};

const fileList = [
  "01_web_Lecture00_Syllabus.pptx",
  "Web programming Lab1",
  "Lab01_ProfilePage",
  "lab03_images",
  "Web programming Lab2",
  "lab04_Javascript",
  "Midterm Project",
  "midterm project 2",
  "Practice 1 _ Taiwan Lottery Number Display"
];
</script>

<template>
  <div class="simulation-wrapper mooc-sidebar">
    <!-- Mock Course Selector -->
    <div class="course-selector-wrapper">
      <select class="mock-select">
        <option>1141_網頁程式設計_351852</option>
      </select>
    </div>

    <div class="section original-site">
      <h2 id="SYS_04_01_000">學習互動區</h2>
      <ul>
        <li class="active"><a id="SYS_04_01_002" href="#" @click.prevent>教材及錄影</a></li>
        <li><a id="SYS_04_01_001" href="#" @click.prevent>課程公告</a></li>
        <li><a id="SYS_04_01_003" href="#" @click.prevent>課程討論</a></li>
        <li><a id="SYS_04_01_004" href="#" @click.prevent>線上討論室</a></li>
        <li><a id="SYS_04_01_005" href="#" @click.prevent>議題討論</a></li>
        <li><a id="SYS_04_01_006" href="#" @click.prevent>分組討論</a></li>
      </ul>
    </div>
    
    <div class="section" id="ntut-sso-fdl-section">
      <h2 id="ntut-sso-fdl-header">
        <span class="ntut-sso-fdl-title">檔案下載</span>
        <span class="ntut-sso-fdl-badge" title="課程 ID">cid: 10098775</span>
        <span class="ntut-sso-fdl-badge ntut-sso-fdl-status ntut-sso-fdl-status--done">已載入</span>
      </h2>
      <div class="ntut-sso-fdl-file-list" id="ntut-sso-fdl-file-list">
        <ul class="ntut-sso-fdl-file-ul">
          <li v-for="(file, index) in fileList" :key="index">
            <a 
              class="ntut-sso-fdl-link" 
              :class="{ 'is-downloading': downloadingIndex === index }"
              href="#" 
              @click.prevent="simulateDownload(index)"
            >
              {{ file }}
              <span v-if="downloadingIndex === index" class="download-hint">...下載中</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../../file-download.css";

.simulation-wrapper.mooc-sidebar {
    background: #FFFFFF;
    background: -webkit-linear-gradient(top, #FFFFFF, #F3F3F3);
    background: linear-gradient(to bottom, #FFFFFF, #F3F3F3);
    border-radius: 4px;
    border: 1px solid #ddd;
    overflow-y: auto;
    overflow-x: hidden;
    color: #333;
    font-family: "微軟正黑體", "Microsoft JhengHei", Arial, Helvetica, sans-serif;
    font-size: 12px;
    text-align: left;
    max-height: 400px;
}

/* Mock Course Dropdown */
.course-selector-wrapper {
  padding: 10px 5px;
  border-bottom: 1px solid #eee;
}

.mock-select {
  width: 100%;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 13px;
  color: #555;
  background: white;
}

/* Original Site Simulation Styles (MOOC Sidebar) */
.mooc-sidebar .section {
    padding: 0 5px;
}

.mooc-sidebar h2 {
    color: #06A2A4;
    font-size: 1.3em;
    font-weight: bold;
    height: 2.6em;
    line-height: 3em;
    margin: 0;
    padding-left: 20px;
    border-bottom: 1px solid #C5C5C5;
    text-align: left;
}

.mooc-sidebar ul {
    margin: 0 0 3px 0;
    padding: 7px 0 0 0;
    list-style: none;
}

.mooc-sidebar li {
    margin: 0;
    padding: 0;
    list-style: none;
    line-height: 2.1em;
    border-radius: 4px;
    position: relative;
    transition: background-color 0.2s;
}

/* Arrow icon */
.mooc-sidebar li::after {
  content: "";
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 5px;
  height: 5px;
  border-right: 2px solid #ccc;
  border-top: 2px solid #ccc;
  opacity: 0.6;
}

.mooc-sidebar li:hover {
    background-color: #007F81;
}

.mooc-sidebar li.active {
    background-color: #06A2A4;
}

.mooc-sidebar li:hover::after,
.mooc-sidebar li.active::after {
    border-color: #fff;
    opacity: 1;
}

.mooc-sidebar li a {
    color: #353535;
    text-decoration: none;
    padding: 3px 20px;
    display: block;
    outline: none;
    font-size: 1.1em;
}

.mooc-sidebar li:hover a,
.mooc-sidebar li.active a {
    color: #FFFFFF;
}

/* Injected Section Style Overrides for Simulation */
#ntut-sso-fdl-header {
    background: transparent;
    padding: 10px 15px 10px 20px !important;
    height: auto !important;
    line-height: normal !important;
}

.ntut-sso-fdl-file-ul li::after {
    display: none; /* Hide sidebar arrows in file list */
}

.ntut-sso-fdl-link {
    width: 100%;
}

.ntut-sso-fdl-link.is-downloading {
    color: #fff !important;
    background: #06A2A4 !important;
}

.download-hint {
    font-size: 10px;
    opacity: 0.8;
    margin-left: 4px;
}

/* Custom Scrollbar to match site */
.simulation-wrapper::-webkit-scrollbar {
  width: 6px;
}
.simulation-wrapper::-webkit-scrollbar-thumb {
  background: #9C98BB;
  border-radius: 3px;
}
</style>
