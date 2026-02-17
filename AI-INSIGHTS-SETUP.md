# AI Insights Generator with GLM Flash

## 🧠 **النظام الجديد لـ AI Insights:**

### **1. API الرئيسي: `/api/progress/ai-insights-generator`**
- يستخدم GLM Flash لتحليل بيانات أسبوعية
- يولد insights باللغتين العربية والإنجليزية
- يحفظ النتائج في قاعدة البيانات

### **2. Cron Job: `/api/progress/weekly-insights-cron`**
- يعمل أسبوعيًا لكل المستخدمين
- يولد insights تلقائيًا
- يرسل إشعارات للمستخدمين

### **3. Enhanced API: `/api/progress/enhanced-ai-insights`**
- يجلب الـ insights مع دعم عربي
- يسمح بتحديث الحالة (read/bookmarked)
- يدعم الترجمة الفورية

### **4. واجهة تحكم: `/ai-insights-generator`**
- صفحة خاصة لتجربة النظام
- أزرار للتوليد اليدوي والتلقائي
- عرض النتائج باللغتين

---

## 🔧 **كيف يعمل GLM Flash:**

### **System Prompt المتخصص:**
```
You are an expert AI fitness coach analyzing weekly progress data.
Generate 3-5 personalized insights in Arabic and English based on the user's data.

Focus on:
1. Achievements and progress
2. Areas for improvement  
3. Motivational messages
4. Specific recommendations
5. Pattern recognition
```

### **البيانات التي يحللها:**
```json
{
  "user": { "currentStreak": 7, "longestStreak": 21 },
  "workouts": { "totalSessions": 4, "uniqueExercises": 12 },
  "nutrition": { "avgDailyCalories": 2200, "avgDailyProtein": 180 },
  "achievements": { "newPRs": 2, "avgDayScore": 85 }
}
```

### **الناتج المتوقع:**
```json
{
  "type": "achievement",
  "category": "consistency", 
  "title_ar": "انتظام رائع!",
  "title_en": "Great Consistency!",
  "message_ar": "لقد تدربت 4 مرات هذا الأسبوع!",
  "message_en": "You worked out 4 times this week!",
  "priority": 4,
  "relevance": 0.9
}
```

---

## 📅 **التشغيل الأسبوعي التلقائي:**

### **Cron Job Setup:**
```bash
# كل يوم الأحد الساعة 9 صباحًا
0 9 * * 0 curl -X POST https://your-app.com/api/progress/weekly-insights-cron
```

### **ما يفعله Cron Job:**
1. يجلب كل المستخدمين النشطين
2. يستدعي GLM Flash لكل مستخدم
3. يحفظ الـ insights في قاعدة البيانات
4. يرسل إشعارات للمستخدمين

---

## 🎯 **أنواع الـ Insights:**

### **1. Achievement Insights**
- تحقيق أرقام شخصية جديدة
- الوصول إلى معالم مهمة
- انتظام ممتاز

### **2. Recommendation Insights**
- زيادة البروتين
- تحسين تكرار التدريب
- نصائح للتعافي

### **3. Motivation Insights**
- تشجيع على الاستمرارية
- الاحتفال بالإنجازات
- بناء العادات

### **4. Warning Insights**
- نقص في التغذية
- قلة النوم
- خطر الإرهاق

---

## 🌐 **دعم اللغتين:**

### **English Version:**
```
🏆 New Personal Records!
You set 2 new PRs this week!
💡 Keep pushing your limits gradually.
```

### **Arabic Version:**
```
🏆 أرقام شخصية جديدة!
حققت 2 أرقام شخصية جديدة هذا الأسبوع!
💡 استمر في دفع حدودك تدريجياً.
```

---

## 🔄 **التكامل مع النظام الحالي:**

### **التحديث في Progress Page:**
```typescript
// يجلب الـ insights مع دعم عربي
const { data: insights } = await fetch('/api/progress/enhanced-ai-insights?arabic=true')

// عرض باللغة المختارة
{currentLanguage === 'ar' && insight.arabic ? 
  insight.arabic.title : insight.title}
```

### **Real-time Updates:**
```typescript
// عند توليد insight جديد
window.dispatchEvent(new CustomEvent('newInsight', {
  detail: { insight: newInsight }
}))
```

---

## 📊 **المقاييس والتحليل:**

### **Quality Metrics:**
- **Relevance Score**: 0.0-1.0 (مدى صلة الـ insight)
- **Priority Level**: 1-5 (الأولوية)
- **User Feedback**: thumbs up/down
- **Engagement**: opens, clicks, bookmarks

### **Performance Metrics:**
- **Generation Time**: < 5 seconds
- **Success Rate**: > 95%
- **User Satisfaction**: > 4.5/5
- **Weekly Coverage**: 100% of active users

---

## 🛠️ **Environment Variables:**
```env
GLM_FLASH_API_KEY=your_glm_flash_api_key
NEXT_PUBLIC_APP_URL=https://your-app.com
CRON_SECRET_KEY=your_cron_secret
```

---

## 🎯 **الاستخدام:**

1. **Manual Generation**: اذهب إلى `/ai-insights-generator`
2. **Automatic Weekly**: Cron job runs every Sunday
3. **API Integration**: استخدم `/api/progress/enhanced-ai-insights`
4. **Real-time**: تحديثات فورية في Progress Page

---

## 🚀 **النتيجة:**

**نظام AI Insights ذكي ومتعدد اللغات يحلل بياناتك أسبوعيًا ويولد نصائح مخصصة باستخدام GLM Flash!** 🧠✨
