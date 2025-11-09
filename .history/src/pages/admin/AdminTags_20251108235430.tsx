import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, X, Save, Tag } from 'lucide-react'

interface Tag {
  id: number
  name: string
  created_at: string
}

interface TagFormData {
  name: string
}

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<TagFormData>({ name: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTags()
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('请输入标签名称')
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        const { error } = await supabase
          .from('tags')
          .update({ name: formData.name.trim() })
          .eq('id', editingId)

        if (error) throw error
        alert('更新成功')
      } else {
        const { error } = await supabase
          .from('tags')
          .insert({ name: formData.name.trim() })

        if (error) throw error
        alert('创建成功')
      }

      await loadTags()
      closeForm()
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  function openForm(tag?: Tag) {
    if (tag) {
      setEditingId(tag.id)
      setFormData({ name: tag.name })
    } else {
      setEditingId(null)
      setFormData({ name: '' })
    }
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormData({ name: '' })
  }

  async function deleteTag(id: number) {
    if (!confirm('确定要删除这个标签吗？此操作不可恢复。')) {
      return
    }

    try {
      // 先删除关联的article_tags
      await supabase.from('article_tags').delete().eq('tag_id', id)
      await supabase.from('life_post_tags').delete().eq('tag_id', id)
      // 还少一个删除小说标签的操作
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTags(tags.filter(tag => tag.id !== id))
      alert('删除成功')
    } catch (error) {
      console.error('删除标签失败:', error)
      alert('删除失败，请重试')
    }
  }

  if (loading) {
    return <div className="text-text-secondary">加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-noto-serif text-3xl font-semibold text-text-primary">
          标签管理
        </h2>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建标签
        </button>
      </div>

      {!showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="group flex items-center gap-2 px-4 py-2 bg-background-page border border-divider rounded-full hover:border-accent-primary transition-colors"
              >
                <Tag className="w-4 h-4 text-text-tertiary" />
                <span className="text-text-primary">{tag.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openForm(tag)}
                    className="p-1 text-text-tertiary hover:text-accent-primary transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="p-1 text-text-tertiary hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {tags.length === 0 && (
              <div className="w-full py-12 text-center text-text-tertiary">
                暂无标签，点击"新建标签"开始添加
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-surface rounded-lg border border-divider p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">
              {editingId ? '编辑标签' : '新建标签'}
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
                标签名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                className="w-full px-4 py-2 border border-divider rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="例如：人生感悟、文学、经典阅读"
                required
              />
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
