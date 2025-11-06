import { Heart, BookOpen, Stethoscope, Coffee } from 'lucide-react'

const AboutPage = () => {
  const timeline = [
    {
      year: '2020',
      title: '步入山西中医药大学',
      description: '开始学习针灸推拿专业，对中医文化产生了浓厚兴趣。'
    },
    {
      year: '2021',
      title: '加入文学社',
      description: '在文学社遇到了许多志同道合的朋友，开始用文字记录生活。'
    },
    {
      year: '2022',
      title: '第一次发表文章',
      description: '在校园文学刊物上发表了第一篇散文，感受到文字的力量。'
    },
    {
      year: '2023',
      title: '临床实习',
      description: '开始临床实习，在实践中体会医者的责任与使命。'
    },
    {
      year: '2024',
      title: '即将毕业',
      description: '即将毕业，对未来充满期待，希望能在医学道路上发光发热。'
    }
  ]

  const qualities = [
    {
      icon: Heart,
      title: '温柔而有力量',
      description: '用温柔的心对待每一位患者，用专业的技能为他人解除病痛。'
    },
    {
      icon: BookOpen,
      title: '热爱文学',
      description: '在忙碌的学习之余，喜欢阅读和写作，用文字记录生活的美好。'
    },
    {
      icon: Stethoscope,
      title: '医者仁心',
      description: '秉承医者仁心的理念，用爱心和耐心对待每一位患者。'
    },
    {
      icon: Coffee,
      title: '享受生活',
      description: '在紧张的学习之余，学会享受生活的每一个美好瞬间。'
    }
  ]

  return (
    <div className="min-h-screen bg-background-page">
      {/* Hero Section */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="font-serif text-h1 text-text-primary">关于我</h1>
              <div className="space-y-4">
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  你好，我是<span className="text-accent-primary font-semibold">岁月缱绻 葳蕤生香</span>。
                  这个网名来自两句古诗："岁月缱绻"寓意时光的温柔流逝，"葳蕤生香"象征生命的茂盛与美好。
                </p>
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  我是山西中医药大学针灸推拿学专业的大五学生，一个热爱文学的医学生。
                  在这个充满挑战和机遇的时代，我选择在医学与文学的交融中找到自己的人生方向。
                </p>
                <p className="font-serif text-body text-text-secondary leading-relaxed">
                  我相信，文学给了我同理心，医学给了我专业技能。当这两者结合时，
                  我发现自己在治疗患者时更加细致入微，更加温柔耐心。
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src="/imgs/cat_avatar.jpg"
                  alt="作者照片"
                  className="w-80 h-80 rounded-full object-cover shadow-card"
                />
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-accent-secondary rounded-full flex items-center justify-center">
                  <Heart className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Qualities */}
      <section className="py-16 bg-background-page">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-h2 text-text-primary mb-4">我的特质</h2>
            <p className="font-sans text-body text-text-secondary">
              在文学与医学的交融中，我找到了属于自己的特质
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualities.map((quality, index) => {
              const IconComponent = quality.icon
              return (
                <div
                  key={index}
                  className="text-center space-y-4 p-6 bg-background-elevated rounded-sm border border-semantic-border hover:shadow-card-hover transition-all duration-standard"
                >
                  <div className="w-16 h-16 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="text-accent-primary" size={32} />
                  </div>
                  <h3 className="font-serif text-h3 text-text-primary">
                    {quality.title}
                  </h3>
                  <p className="font-serif text-body-small text-text-secondary leading-relaxed">
                    {quality.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-h2 text-text-primary mb-4">成长历程</h2>
            <p className="font-sans text-body text-text-secondary">
              在山西中医药大学的求学路上，每一个阶段都有不同的收获
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-accent-primary"></div>
              
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div key={index} className="relative flex items-start">
                    {/* Timeline Dot */}
                    <div className="absolute left-6 w-4 h-4 bg-accent-primary rounded-full border-4 border-background-surface"></div>
                    
                    {/* Timeline Content */}
                    <div className="ml-16 bg-background-elevated p-6 rounded-sm border border-semantic-border hover:shadow-card-hover transition-all duration-standard">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <span className="px-3 py-1 bg-accent-primary text-white font-sans text-metadata rounded-xs">
                            {item.year}
                          </span>
                          <h3 className="font-serif text-h3 text-text-primary">
                            {item.title}
                          </h3>
                        </div>
                        <p className="font-serif text-body text-text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Vision */}
      <section className="py-16 bg-background-page">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="font-serif text-h2 text-text-primary">博客初衷</h2>
            <div className="space-y-6">
              <p className="font-serif text-body text-text-secondary leading-relaxed">
                创建这个博客的初衷，是希望能够与更多热爱文字、热爱生活的人分享我的思考与感悟。
                在这个快节奏的时代，我们都需要一个安静的角落来沉淀心灵。
              </p>
              <p className="font-serif text-body text-text-secondary leading-relaxed">
                我希望通过我的文字，能够给同样在求学路上奋斗的朋友们一些温暖和鼓励。
                无论是在医学的学习中，还是在生活的感悟里，都希望能够传递正能量。
              </p>
              <p className="font-serif text-body text-text-secondary leading-relaxed">
                愿我们都能在各自的岁月里，找到属于自己的静好时光，用温柔的心面对生活的每一个挑战。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-background-surface">
        <div className="max-w-container mx-auto px-4 lg:px-8">
          <div className="text-center space-y-6">
            <h2 className="font-serif text-h2 text-text-primary">联系我</h2>
            <p className="font-serif text-body text-text-secondary">
              如果你也热爱文学，或者对中医文化感兴趣，欢迎与我交流
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="mailto:contact@example.com"
                className="inline-flex items-center px-6 py-3 bg-accent-primary text-white font-sans text-body-small rounded-xs hover:bg-accent-hover transition-all duration-fast hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                发送邮件
              </a>
              <a
                href="#"
                className="inline-flex items-center px-6 py-3 border border-accent-primary text-accent-primary font-sans text-body-small rounded-xs hover:bg-accent-primary hover:text-white transition-all duration-fast"
              >
                关注公众号
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage