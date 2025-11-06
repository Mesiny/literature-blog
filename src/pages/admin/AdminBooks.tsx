import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Search, CheckSquare, Square } from 'lucide-react'
import ImageUpload from '../../components/admin/ImageUpload'

interface Book {
  id: number
  book_title: string
  author: string
  recommendation: string
  rating: number
  recommend_date: string
  cover_image: string
  category: string
  is_published: boolean
}

interface BookFormData {
  book_title: string
  author: string
  recommendation: string
  rating: number
  recommend_date: string
  cover_image: string
  category: string
}

const bookCategories = ['文学小说', '社科人文', '历史传记', '科幻奇幻', '悬疑推理', '心灵成长', '经济管理', '其他']

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [formData, setFormData] = useState<BookFormData>({
    book_title: '',
    author: '',
    recommendation: '',
    rating: 8.0,
    recommend_date: new Date().toISOString().split('T')[0],
    cover_image: '',
    category: '文学小说'
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    // 搜索过滤
    if (searchTerm.trim() === '') {
      setFilteredBooks(books)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredBooks(books.filter(book => 
        book.book_title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.category?.toLowerCase().includes(term)
      ))
    }
  }, [searchTerm, books])

  async function loadBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('recommend_date', { ascending: false })

      if (error) throw error
      setBooks(data || [])
      setFilteredBooks(data || [])
    } catch (error) {
      console.error('加载书籍失败:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.book_title || !formData.author) {
      alert('请填写书名和作者')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        // 更新书籍
        const { error } = await supabase
          .from('books')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
        alert('更新成功')
      } else {
        // 新建书籍
        const { error } = await supabase
          .from('books')
          .insert({
            ...formData,
            is_published: false
          })

        if (error) throw error
        alert('创建成功')
      }

      await loadBooks()
      closeForm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  function openForm(book?: Book) {
    if (book) {
      setEditingId(book.id)
      setFormData({
        book_title: book.book_title,
        author: book.author,
        recommendation: book.recommendation,
        rating: book.rating,
        recommend_date: book.recommend_date,
        cover_image: book.cover_image || '',
        category: book.category || '文学小说'
      })
    } else {
      setEditingId(null)
      setFormData({
        book_title: '',
        author: '',
        recommendation: '',
        rating: 8.0,
        recommend_date: new Date().toISOString().split('T')[0],
        cover_image: '',
        category: '文学小说'
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
        .from('books')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      setBooks(books.map(book =>
        book.id === id
          ? { ...book, is_published: !currentStatus }
          : book
      ))
    } catch (error) {
      console.error('更新发布状态失败:', error)
      alert('更新失败，请重试')
    }
  }

  async function deleteBook(id: number) {
    if (!confirm('确定要删除这本书籍推荐吗？此操作不可恢复。')) {
      return
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error

      setBooks(books.filter(book => book.id !== id))
      alert('删除成功')
    } catch (error) {
      console.error('删除书籍失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 批量操作功能
  function toggleSelectAll() {
    if (selectedIds.length === filteredBooks.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredBooks.map(book => book.id))
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
      alert('请先选择要删除的书籍')
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 本书籍吗？此操作不可恢复。`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .in('id', selectedIds)

      if (error) throw error

      setBooks(books.filter(book => !selectedIds.includes(book.id)))
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
      alert('请先选择要修改的书籍')
      return
    }

    try {
      const { error } = await supabase
        .from('books')
        .update({ category })
        .in('id', selectedIds)

      if (error) throw error

      await loadBooks()
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
      alert('请先选择要修改的书籍')
      return
    }

    try {
      const { error } = await supabase
        .from('books')
        .update({ is_published: isPublished })
        .in('id', selectedIds)

      if (error) throw error

      await loadBooks()
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          书籍管理
        </h2>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBatchActions(!showBatchActions)}
              className="px-4 py-2 border border-accent-primary text-accent-primary rounded hover:bg-accent-primary hover:text-white transition-colors"
            >
              批量操作 ({selectedIds.length})
            </button>
          )}
          <button 
            onClick={() => openForm()}
            className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建书籍推荐
          </button>
        </div>
      </div>

      {/* 批量操作面板 */}
      {showBatchActions && selectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-surface border border-divider rounded-lg">
          <h3 className="text-sm font-medium text-text-primary mb-3">
            批量操作 - 已选择 {selectedIds.length} 项
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={batchDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              批量删除
            </button>
            <button
              onClick={() => batchUpdatePublish(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              批量发布
            </button>
            <button
              onClick={() => batchUpdatePublish(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
            >
              批量取消发布
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">修改分类为:</span>
              {bookCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => batchUpdateCategory(cat)}
                  className="px-3 py-1 border border-divider rounded hover:border-accent-primary hover:text-accent-primary transition-colors text-sm"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 搜索框 */}
      {!showForm && (
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <input
                type="text"
                placeholder="搜索书名、作者或分类..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-divider rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 border border-divider rounded-lg hover:border-accent-primary transition-colors"
            >
              {selectedIds.length === filteredBooks.length && filteredBooks.length > 0 ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              <span className="text-sm">全选</span>
            </button>
          </div>
          <p className="text-sm text-text-tertiary mt-2">
            共 {filteredBooks.length} 本书籍
          </p>
        </div>
      )}

      {/* 书籍列表 */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className={`bg-surface rounded-lg border ${
                selectedIds.includes(book.id) ? 'border-accent-primary ring-2 ring-accent-primary' : 'border-divider'
              } p-6 hover:shadow-md transition-all relative`}
            >
              {/* 选择框 */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => toggleSelect(book.id)}
                  className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 transition-colors"
                >
                  {selectedIds.includes(book.id) ? (
                    <CheckSquare className="w-5 h-5 text-accent-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-text-tertiary" />
                  )}
                </button>
              </div>

              {/* 封面图片 */}
              <div className="aspect-[3/4] mb-4 bg-background-page rounded overflow-hidden">
                {book.cover_image && (
                  <img
                    src={book.cover_image}
                    alt={book.book_title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/imgs/book_placeholder.jpg'
                    }}
                  />
                )}
              </div>

              {/* 书籍信息 */}
              <h3 className="font-noto-serif text-lg font-semibold text-text-primary mb-2 truncate">
                {book.book_title}
              </h3>
              <p className="text-sm text-text-secondary mb-1">作者: {book.author}</p>
              <p className="text-sm text-text-secondary mb-2">分类: {book.category || '未分类'}</p>
              <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                {book.recommendation}
              </p>

              {/* 评分 */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-text-secondary">评分:</span>
                <span className="text-accent-primary font-medium">{book.rating}</span>
              </div>

              {/* 状态和操作 */}
              <div className="flex items-center justify-between pt-4 border-t border-divider">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  book.is_published
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {book.is_published ? '已发布' : '草稿'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(book.id, book.is_published)}
                    className="p-2 text-text-tertiary hover:text-text-primary transition-colors"
                    title={book.is_published ? '取消发布' : '发布'}
                  >
                    {book.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openForm(book)}
                    className="p-2 text-text-tertiary hover:text-accent-primary transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBook(book.id)}
                    className="p-2 text-text-tertiary hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredBooks.length === 0 && searchTerm === '' && (
            <div className="col-span-3 py-12 text-center text-text-tertiary bg-surface rounded-lg border border-divider">
              暂无书籍推荐，点击"新建书籍推荐"开始添加
            </div>
          )}

          {filteredBooks.length === 0 && searchTerm !== '' && (
            <div className="col-span-3 py-12 text-center text-text-tertiary bg-surface rounded-lg border border-divider">
              没有找到匹配 "{searchTerm}" 的书籍
            </div>
          )}
        </div>
      )}

      {/* 书籍表单 */}
      {showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {editingId ? '编辑书籍' : '新建书籍推荐'}
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
                bucket="book-covers"
                value={formData.cover_image}
                onChange={(url) => setFormData({ ...formData, cover_image: url })}
                onRemove={() => setFormData({ ...formData, cover_image: '' })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  书名 *
                </label>
                <input
                  type="text"
                  value={formData.book_title}
                  onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  作者 *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                {bookCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                推荐语
              </label>
              <textarea
                value={formData.recommendation}
                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  评分 (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  推荐日期
                </label>
                <input
                  type="date"
                  value={formData.recommend_date}
                  onChange={(e) => setFormData({ ...formData, recommend_date: e.target.value })}
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
