import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, X } from 'lucide-react'

interface ImageUploadProps {
  bucket: string
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
}

export default function ImageUpload({ bucket, value, onChange, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件')
      return
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB')
      return
    }

    try {
      setUploading(true)
      
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 获取公开URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onChange(data.publicUrl)
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-lg border border-divider"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-divider rounded-lg cursor-pointer hover:border-accent-primary transition-colors">
          <Upload className="w-8 h-8 text-text-tertiary mb-2" />
          <span className="text-sm text-text-secondary">
            {uploading ? '上传中...' : '点击上传图片'}
          </span>
          <span className="text-xs text-text-tertiary mt-1">
            最大 5MB
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}
