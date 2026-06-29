# NutriScan AI — Phase 5: AI Food Recognition

## Architecture Overview

```
User uploads image
       ↓
Frontend compression (Canvas API, ~85% JPEG quality)
       ↓
POST /api/scans/analyze  (multipart/form-data)
       ↓
Backend: validate + compress further (Sharp)
       ↓
Cloudinary upload  (or local fallback)
       ↓
AIProviderFactory.getProvider()  ← swappable
       ↓
Google Vision API  (or Mock / YOLOv8)
       ↓
FoodMatchingEngine.matchFoods()
  ├── Exact alias lookup   (food-aliases.ts dictionary)
  ├── DB aliases           (food_aliases table)
  ├── Fuzzy similarity     (Levenshtein + Dice coefficient)
  └── Token overlap        (keyword partial match)
       ↓
Return ranked FoodMatchResult[]
       ↓
User selects match + serving size (small/medium/large/custom)
       ↓
POST /api/scans/:id/confirm
       ↓
Create Meal + MealItem with nutrition snapshot
```

---

## AI Abstraction Layer

The key design decision: **all AI providers implement `IAIVisionProvider`**.

```typescript
interface IAIVisionProvider {
  readonly name: string
  detectLabels(imageBuffer: Buffer, config: AIProviderConfig): Promise<AIDetectionResult>
}
```

### Swapping to YOLOv8

When your custom model is ready:

1. Train YOLOv8 on Vietnamese food dataset
2. Deploy as HTTP inference server
3. Set in `.env`:
   ```env
   AI_PROVIDER=yolov8
   YOLOV8_ENDPOINT=http://your-model-server:8001
   ```
4. Implement `detectLabels()` in `yolov8.provider.ts`
5. **Zero other code changes needed**

### Providers

| Provider | Status | Use case |
|----------|--------|---------|
| `mock`   | ✅ Ready | Development, no API key needed |
| `google_vision` | ✅ Ready | Production |
| `yolov8` | 🔧 Stub | When custom model is ready |

---

## Food Matching Engine

### Matching pipeline (4 levels)

```
AI label: "pho bo"
     ↓
1. Exact alias dict  → "Phở bò"  (score: 1.0 × AI_score)
2. DB aliases table  → fuzzy >85%  (score: 0.95 × AI_score)
3. String similarity → Levenshtein+Dice >55%  (score: 0.80 × AI_score)
4. Token overlap     → keyword match >60%  (score: 0.70 × AI_score)
     ↓
Ranked by final_score = match_score × AI_confidence
```

### Vietnamese diacritics handling

```
"phở bò" → removeDiacritics() → "pho bo"
"bánh mì" → "banh mi"
```

Both the query and candidates are normalized before comparison, so English labels from Google Vision match Vietnamese food names reliably.

### Examples

| AI label | Matched food | Method | Score |
|----------|-------------|--------|-------|
| "pho" | Phở bò | exact | 0.95 |
| "banh mi" | Bánh mì thịt | exact | 0.96 |
| "bubble tea" | Trà sữa trân châu | alias | 0.91 |
| "grilled pork rice" | Cơm tấm sườn | fuzzy | 0.78 |
| "spring roll" | Gỏi cuốn tôm thịt | alias | 0.89 |

---

## Serving Size System

### Presets
| Preset | Multiplier | Use case |
|--------|-----------|---------|
| small  | 0.6×      | Small bowl, snack portion |
| medium | 1.0×      | Standard serving size |
| large  | 1.5×      | Large portion |

### Custom grams
User can override with exact grams. Nutrition is recalculated:
```
actual_nutrition = base_nutrition × (custom_grams / serving_size)
```

---

## Setup

### 1. Cài dependencies
```bash
npm install
```

### 2. Cấu hình .env
```env
# Bắt buộc cho dev (không cần API keys)
AI_PROVIDER=mock

# Sử dụng Google Vision thật
AI_PROVIDER=google_vision
GOOGLE_VISION_API_KEY=your_key_here

# Cloudinary (optional — local fallback nếu không cấu hình)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Migrate + Seed
```bash
npm run db:migrate
npm run db:seed   # seeds food aliases too
```

### 4. Test API

```bash
# Scan ảnh (với mock AI)
curl -X POST http://localhost:8000/api/scans/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/food.jpg"

# Confirm scan
curl -X POST http://localhost:8000/api/scans/SCAN_ID/confirm \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "foodItemId": "FOOD_ITEM_ID",
    "mealType": "LUNCH",
    "mealDate": "2024-01-15",
    "servingPreset": "medium"
  }'

# Health check (shows active provider)
curl http://localhost:8000/api/health
```

---

## API Endpoints Phase 5

```
POST  /api/scans/analyze         Upload image → AI pipeline → matches
POST  /api/scans/:id/confirm     Confirm match → create Meal
GET   /api/scans/history         Scan history (paginated)
GET   /api/scans/:id             Get scan details
DELETE /api/scans/:id            Delete scan + Cloudinary image
```

---

## Frontend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ImageUploader` | features/scan/components | Drag/drop + camera capture |
| `ScanProgress` | features/scan/components | Animated AI pipeline steps |
| `FoodMatchCard` | features/scan/components | Ranked match with confidence bar |
| `ServingSizeSelector` | features/scan/components | S/M/L presets + custom grams |
| `MealConfirmModal` | features/scan/components | Bottom drawer: meal type + date |
| `useScan` | features/scan/hooks | Full state machine (idle→uploading→analyzing→result→confirmed) |

### State machine
```
idle
 ↓ (file selected)
compressing → uploading → analyzing
                                   ↓
                               result ←→ confirming
                                   ↓
                              confirmed
                                   ↓ (reset)
                               idle

Any step → error (on failure)
```
