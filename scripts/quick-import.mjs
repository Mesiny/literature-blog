import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqbdwftqhmuosqnmoqnt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYmR3ZnRxaG11b3Nxbm1vcW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM5Nzc0NiwiZXhwIjoyMDc3OTczNzQ2fQ.HgyGbbf8P3AKy7VOGI2cBHXHFkKha5UyNj45n2GCTcQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const articlesData = [
  {id: 1, title: "关于\"岁月静好\"的思考", excerpt: "在这个快节奏的时代，我们总是被各种声音裹挟着前进，却很少停下来问问自己，什么才是真正的岁月静好？", content: "在这个快节奏的时代，我们总是被各种声音裹挟着前进，却很少停下来问问自己，什么才是真正的岁月静好？\n\n有人说，岁月静好就是没有波澜的生活，平平淡淡才是真。但我觉得，真正的岁月静好不是没有变化，而是在变化中保持内心的平静。\n\n作为一名医学生，我每天都在接触生死，见过太多的无常。生命如此脆弱，却又如此珍贵。在这样的环境中，我更加珍惜每一个平凡的日子。\n\n岁月静好，是在忙碌中为自己留一杯茶的时间，是在疲惫时抬头看看窗外的云，是在深夜的台灯下读一本好书。它不需要轰轰烈烈，只需要内心的安宁。\n\n记得有一次，我在图书馆读到一句话：\"生活不是缺少美，而是缺少发现美的眼睛。\"从那以后，我开始学会在平凡中寻找诗意。\n\n岁月静好，不是逃避现实，而是在现实中保持一份温柔。不是没有痛苦，而是在痛苦中依然相信美好。\n\n愿我们都能在各自的岁月里，找到属于自己的静好时光。", category: "读书感悟", tags: ["岁月静好", "生活感悟", "内心平静"], date: "2024-03-20", readCount: 128, relatedBook: null, author: "岁月缱绻 葳蕤生香"},
  {id: 2, title: "读《小王子》的人生感悟", excerpt: "重读《小王子》，我发现自己已经不再是那个只看故事的孩子，而是开始理解其中深意的大人。", content: "重读《小王子》，我发现自己已经不再是那个只看故事的孩子，而是开始理解其中深意的大人。\n\n小时候读《小王子》，只记住了小王子的可爱和故事的美好。现在重新翻开这本书，却看到了更多关于成人世界的隐喻。\n\n小王子说：\"重要的东西用眼睛是看不见的。\"这句话在我学医的过程中体会尤深。医学不仅仅是技术的积累，更是对生命的敬畏和对患者的关爱。有时候，一个温暖的眼神，一句贴心的话语，比任何药物都更有疗效。\n\n书中的玫瑰花让小王子明白了什么是爱。爱不是占有，而是责任。当你为某个人或某件事承担责任时，你就真正长大了。\n\n作为即将毕业的医学生，我明白自己肩负的不仅是一个职业，更是一份使命。每一次实习，每一次接触患者，都是在学会如何去爱，如何去承担责任。\n\n小王子教会我们的不只是童话，更是人生的智慧。在这个复杂的世界里，保持一颗纯真的心，用心灵去看世界，这或许就是成人世界最难得的品质。\n\n愿我们都能在各自的星球上，找到属于自己的玫瑰花。", category: "读书感悟", tags: ["小王子", "人生感悟", "爱与责任"], date: "2024-03-18", readCount: 156, relatedBook: 4, author: "岁月缱绻 葳蕤生香"}
]

async function main() {
  console.log('开始导入数据...')
  
  // 导入文章
  console.log('导入文章数据...')
  for (const article of articlesData) {
    const { error } = await supabase
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
    
    if (error && !error.message.includes('duplicate')) {
      console.error(`导入文章失败: ${article.title}`, error.message)
    } else {
      console.log(`✓ 导入文章: ${article.title}`)
    }
    
    // 导入标签关联
    for (const tagName of article.tags) {
      const { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .maybeSingle()
      
      if (tag) {
        await supabase
          .from('article_tags')
          .insert({
            article_id: article.id,
            tag_id: tag.id
          })
      }
    }
  }
  
  console.log('✅ 数据导入完成！')
}

main().catch(console.error)
