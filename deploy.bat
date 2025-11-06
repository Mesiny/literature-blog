@echo off
chcp 65001 >nul

echo 🚀 开始部署文学博客...

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 pnpm 是否安装
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo 📦 未检测到 pnpm，正在安装...
    npm install -g pnpm
)

echo 📋 检查项目依赖...

REM 安装依赖
echo 📦 安装项目依赖...
pnpm install --prefer-offline

if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo 🔨 开始编译项目...

REM 编译项目
pnpm run build

if errorlevel 1 (
    echo ❌ 编译失败
    pause
    exit /b 1
)

echo ✅ 编译完成！
echo.
echo 📁 静态文件已生成在 dist\ 文件夹中
echo.
echo 🌐 部署选项：
echo 1. 将 dist\ 文件夹内容上传到静态托管服务（如 Vercel、Netlify）
echo 2. 将 dist\ 文件夹内容上传到你的服务器网站根目录
echo 3. 使用 GitHub Pages、腾讯云静态网站托管等服务
echo.
echo 📖 详细部署指导请查看: 部署指导.md
echo.
echo 🎉 部署准备完成！
pause