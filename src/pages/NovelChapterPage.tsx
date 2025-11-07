import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, Clock, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Chapter {
  chapterNumber: number
  chapterTitle: string
  publishDate: string
  wordCount: number
  excerpt: string
  content?: string
}

interface Novel {
  id: number
  novelTitle: string
  synopsis: string
  chapterCount: number
  lastUpdate: string
  status: string
  chapters: Chapter[]
}

const NovelChapterPage = () => {
  const { novelId, chapterNum } = useParams<{ novelId: string; chapterNum: string }>()
  const [novel, setNovel] = useState<Novel | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadNovel = async () => {
      try {
        const id = parseInt(novelId || '0')
        const chapterNumber = parseInt(chapterNum || '0')

        // 从 Supabase 加载小说信息
        const { data: novelData, error: novelError } = await supabase
          .from('novels')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (novelError) throw novelError

        if (novelData) {
          // 加载所有章节
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*')
            .eq('novel_id', id)
            .order('chapter_number')

          if (chaptersError) throw chaptersError
          // console.log(chaptersData);
          const chapters = (chaptersData || []).map(c => ({
            chapterNumber: c.chapter_number,
            chapterTitle: c.chapter_title || c.title,
            publishDate: new Date(c.created_at).toLocaleDateString('zh-CN'),
            wordCount: c.word_count || 0,
            excerpt: c.excerpt || '',
            content: c.content || ''
          }))

          const foundNovel: Novel = {
            id: novelData.id,
            novelTitle: novelData.title,
            synopsis: novelData.synopsis,
            chapterCount: novelData.chapter_count || 0,
            lastUpdate: new Date(novelData.updated_at).toLocaleDateString('zh-CN'),
            status: novelData.status,
            chapters
          }

          setNovel(foundNovel)
          const chapter = chapters.find(c => c.chapterNumber === chapterNumber)
          setCurrentChapter(chapter || null)

          // 增加章节阅读量
          const currentChapterData = chaptersData?.find(c => c.chapter_number === chapterNumber)
          if (currentChapterData) {
            await supabase
              .from('chapters')
              .update({ read_count: (currentChapterData.read_count || 0) + 1 })
              .eq('id', currentChapterData.id)
          }
        }
      } catch (error) {
        console.error('Failed to load novel:', error)
        // 回退到静态文件
        try {
          const response = await fetch('/data/novels.json')
          const data = await response.json()
          const foundNovel = data.find((item: Novel) => item.id === parseInt(novelId || '0'))
          if (foundNovel) {
            setNovel(foundNovel)
            const chapter = foundNovel.chapters.find((c: Chapter) => c.chapterNumber === parseInt(chapterNum || '0'))
            setCurrentChapter(chapter || null)
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback data:', fallbackError)
        }
      } finally {
        setLoading(false)
      }
    }

    if (novelId && chapterNum) {
      loadNovel()
    }
  }, [novelId, chapterNum])

  const formatWordCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const getPrevChapter = () => {
    if (!novel || !currentChapter) return null
    return novel.chapters.find(c => c.chapterNumber === currentChapter.chapterNumber - 1) || null
  }

  const getNextChapter = () => {
    if (!novel || !currentChapter) return null
    return novel.chapters.find(c => c.chapterNumber === currentChapter.chapterNumber + 1) || null
  }
  function getPlainTextLength(html) {
    // 创建临时DOM元素
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // 获取纯文本内容
    const plainText = tempElement.textContent || tempElement.innerText || '';
    return plainText.length;
  }

  const formatContent = (content: string) => {
    // 如果内容包含HTML标签，直接渲染HTML
    if (content.includes('<p>') || content.includes('<br>') || content.includes('<div>')) {
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
      console.log(processedHtml);
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

  if (!novel || !currentChapter) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-h2 text-text-primary">章节未找到</h1>
          <Link
            to="/novels"
            className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast"
          >
            <ChevronLeft size={16} className="mr-2" />
            返回小说列表
          </Link>
        </div>
      </div>
    )
  }

  const prevChapter = getPrevChapter()
  const nextChapter = getNextChapter()

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
            <Link to="/novels" className="text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast">
              小说连载
            </Link>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">{novel.novelTitle}</span>
            <span className="text-text-tertiary">/</span>
            <span className="text-text-secondary">第{currentChapter.chapterNumber}章</span>
          </nav>
        </div>
      </div>

      {/* Chapter Header */}
      <header className="py-16 bg-background-surface">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-1 text-text-tertiary">
                <BookOpen size={14} />
                <span className="font-sans text-metadata">{novel.novelTitle}</span>
              </div>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Calendar size={14} />
                <span className="font-sans text-metadata">{currentChapter.publishDate}</span>
              </div>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Clock size={14} />
                <span className="font-sans text-metadata">{formatWordCount(currentChapter.wordCount)}字</span>
              </div>
            </div>

            <h1 className="font-serif text-h1 text-text-primary leading-tight max-w-4xl mx-auto">
              第{currentChapter.chapterNumber}章 {currentChapter.chapterTitle}
            </h1>

            <p className="font-serif text-body-large text-text-secondary max-w-2xl mx-auto italic">
              "{currentChapter.excerpt}"
            </p>
          </div>
        </div>
      </header>

      {/* Chapter Navigation */}
      <div className="bg-background-elevated border-b border-semantic-divider">
        <div className="max-w-content mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {prevChapter ? (
                <Link
                  to={`/novels/${novelId}/chapter/${prevChapter.chapterNumber}`}
                  className="inline-flex items-center text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  上一章：{prevChapter.chapterTitle}
                </Link>
              ) : (
                <span className="text-text-tertiary font-sans text-body-small">已是第一章</span>
              )}
            </div>

            <Link
              to={`/novels?id=${novelId}`}
              className="px-4 py-2 bg-background-surface text-text-secondary font-sans text-body-small rounded-xs hover:bg-background-page transition-colors duration-fast"
            >
              章节目录
            </Link>

            <div>
              {nextChapter ? (
                <Link
                  to={`/novels/${novelId}/chapter/${nextChapter.chapterNumber}`}
                  className="inline-flex items-center text-semantic-link hover:text-semantic-link-hover transition-colors duration-fast"
                >
                  下一章：{nextChapter.chapterTitle}
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              ) : (
                <span className="text-text-tertiary font-sans text-body-small">已是最末章</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <article className="py-16">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="article-content">
            <p className="text-center text-text-tertiary font-sans text-body-small mb-8">
              * * *
            </p>

            <p className="text-center text-text-tertiary font-sans text-body-small mb-12">
              本章字数：{currentChapter.wordCount} 字 |
              阅读时间：约 {Math.ceil(getPlainTextLength(currentChapter.wordCount) / 400)} 分钟
            </p>



            {/* 章节正文内容 */}
            {/* <div className="space-y-6 text-text-secondary font-serif text-body leading-relaxed">
              {currentChapter.content ? (
                currentChapter.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="indent-8">
                    {paragraph}
                  </p>
                ))
              ) : (
                <div className="text-center py-12 text-text-tertiary">
                  <p>章节内容暂未录入</p>
                  <p className="text-sm mt-2">敬请期待后续更新</p>
                </div>
              )}
            </div> */}
            <div className="max-w-content mx-auto px-4 lg:px-8">
              <div className="article-content">
                {formatContent(currentChapter.content)}
              </div>
            </div>
            <p className="text-center text-text-tertiary font-sans text-body-small mt-12">
              * * *
            </p>
          </div>
        </div>
      </article>

      {/* Chapter Navigation Footer */}
      <footer className="py-16 bg-background-surface border-t border-semantic-divider">
        <div className="max-w-content mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              {prevChapter ? (
                <Link
                  to={`/novels/${novelId}/chapter/${prevChapter.chapterNumber}`}
                  className="inline-flex items-center px-6 py-3 border border-accent-primary text-accent-primary font-sans text-body-small rounded-xs hover:bg-accent-primary hover:text-white transition-all duration-fast"
                >
                  <ChevronLeft size={16} className="mr-2" />
                  上一章：{prevChapter.chapterTitle}
                </Link>
              ) : (
                <span className="text-text-tertiary font-sans text-body-small">已是第一章</span>
              )}
            </div>

            <Link
              to="/novels"
              className="px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast"
            >
              返回小说列表
            </Link>

            <div>
              {nextChapter ? (
                <Link
                  to={`/novels/${novelId}/chapter/${nextChapter.chapterNumber}`}
                  className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast"
                >
                  下一章：{nextChapter.chapterTitle}
                  <ChevronRight size={16} className="ml-2" />
                </Link>
              ) : (
                <span className="text-text-tertiary font-sans text-body-small">已是最末章</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default NovelChapterPage