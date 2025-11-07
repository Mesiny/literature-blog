import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Calendar, Eye, Tag, BookOpen, PenTool, Heart, Search } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import { supabase } from '../lib/supabase'

interface SearchResult {
  id: number
  title: string
  excerpt: string
  category: string
  tags: string[]
  date: string
  readCount: number
  type: 'article' | 'book' | 'novel'
  relatedBook?: number
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [allData, setAllData] = useState<{
    articles: any[]
    books: any[]
    novels: any[]
  }>({ articles: [], books: [], novels: [] })

  const query = searchParams.get('q') || ''

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 从 Supabase 加载所有数据
        const [articlesRes, lifePostsRes, booksRes, novelsRes] = await Promise.all([
          supabase.from('articles').select('*'),
          supabase.from('life_posts').select('*'),
          supabase.from('books').select('*'),
          supabase.from('novels').select('*')
        ])

        if (articlesRes.error) throw articlesRes.error
        if (lifePostsRes.error) throw lifePostsRes.error
        if (booksRes.error) throw booksRes.error
        if (novelsRes.error) throw novelsRes.error

        // 转换数据格式
        const articles = [
          ...(articlesRes.data || []).map(a => ({
            id: a.id,
            title: a.title,
            excerpt: a.excerpt,
            content: a.content,
            category: a.category,
            tags: a.tags || [],
            date: new Date(a.created_at).toLocaleDateString('zh-CN'),
            readCount: a.view_count || 0,
            author: a.author || '岁月缱绻',
            relatedBook: a.related_book_id
          })),
          ...(lifePostsRes.data || []).map(p => ({
            id: p.id,
            title: p.title,
            excerpt: p.excerpt,
            content: p.content,
            category: '生活分享',
            tags: p.tags || [],
            date: new Date(p.created_at).toLocaleDateString('zh-CN'),
            readCount: p.view_count || 0,
            author: p.author || '岁月缱绻'
          }))
        ]

        const books = (booksRes.data || []).map(b => ({
          id: b.id,
          bookTitle: b.book_title,
          author: b.author,
          recommendation: b.recommendation,
          category: b.category,
          date: new Date(b.created_at).toLocaleDateString('zh-CN'),
          rating: b.rating
        }))
        // console.log(novelsRes.data)
        const novels = (novelsRes.data || []).map(n => ({
          id: n.id,
          novelTitle: n.novel_title,
          synopsis: n.synopsis,
          tags: n.tags || [],
          lastUpdate: new Date(n.updated_at).toLocaleDateString('zh-CN'),
          status: n.status
        }))

        setAllData({ articles, books, novels })
      } catch (error) {
        console.error('Failed to load data:', error)
        // 回退到静态文件
        try {
          const [articlesRes, booksRes, novelsRes] = await Promise.all([
            fetch('/data/articles.json'),
            fetch('/data/books.json'),
            fetch('/data/novels.json')
          ])

          const articles = await articlesRes.json()
          const books = await booksRes.json()
          const novels = await novelsRes.json()

          setAllData({ articles, books, novels })
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError)
        }
      }
    }

    loadAllData()
  }, [])

  useEffect(() => {
    if (query && (allData.articles.length > 0) || (allData.books.length > 0) || (allData.novels.length > 0)) {
      performSearch(query)
    } else {
      setResults([])
    }
  }, [query, allData])

  const performSearch = (searchQuery: string) => {
    setLoading(true)
    const searchResults: SearchResult[] = []
    const query = searchQuery.toLowerCase()

    // 搜索文章
    allData.articles.forEach(article => {
      if (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some((tag: string) => tag.toLowerCase().includes(query))
      ) {
        searchResults.push({
          ...article,
          type: 'article' as const
        })
      }
    })
    console.log(allData.books)
    // 搜索书籍
    allData.books.forEach(book => {

      if (
        book.bookTitle.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.recommendation.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
      ) {
        searchResults.push({
          id: book.id,
          title: book.bookTitle,
          excerpt: book.recommendation,
          category: '好书推荐',
          tags: [book.category],
          date: book.date,
          readCount: 0,
          type: 'book' as const
        })
      }
    })

    // 搜索小说
    allData.novels.forEach(novel => {
      if (
        novel.novelTitle.toLowerCase().includes(query) ||
        novel.synopsis.toLowerCase().includes(query) ||
        novel.tags.some((tag: string) => tag.toLowerCase().includes(query))
      ) {
        searchResults.push({
          id: novel.id,
          title: novel.novelTitle,
          excerpt: novel.synopsis,
          category: '小说连载',
          tags: novel.tags,
          date: novel.lastUpdate,
          readCount: 0,
          type: 'novel' as const
        })
      }
    })

    setResults(searchResults)
    setLoading(false)
  }

  const handleSearch = (searchQuery: string) => {
    setSearchParams({ q: searchQuery })
  }

  const highlightText = (text: string, query: string) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-accent-primary/20 text-accent-primary px-1 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'book':
        return <BookOpen size={16} className="text-accent-primary" />
      case 'novel':
        return <PenTool size={16} className="text-accent-primary" />
      default:
        return <Heart size={16} className="text-accent-primary" />
    }
  }

  const getCategoryPath = (result: SearchResult) => {
    switch (result.type) {
      case 'book':
        return '/books'
      case 'novel':
        return '/novels'
      case 'article':
        return result.category === '读书感悟' ? '/reflections' : '/life'
      default:
        return '/'
    }
  }

  const getItemPath = (result: SearchResult) => {
    switch (result.type) {
      case 'book':
        return '/books'
      case 'novel':
        return '/novels'
      case 'article':
        return `/article/${result.category}/${result.id}`
      default:
        return '/'
    }
  }

  return (
    <div className="min-h-screen bg-background-page">
      {/* 搜索页面头部 */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="font-serif text-h1 text-text-primary">搜索</h1>
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleSearch} placeholder="搜索文章、书籍、小说..." />
            </div>
            {query && (
              <p className="font-sans text-body text-text-secondary">
                搜索结果："{query}"
                {results.length > 0 && ` - 找到 ${results.length} 个结果`}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 搜索结果 */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="font-sans text-body text-text-secondary">搜索中...</p>
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-background-surface rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-text-tertiary" />
              </div>
              <h3 className="font-serif text-h3 text-text-primary mb-2">没有找到相关结果</h3>
              <p className="font-sans text-body text-text-secondary mb-6">
                请尝试使用其他关键词，或浏览我们的分类内容
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  to="/books"
                  className="px-4 py-2 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-colors duration-fast"
                >
                  浏览书籍
                </Link>
                <Link
                  to="/reflections"
                  className="px-4 py-2 border border-accent-primary text-accent-primary font-sans text-body-small rounded-xs hover:bg-accent-primary hover:text-white transition-colors duration-fast"
                >
                  阅读文章
                </Link>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-8">
              {results.map((result) => (
                <article
                  key={`${result.type}-${result.id}`}
                  className="group bg-background-elevated p-6 rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard"
                >
                  <div className="space-y-4">
                    {/* 结果类型和日期 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(result.type)}
                        <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                          {result.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-text-tertiary">
                        <Calendar size={14} />
                        <span className="font-sans text-metadata">{result.date}</span>
                      </div>
                    </div>

                    {/* 标题 */}
                    <Link to={getItemPath(result)}>
                      <h2 className="font-serif text-h2 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                        {highlightText(result.title, query)}
                      </h2>
                    </Link>

                    {/* 摘要 */}
                    <p className="font-serif text-body text-text-secondary leading-relaxed">
                      {highlightText(result.excerpt, query)}
                    </p>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-background-surface text-text-tertiary font-sans text-metadata rounded-xs"
                        >
                          <Tag size={12} className="mr-1" />
                          {highlightText(tag, query)}
                        </span>
                      ))}
                    </div>

                    {/* 阅读链接 */}
                    <div className="pt-4 border-t border-semantic-divider">
                      <Link
                        to={getItemPath(result)}
                        className="inline-flex items-center font-sans text-body-small text-accent-primary hover:text-accent-hover transition-colors duration-fast"
                      >
                        查看详情
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="font-serif text-h3 text-text-primary mb-4">开始搜索</h3>
              <p className="font-sans text-body text-text-secondary">
                输入关键词来搜索文章、书籍和小说
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 热门搜索建议 */}
      {!query && (
        <section className="py-16 bg-background-surface">
          <div className="max-w-container mx-auto px-4 lg:px-8">
            <div className="text-center space-y-8">
              <h2 className="font-serif text-h2 text-text-primary">热门搜索</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {['小王子', '红楼梦', '文学', '生活感悟', '学医', '青春', '读书', '中医'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => handleSearch(keyword)}
                    className="px-4 py-2 bg-background-elevated text-text-secondary border border-semantic-border font-sans text-body-small rounded-xs hover:border-accent-primary hover:text-accent-primary transition-colors duration-fast"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default SearchPage