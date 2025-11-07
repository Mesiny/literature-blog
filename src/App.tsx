import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import BooksPage from './pages/BooksPage'
import ReflectionsPage from './pages/ReflectionsPage'
import NovelsPage from './pages/NovelsPage'
import LifePage from './pages/LifePage'
import AboutPage from './pages/AboutPage'
import NovelChapterPage from './pages/NovelChapterPage'
import ArticlePage from './pages/ArticlePage'
import SearchPage from './pages/SearchPage'
import LoginPage from './pages/LoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminArticles from './pages/admin/AdminArticles'
import AdminBooks from './pages/admin/AdminBooks'
import AdminNovels from './pages/admin/AdminNovels'
import AdminLife from './pages/admin/AdminLife'
import AdminTags from './pages/admin/AdminTags'
import './index.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 登录路由（独立布局） */}
          <Route path="/login" element={<LoginPage />} />

          {/* 后台管理路由（独立布局） */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="novels" element={<AdminNovels />} />
            <Route path="life" element={<AdminLife />} />
            <Route path="tags" element={<AdminTags />} />
          </Route>

          {/* 前台路由（带导航和页脚） */}
          <Route path="/" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <HomePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/books" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <BooksPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/reflections" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <ReflectionsPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/novels" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <NovelsPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/novels/:novelId/chapter/:chapterNum" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <NovelChapterPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/life" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <LifePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <AboutPage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/article/:category/:id" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <ArticlePage />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/search" element={
            <div className="min-h-screen bg-background-page">
              <Navbar />
              <main className="pt-18">
                <SearchPage />
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
