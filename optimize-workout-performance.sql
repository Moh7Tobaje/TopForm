-- إضافة فهارس لتحسين أداء الاستعلامات على حقول الوزن الجديدة
-- هذا سيحل مشكلة البطء التي ظهرت بعد إضافة حقول الوزن

-- فهرس مركب لتحسين استعلامات المستخدم مع الترتيب حسب التاريخ
CREATE INDEX IF NOT EXISTS idx_workout_tracking_user_date 
ON workout_tracking (user_id, workout_date DESC);

-- فهرس على حقل الوزن المطلوب للبحث السريع
CREATE INDEX IF NOT EXISTS idx_workout_tracking_required_weight 
ON workout_tracking (required_weight) 
WHERE required_weight IS NOT NULL;

-- فهرس على حقل الوزن المنفذ للبحث السريع
CREATE INDEX IF NOT EXISTS idx_workout_tracking_completed_weight 
ON workout_tracking (completed_weight) 
WHERE completed_weight IS NOT NULL;

-- فهرس على اسم يوم التمرين للبحث السريع
CREATE INDEX IF NOT EXISTS idx_workout_tracking_day_name 
ON workout_tracking (workout_day_name);

-- تحديث إحصائيات قاعدة البيانات
ANALYZE workout_tracking;

-- تحديث الذاكرة المؤقتة لـ Supabase
NOTIFY pgrst, 'reload schema';

-- التحقق من الفهارس المضافة
SELECT 
    indexname, 
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'workout_tracking' 
    AND indexname LIKE 'idx_workout_tracking_%'
ORDER BY indexname;
