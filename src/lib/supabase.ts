import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqbdwftqhmuosqnmoqnt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYmR3ZnRxaG11b3Nxbm1vcW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzOTc3NDYsImV4cCI6MjA3Nzk3Mzc0Nn0.4ZFdo7-oUUluGfOW2ZX4kLKlimw_MrBauxQY6eTSvyc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
