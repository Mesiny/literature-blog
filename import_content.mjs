import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqbdwftqhmuosqnmoqnt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYmR3ZnRxaG11b3Nxbm1vcW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM5Nzc0NiwiZXhwIjoyMDc3OTczNzQ2fQ.HgyGbbf8P3AKy7VOGI2cBHXHFkKha5UyNj45n2GCTcQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 书籍推荐数据
const books = [
  {
    title: '小王子',
    author: '安托万·德·圣埃克苏佩里',
    recommendation: '这是一部关于爱与责任的童话。小王子的纯真和对玫瑰花的执着让我明白，真正重要的东西用眼睛是看不见的。书中的每一个星球，每一个人物，都是成人世界的隐喻。',
    rating: 9.5,
    category: '文学',
    recommend_date: '2024-01-15'
  },
  {
    title: '红楼梦',
    author: '曹雪芹',
    recommendation: '中国古典文学的巅峰之作。宝黛钗的爱情悲剧，贾府的兴衰荣辱，映射出封建社会的必然衰落。曹雪芹用细腻的笔触刻画了众多鲜活的人物形象，每次重读都有新的感悟。',
    rating: 9.8,
    category: '古典文学',
    recommend_date: '2024-02-01'
  },
  {
    title: '活着',
    author: '余华',
    recommendation: '福贵的一生经历了太多苦难，但他依然选择活着。这本书让我重新思考生命的意义，即使在最艰难的时刻，人也要保持对生活的希望。余华的文字平实却震撼人心。',
    rating: 9.3,
    category: '当代文学',
    recommend_date: '2024-02-20'
  },
  {
    title: '月亮与六便士',
    author: '毛姆',
    recommendation: '斯特里克兰德为了追求艺术理想，放弃了一切世俗的成功。这本书让我思考梦想与现实的平衡，每个人心中都有月亮，但也要捡起脚下的六便士。',
    rating: 9.0,
    category: '外国文学',
    recommend_date: '2024-03-10'
  },
  {
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    recommendation: '魔幻现实主义的代表作。布恩迪亚家族七代人的传奇故事，折射出拉丁美洲的历史与现实。马尔克斯的想象力令人叹为观止，每一页都充满了奇妙的意象。',
    rating: 9.4,
    category: '外国文学',
    recommend_date: '2024-03-25'
  },
  {
    title: '围城',
    author: '钱钟书',
    recommendation: '婚姻是一座围城，城外的人想进去，城里的人想出来。钱钟书用幽默讽刺的笔调，描绘了知识分子的精神困境。这本书让我对人生、婚姻有了更深的理解。',
    rating: 9.1,
    category: '当代文学',
    recommend_date: '2024-04-05'
  },
  {
    title: '平凡的世界',
    author: '路遥',
    recommendation: '孙少安、孙少平兄弟的奋斗史，展现了普通人在时代洪流中的坚韧与努力。路遥用朴实的语言，书写了一代人的青春与梦想，读来让人热泪盈眶。',
    rating: 9.6,
    category: '当代文学',
    recommend_date: '2024-04-18'
  },
  {
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    recommendation: '为你，千千万万遍。这是一个关于背叛与救赎的故事。阿米尔与哈桑的友谊，在战争与苦难中显得格外珍贵。这本书让我明白，勇气不是无所畏惧，而是知道害怕后依然前行。',
    rating: 9.2,
    category: '外国文学',
    recommend_date: '2024-05-01'
  },
  {
    title: '挪威的森林',
    author: '村上春树',
    recommendation: '青春的迷茫、爱情的纯真、生命的脆弱，村上春树用诗意的语言描绘了一代人的精神图景。渡边、直子、绿子的故事，让人想起自己的青春岁月。',
    rating: 8.8,
    category: '外国文学',
    recommend_date: '2024-05-15'
  },
  {
    title: '人间失格',
    author: '太宰治',
    recommendation: '叶藏的一生是痛苦的，他无法融入人类社会，最终选择了自我毁灭。太宰治用极致的敏感和细腻，书写了人性的黑暗面。这本书虽然沉重，但让人反思生命的意义。',
    rating: 8.7,
    category: '外国文学',
    recommend_date: '2024-06-01'
  }
]

// 小说章节数据
const chapters = [
  {
    novel_id: 1,
    chapter_number: 1,
    chapter_title: '初遇',
    content: `那是一个初秋的午后，阳光透过梧桐树叶，在青石板路上投下斑驳的光影。

她站在古旧的书店门口，手里捧着一本泛黄的诗集。微风吹过，掀起她额前的发丝，也吹来了淡淡的桂花香。

"你也喜欢这位诗人吗？"他走过去，声音有些轻。

她抬起头，眼中闪过一丝惊讶，随即露出浅浅的微笑："是啊，他的诗总让我想起故乡的月光。"

那一刻，时光仿佛静止。书店外的喧嚣声渐渐远去，只剩下两颗年轻的心，在文字的世界里悄然靠近。

他们不知道，这次偶然的相遇，将成为彼此生命中最美的诗篇。

多年以后，当她再次翻开那本诗集，依然能想起那个午后的阳光，和他温柔的笑容。有些相遇，注定要改变一生。`,
    publish_date: '2024-01-01',
    word_count: 289,
    excerpt: '那是一个初秋的午后，阳光透过梧桐树叶，在青石板路上投下斑驳的光影...'
  },
  {
    novel_id: 1,
    chapter_number: 2,
    chapter_title: '书店里的时光',
    content: `自那天之后，他们常常在书店相遇。

她喜欢坐在窗边的角落，阳光正好洒在那里。他总是悄悄地坐在她对面，假装看书，却忍不住偷偷打量她专注的侧脸。

"你总是看同一本书吗？"她终于抬起头，带着一丝俏皮的笑意。

他有些窘迫地低下头，才发现自己手中的书竟然拿反了。她轻笑出声，那笑容像春日里的暖阳。

"要不要一起喝杯咖啡？"他鼓起勇气问道。

"好啊。"她合上书，眼中的期待如星光般闪烁。

书店旁边的小咖啡馆，成了他们的秘密基地。他们聊诗歌，聊音乐，聊各自的梦想。她说想成为一名作家，用文字记录这世间的美好。他说想开一家小书店，让更多人能在书籍中找到慰藉。

窗外的梧桐树叶渐渐变黄，时光在咖啡的香气中缓缓流淌。

他们不急不缓地了解着彼此，就像品味一杯好茶，慢慢地，细细地，珍惜每一刻的温暖。`,
    publish_date: '2024-01-08',
    word_count: 358,
    excerpt: '自那天之后，他们常常在书店相遇。她喜欢坐在窗边的角落，阳光正好洒在那里...'
  },
  {
    novel_id: 1,
    chapter_number: 3,
    chapter_title: '雨夜',
    content: `那天下班时，天空突然下起了大雨。

她站在书店门口，望着倾盆而下的雨水，犹豫着要不要冲进雨中。手机响起，是他发来的消息："在书店门口等我，我马上到。"

十五分钟后，他气喘吁吁地出现在雨中，手里举着一把大大的雨伞。雨水顺着他的发梢滴落，衬衫也湿透了一大片。

"你怎么不先回去？"她有些心疼地看着他。

"怕你淋雨。"他笑着说，眼中满是温柔。

他们共撑一把伞，慢慢走在雨中。伞并不大，他总是不自觉地把伞偏向她那边，自己的肩膀却淋着雨。

"你的肩膀都湿了。"她说。

"没事，不冷。"他笑着回答。

雨声淅沥，街灯朦胧。他们就这样并肩走着，谁也没有说话，却觉得此刻的安静胜过千言万语。

有些感情，不需要华丽的表白，一把雨伞，一段雨中的陪伴，就已经说明了一切。`,
    publish_date: '2024-01-15',
    word_count: 342,
    excerpt: '那天下班时，天空突然下起了大雨。她站在书店门口，望着倾盆而下的雨水...'
  }
]

async function importBooks() {
  console.log('开始导入书籍数据...')
  
  for (const book of books) {
    const { data, error } = await supabase
      .from('books')
      .insert({
        title: book.title,
        author: book.author,
        recommendation: book.recommendation,
        rating: book.rating,
        category: book.category,
        recommend_date: book.recommend_date,
        is_published: true
      })
    
    if (error) {
      console.log(`导入《${book.title}》失败:`, error.message)
    } else {
      console.log(`✅ 成功导入《${book.title}》`)
    }
  }
}

async function importChapters() {
  console.log('\n开始导入章节数据...')
  
  for (const chapter of chapters) {
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        novel_id: chapter.novel_id,
        chapter_number: chapter.chapter_number,
        chapter_title: chapter.chapter_title,
        content: chapter.content,
        publish_date: chapter.publish_date,
        word_count: chapter.word_count,
        excerpt: chapter.excerpt,
        is_published: true
      })
    
    if (error) {
      console.log(`导入第${chapter.chapter_number}章失败:`, error.message)
    } else {
      console.log(`✅ 成功导入第${chapter.chapter_number}章: ${chapter.chapter_title}`)
    }
  }
}

async function main() {
  await importBooks()
  await importChapters()
  console.log('\n数据导入完成！')
}

main()
