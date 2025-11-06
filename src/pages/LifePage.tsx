import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Eye, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LifeArticle {
  id: number
  title: string
  excerpt: string
  category: string
  tags: string[]
  date: string
  readCount: number
  images?: string[]
}

const LifePage = () => {
  const [articles, setArticles] = useState<LifeArticle[]>([])

  useEffect(() => {
    const loadArticles = async () => {
      try {
        // 从 Supabase 加载生活分享文章
        const { data: posts, error } = await supabase
          .from('life_posts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        // 为每个文章加载图片
        const articlesWithImages = await Promise.all(
          (posts || []).map(async (post) => {
            const { data: images } = await supabase
              .from('life_post_images')
              .select('image_url')
              .eq('life_post_id', post.id)
              .order('display_order')
            
            return {
              id: post.id,
              title: post.title,
              excerpt: post.excerpt,
              category: '生活分享',
              tags: post.tags || [],
              date: new Date(post.created_at).toLocaleDateString('zh-CN'),
              readCount: post.view_count || 0,
              images: images?.map(img => img.image_url) || []
            }
          })
        )
        
        setArticles(articlesWithImages)
      } catch (error) {
        console.error('Failed to load life articles:', error)
        // 回退到静态文件
        try {
          const response = await fetch('/data/life-articles.json')
          const data = await response.json()
          setArticles(data)
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError)
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
            <h1 className="font-serif text-h1 text-text-primary">生活分享</h1>
            <p className="font-serif text-body-large text-text-secondary leading-relaxed">
              生活中的每一个瞬间都值得被记录。<br />
              在这里分享我在山西中医药大学的校园生活，以及学医路上的点点滴滴。
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <article
                key={article.id}
                className="group bg-background-elevated rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard overflow-hidden"
              >
                {/* Article Image */}
                {article.images && article.images.length > 0 && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={article.images[0]}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-standard"
                    />
                  </div>
                )}
                
                <div className="p-6 space-y-4">
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
                    <h2 className="font-serif text-h3 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                      {article.title}
                    </h2>
                  </Link>

                  {/* Article Excerpt */}
                  <p className="font-serif text-body-small text-text-secondary leading-relaxed line-clamp-3">
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

export default LifePage