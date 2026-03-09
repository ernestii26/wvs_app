# WVS Pocket

## 專案開發執行與協作指南
本專案包含前端 App (wvs_project50) 與後端伺服器 (backend)。開發環境使用台大資工 ws2 工作站之 PostgreSQL 資料庫。

## 📱 前端環境設定 (Frontend Setup)

本專案前端使用 Expo / React Native 開發。在啟動 App 之前，必須先設定環境變數以連線至後端 API。

### 1. 安裝與初始化
```bash
cd fronend
npm install --legacy-peer-deps
```

### 2. 建立環境變數檔案
請在 `frontend` 資料夾根目錄下建立 `.env.local` 檔案。

### 3. 設定後端連線位址
在 `.env.local` 中加入以下內容：

```env
# 請將 IP 位址替換為你後端伺服器執行的實體 IP
EXPO_PUBLIC_BACKEND_URL=[http://172.20.10.6:4000](http://172.20.10.6:4000)
```

### 4. 啟動
```bash
npx expo start -c
```

## 🔙 後端設定 (Backend)

### 1. 安裝與初始化
```bash
cd backend
npm install
npx prisma generate
```

### 2. 啟動
```bash
npm run server
```

## 🛠 SOP
在共用資料庫的環境下，Git 是唯一真理。請遵循「先拿再推」原則。

### 📥 獲取最新變更 (下載)
當隊友修改了資料庫結構並更新 Git 後：

拉取程式碼：git pull

部署遷移：npx prisma migrate deploy (將隊友的變更套用到共用 DB)

更新 Client：npx prisma generate (生成本地 Type 提示)

### 📤 提交結構變更 (上傳)
當你需要修改 schema.prisma（新增欄位/模型）時：

確認同步：先執行 git pull 確保本地是最新狀態。

執行遷移：npx prisma migrate dev --name [描述性名稱]

注意：Prisma 會檢查共用 DB 是否有其他人未提交的變更，請務必在群組告知隊友。

提交紀錄：立刻將 prisma/schema.prisma 與產生的 prisma/migrations 資料夾提交至 Git。