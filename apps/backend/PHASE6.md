# NutriScan AI — Phase 6: Intelligent Health Analysis

## Architecture

```
POST /api/analysis/daily?date=YYYY-MM-DD
         ↓
  analysisService.getDailyAnalysis()
         ↓
  ┌──────────────────────────────────────┐
  │  Aggregate all meals for the day     │
  │  + water tracking                    │
  └──────────────────────────────────────┘
         ↓
  ┌──────────────────────────────────────┐
  │  calculateDailyScore()               │
  │  ├── scoreCalories()   25%           │
  │  ├── scoreProtein()    20%           │
  │  ├── scoreSugar()      18%           │
  │  ├── scoreSodium()     15%           │
  │  ├── scoreFiber()      12%           │
  │  └── scoreDiversity()  10%           │
  │  → overall 0–100                     │
  └──────────────────────────────────────┘
         ↓
  ┌──────────────────────────────────────┐
  │  generateAlerts()                    │
  │  Condition-aware rules:              │
  │  • DIABETES → stricter sugar limit   │
  │  • HYPERTENSION → stricter sodium    │
  │  • OBESITY → higher fiber target     │
  └──────────────────────────────────────┘
         ↓
  ┌──────────────────────────────────────┐
  │  recommendationService               │
  │  → buildDailyPrompt()               │
  │  → callAnthropicAPI()  (or fallback) │
  └──────────────────────────────────────┘
         ↓
  Upsert DailyAnalysis in DB (cache)
         ↓
  Return to client
```

---

## Scoring Engine

### Sub-score weights

| Factor | Weight | Description |
|--------|--------|-------------|
| Calorie balance | 25% | How close to TDEE target |
| Protein | 20% | Hits protein target |
| Sugar | 18% | Below sugar limit |
| Sodium | 15% | Below sodium limit |
| Fiber | 12% | Reaches fiber minimum |
| Diversity | 10% | Number of meals logged |

### Grade thresholds

| Score | Grade | Label |
|-------|-------|-------|
| ≥ 85 | excellent | 🌟 Xuất sắc |
| ≥ 70 | good | ✅ Tốt |
| ≥ 50 | fair | ⚠️ Trung bình |
| < 50 | poor | ❌ Cần cải thiện |

---

## Health Condition Rules

### DIABETES
- Sugar limit: **25g/day** (vs 50g default)
- Ideal sugar: **10g/day**
- Alerts become **DANGER** (not just WARNING)
- Recommendation: avoid refined carbs, monitor GI

### HYPERTENSION
- Sodium limit: **1500mg/day** (vs 2300mg default)
- Ideal sodium: **1000mg/day**
- Alerts become **DANGER** severity
- Recommendation: reduce processed foods, increase potassium

### OBESITY
- Fiber minimum: **30g/day** (vs 25g default)
- Higher satiety focus
- Recommendation: high-volume low-calorie foods

### HIGH_CHOLESTEROL
- Saturated fat max: **7% of calories** (vs 10% default)
- Cholesterol limit: **200mg/day** (vs 300mg)
- Recommendation: plant-based proteins, omega-3

---

## Weekly Analysis

### Trend detection
Compares first half vs second half of 7-day window:
- Change ≥ 5% in right direction → **improving**
- Change ≥ 5% in wrong direction → **declining**
- Otherwise → **stable**

### Deficiency detection
Nutrients consistently below 80% of target over 3+ days are flagged with severity:
- **mild**: 15-30% below target
- **moderate**: 30-50% below target
- **severe**: 50%+ below target

### Habit detection
Pattern recognition across logged days:
- Skip meals, high sodium habit, high sugar habit → **negative**
- Consistent logging, good fiber days → **positive**

---

## AI Recommendations

### Provider
Uses **Claude Haiku** (fast, cost-effective for short recs).

Fallback chain:
```
Anthropic API → Rule-based fallback
```

### Prompt engineering
All prompts are **grounded in actual data**:
- Exact calories, protein, sodium values from DB
- Specific meals consumed that day
- User's health conditions
- Scoring alerts

This prevents hallucination — Claude cannot invent facts.

### Setup
```env
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Without API key**: rule-based fallbacks produce reasonable recommendations automatically.

---

## API Endpoints Phase 6

```
GET  /api/analysis/daily?date=YYYY-MM-DD    Daily analysis + score + AI rec
GET  /api/analysis/weekly?weekStart=...     Weekly trends + habits + AI insight
GET  /api/analysis/conditions               User's health conditions
POST /api/analysis/conditions               Add/update condition
DELETE /api/analysis/conditions/:condition  Remove condition
```

---

## Frontend Components

| Component | Purpose |
|-----------|---------|
| `HealthScoreRing` | Circular SVG score display (0-100) |
| `AlertList` | Expandable alert cards with severity colors |
| `ScoreBreakdownCard` | 6 sub-scores with progress bars |
| `NutritionProgress` | Full nutrition vs targets breakdown |
| `WeeklyInsightPanel` | Trends, deficiencies, habits |
| `ConditionSelector` | Manage health conditions |
| `DailyAnalysisPage` | Full daily analysis view with tabs |
| `WeeklyAnalysisPage` | Weekly report with charts + insights |

---

## Setup

### 1. Migrate DB
```bash
npm run db:migrate
```

### 2. (Optional) Add Anthropic key
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Without this, rule-based recommendations are used automatically.

### 3. Test

```bash
# Get today's analysis
curl http://localhost:8000/api/analysis/daily \
  -H "Authorization: Bearer TOKEN"

# Get weekly analysis
curl http://localhost:8000/api/analysis/weekly \
  -H "Authorization: Bearer TOKEN"

# Add health condition
curl -X POST http://localhost:8000/api/analysis/conditions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"condition":"DIABETES","severity":"mild"}'

# Weekly analysis with custom week
curl "http://localhost:8000/api/analysis/weekly?weekStart=2024-01-08" \
  -H "Authorization: Bearer TOKEN"
```

---

## Example API Response

### Daily Analysis
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "nutrition": {
      "calories": 1420, "protein": 72, "fiber": 18,
      "sugar": 38, "sodium": 1850, "water": 1200
    },
    "targets": { "calorieTarget": 2100, "proteinTarget": 160 },
    "scoring": {
      "scores": {
        "overall": 67, "calorie": 72, "protein": 55,
        "sugar": 78, "sodium": 65, "fiber": 58, "diversity": 85
      },
      "grade": "good",
      "alerts": [
        {
          "id": "low_protein",
          "severity": "WARNING",
          "title": "Protein không đủ",
          "message": "72g protein (mục tiêu 160g)",
          "recommendation": "Bổ sung thịt nạc, cá, trứng, đậu phụ, sữa chua."
        }
      ],
      "summary": "Hôm nay ăn khá cân bằng..."
    },
    "recommendation": "Bạn đã đạt 67% mục tiêu dinh dưỡng hôm nay...",
    "mealCount": 3
  }
}
```
