部署這個專案到 GitHub Pages。請依照以下步驟執行：

## 步驟零：前置檢查（自動引導）

在做任何事之前，先執行以下檢查。**每個子步驟都必須確認通過才能繼續**。

### 0-A：確認 git 是否已初始化

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

若指令失敗（回傳非零），表示目前目錄尚未初始化 git。執行：

```bash
git init
git add .
git commit -m "Initial commit"
```

### 0-B：確認 gh CLI 是否已安裝

```bash
gh --version 2>/dev/null
```

若指令失敗，告知用戶安裝 GitHub CLI：

> 請先安裝 GitHub CLI：https://cli.github.com/
> 安裝完成後重新執行 `/deploy_githubpage`

**停止流程，等待用戶回報已安裝。**

### 0-C：確認 gh CLI 是否已登入 GitHub

```bash
gh auth status 2>&1
```

若輸出包含 `not logged in` 或 `You are not logged into`，表示尚未登入。告知用戶：

> 請在終端機執行以下指令登入 GitHub（Claude Code 無法代為執行互動式登入）：
> ```
> ! gh auth login
> ```
> 依照提示選擇 GitHub.com → HTTPS 或 SSH → Login with a web browser，完成後回來繼續。

**停止流程，等待用戶回報已登入。**

登入完成後，重新執行 `gh auth status` 確認登入成功，再繼續。

### 0-D：確認是否有 GitHub remote（origin）

```bash
git remote get-url origin 2>/dev/null
```

若指令失敗（無 remote），表示尚未建立 GitHub Repo。執行以下步驟：

**1. 取得當前目錄名稱作為預設 repo 名稱：**

```bash
basename "$(pwd)"
```

**2. 用 gh CLI 建立 GitHub Repo（Public）並推送：**

```bash
gh repo create <REPO_NAME> --public --source=. --remote=origin --push
```

若用戶想要 Private repo，改用 `--private`。建立完成後再執行一次 `git remote get-url origin` 確認 remote 已設定。

---

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
# 先清除舊的 build 目錄，避免殘留舊版 JS 檔案
rm -rf build
npm run build
```

確認 `build/` 目錄產生成功。

---

## 步驟四：部署到 gh-pages branch

使用 git worktree，全程不切換 branch，避免 Claude Code 失去自訂指令：

```bash
# 移除舊的 worktree（若存在）
git worktree remove /tmp/gh-pages-deploy --force 2>/dev/null || true

# 確保 gh-pages branch 存在（若不存在則建立孤立 branch）
git fetch origin gh-pages:gh-pages 2>/dev/null || git branch gh-pages 2>/dev/null || true

# 建立 worktree 指向 gh-pages branch
git worktree add /tmp/gh-pages-deploy gh-pages

# 清除 worktree 內容（保留 .git）
git -C /tmp/gh-pages-deploy rm -rf . --quiet 2>/dev/null || true

# 複製 build 內容到 worktree
cp -r build/. /tmp/gh-pages-deploy/

# 建立 .nojekyll 避免 GitHub Pages 忽略底線開頭的檔案
touch /tmp/gh-pages-deploy/.nojekyll

# Commit 並推送（只加必要檔案，避免 .claude/ 等污染）
git -C /tmp/gh-pages-deploy add assets/ index.html .nojekyll
git -C /tmp/gh-pages-deploy commit -m "Deploy to GitHub Pages"
git -C /tmp/gh-pages-deploy push origin gh-pages --force

# 清除 worktree
git worktree remove /tmp/gh-pages-deploy --force
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
