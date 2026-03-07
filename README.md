# 北科大 SSO+
## 簡介
北科大 SSO+ 提供統一且便捷的介面，讓北科學生快速登入校內各項服務，並提供課程教材下載功能。

## 功能特色
- **快速登入校內服務**：自動 SSO 跳轉，實現免密碼快速登入校內各大系統。
- **i 學園影片下載功能**：在 i 學園影片播放頁面中顯示下載按鈕
- **i 學園檔案下載功能**：下載所有課程檔案 (包括不開放下載的)
- **加退選系統自動填入**
- **客製化最愛捷徑**

## 安裝指南 (Chrome、Edge、Brave、Chromium)
1. 在 [Github Release](https://github.com/NTUT-NPC/ntut_sso_plus/releases) 下載 [`chrome.zip`](https://github.com/NTUT-NPC/ntut_sso_plus/releases)
1. 解壓縮 `chrome.zip`
1. 在網址列輸入並前往
    ```
    chrome://extensions
    ```
1. 開啟 Developer mode
    ![](docs/image.png)
1. 點擊 Load unpacked
1. 選擇解壓縮完的 `chrome.zip` 資料夾
    ![](docs/image-1.png)

## 安裝指南 (Firefox)
安裝  Firefox Nightly / Developer Edition，從原始碼建置 `.xpi` 檔案並自行安裝

## 螢幕截圖
![Screenshot_0](./docs/Screenshot_0.png)
![Screenshot_1](./docs/Screenshot_1.png)
![Screenshot_2](./docs/Screenshot_2.png)
![Screenshot_3](./docs/Screenshot_3.png)
![Screenshot_4](./docs/Screenshot_4.png)
![Screenshot_5](./docs/Screenshot_5.png)


## 授權條款
- **程式碼授權 (Codes)**：採用 GPL v3 授權條款。
- **資源與素材 (Assets)**：不公開受權。

## 隱私與安全聲明
- **無官方代表性**：本專案為第三方開發之實用工具，與國立臺北科技大學 (NTUT　)無任何官方關聯。
- **限定互動網域**：本擴充功能僅會與北科大相關網域 `*.ntut.edu.tw`  (包含但不限於 `istream.ntut.edu.tw`)進行網路請求互動。
- **本地資料儲存**：使用者的登入帳號與密碼等敏感資訊**只會儲存於本機端**，絕對不會回傳至開發者伺服器或任何第三方。
- **資料保護承諾**：本程式保證不會傳送任何個人隱私資料至非 `*.ntut.edu.tw` 之網域伺服器。
- **問題回報**：如果您遇到任何問題，請前往 GitHub 開啟 Issue。
- **免責條款**：**請勿將關於本擴充功能之問題向國立臺北科技大學相關處室提出**。
- **權限說明**：若未來版本為了提供更新服務而調整網路請求存取範圍，開發團隊將同步更新 `manifest.json` 檔案中的權限與本 README 文檔之聲明。
