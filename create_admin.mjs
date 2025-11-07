import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqbdwftqhmuosqnmoqnt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYmR3ZnRxaG11b3Nxbm1vcW50Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM5Nzc0NiwiZXhwIjoyMDc3OTczNzQ2fQ.HgyGbbf8P3AKy7VOGI2cBHXHFkKha5UyNj45n2GCTcQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  try {
    // 创建管理员账号
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'blog@xxc.com',
      password: '200308',
      email_confirm: true
    })

    if (error) {
      console.log('创建管理员失败:', error.message)
      if (error.message.includes('already registered')) {
        console.log('管理员账号已存在，继续...')
      } else {
        throw error
      }
    } else {
      console.log('✅ 管理员账号创建成功')
      console.log('邮箱:', data.user.email)
      console.log('用户ID:', data.user.id)
    }
  } catch (err) {
    console.error('错误:', err)
  }
}

createAdmin()
