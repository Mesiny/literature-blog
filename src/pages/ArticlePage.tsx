import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, ArrowLeft, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Article {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  date: string
  readCount: number
  author: string
  relatedBook?: number
}

const ArticlePage = () => {
  const { category, id } = useParams<{ category: string; id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const articleId = parseInt(id || '0')
        let foundArticle: Article | null = null
        
        // 从 Supabase 加载文章
        if (category === '读书感悟') {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', articleId)
            .eq('category', '读书感悟')
            .maybeSingle()
          
          if (error) throw error
          
          if (data) {
            foundArticle = {
              id: data.id,
              title: data.title,
              content: data.content,
              category: data.category,
              tags: data.tags || [],
              date: new Date(data.created_at).toLocaleDateString('zh-CN'),
              readCount: data.read_count || 0,
              author: data.author || '岁月缱绻',
              relatedBook: data.related_book_id
            }
            
            // 增加阅读量
            await supabase
              .from('articles')
              .update({ read_count: (data.read_count || 0) + 1 })
              .eq('id', articleId)
          }
        } else if (category === '生活分享') {
          const { data, error } = await supabase
            .from('life_posts')
            .select('*')
            .eq('id', articleId)
            .maybeSingle()
          
          if (error) throw error
          
          if (data) {
            foundArticle = {
              id: data.id,
              title: data.title,
              content: data.content,
              category: '生活分享',
              tags: data.tags || [],
              date: new Date(data.created_at).toLocaleDateString('zh-CN'),
              readCount: data.read_count || 0,
              author: data.author || '岁月缱绻'
            }
            
            // 增加阅读量
            await supabase
              .from('life_posts')
              .update({ read_count: (data.read_count || 0) + 1 })
              .eq('id', articleId)
          }
        }
        
        setArticle(foundArticle)
      } catch (error) {
        console.error('Failed to load article:', error)
        // 回退到静态文件
        try {
          let data: Article[] = []
          if (category === '读书感悟') {
            const response = await fetch('/data/articles.json')
            data = await response.json()
          } else if (category === '生活分享') {
            const response = await fetch('/data/life-articles.json')
            data = await response.json()
          }
          const foundArticle = data.find(item => item.id === parseInt(id || '0'))
          setArticle(foundArticle || null)
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (category && id) {
      loadArticle()
    }
  }, [category, id])

  const formatContent = (content: string) => {
    // 如果内容包含HTML标签，直接渲染HTML
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<div>')) {
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }
    
    // 将单个换行符转换为 <br>，双换行符转换为段落分隔
    const paragraphs = content.split('\n\n')
    const formattedParagraphs: JSX.Element[] = []
    
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim()) {
        // 将段落内的单换行符转换为 <br>
        const lines = paragraph.split('\n').filter(line => line.trim())
        
        // Add pull quote every 3-4 paragraphs
        if (index > 0 && index % 3 === 0 && paragraph.length > 50) {
          formattedParagraphs.push(
            <blockquote key={`quote-${index}`} className="pull-quote">
              {lines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </span>
              ))}
            </blockquote>
          )
        } else {
          formattedParagraphs.push(
            <p key={index} className="mb-6">
              {lines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )
        }
      }
    })
    
    return <>{formattedParagraphs}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-sans text-body text-text-secondary">加载中...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-h2 text-text-primary">文章未找到</h1>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast"
          >
            <ArrowLeft size={16} className="mr-2" />
            返回首页
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-page">
      {/* Breadcrumb */}
      <div className="bg-background-surface border-b border-semantic-divider">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 font-sans text-body-small">
            <Link to="/" className="text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast">
              首页
            </Link>
            <span className="text-text-tertiary">/</span>
            <Link
              to={category === '读书感悟' ? '/reflections' : '/life'}
              className="text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast"
            >
              {category}
            </Link>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-16 bg-background-surface">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                {article.category}
              </span>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Calendar size={14} />
                <span className="font-sans text-metadata">{article.date}</span>
              </div>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Eye size={14} />
                <span className="font-sans text-metadata">{article.readCount} 次阅读</span>
              </div>
            </div>
            
            <h1 className="font-serif text-h1 text-text-primary leading-tight max-w-4xl mx-auto">
              {article.title}
            </h1>
            
            <p className="font-sans text-body text-text-secondary">
              作者：{article.author}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-background-elevated text-text-tertiary font-sans text-metadata rounded-xs"
                >
                  <Tag size={12} className="mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-16">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="article-content">
            {formatContent(article.content)}
          </div>
        </div>
      </article>

      {/* Article Footer */}
      <footer className="py-16 bg-background-surface border-t border-semantic-divider">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-0.5 bg-accent-primary mx-auto"></div>
            <p className="font-serif text-body text-text-secondary">
              感谢你的阅读，希望这篇文章能给你带来一些思考和启发。
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to={category === '读书感悟' ? '/reflections' : '/life'}
                className="inline-flex items-center px-6 py-3 border border-accent-primary text-accent-primary font-sans text-body-small rounded-xs hover:bg-accent-primary hover:text-white transition-all duration-fast"
              >
                <ArrowLeft size={16} className="mr-2" />
                返回列表
              </Link>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast"
              >
                回到首页
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ArticlePage