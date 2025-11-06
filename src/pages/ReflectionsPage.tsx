import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Article {
  id: number
  title: string
  excerpt: string
  category: string
  tags: string[]
  date: string
  readCount: number
  relatedBook?: number
}

const ReflectionsPage = () => {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('is_published', true)
          .eq('category', '读书感悟')
          .order('date', { ascending: false })

        if (error) throw error

        const formattedArticles = data?.map(article => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          category: article.category,
          tags: [],
          date: article.date,
          readCount: article.read_count,
          relatedBook: article.related_book
        })) || []

        setArticles(formattedArticles)
      } catch (error) {
        console.error('加载文章失败:', error)
        try {
          const response = await fetch('/data/articles.json')
          const data = await response.json()
          setArticles(data)
        } catch (fallbackError) {
          console.error('加载静态数据也失败:', fallbackError)
        }
      }
    }
    
    loadArticles()
  }, [])

  return (
    <div className="min-h-screen bg-background-page">
      {/* Page Header */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="font-serif text-h1 text-text-primary">读书感悟</h1>
            <p className="font-serif text-body-large text-text-secondary leading-relaxed">
              每一本书都是一次心灵的旅行，每一篇感悟都是对生活的思考。<br />
              在这里分享阅读路上的点点滴滴，与你一起在文字中寻找智慧与温暖。
            </p>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          <div className="space-y-12">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group bg-background-elevated p-8 rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard"
              >
                <div className="space-y-6">
                  {/* Article Meta */}
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                      {article.category}
                    </span>
                    <div className="flex items-center space-x-1 text-text-tertiary">
                      <Calendar size={14} />
                      <span className="font-sans text-metadata">{article.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-text-tertiary">
                      <Eye size={14} />
                      <span className="font-sans text-metadata">{article.readCount}</span>
                    </div>
                  </div>

                  {/* Article Title */}
                  <Link to={`/article/${article.category}/${article.id}`}>
                    <h2 className="font-serif text-h2 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                      {article.title}
                    </h2>
                  </Link>

                  {/* Article Excerpt */}
                  <p className="font-serif text-body text-text-secondary leading-relaxed">
                    {article.excerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-background-surface text-text-tertiary font-sans text-metadata rounded-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Read More Link */}
                  <div className="pt-4 border-t border-semantic-divider">
                    <Link
                      to={`/article/${article.category}/${article.id}`}
                      className="inline-flex items-center font-sans text-body-small text-accent-primary hover:text-accent-hover transition-colors duration-fast"
                    >
                      阅读全文
                      <span className="ml-1">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ReflectionsPage