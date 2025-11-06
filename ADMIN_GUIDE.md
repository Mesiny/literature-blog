# 文学博客管理系统使用说明

## 管理员账号设置

### 创建管理员账号

由于Supabase Auth需要通过API或控制台创建用户，请按以下步骤操作：

1. **通过Supabase控制台创建**：
   - 访问 https://supabase.com/dashboard/project/bqbdwftqhmuosqnmoqnt
   - 进入 "Authentication" → "Users"
   - 点击 "Add user" 
   - 输入邮箱和密码
   - 点击 "Create user"

2. **推荐的管理员账号信息**：
   - 邮箱：admin@literature-blog.com（您可以使用任何邮箱）
   - 密码：请设置一个安全的密码

### 登录后台

创建管理员账号后：
1. 访问 `/login` 页面
2. 输入创建的邮箱和密码
3. 登录后将自动跳转到后台管理系统 `/admin`

## 后台功能

### 数据统计（/admin）
- 查看总访客数、文章数量、小说数量
- 快速访问各管理模块

### 文章管理（/admin/articles）
- 查看所有读书感悟文章
- 发布/取消发布文章
- 编辑文章内容
- 删除文章

### 书籍管理（/admin/books）
- 管理书籍推荐
- 添加新书籍
- 编辑书籍信息

### 小说管理（/admin/novels）
- 管理小说连载
- 添加/编辑章节
- 管理小说状态

### 生活分享（/admin/life）
- 管理生活分享文章
- 发布新的生活分享

## 前台访问

所有访客可以访问以下页面（无需登录）：
- 首页：/
- 好书推荐：/books
- 读书感悟：/reflections
- 小说连载：/novels
- 生活分享：/life
- 关于我：/about

## 技术架构

- 前端：React 18 + TypeScript + Tailwind CSS
- 后端：Supabase（PostgreSQL + Auth + Storage）
- 认证：Supabase Auth（JWT）
- 部署：Vercel

## 数据库表结构

- `categories` - 分类表
- `tags` - 标签表
- `articles` - 文章表（读书感悟）
- `novels` - 小说表
- `chapters` - 章节表
- `books` - 书籍推荐表
- `life_posts` - 生活分享表
- `stats` - 统计表

## 安全说明

- 所有已发布内容对公众可见
- 只有认证用户（管理员）可以修改内容
- 使用RLS（行级安全）保护数据
- 草稿状态的内容只有管理员可见
