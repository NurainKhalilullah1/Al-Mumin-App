import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oqywjmamyldwuveufwtu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xeXdqbWFteWxkd3V2ZXVmd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjM1OTcsImV4cCI6MjA4NTUzOTU5N30.WYzos5SUTbKcRxPYsrRJa1W0lkYgdSvMgtOU5QJBpqI'

export const supabase = createClient(supabaseUrl, supabaseKey)
