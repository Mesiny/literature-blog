import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-page flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="font-noto-serif text-4xl font-semibold text-text-primary mb-4">
            岁月缱绻 葳蕤生香
          </h1>
          <p className="text-lg text-text-secondary">后台管理系统</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-background-surface rounded-lg p-8 border border-semantic-border">
          <h2 className="font-noto-serif text-2xl font-medium text-text-primary mb-6">
            管理员登录
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-semantic-border rounded bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                placeholder="请输入邮箱地址"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-semantic-border rounded bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                placeholder="请输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent-primary text-white rounded font-medium hover:bg-accent-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-tertiary">
            <p>只有管理员可以访问后台系统</p>
          </div>
        </div>

        {/* 返回首页链接 */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-semantic-link hover:text-semantic-link-hover transition-colors duration-200"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
