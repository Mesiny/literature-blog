import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Eye, ArrowLeft, Tag, Tags } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Star } from 'lucide-react'

interface Book {
  id: number
  bookTitle: string
  author: string
  coverImage: string
  rating: number
  recommendation: string
  category: string,
  title: string
  date: string
}

const BookViewPage = () => {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBook = async () => {
      try {
        const bookId = parseInt(id || '0')
        let foundBook: Book | null = null
        const { data, error } = await supabase
          .from('books')
          .select(`*`)
          .eq('id', bookId)
          .maybeSingle()

        if (error) throw error
        // console.log('测试数据data', data);
        if (data) {
          foundBook = {
            id: data.id,
            bookTitle: data.book_title,
            author: data.author,
            coverImage: data.cover_image,
            rating: data.rating,
            recommendation: data.recommendation,
            category: data.category,
            title: data.title,
            date: data.recommend_date
          }
          // 更新总访问量
          const { data: currentData, error: queryError } = await supabase
            .from('stats')
            .select('*')
            .maybeSingle()
          await supabase
            .from('stats')
            .update({
              total_visitors: currentData.total_visitors + 1
            })
            .eq('id', 1)
        }



        setBook(foundBook)
      } catch (error) {
        console.error('Failed to load article:', error)
        // 回退到静态文件
        // try {
        //   let data: Article[] = []
        //   if (category === '读书感悟') {
        //     const response = await fetch('/data/articles.json')
        //     data = await response.json()
        //   } else if (category === '生活分享') {
        //     const response = await fetch('/data/life-articles.json')
        //     data = await response.json()
        //   }
        //   const foundArticle = data.find(item => item.id === parseInt(id || '0'))
        //   setArticle(foundArticle || null)
        // } catch (fallbackError) {
        //   console.error('Failed to load fallback data:', fallbackError)
        // }
      } finally {
        setLoading(false)
      }
    }
    // console.log(category, id);
    if (id) {
      loadBook()
    }
  }, [id])

  const renderStars = (rating: number) => {
    // 十分制转五分制
    const ratingFive = rating / 2;
    return Array.from({ length: 5 }, (_, index) => {
      const full = index + 1 <= ratingFive
      const half = !full && index + 0.5 <= ratingFive

      return (
        <Star
          key={index}
          size={16}
          className={
            full
              ? 'text-yellow-400 fill-current'
              : half
                ? 'text-yellow-400 fill-current opacity-50' // 半星样式
                : 'text-gray-300'
          }
        />
      )
    })
  }


  const formatContent = (content: string) => {
    // 如果内容包含HTML标签，直接渲染HTML
    console.log(content);
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<div>') || content.includes('<h1>') || content.includes('<blockquote>') || content.includes('<h2>') || content.includes('<h3>')) {
      const addClassToBlockquotes = (htmlString: string): string => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        const blockquotes = doc.querySelectorAll('blockquote');
        const h1s = doc.querySelectorAll('h1');
        const h2s = doc.querySelectorAll('h2');
        const h3s = doc.querySelectorAll('h3');
        blockquotes.forEach(blockquote => {
          // 在 DOM 操作中仍然使用 classList，因为这是原生 DOM API
          blockquote.classList.add('pull-quote');
        });
        h1s.forEach(h1 => {
          const pElement = document.createElement('p')
          pElement.innerHTML = h1.innerHTML;
          pElement.classList.add('h1');
          h1.replaceWith(pElement);
        });
        h2s.forEach(h2 => {
          const pElement = document.createElement('p')
          pElement.innerHTML = h2.innerHTML;
          pElement.classList.add('h2');
          h2.replaceWith(pElement);
        });
        h3s.forEach(h3 => {
          const pElement = document.createElement('p')
          pElement.innerHTML = h3.innerHTML;
          pElement.classList.add('h3');
          h3.replaceWith(pElement);
        });
        return doc.body.innerHTML;
      };
      const processedHtml = addClassToBlockquotes(content);
      // console.log(processedHtml);
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: processedHtml }}
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

  if (!book) {
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
              to={'/books'}
              className="text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast"
            >
              {book.category}
            </Link>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">{book.bookTitle}</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <header className="py-16 bg-background-surface">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                {'好书推荐'}
              </span>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Calendar size={14} />
                <span className="font-sans text-metadata">{book.date}</span>
              </div>
              {/* <div className="flex items-center space-x-1 text-text-tertiary">
                <Eye size={14} />
                <span className="font-sans text-metadata">{book.readCount} 次阅读</span>
              </div> */}
            </div>

            <h1 className="font-serif text-h1 text-text-primary leading-tight max-w-4xl mx-auto">
              {book.title}
            </h1>

            <p className="font-sans text-body text-text-secondary">
              推荐书目：《{book.bookTitle}》 &nbsp;|&nbsp; 作者： {book.author}
            </p>
            <p className="flex justify-center items-center space-x-1">
              评分：{renderStars(book.rating)}
            </p>

            {/* Tags */}
            {/* <div className="flex flex-wrap justify-center gap-2">
              {book.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 bg-background-elevated text-text-tertiary font-sans text-metadata rounded-xs"
                >
                  <Tag size={12} className="mr-1" />
                  {tag.name}
                </span>
              ))}
            </div> */}
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-16">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          {/* <div v-if="article.excerpt" className="pull-quote" style={{ fontSize: '1rem' }}>
            {formatContent("摘要：" + article.excerpt)}
          </div> */}
          <div className="article-content">
            {formatContent(book.recommendation)}
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
                to={'/books'}
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

export default BookViewPage