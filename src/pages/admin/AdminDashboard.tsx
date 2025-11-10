import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, FileText, BookMarked, BookOpen, Heart, Tags } from 'lucide-react'

interface Stats {
  totalArticles: number
  totalBooks: number
  totalNovels: number
  totalChapters: number
  totalLifePosts: number
  totalTags: number
  publishedArticles: number
  publishedBooks: number
  totalViews: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      // 并行获取所有统计数据
      const [
        articlesResult,
        booksResult,
        novelsResult,
        chaptersResult,
        lifePostsResult,
        tagsResult
      ] = await Promise.all([
        supabase.from('articles').select('id, is_published, read_count', { count: 'exact' }),
        supabase.from('books').select('id, is_published', { count: 'exact' }),
        supabase.from('novels').select('id', { count: 'exact' }),
        supabase.from('chapters').select('id, read_count', { count: 'exact' }),
        supabase.from('life_posts').select('id, read_count', { count: 'exact' }),
        supabase.from('tags').select('id', { count: 'exact' })
      ])
      // console.log('章节阅读', chaptersResult);
      // 计算总阅读量
      const articleViews = articlesResult.data?.reduce((sum, a) => sum + (a.read_count || 0), 0) || 0
      const lifeViews = lifePostsResult.data?.reduce((sum, p) => sum + (p.read_count || 0), 0) || 0
      const chapterViews = chaptersResult.data?.reduce((sum, c) => sum + (c.read_count || 0), 0) || 0

      // 计算发布数量
      const publishedArticles = articlesResult.data?.filter(a => a.is_published).length || 0
      const publishedBooks = booksResult.data?.filter(b => b.is_published).length || 0

      setStats({
        totalArticles: articlesResult.count || 0,
        totalBooks: booksResult.count || 0,
        totalNovels: novelsResult.count || 0,
        totalChapters: chaptersResult.count || 0,
        totalLifePosts: lifePostsResult.count || 0,
        totalTags: tagsResult.count || 0,
        publishedArticles,
        publishedBooks,
        totalViews: articleViews + lifeViews + chapterViews
      })
      await supabase
        .from('stats')
        .update({
          total_visitors: articleViews + lifeViews + chapterViews,
          total_articles: publishedArticles,
          total_novels: novelsResult.count || 0,
          total_recommend: publishedBooks,
          total_life: lifePostsResult.count || 0
        })
        .eq('id', 1)
    } catch (error) {
      console.error('加载统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-text-secondary">加载中...</div>
  }

  const statCards = [
    {
      icon: FileText,
      label: '文章总数',
      value: stats?.totalArticles || 0,
      subtext: `${stats?.publishedArticles || 0} 已发布`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: BookMarked,
      label: '书籍推荐',
      value: stats?.totalBooks || 0,
      subtext: `${stats?.publishedBooks || 0} 已发布`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: BookOpen,
      label: '小说作品',
      value: stats?.totalNovels || 0,
      subtext: `${stats?.totalChapters || 0} 章节`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Heart,
      label: '生活分享',
      value: stats?.totalLifePosts || 0,
      subtext: '篇文章',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Users,
      label: '总阅读量',
      value: stats?.totalViews || 0,
      subtext: '次浏览',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          数据统计
        </h2>
        <p className="text-text-secondary mt-2">
          网站内容概览与数据统计
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-surface rounded-lg border border-divider p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-tertiary mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-text-primary mb-1">
                    {card.value}
                  </p>
                  <p className="text-xs text-text-tertiary">{card.subtext}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 快速操作 */}
      <div>
        <h3 className="font-noto-serif text-xl font-medium text-text-primary mb-6">
          快速操作
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/articles"
            className="block bg-surface rounded-lg border border-divider p-6 hover:border-accent-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-accent-primary" />
              <h4 className="font-medium text-text-primary">文章管理</h4>
            </div>
            <p className="text-sm text-text-secondary">
              创建、编辑读书感悟文章，支持富文本编辑和标签
            </p>
          </a>

          <a
            href="/admin/books"
            className="block bg-surface rounded-lg border border-divider p-6 hover:border-accent-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookMarked className="w-5 h-5 text-accent-primary" />
              <h4 className="font-medium text-text-primary">书籍管理</h4>
            </div>
            <p className="text-sm text-text-secondary">
              添加书籍推荐，上传封面图片，设置评分
            </p>
          </a>

          <a
            href="/admin/novels"
            className="block bg-surface rounded-lg border border-divider p-6 hover:border-accent-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-accent-primary" />
              <h4 className="font-medium text-text-primary">小说管理</h4>
            </div>
            <p className="text-sm text-text-secondary">
              管理小说连载、章节编辑、上传封面
            </p>
          </a>

          <a
            href="/admin/life"
            className="block bg-surface rounded-lg border border-divider p-6 hover:border-accent-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-accent-primary" />
              <h4 className="font-medium text-text-primary">生活分享</h4>
            </div>
            <p className="text-sm text-text-secondary">
              发布日常生活记录，支持批量图片上传
            </p>
          </a>

          <a
            href="/admin/tags"
            className="block bg-surface rounded-lg border border-divider p-6 hover:border-accent-primary hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3 mb-2">
              <Tags className="w-5 h-5 text-accent-primary" />
              <h4 className="font-medium text-text-primary">标签管理</h4>
            </div>
            <p className="text-sm text-text-secondary">
              管理自定义标签，为内容分类打标
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
