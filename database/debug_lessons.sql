-- Debug script para verificar lições no banco
-- Execute no Supabase SQL Editor para ver o que está no banco

SELECT 
  id, 
  title, 
  language, 
  user_id, 
  created_at,
  ai_generated
FROM lessons 
ORDER BY created_at DESC 
LIMIT 10;