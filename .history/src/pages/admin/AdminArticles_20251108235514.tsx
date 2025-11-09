import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Tag, CheckSquare, Square } from 'lucide-react'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface Article {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  read_count: number
  is_published: boolean
}

interface ArticleFormData {
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  tagIds: number[]
}

interface TagOption {
  id: number
  name: string,
  created_at: string
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tags, setTags] = useState<TagOption[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '读书感悟',
    date: new Date().toISOString().split('T')[0],
    tagIds: []
  })
  const [saving, setSaving] = useState(false)

  const categories = ['读书感悟', '好书推荐', '生活分享', '小说连载']

  useEffect(() => {
    loadArticles()
    loadTags()
  }, [])

  async function loadArticles() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('加载文章失败:', error)
    } finally {
      setLoading(false)
    }
  }
  function getPlainTextLength(html) {
    // 创建临时DOM元素
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    // 获取纯文本内容
    const plainText = tempElement.textContent || tempElement.innerText || '';
    return plainText.length;
  }
  async function loadTags() {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setTags(data || [])
    } catch (error) {
      console.error('加载标签失败:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    try {
      setSaving(true)
      let articleId = editingId

      if (editingId) {
        // 更新文章
        const { error } = await supabase
          .from('articles')
          .update({
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            date: formData.date,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error

        // 更新标签关联
        await supabase.from('article_tags').delete().eq('article_id', editingId)
        if (formData.tagIds.length > 0) {
          const tagInserts = formData.tagIds.map(tagId => ({
            article_id: editingId,
            tag_id: tagId
          }))
          await supabase.from('article_tags').insert(tagInserts)
        }

        alert('更新成功')
      } else {
        // 新建文章
        const { data, error } = await supabase
          .from('articles')
          .insert({
            title: formData.title,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            date: formData.date,
            read_count: 0,
            is_published: false
          })
          .select()
          .single()

        if (error) throw error
        articleId = data.id

        // 添加标签关联
        if (formData.tagIds.length > 0) {
          const tagInserts = formData.tagIds.map(tagId => ({
            article_id: data.id,
            tag_id: tagId
          }))
          await supabase.from('article_tags').insert(tagInserts)
        }

        alert('创建成功')
      }

      // 重新加载列表
      await loadArticles()
      closeForm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function openForm(article?: Article) {
    if (article) {
      setEditingId(article.id)

      // 加载文章的标签
      const { data: articleTags } = await supabase
        .from('article_tags')
        .select('tag_id')
        .eq('article_id', article.id)

      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        date: article.date,
        tagIds: articleTags?.map(at => at.tag_id) || []
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '读书感悟',
        date: new Date().toISOString().split('T')[0],
        tagIds: []
      })
    }
    setShowForm(true)
  }

  function closeForm() {
    console.log(formData.content)
    setShowForm(false)
    setEditingId(null)
  }

  async function togglePublish(id: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setArticles(articles.map(article =>
        article.id === id
          ? { ...article, is_published: !currentStatus }
          : article
      ))
    } catch (error) {
      console.error('更新发布状态失败:', error)
      alert('更新失败，请重试')
    }
  }

  async function deleteArticle(id: number) {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      return
    }

    try {
      // 先删除关联的article_tags
      await supabase.from('article_tags').delete().eq('tag_id', id)

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      setArticles(articles.filter(article => article.id !== id))
      alert('删除成功')
    } catch (error) {
      console.error('删除文章失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 批量操作功能
  function toggleSelectAll() {
    if (selectedIds.length === articles.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(articles.map(article => article.id))
    }
  }

  function toggleSelect(id: number) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  async function batchDelete() {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的文章')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 篇文章吗？此操作不可恢复。`)) {
      return
    }

    try {
      await supabase.from('article_tags').delete().in('article_id', selectedIds)
      const { error } = await supabase.from('articles').delete().in('id', selectedIds)
      if (error) throw error

      setArticles(articles.filter(article => !selectedIds.includes(article.id)))
      setSelectedIds([])
      setShowBatchActions(false)
      alert('批量删除成功')
    } catch (error) {
      console.error('批量删除失败:', error)
      alert('批量删除失败，请重试')
    }
  }

  async function batchUpdateCategory(category: string) {
    if (selectedIds.length === 0) {
      alert('请先选择要修改的文章')
      return
    }

    try {
      const { error } = await supabase.from('articles').update({ category }).in('id', selectedIds)
      if (error) throw error

      await loadArticles()
      setSelectedIds([])
      setShowBatchActions(false)
      alert('批量修改分类成功')
    } catch (error) {
      console.error('批量修改分类失败:', error)
      alert('批量修改分类失败，请重试')
    }
  }

  async function batchUpdatePublish(isPublished: boolean) {
    if (selectedIds.length === 0) {
      alert('请先选择要修改的文章')
      return
    }

    try {
      const { error } = await supabase.from('articles').update({ is_published: isPublished }).in('id', selectedIds)
      if (error) throw error

      await loadArticles()
      setSelectedIds([])
      setShowBatchActions(false)
      alert(`批量${isPublished ? '发布' : '取消发布'}成功`)
    } catch (error) {
      console.error('批量修改发布状态失败:', error)
      alert('批量修改发布状态失败，请重试')
    }
  }

  if (loading) {
    return <div className="text-text-secondary">加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          文章管理
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBatchActions(!showBatchActions)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${showBatchActions
              ? 'bg-accent-primary text-white'
              : 'bg-surface border border-divider text-text-primary hover:bg-background-page'
              }`}
          >
            {showBatchActions ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            批量操作
          </button>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建文章
          </button>
        </div>
      </div>

      {/* 批量操作面板 */}
      {showBatchActions && (
        <div className="mb-4 p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              已选择 <span className="font-semibold text-accent-primary">{selectedIds.length}</span> 篇文章
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={batchDelete}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                删除选中
              </button>
              <button
                onClick={() => batchUpdatePublish(true)}
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                发布选中
              </button>
              <button
                onClick={() => batchUpdatePublish(false)}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                取消发布
              </button>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    batchUpdateCategory(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="px-3 py-1.5 text-sm border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="">修改分类...</option>
                <option value="散文">散文</option>
                <option value="诗歌">诗歌</option>
                <option value="小说">小说</option>
                <option value="随笔">随笔</option>
                <option value="评论">评论</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 文章列表 */}
      {!showForm && (
        <div className="bg-surface rounded-lg border border-divider overflow-hidden">
          <table className="w-full">
            <thead className="bg-background-page border-b border-divider">
              <tr>
                {showBatchActions && (
                  <th className="px-4 py-4 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 text-text-tertiary hover:text-accent-primary transition-colors"
                    >
                      {selectedIds.length === articles.length ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                )}
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">标题</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">分类</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">发布日期</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">阅读量</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">状态</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-background-page transition-colors">
                  {showBatchActions && (
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(article.id)}
                        className="p-1 text-text-tertiary hover:text-accent-primary transition-colors"
                      >
                        {selectedIds.includes(article.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{article.title}</div>
                    <div className="text-sm text-text-tertiary truncate max-w-md">{article.excerpt}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{article.category}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{article.date}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{article.read_count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${article.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {article.is_published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(article.id, article.is_published)}
                        className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                        title={article.is_published ? '取消发布' : '发布'}
                      >
                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openForm(article)}
                        className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id)}
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

          {articles.length === 0 && (
            <div className="py-12 text-center text-text-tertiary">
              暂无文章，点击"新建文章"开始创作
            </div>
          )}
        </div>
      )}

      {/* 文章表单 */}
      {showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {editingId ? '编辑文章' : '新建文章'}
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
                标题 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                摘要
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                正文 *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
              />
              <p className="text-xs text-text-tertiary mt-1">
                字数: {getPlainTextLength(formData.content)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                标签
              </label>
              <div className="flex flex-wrap gap-3 p-4 border border-divider rounded bg-background-page">
                {tags.length > 0 ? (
                  tags.map(tag => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer hover:text-accent-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              tagIds: [...formData.tagIds, tag.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              tagIds: formData.tagIds.filter(id => id !== tag.id)
                            })
                          }
                        }}
                        className="w-4 h-4 text-accent-primary border-divider rounded focus:ring-2 focus:ring-accent-primary"
                      />
                      <span className="text-sm text-text-secondary">{tag.name}</span>
                    </label>
                  ))
                ) : (
                  <span className="text-sm text-text-tertiary">暂无标签，请先在标签管理中创建</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  发布日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
