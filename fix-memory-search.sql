-- حذف الدالة القديمة أولاً لتجنب التعارض
DROP FUNCTION IF EXISTS public.match_memories CASCADE;

-- إنشاء دالة البحث عن الذكريات المتشابهة في جدول memory_store
-- هذه الدالة تحل مشكلة خطأ PGRST202

CREATE OR REPLACE FUNCTION public.match_memories(
    query_embedding VECTOR(768),
    target_user_id UUID,
    min_similarity FLOAT DEFAULT 0.5,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    id BIGINT,
    user_id UUID,
    content TEXT,
    embedding VECTOR(768),
    metadata JSONB,
    created_at TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
    sql_query TEXT;
BEGIN
    -- بناء استعلام البحث باستخدام مشغل التشابه <=> لـ pgvector
    sql_query := format('
        SELECT 
            m.id,
            m.user_id,
            m.content,
            m.embedding,
            m.metadata,
            m.created_at,
            1 - (m.embedding <=> $1) as similarity
        FROM memory_store m
        WHERE m.user_id = $2
            AND m.embedding IS NOT NULL
            AND 1 - (m.embedding <=> $1) >= $3
        ORDER BY m.embedding <=> $1
        LIMIT $4
    ');
    
    -- تنفيذ الاستعلام وإرجاع النتائج
    RETURN QUERY EXECUTE sql_query 
        USING query_embedding, target_user_id, min_similarity, match_count;
    
    RETURN;
END;
$$;

-- إنشاء فهرس بسيط لتحسين أداء البحث (بدون فهرس vector)
-- البحث التسلسلي سيعمل بشكل جيد مع حجم البيانات المتوسط
CREATE INDEX IF NOT EXISTS idx_memory_store_user_id 
ON memory_store (user_id);

-- فهرس للتأكد من أن الـ embedding ليس null
CREATE INDEX IF NOT EXISTS idx_memory_store_embedding_not_null 
ON memory_store (id) 
WHERE embedding IS NOT NULL;

-- تحديث الذاكرة المؤقتة لـ Supabase
NOTIFY pgrst, 'reload schema';

-- تعليق توضيحي بالعربية
COMMENT ON FUNCTION public.match_memories IS 'دالة البحث عن الذكريات المتشابهة باستخدام التشابه الجيبيني (cosine similarity)';
