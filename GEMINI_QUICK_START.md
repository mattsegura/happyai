# 🚀 Gemini AI - Quick Start Guide

## ✅ Your Setup is Complete!

Your app now uses **Google Gemini 2.5 Flash** for all AI features.

---

## 🔑 Your API Key

```
AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0
```

**Keep this secure!** It's already configured in your `.env` file.

---

## 🎯 Quick Test

### Option 1: Test Page (Easiest)
```bash
npm run dev
# Visit: http://localhost:5175/ai-logger-test
# Click "Test Simple Request"
```

### Option 2: Command Line
```bash
node test-gemini-flash.js
```

### Option 3: In Your Code
```typescript
import { getAIService } from './lib/ai/aiService';

const ai = getAIService();
const response = await ai.complete({
  prompt: 'Explain quantum physics in simple terms',
  featureType: 'course_tutor'
});

console.log(response.content);
```

---

## 💰 Pricing (Super Cheap!)

**Gemini 2.5 Flash:**
- Input: $0.000075 per 1K tokens
- Output: $0.0003 per 1K tokens

**Example Costs:**
- Simple question (100 tokens): **$0.00003** (0.003 cents!)
- Essay analysis (5K tokens): **$0.0015** (0.15 cents)
- Full textbook chapter (50K tokens): **$0.015** (1.5 cents)

**Free Tier:** 1,500 requests per day!

---

## 🎨 Available Models

Your API key has access to **40+ models**. Here are the best ones:

### **For Speed (Recommended):**
```typescript
model: 'gemini-2.5-flash'  // ⚡ Fastest, cheapest
model: 'gemini-2.0-flash'  // Alternative
```

### **For Quality:**
```typescript
model: 'gemini-2.5-pro'    // 🧠 Best reasoning
model: 'gemini-pro-latest' // Always latest
```

### **For Experiments:**
```typescript
model: 'gemini-2.0-flash-thinking-exp' // Shows reasoning process
```

---

## 📊 What's Being Logged

Every AI call automatically logs:
- ✅ User who made the request
- ✅ Feature type (tutor, coach, etc.)
- ✅ Full prompt and response
- ✅ Tokens used (input/output)
- ✅ Cost in cents
- ✅ Execution time
- ✅ Cache hit status

**View logs in:** Supabase `ai_interactions` table

---

## 🔧 Configuration Files

### `.env` (Main Config)
```bash
VITE_AI_PRIMARY_PROVIDER=gemini
VITE_GEMINI_API_KEY=AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0
VITE_AI_ENABLE_CACHING=true
VITE_AI_LOG_INTERACTIONS=true
```

### Change Model (if needed)
Edit `src/lib/ai/aiConfig.ts`:
```typescript
export const DEFAULT_MODELS: Record<AIFeatureType, AIModel> = {
  study_coach: 'gemini-2.5-flash',  // Change this
  course_tutor: 'gemini-2.5-pro',   // Or this
  // ...
};
```

---

## 🎓 AI Features in Your App

### 1. **Course Tutor** (`course_tutor`)
```typescript
const response = await ai.complete({
  prompt: 'Explain photosynthesis',
  featureType: 'course_tutor'
});
```

### 2. **Study Coach** (`study_coach`)
```typescript
const response = await ai.complete({
  prompt: 'Create a study plan for my biology exam',
  featureType: 'study_coach'
});
```

### 3. **Feedback Analyzer** (`feedback_analyzer`)
```typescript
const response = await ai.complete({
  prompt: 'Analyze this instructor feedback: ...',
  featureType: 'feedback_analyzer'
});
```

### 4. **Grade Projection** (`grade_projection`)
```typescript
const response = await ai.complete({
  prompt: 'Project my final grade based on...',
  featureType: 'grade_projection'
});
```

### 5. **Quiz Generator** (`quiz_generator`)
```typescript
const response = await ai.complete({
  prompt: 'Generate 5 quiz questions about...',
  featureType: 'quiz_generator'
});
```

---

## 🌟 Advanced Features

### **Streaming Responses:**
```typescript
for await (const chunk of ai.streamComplete(request)) {
  console.log(chunk.content); // Real-time output
}
```

### **Function Calling:**
```typescript
const result = await ai.functionCall({
  prompt: 'What's the weather?',
  functions: [{
    name: 'get_weather',
    description: 'Get current weather',
    parameters: { /* ... */ }
  }],
  featureType: 'chat'
});
```

### **Custom Options:**
```typescript
const response = await ai.complete({
  prompt: 'Your prompt',
  featureType: 'chat',
  options: {
    temperature: 0.9,      // Creativity (0-1)
    maxTokens: 2000,       // Response length
    cacheEnabled: true,    // Use caching
    cacheTTL: 3600        // Cache for 1 hour
  }
});
```

---

## 🐛 Troubleshooting

### **"API key not configured"**
Check `.env` file has:
```bash
VITE_GEMINI_API_KEY=AIzaSyAPFfRYhMmLj_-7c_gov2fd_bRKAOtCQO0
```

### **"Model not found"**
Use one of these models:
- `gemini-2.5-flash` ✅
- `gemini-2.5-pro` ✅
- `gemini-2.0-flash` ✅

### **"Invalid response"**
Check browser console for detailed error.
The response structure might have changed.

### **Slow responses**
- Use `gemini-2.5-flash` instead of `pro`
- Reduce `maxTokens` in options
- Enable caching for repeated queries

---

## 📈 Monitor Usage

### **Check Costs:**
```typescript
const stats = await ai.getUsageStats(30); // Last 30 days
console.log(`Total cost: $${stats.totalCostCents / 100}`);
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
```

### **View in Supabase:**
```sql
SELECT 
  feature_type,
  COUNT(*) as requests,
  SUM(cost_cents) as total_cost_cents,
  AVG(execution_time_ms) as avg_time_ms
FROM ai_interactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY feature_type;
```

---

## 🎉 You're All Set!

Your AI logging system is fully operational with Gemini.

**Test it now:**
```bash
npm run dev
# Visit: http://localhost:5175/ai-logger-test
```

**Questions?** Check `AI_LOGGER_TEST_SUMMARY.md` for detailed info.

---

**Happy coding! 🚀**
