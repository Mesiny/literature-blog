#!/bin/bash

# 文学博客部署脚本
# 使用方法: ./deploy.sh

echo "🚀 开始部署文学博客..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查 pnpm 是否安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 未检测到 pnpm，正在安装..."
    npm install -g pnpm
fi

echo "📋 检查项目依赖..."

# 安装依赖
echo "📦 安装项目依赖..."
pnpm install --prefer-offline

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "🔨 开始编译项目..."

# 编译项目
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译完成！"
echo ""
echo "📁 静态文件已生成在 dist/ 文件夹中"
echo ""
echo "🌐 部署选项："
echo "1. 将 dist/ 文件夹内容上传到静态托管服务（如 Vercel、Netlify）"
echo "2. 将 dist/ 文件夹内容上传到你的服务器网站根目录"
echo "3. 使用 GitHub Pages、腾讯云静态网站托管等服务"
echo ""
echo "📖 详细部署指导请查看: 部署指导.md"
echo ""
echo "🎉 部署准备完成！"