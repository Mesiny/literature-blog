import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

const SearchBar = ({ onSearch, placeholder = "搜索文章、书籍..." }: SearchBarProps) => {
  const [query, setQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
      setIsExpanded(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setIsExpanded(false)
  }

  return (
    <div className="relative">
      {isExpanded ? (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-64 px-4 py-2 pl-10 pr-10 bg-background-elevated border border-semantic-border rounded-xs focus:outline-none focus:border-accent-primary transition-colors duration-fast"
              autoFocus
            />
            <Search 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors duration-fast"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="ml-2 px-4 py-2 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-colors duration-fast"
          >
            搜索
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 text-text-secondary hover:text-accent-primary transition-colors duration-fast"
          title="搜索"
        >
          <Search size={20} />
        </button>
      )}
    </div>
  )
}

export default SearchBar