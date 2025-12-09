import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, PenTool, Heart, Coffee } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Article {
  id: number
  title: string
  excerpt: string
  category: string
  date: string
  readCount: number
}

interface Stats {
  totalViews: number
  totalArticles: number
  totalBooks: number
  totalNovels: number
  totalLifes: number
}

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    // Load articles and stats from Supabase
    const loadData = async () => {
      try {
        // 加载文章数据
        const { data: articlesData, error: articlesError } = await supabase
          .from('articles')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(4)

        if (articlesError) throw articlesError
        //  还要加载生活分享数据，并合并
        const { data: lifeData, error: lifeError } = await supabase
          .from('life_posts')
          .select(`
                  *,
                life_post_tags (
                  tags (*)
                )
              `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(4)

        if (lifeError) throw lifeError

        // 加载统计数据
        const { data: statsData, error: statsError } = await supabase
          .from('stats')
          .select('*')
          .maybeSingle()
        // console.log(statsData);
        if (statsError) throw statsError
        // 转换数据格式
        const heartArticles = articlesData?.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          category: "心语时光",
          date: article.date,
          readCount: article.read_count
        })) || []

        const lifeArticles = lifeData?.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          category: "生活分享",
          date: article.date,
          readCount: article.read_count
        })) || []

        const formattedArticles = [...heartArticles, ...lifeArticles]
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // 1. 按日期降序排序
          .slice(0, 4);                                        // 2. 取前4个
        // console.log(lifeArticles);
        // console.log(articlesData);
        setArticles(formattedArticles)
        setStats(statsData ? {
          totalViews: statsData.total_visitors,
          totalArticles: statsData.total_articles,
          totalBooks: statsData.total_recommend,
          totalNovels: statsData.total_novels,
          totalLifes: statsData.total_life
        } : null)
      } catch (error) {
        console.error('加载数据失败:', error)
        // 如果失败，尝试加载静态数据作为后备
        try {
          const [articlesRes, statsRes] = await Promise.all([
            fetch('/data/articles.json'),
            fetch('/data/stats.json')
          ])
          const articlesData = await articlesRes.json()
          const statsData = await statsRes.json()
          setArticles(articlesData.slice(0, 4))
          setStats(statsData)
        } catch (fallbackError) {
          console.error('加载静态数据也失败:', fallbackError)
        }
      }
    }

    loadData()
  }, [])

  const categories = [
    { path: '/reflections', icon: PenTool, label: '心语时光', count: stats?.totalArticles || 0 },
    { path: '/books', icon: BookOpen, label: '好书推荐', count: stats?.totalBooks || 0 },
    { path: '/novels', icon: Coffee, label: '小说连载', count: stats?.totalNovels || 0 },
    { path: '/life', icon: Heart, label: '生活分享', count: stats?.totalLifes || 0 },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background-page to-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="font-serif text-display text-text-primary leading-tight">
              岁月缱绻 葳蕤生香
            </h1>
            <p className="font-serif text-body-large text-text-secondary max-w-2xl mx-auto">
              温柔文字，静谧时光
            </p>
            <p className="font-sans text-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
              在山西中医药大学的校园里，用文字记录学医路上的点点滴滴。<br />
              分享读书感悟，书写生活美好，在文学与医学的交融中寻找内心的宁静。
            </p>
          </div>
        </div>
      </section>

      {/* Author Introduction */}
      <section className="py-16 bg-background-elevated">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-serif text-h2 text-text-primary">关于作者</h2>
              <div className="space-y-4">
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  我是山西中医药大学针灸推拿学专业的大五学生，一个热爱文学的医学生。
                  在忙碌的学习之余，喜欢用文字记录生活中的美好瞬间。
                </p>
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  文学给了我同理心，医学给了我专业技能。当这两者结合时，
                  我发现自己在治疗患者时更加细致入微，更加温柔耐心。
                </p>
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  愿通过这个博客，与更多热爱文字、热爱生活的人分享我的思考与感悟。
                </p>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                了解更多
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/imgs/cat_avatar.jpg"
                  alt="作者照片"
                  className="w-64 h-64 rounded-full object-cover shadow-card"
                />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent-secondary rounded-full flex items-center justify-center">
                  <Heart className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-h2 text-text-primary mb-4">内容分类</h2>
            <p className="font-sans text-body text-text-secondary">
              在这里找到你感兴趣的内容
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Link
                  key={category.path}
                  to={category.path}
                  className="group bg-background-elevated p-6 rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard"
                >
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent-primary/20 transition-colors duration-fast">
                      <IconComponent className="text-accent-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-serif text-h3 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                        {category.label}
                      </h3>
                      <p className="font-sans text-body-small text-text-tertiary mt-1">
                        {category.count} 篇文章
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-background-page">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-h2 text-text-primary mb-4">最新文章</h2>
            <p className="font-sans text-body text-text-secondary">
              分享最近的思考与感悟
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.category}/${article.id}`}
                className="group bg-background-elevated p-8 rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                      {article.category == '读书感悟' ? '心语时光' : article.category}
                    </span>
                    <span className="font-sans text-metadata text-text-tertiary">
                      {article.date}
                    </span>
                  </div>
                  <h3 className="font-serif text-h3 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                    {article.title}
                  </h3>
                  <p className="font-serif text-body text-text-secondary leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-semantic-divider">
                    <span className="font-sans text-metadata text-text-tertiary">
                      阅读 {article.readCount} 次
                    </span>
                    <span className="font-sans text-metadata text-accent-primary group-hover:text-accent-hover transition-colors duration-fast">
                      阅读全文 →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/reflections"
              className="inline-flex items-center px-6 py-3 border border-accent-primary text-accent-primary font-sans text-body-small rounded-xs hover:bg-accent-primary hover:text-white transition-all duration-fast"
            >
              查看更多文章
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 bg-background-surface">
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="font-serif text-h1 text-accent-primary">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="font-sans text-body-small text-text-secondary">
                  总阅读量
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-serif text-h1 text-accent-primary">
                  {stats.totalArticles}
                </div>
                <div className="font-sans text-body-small text-text-secondary">
                  文章总数
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-serif text-h1 text-accent-primary">
                  {stats.totalBooks}
                </div>
                <div className="font-sans text-body-small text-text-secondary">
                  推荐书籍
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-serif text-h1 text-accent-primary">
                  {stats.totalNovels}
                </div>
                <div className="font-sans text-body-small text-text-secondary">
                  连载小说
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage