import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Search, CheckSquare, Square } from 'lucide-react'
import ImageUpload from '../../components/admin/ImageUpload'
import RichTextEditor from '../../components/admin/RichTextEditor'

interface LifePost {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  read_count: number
  is_published: boolean
}

interface LifePostFormData {
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  images: string[]
  tagIds: number[]
}

interface TagOption {
  id: number
  name: string,
  created_at: string
}

export default function AdminLife() {
  const [posts, setPosts] = useState<LifePost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<LifePost[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [tags, setTags] = useState<TagOption[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [formData, setFormData] = useState<LifePostFormData>({
    title: '',
    excerpt: '',
    content: '',
    category: '校园生活',
    date: new Date().toISOString().split('T')[0],
    images: [],
    tagIds: []
  })
  const [saving, setSaving] = useState(false)

  const categories = ['校园生活', '中医学习', '日常感悟', '美食分享', '旅行记录']

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    // 搜索过滤
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPosts(posts.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term)
      ))
    }
  }, [searchTerm, posts])

  async function loadPosts() {
    try {
      const { data, error } = await supabase
        .from('life_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
      setFilteredPosts(data || [])
    } catch (error) {
      console.error('加载生活分享失败:', error)
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

      if (editingId) {
        // 更新生活分享
        const { error } = await supabase
          .from('life_posts')
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

        // 更新图片：先删除旧图片，再添加新图片
        await supabase
          .from('life_post_images')
          .delete()
          .eq('life_post_id', editingId)

        // 添加新图片
        if (formData.images.length > 0) {
          const imageRecords = formData.images
            .filter(img => img.trim() !== '')
            .map((img, index) => ({
              life_post_id: editingId,
              image_url: img,
              display_order: index
            }))

          if (imageRecords.length > 0) {
            await supabase
              .from('life_post_images')
              .insert(imageRecords)
          }
        }
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
        // 新建生活分享
        const { data: newPost, error } = await supabase
          .from('life_posts')
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

        // 保存图片
        if (newPost && formData.images.length > 0) {
          const imageRecords = formData.images
            .filter(img => img.trim() !== '')
            .map((img, index) => ({
              life_post_id: newPost.id,
              image_url: img,
              display_order: index
            }))

          if (imageRecords.length > 0) {
            await supabase
              .from('life_post_images')
              .insert(imageRecords)
          }
        }

        alert('创建成功')
      }

      await loadPosts()
      closeForm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  async function openForm(post?: LifePost) {
    if (post) {
      setEditingId(post.id)

      // 加载图片
      const { data: images } = await supabase
        .from('life_post_images')
        .select('image_url')
        .eq('life_post_id', post.id)
        .order('display_order')

      setFormData({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        date: post.date,
        images: images?.map(img => img.image_url) || []
      })
    } else {
      setEditingId(null)
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '校园生活',
        date: new Date().toISOString().split('T')[0],
        images: []
      })
    }
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  async function togglePublish(id: number, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('life_posts')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setPosts(posts.map(post =>
        post.id === id
          ? { ...post, is_published: !currentStatus }
          : post
      ))
    } catch (error) {
      console.error('更新发布状态失败:', error)
      alert('更新失败，请重试')
    }
  }

  async function deletePost(id: number) {
    if (!confirm('确定要删除这篇生活分享吗？此操作不可恢复。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('life_posts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPosts(posts.filter(post => post.id !== id))
      alert('删除成功')
    } catch (error) {
      console.error('删除生活分享失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 批量操作功能
  function toggleSelectAll() {
    if (selectedIds.length === filteredPosts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredPosts.map(post => post.id))
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
      alert('请先选择要删除的生活分享')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 篇生活分享吗？此操作不可恢复。`)) {
      return
    }

    try {
      const { error } = await supabase.from('life_posts').delete().in('id', selectedIds)
      if (error) throw error

      setPosts(posts.filter(post => !selectedIds.includes(post.id)))
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
      alert('请先选择要修改的生活分享')
      return
    }

    try {
      const { error } = await supabase.from('life_posts').update({ category }).in('id', selectedIds)
      if (error) throw error

      await loadPosts()
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
      alert('请先选择要修改的生活分享')
      return
    }

    try {
      const { error } = await supabase.from('life_posts').update({ is_published: isPublished }).in('id', selectedIds)
      if (error) throw error

      await loadPosts()
      setSelectedIds([])
      setShowBatchActions(false)
      alert(`批量${isPublished ? '发布' : '取消发布'}成功`)
    } catch (error) {
      console.error('批量修改发布状态失败:', error)
      alert('批量修改发布状态失败，请重试')
    }
  }


  function addImageSlot() {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    })
  }

  function updateImage(index: number, url: string) {
    const newImages = [...formData.images]
    newImages[index] = url
    setFormData({ ...formData, images: newImages })
  }

  function removeImage(index: number) {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  if (loading) {
    return <div className="text-text-secondary">加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          生活分享管理
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
            新建生活分享
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      {!showForm && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <input
              type="text"
              placeholder="搜索标题、分类或摘要..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          <p className="text-sm text-text-tertiary mt-2">
            共 {filteredPosts.length} 篇文章
          </p>
        </div>
      )}

      {/* 批量操作面板 */}
      {showBatchActions && !showForm && (
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 生活分享列表 */}
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
                      {selectedIds.length === filteredPosts.length ? (
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
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-background-page transition-colors">
                  {showBatchActions && (
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(post.id)}
                        className="p-1 text-text-tertiary hover:text-accent-primary transition-colors"
                      >
                        {selectedIds.includes(post.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{post.title}</div>
                    <div className="text-sm text-text-tertiary truncate max-w-md">{post.excerpt}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{post.category}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{post.date}</td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{post.read_count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${post.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {post.is_published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(post.id, post.is_published)}
                        className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                        title={post.is_published ? '取消发布' : '发布'}
                      >
                        {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openForm(post)}
                        className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
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

          {filteredPosts.length === 0 && searchTerm === '' && (
            <div className="py-12 text-center text-text-tertiary">
              暂无生活分享，点击"新建生活分享"开始创作
            </div>
          )}

          {filteredPosts.length === 0 && searchTerm !== '' && (
            <div className="py-12 text-center text-text-tertiary">
              没有找到匹配 "{searchTerm}" 的内容
            </div>
          )}
        </div>
      )}

      {/* 生活分享表单 */}
      {showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {editingId ? '编辑生活分享' : '新建生活分享'}
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
              {/* <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary font-mono text-sm whitespace-pre-wrap"
                required
                placeholder="支持单回车换行，段落之间可以用双回车分隔"
              /> */}
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
              />
              <p className="text-xs text-text-tertiary mt-1">
                字数: {getPlainTextLength(formData.content)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  配图
                </label>
                <button
                  type="button"
                  onClick={addImageSlot}
                  className="text-sm text-accent-primary hover:text-accent-hover"
                >
                  + 添加图片
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index}>
                    <ImageUpload
                      bucket="life-images"
                      value={image}
                      onChange={(url) => updateImage(index, url)}
                      onRemove={() => removeImage(index)}
                    />
                  </div>
                ))}
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
