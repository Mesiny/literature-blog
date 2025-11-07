import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, BookOpen } from 'lucide-react'
import ImageUpload from '../../components/admin/ImageUpload'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface Novel {
  id: number
  novel_title: string
  synopsis: string
  chapter_count: number
  last_update: string
  status: string
  cover_image: string
  is_published: boolean
}

interface NovelFormData {
  novel_title: string
  synopsis: string
  status: string
  cover_image: string
  last_update: string
}

interface Chapter {
  id: number
  chapter_number: number
  chapter_title: string
  content: string
  word_count: number
  publish_date: string
}

interface ChapterFormData {
  chapter_number: number
  chapter_title: string
  content: string
  publish_date: string
}

export default function AdminNovels() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showChapters, setShowChapters] = useState(false)
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [currentNovelId, setCurrentNovelId] = useState<number | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)

  const [formData, setFormData] = useState<NovelFormData>({
    novel_title: '',
    synopsis: '',
    status: '连载中',
    cover_image: '',
    last_update: new Date().toISOString().split('T')[0]
  })

  const [chapterFormData, setChapterFormData] = useState<ChapterFormData>({
    chapter_number: 1,
    chapter_title: '',
    content: '',
    publish_date: new Date().toISOString().split('T')[0]
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadNovels()
  }, [])

  async function loadNovels() {
    try {
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .order('last_update', { ascending: false })

      if (error) throw error
      setNovels(data || [])
    } catch (error) {
      console.error('加载小说失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadChapters(novelId: number) {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('novel_id', novelId)
        .order('chapter_number', { ascending: true })

      if (error) throw error
      setChapters(data || [])
    } catch (error) {
      console.error('加载章节失败:', error)
    }
  }
  // 获取纯文本内容的长度
  function getPlainTextLength(html) {
    // 创建临时DOM元素
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // 获取纯文本内容
    const plainText = tempElement.textContent || tempElement.innerText || '';
    return plainText.length;
  }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.novel_title) {
      alert('请填写小说标题')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        const { error } = await supabase
          .from('novels')
          .update({
            novel_title: formData.novel_title,
            synopsis: formData.synopsis,
            status: formData.status,
            cover_image: formData.cover_image,
            last_update: formData.last_update
          })
          .eq('id', editingId)

        if (error) throw error
        alert('更新成功')
      } else {
        const { error } = await supabase
          .from('novels')
          .insert({
            novel_title: formData.novel_title,
            synopsis: formData.synopsis,
            status: formData.status,
            cover_image: formData.cover_image,
            last_update: formData.last_update,
            chapter_count: 0,
            is_published: false
          })

        if (error) throw error
        alert('创建成功')
      }

      await loadNovels()
      closeForm()
    } catch (error: any) {
      console.error('保存失败:', error)
      alert(`保存失败：${error.message || '请重试'}`)
    } finally {
      setSaving(false)
    }
  }

  async function handleChapterSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!chapterFormData.chapter_title || !chapterFormData.content) {
      alert('请填写章节标题和内容')
      return
    }

    try {
      setSaving(true)
      const wordCount = getPlainTextLength(chapterFormData.content)

      if (editingChapterId) {
        const { error } = await supabase
          .from('chapters')
          .update({
            ...chapterFormData,
            word_count: wordCount
          })
          .eq('id', editingChapterId)

        if (error) throw error
        alert('更新成功')
      } else {
        const { error } = await supabase
          .from('chapters')
          .insert({
            ...chapterFormData,
            novel_id: currentNovelId,
            word_count: wordCount
          })

        if (error) throw error

        // 更新小说的章节数
        const novel = novels.find(n => n.id === currentNovelId)
        if (novel) {
          await supabase
            .from('novels')
            .update({
              chapter_count: novel.chapter_count + 1,
              last_update: new Date().toISOString().split('T')[0]
            })
            .eq('id', currentNovelId)
        }

        alert('创建成功')
      }

      if (currentNovelId) await loadChapters(currentNovelId)
      await loadNovels()
      closeChapterForm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  function openForm(novel?: Novel) {
    if (novel) {
      setEditingId(novel.id)
      setFormData({
        novel_title: novel.novel_title,
        synopsis: novel.synopsis,
        status: novel.status,
        cover_image: novel.cover_image || '',
        last_update: novel.last_update
      })
    } else {
      setEditingId(null)
      setFormData({
        novel_title: '',
        synopsis: '',
        status: '连载中',
        cover_image: '',
        last_update: new Date().toISOString().split('T')[0]
      })
    }
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function openChapters(novelId: number) {
    setCurrentNovelId(novelId)
    await loadChapters(novelId)
    setShowChapters(true)
  }

  function closeChapters() {
    setShowChapters(false)
    setCurrentNovelId(null)
    setChapters([])
  }

  function openChapterForm(chapter?: Chapter) {
    if (chapter) {
      setEditingChapterId(chapter.id)
      setChapterFormData({
        chapter_number: chapter.chapter_number,
        chapter_title: chapter.chapter_title,
        content: chapter.content,
        publish_date: chapter.publish_date
      })
    } else {
      setEditingChapterId(null)
      const nextChapterNum = chapters.length > 0
        ? Math.max(...chapters.map(c => c.chapter_number)) + 1
        : 1
      setChapterFormData({
        chapter_number: nextChapterNum,
        chapter_title: '',
        content: '',
        publish_date: new Date().toISOString().split('T')[0]
      })
    }
    setShowChapterForm(true)
  }

  function closeChapterForm() {
    setShowChapterForm(false)
    setEditingChapterId(null)
  }

  async function togglePublish(id: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('novels')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setNovels(novels.map(novel =>
        novel.id === id
          ? { ...novel, is_published: !currentStatus }
          : novel
      ))
    } catch (error) {
      console.error('更新发布状态失败:', error)
      alert('更新失败，请重试')
    }
  }

  async function deleteNovel(id: number) {
    if (!confirm('确定要删除这部小说吗？这将同时删除所有章节，此操作不可恢复。')) {
      return
    }

    try {
      await supabase.from('chapters').delete().eq('novel_id', id)
      const { error } = await supabase
        .from('novels')
        .delete()
        .eq('id', id)

      if (error) throw error

      setNovels(novels.filter(novel => novel.id !== id))
      alert('删除成功')
    } catch (error) {
      console.error('删除小说失败:', error)
      alert('删除失败，请重试')
    }
  }

  async function deleteChapter(id: number) {
    if (!confirm('确定要删除这个章节吗？')) return

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id)

      if (error) throw error

      if (currentNovelId) {
        await loadChapters(currentNovelId)
        // 更新章节数
        const novel = novels.find(n => n.id === currentNovelId)
        if (novel) {
          await supabase
            .from('novels')
            .update({ chapter_count: novel.chapter_count - 1 })
            .eq('id', currentNovelId)
        }
      }
      await loadNovels()
      alert('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  if (loading) {
    return <div className="text-text-secondary">加载中...</div>
  }

  // 章节管理界面
  if (showChapters && !showChapterForm) {
    const novel = novels.find(n => n.id === currentNovelId)
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={closeChapters}
              className="text-text-secondary hover:text-text-primary mb-2"
            >
              ← 返回小说列表
            </button>
            <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
              {novel?.novel_title} - 章节管理
            </h2>
          </div>
          <button
            onClick={() => openChapterForm()}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建章节
          </button>
        </div>

        <div className="bg-surface rounded-lg border border-divider overflow-hidden">
          <table className="w-full">
            <thead className="bg-background-page border-b border-divider">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">章节号</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">字数</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">发布日期</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {chapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-background-page transition-colors">
                  <td className="px-6 py-4 text-text-secondary">第 {chapter.chapter_number} 章</td>
                  <td className="px-6 py-4 text-text-primary">{chapter.chapter_title}</td>
                  <td className="px-6 py-4 text-text-secondary">{chapter.word_count}</td>
                  <td className="px-6 py-4 text-text-secondary">{chapter.publish_date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openChapterForm(chapter)}
                        className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteChapter(chapter.id)}
                        className="p-2 text-text-tertiary hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {chapters.length === 0 && (
            <div className="py-12 text-center text-text-tertiary">
              暂无章节，点击"新建章节"开始创作
            </div>
          )}
        </div>
      </div>
    )
  }

  // 章节表单
  if (showChapterForm) {
    return (
      <div className="bg-surface rounded-lg border border-divider p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text-primary">
            {editingChapterId ? '编辑章节' : '新建章节'}
          </h3>
          <button
            onClick={closeChapterForm}
            className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleChapterSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                章节号
              </label>
              <input
                type="number"
                min="1"
                value={chapterFormData.chapter_number}
                onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                发布日期
              </label>
              <input
                type="date"
                value={chapterFormData.publish_date}
                onChange={(e) => setChapterFormData({ ...chapterFormData, publish_date: e.target.value })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              章节标题 *
            </label>
            <input
              type="text"
              value={chapterFormData.chapter_title}
              onChange={(e) => setChapterFormData({ ...chapterFormData, chapter_title: e.target.value })}
              className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              章节内容 *
            </label>
            {/* <textarea
              value={chapterFormData.content}
              onChange={(e) => setChapterFormData({ ...chapterFormData, content: e.target.value })}
              rows={20}
              className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-sm"
              required
            /> */}
            <RichTextEditor
              value={chapterFormData.content}
              onChange={(value) => setChapterFormData({ ...chapterFormData, content: value })}
            />
            <p className="text-xs text-text-tertiary mt-1">
              字数: {getPlainTextLength(chapterFormData.content)}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-divider">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={closeChapterForm}
              className="px-6 py-2 border border-divider rounded hover:bg-background-page transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    )
  }

  // 小说列表和表单
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          小说管理
        </h2>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建小说
        </button>
      </div>

      {!showForm && (
        <div className="bg-surface rounded-lg border border-divider overflow-hidden">
          <table className="w-full">
            <thead className="bg-background-page border-b border-divider">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">小说信息</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">章节数</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">最后更新</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">状态</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">发布状态</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {novels.map((novel) => (
                <tr key={novel.id} className="hover:bg-background-page transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-20 flex-shrink-0 bg-background-page rounded overflow-hidden">
                        {novel.cover_image && (
                          <img
                            src={novel.cover_image}
                            alt={novel.novel_title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary mb-1">{novel.novel_title}</div>
                        <div className="text-sm text-text-tertiary line-clamp-2 max-w-md">
                          {novel.synopsis}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-text-tertiary" />
                      <span className="text-sm text-text-secondary">{novel.chapter_count} 章</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{novel.last_update}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${novel.status === '连载中'
                      ? 'bg-blue-100 text-blue-700'
                      : novel.status === '已完结'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {novel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${novel.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {novel.is_published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(novel.id, novel.is_published)}
                        className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                        title={novel.is_published ? '取消发布' : '发布'}
                      >
                        {novel.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openChapters(novel.id)}
                        className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                        title="管理章节"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openForm(novel)}
                        className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNovel(novel.id)}
                        className="p-2 text-text-tertiary hover:text-red-600 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {novels.length === 0 && (
            <div className="py-12 text-center text-text-tertiary">
              暂无小说，点击"新建小说"开始创作
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {editingId ? '编辑小说' : '新建小说'}
            </h3>
            <button
              onClick={closeForm}
              className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                封面图片
              </label>
              <ImageUpload
                bucket="novel-covers"
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                onRemove={() => setFormData({ ...formData, cover_image: '' })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                小说标题 *
              </label>
              <input
                type="text"
                value={formData.novel_title}
                onChange={(e) => setFormData({ ...formData, novel_title: e.target.value })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                简介
              </label>
              <textarea
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="连载中">连载中</option>
                  <option value="已完结">已完结</option>
                  <option value="暂停">暂停</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  最后更新
                </label>
                <input
                  type="date"
                  value={formData.last_update}
                  onChange={(e) => setFormData({ ...formData, last_update: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-divider">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="px-6 py-2 border border-divider rounded hover:bg-background-page transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
