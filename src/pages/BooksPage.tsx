import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface Book {
  id: number
  bookTitle: string
  author: string
  coverImage: string
  rating: number
  recommendation: string
  category: string
  date: string
}

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('is_published', true)
          .order('recommend_date', { ascending: false })
        console.log(data);
        if (error) throw error

        const formattedBooks = data?.map(book => ({
          id: book.id,
          bookTitle: book.book_title,
          author: book.author,
          coverImage: book.cover_image,
          rating: book.rating,
          recommendation: book.recommendation,
          category: '现代文学',
          date: book.recommend_date
        })) || []

        setBooks(formattedBooks)
      } catch (error) {
        console.error('加载书籍失败:', error)
        // 后备：加载静态数据
        try {
          const response = await fetch('/data/books.json')
          const data = await response.json()
          setBooks(data)
        } catch (fallbackError) {
          console.error('加载静态数据也失败:', fallbackError)
        }
      }
    }

    loadBooks()
  }, [])

  const categories = ['全部', '经典文学', '现代文学', '外国文学', '哲理文学', '自然文学']

  const filteredBooks = selectedCategory === '全部'
    ? books
    : books.filter(book => book.category === selectedCategory)

  return (
    <div className="min-h-screen bg-background-page">
      {/* Page Header */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="font-serif text-h1 text-text-primary">好书推荐</h1>
            <p className="font-serif text-body-large text-text-secondary leading-relaxed">
              在这个快节奏的时代，书籍是我们心灵的避风港。<br />
              分享那些曾经深深打动过我的文学作品，愿它们也能温暖你的心。
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-background-page border-b border-semantic-divider">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 font-sans text-body-small rounded-xs transition-all duration-fast ${selectedCategory === category
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-surface text-text-secondary border border-semantic-border hover:border-accent-primary hover:text-accent-primary'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="group bg-background-elevated rounded-sm border border-semantic-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-standard overflow-hidden"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={book.coverImage}
                    alt={book.bookTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-standard"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-h3 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                      {book.bookTitle}
                    </h3>
                    <p className="font-serif text-body text-text-secondary">
                      {book.author}
                    </p>
                  </div>

                  <p className="font-serif text-body-small text-text-secondary leading-relaxed line-clamp-4">
                    {book.recommendation}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-semantic-divider">
                    <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary font-sans text-metadata rounded-xs">
                      {book.category}
                    </span>
                    <span className="font-sans text-metadata text-text-tertiary">
                      {book.date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default BooksPage