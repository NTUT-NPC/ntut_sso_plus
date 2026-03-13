<script setup lang="ts">
// Simulation of course selector panel
</script>

<template>
  <div class="simulation-wrapper course-selector">
    <!-- Mock Add/Drop Site Section -->
    <div class="original-site-course">
      <!-- Injected Panel -->
      <div id="ntut-sso-cs-panel">
        <div class="ntut-sso-cs-hint">輸入課號（逗號或空白分隔，最多 10 個）</div>
        <div class="ntut-sso-cs-row">
          <input type="text" class="ntut-sso-cs-course-input" value="354067 354068" readonly />
        </div>
        <div class="ntut-sso-cs-status ntut-sso-cs-status--success">已填入 2 個課號</div>
        <div class="ntut-sso-cs-actions">
          <input type="button" value="自動填入" class="ntut-sso-cs-btn ntut-sso-cs-btn--primary" />
          <input type="button" value="清除" class="ntut-sso-cs-btn ntut-sso-cs-btn--clear" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.simulation-wrapper.course-selector {
    background: #fff;
    border-radius: 4px;
    border: 1px solid #ddd;
    overflow: hidden;
    color: #333;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    text-align: left;
}

.original-site-course {
    padding: 10px;
}

.site-header {
    background: #004d99;
    color: white;
    padding: 4px 8px;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
}

.mock-form {
    border: 1px solid #ccc;
    padding: 10px;
    background: #f9f9f9;
}

.form-row {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.site-input {
    width: 80px;
    padding: 2px;
    border: 1px solid #aaa;
}

.site-btn {
    padding: 2px 10px;
    background: #eee;
    border: 1px solid #999;
    cursor: default;
}

/* Injected Styles (from course-selector.css) */
#ntut-sso-cs-panel {
    margin-top: 15px;
    padding: 8px 10px;
    background: #f0f4fa;
    border: 1px solid #b0c4de;
}

.ntut-sso-cs-hint {
    margin-bottom: 5px;
    font-size: 11px;
    color: #444;
}

.ntut-sso-cs-course-input {
    width: 100%;
    padding: 4px;
    border: 1px solid #aaa;
    margin-bottom: 5px;
    font-family: 'Courier New', monospace;
    box-sizing: border-box;
}

.ntut-sso-cs-status {
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 5px;
}

.ntut-sso-cs-status--success {
    color: #166534;
}

.ntut-sso-cs-actions {
    display: flex;
    gap: 5px;
}

.ntut-sso-cs-btn {
    padding: 2px 10px;
    border: 1px solid #aaa;
    background: #e8e8e8;
    color: #111;
    font-size: 11px;
    cursor: default;
}

.ntut-sso-cs-btn--primary {
    background: black;
    color: white;
    font-weight: bold;
}
</style>
