-- 文学博客数据库架构
-- 创建时间：2025-11-06

-- 1. 分类表（categories）
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 标签表（tags）
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 文章表（articles）- 用于读书感悟
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  author VARCHAR(100) DEFAULT '岁月缱绻 葳蕤生香',
  date DATE NOT NULL,
  read_count INTEGER DEFAULT 0,
  related_book INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 文章标签关联表（article_tags）
CREATE TABLE IF NOT EXISTS article_tags (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id)
);

-- 5. 小说表（novels）
CREATE TABLE IF NOT EXISTS novels (
  id SERIAL PRIMARY KEY,
  novel_title VARCHAR(200) NOT NULL,
  synopsis TEXT NOT NULL,
  chapter_count INTEGER DEFAULT 0,
  last_update DATE NOT NULL,
  status VARCHAR(50) DEFAULT '连载中',
  cover_image VARCHAR(500),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 小说标签关联表（novel_tags）
CREATE TABLE IF NOT EXISTS novel_tags (
  novel_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (novel_id, tag_id)
);

-- 7. 章节表（chapters）
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  novel_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  publish_date DATE NOT NULL,
  word_count INTEGER DEFAULT 0,
  excerpt TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(novel_id, chapter_number)
);

-- 8. 书籍推荐表（books）
CREATE TABLE IF NOT EXISTS books (
  id SERIAL PRIMARY KEY,
  book_title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  recommendation TEXT NOT NULL,
  rating DECIMAL(3,1) DEFAULT 0,
  recommend_date DATE NOT NULL,
  cover_image VARCHAR(500),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 生活分享表（life_posts）
CREATE TABLE IF NOT EXISTS life_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT '生活分享',
  author VARCHAR(100) DEFAULT '岁月缱绻 葳蕤生香',
  date DATE NOT NULL,
  read_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 生活分享标签关联表（life_post_tags）
CREATE TABLE IF NOT EXISTS life_post_tags (
  life_post_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (life_post_id, tag_id)
);

-- 11. 统计表（stats）
CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  total_visitors INTEGER DEFAULT 0,
  total_articles INTEGER DEFAULT 0,
  total_novels INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_chapters_novel_id ON chapters(novel_id);
CREATE INDEX IF NOT EXISTS idx_novels_published ON novels(is_published);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published);
CREATE INDEX IF NOT EXISTS idx_life_posts_published ON life_posts(is_published);

-- 启用行级安全（RLS）
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels ENABLE ROW LEVEL SECURITY;
ALTER TABLE novel_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有人可以读取已发布的内容
CREATE POLICY "公开内容可读_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "公开内容可读_tags" ON tags FOR SELECT USING (true);
CREATE POLICY "公开内容可读_articles" ON articles FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "公开内容可读_article_tags" ON article_tags FOR SELECT USING (true);
CREATE POLICY "公开内容可读_novels" ON novels FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "公开内容可读_novel_tags" ON novel_tags FOR SELECT USING (true);
CREATE POLICY "公开内容可读_chapters" ON chapters FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "公开内容可读_books" ON books FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "公开内容可读_life_posts" ON life_posts FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "公开内容可读_life_post_tags" ON life_post_tags FOR SELECT USING (true);
CREATE POLICY "公开内容可读_stats" ON stats FOR SELECT USING (true);

-- RLS 策略：只有认证用户可以写入
CREATE POLICY "认证用户可写_categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_tags" ON tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_articles" ON articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_article_tags" ON article_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_novels" ON novels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_novel_tags" ON novel_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_chapters" ON chapters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_books" ON books FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_life_posts" ON life_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_life_post_tags" ON life_post_tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "认证用户可写_stats" ON stats FOR ALL USING (auth.role() = 'authenticated');

-- 初始化统计数据
INSERT INTO stats (total_visitors, total_articles, total_novels) VALUES (326, 8, 4);

-- 初始化分类数据
INSERT INTO categories (name, slug, description) VALUES
  ('好书推荐', 'books', '分享值得阅读的好书'),
  ('读书感悟', 'reflections', '读书后的感想与体会'),
  ('小说连载', 'novels', '原创小说连载'),
  ('生活分享', 'life', '日常生活的点滴分享')
ON CONFLICT (slug) DO NOTHING;
