import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import SearchBar from './SearchBar'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setIsMenuOpen(false)
  }

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/books', label: '好书推荐' },
    { path: '/reflections', label: '读书感悟' },
    { path: '/novels', label: '小说连载' },
    { path: '/life', label: '生活分享' },
    { path: '/about', label: '关于我' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background-elevated/80 backdrop-blur-sm border-b border-semantic-divider">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="font-serif text-h3 text-text-primary hover:text-accent-primary transition-colors duration-standard">
            岁月缱绻 葳蕤生香
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-sans text-body-small transition-colors duration-fast relative ${
                  isActive(item.path)
                    ? 'text-accent-primary'
                    : 'text-text-secondary hover:text-accent-primary'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-text-secondary hover:text-accent-primary transition-colors duration-fast"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-semantic-divider bg-background-elevated">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 font-sans text-body transition-colors duration-fast ${
                    isActive(item.path)
                      ? 'text-accent-primary bg-background-surface'
                      : 'text-text-secondary hover:text-accent-primary hover:bg-background-surface'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-4 py-2">
                <SearchBar onSearch={handleSearch} placeholder="搜索文章、书籍..." />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar