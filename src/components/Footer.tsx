import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-background-surface border-t border-semantic-divider mt-20">
      <div className="max-w-container mx-auto px-4 lg:px-8 py-12">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="font-serif text-h3 text-text-primary">岁月缱绻 葳蕤生香</h3>
            <p className="font-sans text-body-small text-text-secondary">
              温柔文字，静谧时光
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-1 font-sans text-body-small text-text-tertiary">
            <span>用</span>
            <Heart size={16} className="text-accent-primary" />
            <span>记录生活的美好</span>
          </div>
          
          <div className="pt-6 border-t border-semantic-divider">
            <p className="font-sans text-body-small text-text-tertiary">
              © 2024 岁月缱绻 葳蕤生香. 山西中医药大学 针灸推拿学
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer