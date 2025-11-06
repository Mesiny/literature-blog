// 数据导入脚本
import { createClient } from '@supabase/supabase-js'
import articlesData from '../public/data/articles.json'
import booksData from '../public/data/books.json'
import novelsData from '../public/data/novels.json'
import lifeArticlesData from '../public/data/life-articles.json'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bqbdwftqhmuosqnmoqnt.supabase.co'
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importData() {
  console.log('开始导入数据...')

  try {
    // 1. 导入标签
    console.log('1. 导入标签...')
    const allTags = new Set<string>()
    
    articlesData.forEach(article => article.tags.forEach(tag => allTags.add(tag)))
    novelsData.forEach(novel => novel.tags.forEach(tag => allTags.add(tag)))
    lifeArticlesData.forEach(post => post.tags.forEach(tag => allTags.add(tag)))
    
    for (const tagName of allTags) {
      const { error } = await supabase
        .from('tags')
        .insert({ name: tagName })
        .select()
        .maybeSingle()
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`导入标签失败: ${tagName}`, error)
      }
    }
    console.log(`✓ 导入了 ${allTags.size} 个标签`)

    // 获取所有标签ID映射
    const { data: tagsData } = await supabase.from('tags').select('*')
    const tagIdMap = new Map<string, number>()
    tagsData?.forEach(tag => tagIdMap.set(tag.name, tag.id))

    // 2. 导入文章（读书感悟）
    console.log('2. 导入读书感悟文章...')
    for (const article of articlesData) {
      const { data: insertedArticle, error } = await supabase
        .from('articles')
        .insert({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          category: article.category,
          author: article.author,
          date: article.date,
          read_count: article.readCount,
          related_book: article.relatedBook,
          is_published: true
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error(`导入文章失败: ${article.title}`, error)
        continue
      }

      // 导入文章标签关联
      for (const tagName of article.tags) {
        const tagId = tagIdMap.get(tagName)
        if (tagId) {
          await supabase
            .from('article_tags')
            .insert({
              article_id: article.id,
              tag_id: tagId
            })
        }
      }
    }
    console.log(`✓ 导入了 ${articlesData.length} 篇文章`)

    // 3. 导入书籍推荐
    console.log('3. 导入书籍推荐...')
    for (const book of booksData) {
      const { error } = await supabase
        .from('books')
        .insert({
          id: book.id,
          book_title: book.bookTitle,
          author: book.author,
          recommendation: book.recommendation,
          rating: book.rating,
          recommend_date: book.recommendDate,
          cover_image: book.coverImage,
          is_published: true
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error(`导入书籍失败: ${book.bookTitle}`, error)
      }
    }
    console.log(`✓ 导入了 ${booksData.length} 本书籍`)

    // 4. 导入小说
    console.log('4. 导入小说...')
    for (const novel of novelsData) {
      const { data: insertedNovel, error } = await supabase
        .from('novels')
        .insert({
          id: novel.id,
          novel_title: novel.novelTitle,
          synopsis: novel.synopsis,
          chapter_count: novel.chapterCount,
          last_update: novel.lastUpdate,
          status: novel.status,
          cover_image: novel.coverImage,
          is_published: true
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error(`导入小说失败: ${novel.novelTitle}`, error)
        continue
      }

      // 导入小说标签关联
      for (const tagName of novel.tags) {
        const tagId = tagIdMap.get(tagName)
        if (tagId) {
          await supabase
            .from('novel_tags')
            .insert({
              novel_id: novel.id,
              tag_id: tagId
            })
        }
      }

      // 导入章节
      for (const chapter of novel.chapters) {
        // 生成章节内容（使用excerpt作为内容的一部分）
        const content = `${chapter.excerpt}\n\n（章节正文内容待补充...）\n\n这是一个温暖的故事，讲述了青春与梦想，友情与成长。每一个字都饱含着真挚的情感，希望能够温暖每一位读者的心。`
        
        await supabase
          .from('chapters')
          .insert({
            novel_id: novel.id,
            chapter_number: chapter.chapterNumber,
            chapter_title: chapter.chapterTitle,
            content: content,
            publish_date: chapter.publishDate,
            word_count: chapter.wordCount,
            excerpt: chapter.excerpt,
            is_published: true
          })
      }
    }
    console.log(`✓ 导入了 ${novelsData.length} 部小说`)

    // 5. 导入生活分享
    console.log('5. 导入生活分享...')
    for (const post of lifeArticlesData) {
      const { data: insertedPost, error } = await supabase
        .from('life_posts')
        .insert({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          date: post.date,
          read_count: post.readCount,
          is_published: true
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error(`导入生活分享失败: ${post.title}`, error)
        continue
      }

      // 导入生活分享标签关联
      for (const tagName of post.tags) {
        const tagId = tagIdMap.get(tagName)
        if (tagId) {
          await supabase
            .from('life_post_tags')
            .insert({
              life_post_id: post.id,
              tag_id: tagId
            })
        }
      }
    }
    console.log(`✓ 导入了 ${lifeArticlesData.length} 篇生活分享`)

    console.log('\n✅ 所有数据导入完成！')
  } catch (error) {
    console.error('❌ 数据导入失败:', error)
  }
}

importData()
