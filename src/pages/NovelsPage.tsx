import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Calendar, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Chapter {
  chapterNumber: number
  chapterTitle: string
  publishDate: string
  wordCount: number
  excerpt: string
}

interface Novel {
  id: number
  novelTitle: string
  synopsis: string
  chapterCount: number
  lastUpdate: string
  status: string
  coverImage: string
  tags: string[]
  chapters: Chapter[]
}

const NovelsPage = () => {
  const [novels, setNovels] = useState<Novel[]>([])
  const [expandedChapters, setExpandedChapters] = useState<number | null>(null)

  useEffect(() => {
    const loadNovels = async () => {
      try {
        const { data, error } = await supabase
          .from('novels')
          .select('*')
          .eq('is_published', true)
          .order('last_update', { ascending: false })

        if (error) throw error

        // 加载每个小说的章节
        const novelsWithChapters = await Promise.all(
          (data || []).map(async (novel) => {
            const { data: chapters } = await supabase
              .from('chapters')
              .select('*')
              .eq('novel_id', novel.id)
              .eq('is_published', true)
              .order('chapter_number', { ascending: true })

            return {
              id: novel.id,
              novelTitle: novel.novel_title,
              synopsis: novel.synopsis,
              chapterCount: novel.chapter_count,
              lastUpdate: novel.last_update,
              status: novel.status,
              coverImage: novel.cover_image,
              tags: [],
              chapters: chapters?.map(ch => ({
                chapterNumber: ch.chapter_number,
                chapterTitle: ch.chapter_title,
                publishDate: ch.publish_date,
                wordCount: ch.word_count,
                excerpt: ch.excerpt || ''
              })) || []
            }
          })
        )

        setNovels(novelsWithChapters)
      } catch (error) {
        console.error('加载小说失败:', error)
        try {
          const response = await fetch('/data/novels.json')
          const data = await response.json()
          setNovels(data)
        } catch (fallbackError) {
          console.error('加载静态数据也失败:', fallbackError)
        }
      }
    }
    
    loadNovels()
  }, [])

  const setShowChapters = (novelId: number) => {
    setExpandedChapters(expandedChapters === novelId ? null : novelId)
  }

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  return (
    <div className="min-h-screen bg-background-page">
      {/* Page Header */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h1 className="font-serif text-h1 text-text-primary">小说连载</h1>
            <p className="font-serif text-body-large text-text-secondary leading-relaxed">
              用文字编织梦想，用故事温暖人心。<br />
              在这里分享我的原创小说，每一章都承载着对生活的思考与感悟。
            </p>
          </div>
        </div>
      </section>

      {/* Novels Grid */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="space-y-12">
            {novels.map((novel) => (
              <div
                key={novel.id}
                className="group bg-background-elevated rounded-sm border border-semantic-border hover:shadow-card-hover transition-all duration-standard overflow-hidden"
              >
                <div className="md:flex">
                  {/* Novel Cover */}
                  <div className="md:w-1/3">
                    <div className="aspect-[3/4] h-64 md:h-full overflow-hidden">
                      <img
                        src={novel.coverImage}
                        alt={novel.novelTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-standard"
                      />
                    </div>
                  </div>

                  {/* Novel Info */}
                  <div className="md:w-2/3 p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-h2 text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                          {novel.novelTitle}
                        </h2>
                        <span className={`px-3 py-1 font-sans text-metadata rounded-xs ${
                          novel.status === '连载中' 
                            ? 'bg-accent-primary/10 text-accent-primary' 
                            : 'bg-background-surface text-text-tertiary'
                        }`}>
                          {novel.status}
                        </span>
                      </div>
                      
                      <p className="font-serif text-body text-text-secondary leading-relaxed">
                        {novel.synopsis}
                      </p>
                    </div>

                    {/* Novel Stats */}
                    <div className="flex flex-wrap gap-6 text-text-tertiary">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span className="font-sans text-body-small">{novel.chapterCount} 章</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} />
                        <span className="font-sans text-body-small">更新于 {novel.lastUpdate}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {novel.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-background-surface text-text-tertiary font-sans text-metadata rounded-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Chapter List Toggle */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowChapters(novel.id)}
                        className="flex items-center space-x-2 text-accent-primary hover:text-accent-hover transition-colors duration-fast"
                      >
                        <span className="font-serif text-h3">章节目录</span>
                        {expandedChapters === novel.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                      
                      {expandedChapters === novel.id && (
                        <div className="space-y-2 max-h-80 overflow-y-auto bg-background-page rounded-xs p-4">
                          {novel.chapters.map((chapter) => (
                            <Link
                              key={chapter.chapterNumber}
                              to={`/novels/${novel.id}/chapter/${chapter.chapterNumber}`}
                              className="group flex items-center justify-between p-3 bg-background-elevated hover:bg-background-surface rounded-xs transition-colors duration-fast"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-accent-primary text-white rounded-full flex items-center justify-center font-sans text-metadata">
                                  {chapter.chapterNumber}
                                </div>
                                <div>
                                  <h4 className="font-serif text-body-small text-text-primary group-hover:text-accent-primary transition-colors duration-fast">
                                    {chapter.chapterTitle}
                                  </h4>
                                  <p className="font-sans text-metadata text-text-tertiary">
                                    {chapter.publishDate}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-text-tertiary">
                                <Clock size={14} />
                                <span className="font-sans text-metadata">
                                  {formatWordCount(chapter.wordCount)}字
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
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

export default NovelsPage