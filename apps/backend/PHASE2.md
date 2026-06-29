# NutriScan AI — Phase 2: Database Architecture

## Tổng quan Phase 2

Phase 2 xây dựng hoàn chỉnh nền tảng database, health engine, và toàn bộ API CRUD.

---

## Những gì đã thêm mới

### 1. Prisma Schema (10 models)

| Model | Mô tả |
|-------|-------|
| `User` | Tài khoản người dùng, soft delete |
| `RefreshToken` | Lưu refresh token trong DB để hỗ trợ revoke |
| `HealthProfile` | Thông tin sức khỏe: chiều cao, cân nặng, mục tiêu |
| `FoodItem` | Cơ sở dữ liệu thực phẩm (có sẵn 16 món Việt Nam) |
| `Meal` | Bữa ăn của người dùng, soft delete |
| `MealItem` | Từng món trong bữa ăn, snapshot dinh dưỡng |
| `NutritionAnalysis` | Kết quả phân tích ảnh AI |
| `WaterTracking` | Theo dõi lượng nước uống hàng ngày |
| `WeightTracking` | Theo dõi cân nặng theo thời gian (unique mỗi ngày) |
| `MealHistory` | Denormalized để query analytics nhanh |

### 2. Health Engine (Mifflin-St Jeor formula)

```
BMR → TDEE → Calorie Target → Macro Targets → BMI
```

| Hàm | Mô tả |
|-----|-------|
| `calculateBMR()` | Mifflin-St Jeor 1990, nam/nữ/khác |
| `calculateTDEE()` | BMR × PAL (5 mức hoạt động) |
| `calculateCalorieTarget()` | TDEE ± delta theo goal, có sàn an toàn |
| `calculateMacroTargets()` | Protein/Carb/Fat theo tỉ lệ goal |
| `calculateBMI()` | WHO classification |
| `calculateWaterTarget()` | 35ml/kg + bonus hoạt động |

### 3. DTO Layer (8 files)

Mỗi resource có DTO riêng với Zod schema cho:
- **Request validation** (input từ client)
- **Response serialization** (output gửi ra)
- **Mapper functions** (Prisma model → DTO)

### 4. Repository Layer (8 repositories)

Clean separation: mỗi repo chỉ chứa Prisma queries, không có logic.

### 5. Service Layer (7 services)

Business logic sạch, không biết về `req`/`res`.

### 6. API Endpoints mới (Phase 2)

```
# Health Profile
GET    /api/health-profile           Lấy hồ sơ sức khỏe
POST   /api/health-profile           Tạo/cập nhật hồ sơ (tính BMR/TDEE tự động)
PATCH  /api/health-profile           Cập nhật một phần

# Food Items
GET    /api/foods?q=pho&category=VIETNAMESE   Tìm kiếm thực phẩm
GET    /api/foods/:id                          Xem chi tiết
POST   /api/foods                              Thêm thực phẩm mới

# Meals
POST   /api/meals                    Ghi nhận bữa ăn
GET    /api/meals/daily?date=...     Tổng kết dinh dưỡng trong ngày
GET    /api/meals/history            Lịch sử bữa ăn (có phân trang)
GET    /api/meals/:id                Xem chi tiết bữa ăn
DELETE /api/meals/:id                Xóa bữa ăn (soft delete)

# Water Tracking
POST   /api/water                    Ghi nhận lượng nước
GET    /api/water?date=...           Tổng kết nước trong ngày
DELETE /api/water/:id                Xóa bản ghi

# Weight Tracking
POST   /api/weight                   Ghi nhận cân nặng
GET    /api/weight/progress          Tiến trình cân nặng + BMI
DELETE /api/weight/:id               Xóa bản ghi

# Auth (cập nhật)
POST   /api/auth/logout-all          Đăng xuất tất cả thiết bị
```

---

## Setup từ đầu

### Bước 1: Cài dependencies
```bash
cd nutriscan-ai
npm install
```

### Bước 2: Cấu hình môi trường
```bash
cp apps/backend/.env.example apps/backend/.env
```

Chỉnh sửa `apps/backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nutriscan_dev?schema=public"
JWT_ACCESS_SECRET=thay_bang_32_ky_tu_bat_ky_o_day
JWT_REFRESH_SECRET=thay_bang_32_ky_tu_khac_o_day
```

### Bước 3: Khởi động PostgreSQL (Docker)
```bash
docker run --name nutriscan-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=nutriscan_dev \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Bước 4: Chạy migrations
```bash
npm run db:migrate
# → Tạo tất cả 10 tables + indexes + enums
```

### Bước 5: Generate Prisma Client
```bash
npm run db:generate
# → Tạo @prisma/client có type-safety đầy đủ
```

### Bước 6: Seed dữ liệu
```bash
npm run db:seed
```

Output mong đợi:
```
🌱 Bắt đầu seed database NutriScan AI...

📦 Seeding food items...
  ✅ 16 món mới, 0 món cập nhật

👤 Seeding demo user...
  ✅ Demo user: demo@nutriscan.ai

💪 Seeding health profile...
  ✅ BMR=1649, TDEE=2556, Calo=2556
  📊 Macros: Protein 160g / Carb 320g / Fat 71g

⚖️  Seeding weight tracking...
  ✅ 7 bản ghi cân nặng

🍜 Seeding sample meal...
  ✅ Bữa sáng mẫu: 615 kcal (Phở bò + Cà phê sữa đá)

💧 Seeding water tracking...
  ✅ 3 lần uống nước, tổng 750ml hôm nay

═══════════════════════════════════════
🎉 Seed hoàn thành!
   Food Items:      16
   Users:           1
   Health Profiles: 1
   Meals:           1
   Water Tracking:  3
   Weight Tracking: 7
═══════════════════════════════════════

📧 Demo login:
   Email:    demo@nutriscan.ai
   Password: Password123
```

### Bước 7: Chạy server
```bash
npm run dev:backend
# → http://localhost:8000
```

---

## Test Health Engine

```bash
cd apps/backend
npm run test
```

Kết quả mong đợi:
```
✓ calculateBMR > tính đúng BMR cho nam
✓ calculateBMR > tính đúng BMR cho nữ
✓ calculateBMR > ném lỗi khi weight <= 0
✓ calculateTDEE > SEDENTARY × 1.2
✓ calculateCalorieTarget > WEIGHT_LOSS giảm 500 kcal
✓ calculateCalorieTarget > không xuống dưới 1200 kcal cho nữ
✓ calculateMacroTargets > tổng macro khớp với calo mục tiêu
✓ calculateBMI > BMI bình thường
...
```

---

## Ví dụ API

### Đăng ký tài khoản
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Test1234","name":"Nguyen Van A"}'
```

### Tạo hồ sơ sức khỏe (tự động tính BMR/TDEE)
```bash
curl -X POST http://localhost:8000/api/health-profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "gender": "MALE",
    "birthDate": "1993-05-15T00:00:00Z",
    "height": 170,
    "heightUnit": "CM",
    "weight": 70,
    "weightUnit": "KG",
    "targetWeight": 65,
    "activityLevel": "MODERATE",
    "goalType": "WEIGHT_LOSS"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Hồ sơ sức khỏe đã được lưu",
  "data": {
    "bmr": 1649,
    "tdee": 2556,
    "calorieTarget": 2056,
    "proteinTarget": 180,
    "carbTarget": 205,
    "fatTarget": 57
  }
}
```

### Tìm kiếm thực phẩm Việt Nam
```bash
curl "http://localhost:8000/api/foods?q=pho&category=VIETNAMESE"
```

### Ghi nhận bữa ăn sáng
```bash
curl -X POST http://localhost:8000/api/meals \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mealType": "BREAKFAST",
    "mealDate": "2024-01-15",
    "items": [
      {"foodItemId": "FOOD_ID_PHO", "quantity": 500, "unit": "g"},
      {"foodItemId": "FOOD_ID_CA_PHE", "quantity": 250, "unit": "ml"}
    ]
  }'
```

### Xem tổng kết ngày
```bash
curl "http://localhost:8000/api/meals/daily?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Thực phẩm Việt Nam đã seed

| Tên | Calo | Protein | Carb | Fat | Khẩu phần |
|-----|------|---------|------|-----|-----------|
| Phở bò | 450 | 28g | 52g | 12g | 500g (1 tô) |
| Phở gà | 380 | 30g | 45g | 8g | 500g (1 tô) |
| Bún bò Huế | 520 | 32g | 58g | 16g | 550g (1 tô) |
| Bún riêu cua | 390 | 22g | 50g | 11g | 500g (1 tô) |
| Hủ tiếu Nam Vang | 430 | 26g | 55g | 10g | 500g (1 tô) |
| Cơm tấm sườn | 680 | 35g | 75g | 25g | 400g |
| Cơm gà Hội An | 550 | 38g | 60g | 16g | 380g |
| Bánh mì thịt | 380 | 18g | 42g | 15g | 200g (1 ổ) |
| Bánh cuốn nhân thịt | 320 | 16g | 45g | 8g | 300g |
| Gỏi cuốn tôm thịt | 185 | 14g | 22g | 4g | 180g (2 cuốn) |
| Trà sữa trân châu | 420 | 5g | 78g | 9g | 500ml |
| Cà phê sữa đá | 165 | 3g | 28g | 5g | 250ml |

---

## Database Commands

```bash
# Tạo migration mới sau khi sửa schema
npm run db:migrate

# Deploy migrations lên production
npm run db:migrate:deploy

# Generate Prisma Client (bắt buộc sau khi sửa schema)
npm run db:generate

# Mở Prisma Studio GUI
npm run db:studio

# Reset toàn bộ DB (xóa + migrate lại + seed)
npm run db:reset

# Chỉ chạy seed
npm run db:seed
```
