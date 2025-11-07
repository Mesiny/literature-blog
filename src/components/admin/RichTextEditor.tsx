import { useState, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    // [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    // [{ 'align': [] }],
    ['blockquote']
    // ['link'],
    // ['clean']
  ]
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  // 'list', 'bullet',
  // 'align',
  'blockquote',
  // 'code-block',
  // 'link'
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '开始编写内容...',
  minHeight = '300px'
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className="border border-divider rounded bg-surface p-4"
        style={{ minHeight }}
      >
        <p className="text-text-tertiary">加载编辑器...</p>
      </div>
    )
  }

  // 使用类型断言避免TypeScript类型检查错误
  const QuillComponent = ReactQuill as any

  return (
    <div className="rich-text-editor">
      <style>{`
        .rich-text-editor .quill {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          min-height: ${minHeight};
          font-family: 'Noto Serif SC', serif;
          font-size: 16px;
          line-height: 1.8;
        }
        .rich-text-editor .ql-editor {
          min-height: ${minHeight};
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }
      `}</style>
      <QuillComponent
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  )
}
