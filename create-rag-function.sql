-- Create match_memories RPC function for RAG similarity search
-- This function enables the memory_store table to be searched using vector similarity

-- First, ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the match_memories function
CREATE OR REPLACE FUNCTION match_memories(
    query_embedding vector(3072),
    match_count int DEFAULT 5,
    match_user_id UUID DEFAULT NULL,
    min_similarity float DEFAULT 0.6
)
RETURNS TABLE (
    id bigint,
    user_id uuid,
    content text,
    metadata jsonb,
    created_at timestamptz,
    similarity float
)
LANGUAGE sql STABLE AS $$
SELECT
    m.id,
    m.user_id,
    m.content,
    m.metadata,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
FROM memory_store m
WHERE (match_user_id IS NULL OR m.user_id = match_user_id)
  AND 1 - (m.embedding <=> query_embedding) >= min_similarity
ORDER BY m.embedding <=> query_embedding
LIMIT match_count;
$$;

-- Create proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memory_store_user_id ON memory_store(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_store_embedding ON memory_store USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION match_memories TO authenticated;
GRANT EXECUTE ON FUNCTION match_memories TO service_role;
