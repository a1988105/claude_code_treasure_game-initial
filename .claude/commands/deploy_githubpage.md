部署這個專案到 GitHub Pages。請依照以下步驟執行：

## 步驟一：取得基本資訊

```bash
git remote get-url origin
```

從 remote URL 解析出：
- `GITHUB_USER`：GitHub 使用者名稱
- `REPO_NAME`：repo 名稱（去掉 `.git` 後綴）

URL 格式可能是：
- SSH：`git@github.com:username/repo-name.git`
- HTTPS：`https://github.com/username/repo-name.git`

---

## 步驟二：設定 vite.config.ts 的 base 路徑

讀取 `vite.config.ts`，確認 `base` 是否已設定為 `/<REPO_NAME>/`。

如果尚未設定，在 `defineConfig({` 內加入 `base: '/<REPO_NAME>/',`，例如：

```ts
export default defineConfig({
  base: '/claude_code_treasure_game-initial/',
  plugins: [react()],
  ...
})
```

使用 Edit 工具修改檔案，不要整個覆寫。

如果 base 已正確設定則跳過。修改後執行：
```bash
git add vite.config.ts
git commit -m "Set base path for GitHub Pages"
git push
```

---

## 步驟三：建置專案

```bash
npm run build
```

確認 `build/` 目錄產生成功。

---

## 步驟四：部署到 gh-pages branch

```bash
# 複製 build 內容到暫存目錄
cp -r build /tmp/treasure-game-build

# 切換到 gh-pages branch（若不存在則建立）
git checkout gh-pages 2>/dev/null || git checkout --orphan gh-pages

# 清除所有檔案（保留 .git）
git rm -rf . --quiet 2>/dev/null || true

# 複製 build 內容回來
cp -r /tmp/treasure-game-build/. .

# 建立 .nojekyll 避免 GitHub Pages 忽略底線開頭的檔案
touch .nojekyll

# Commit 並推送
git add -A
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# 切回 main branch
git checkout main
```

---

## 步驟五：啟用 GitHub Pages（第一次才需要）

如果是第一次部署，git push 完成後，請告知用戶手動到 GitHub repo 設定頁面啟用：

1. 前往 `https://github.com/<GITHUB_USER>/<REPO_NAME>/settings/pages`
2. Source 選擇 `Deploy from a branch`
3. Branch 選擇 `gh-pages`，目錄選 `/ (root)`
4. 點 Save

---

## 步驟六：輸出部署網址

部署完成後，顯示 GitHub Pages 網址：

```
https://<GITHUB_USER>.github.io/<REPO_NAME>/
```

提醒用戶：GitHub Pages 首次啟用可能需要等待 **1-3 分鐘**才能生效。

---

## 注意事項

- 這是純前端靜態部署，後端 API（`server.js`）及登入功能在 GitHub Pages 上**無法運作**，只有遊戲本體可正常遊玩。
- 如果 `build/` 目錄建置失敗，請先排除錯誤再繼續。
- 所有操作請在專案根目錄下執行。
