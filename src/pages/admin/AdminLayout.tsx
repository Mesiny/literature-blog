import { useEffect } from 'react'
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { BookOpen, FileText, BookMarked, Heart, LogOut, BarChart, Tags } from 'lucide-react'

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-text-secondary">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    { path: '/admin', icon: BarChart, label: '数据统计' },
    { path: '/admin/articles', icon: FileText, label: '文章管理' },
    { path: '/admin/books', icon: BookOpen, label: '书籍推荐' },
    { path: '/admin/novels', icon: BookMarked, label: '小说管理' },
    { path: '/admin/life', icon: Heart, label: '生活分享' },
    { path: '/admin/tags', icon: Tags, label: '标签管理' }
  ]

  return (
    <div className="min-h-screen bg-background-page">
      {/* 顶部导航栏 */}
      <header className="bg-background-surface border-b border-semantic-divider">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-noto-serif text-2xl font-semibold text-text-primary">
              岁月缱绻 葳蕤生香
            </h1>
            <p className="text-sm text-text-tertiary">后台管理系统</p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              登出
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* 侧边栏 */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-background-surface rounded-lg border border-semantic-border p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${isActive
                        ? 'bg-accent-primary text-white'
                        : 'text-text-secondary hover:bg-background-page hover:text-text-primary'
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* 返回首页 */}
          <div className="mt-6">
            <a
              href="/"
              className="block px-4 py-3 text-center text-sm text-semantic-link hover:text-semantic-link-hover transition-colors"
            >
              返回前台查看
            </a>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
