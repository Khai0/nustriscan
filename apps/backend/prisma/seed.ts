// ============================================================
// NutriScan AI — Database Seed (Phase 2)
// Thực phẩm Việt Nam + Demo user
// ============================================================
import { PrismaClient, FoodCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Vietnamese Foods ────────────────────────────────────────────────────────
// Nguồn dinh dưỡng: Bảng thành phần thực phẩm Việt Nam (Viện Dinh dưỡng, 2017)
// Tất cả tính trên 1 khẩu phần ăn tiêu chuẩn (không phải 100g)

const vietnameseFoods = [
  // ── Món nước / soup ────────────────────────────────────────────────────────
  {
    name: 'Phở bò',
    nameEn: 'Beef Pho',
    category: FoodCategory.VIETNAMESE,
    description: 'Phở bò truyền thống với bánh phở, thịt bò, nước dùng',
    servingSize: 500,
    servingUnit: 'g (1 tô)',
    calories: 450,
    protein: 28,
    carbohydrates: 52,
    fat: 12,
    fiber: 2.5,
    sugar: 4,
    sodium: 1200,
    cholesterol: 65,
    saturatedFat: 4.5,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Phở gà',
    nameEn: 'Chicken Pho',
    category: FoodCategory.VIETNAMESE,
    description: 'Phở gà với bánh phở, thịt gà, nước dùng trong',
    servingSize: 500,
    servingUnit: 'g (1 tô)',
    calories: 380,
    protein: 30,
    carbohydrates: 45,
    fat: 8,
    fiber: 2,
    sugar: 3,
    sodium: 1100,
    cholesterol: 70,
    saturatedFat: 2,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Bún bò Huế',
    nameEn: 'Hue Beef Vermicelli',
    category: FoodCategory.VIETNAMESE,
    description: 'Bún bò Huế cay với bún, thịt bò, giò heo, sả',
    servingSize: 550,
    servingUnit: 'g (1 tô)',
    calories: 520,
    protein: 32,
    carbohydrates: 58,
    fat: 16,
    fiber: 3,
    sugar: 5,
    sodium: 1400,
    cholesterol: 80,
    saturatedFat: 5.5,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Bún riêu cua',
    nameEn: 'Crab Vermicelli Soup',
    category: FoodCategory.VIETNAMESE,
    description: 'Bún riêu cua với bún, riêu cua, cà chua, đậu hũ',
    servingSize: 500,
    servingUnit: 'g (1 tô)',
    calories: 390,
    protein: 22,
    carbohydrates: 50,
    fat: 11,
    fiber: 4,
    sugar: 6,
    sodium: 980,
    cholesterol: 120,
    saturatedFat: 3,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Hủ tiếu Nam Vang',
    nameEn: 'Phnom Penh Noodle Soup',
    category: FoodCategory.VIETNAMESE,
    description: 'Hủ tiếu với thịt heo, tôm, gan, nước dùng trong',
    servingSize: 500,
    servingUnit: 'g (1 tô)',
    calories: 430,
    protein: 26,
    carbohydrates: 55,
    fat: 10,
    fiber: 2,
    sugar: 4,
    sodium: 1100,
    cholesterol: 90,
    saturatedFat: 3,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },

  // ── Món cơm ───────────────────────────────────────────────────────────────
  {
    name: 'Cơm tấm sườn bì chả',
    nameEn: 'Broken Rice with Grilled Pork',
    category: FoodCategory.VIETNAMESE,
    description: 'Cơm tấm với sườn nướng, bì, chả trứng, nước mắm',
    servingSize: 400,
    servingUnit: 'g (1 phần)',
    calories: 680,
    protein: 35,
    carbohydrates: 75,
    fat: 25,
    fiber: 2,
    sugar: 8,
    sodium: 1300,
    cholesterol: 150,
    saturatedFat: 8,
    transFat: 0.5,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Cơm gà Hội An',
    nameEn: 'Hoi An Chicken Rice',
    category: FoodCategory.VIETNAMESE,
    description: 'Cơm gà với thịt gà luộc xé, cơm gà vàng, rau răm',
    servingSize: 380,
    servingUnit: 'g (1 phần)',
    calories: 550,
    protein: 38,
    carbohydrates: 60,
    fat: 16,
    fiber: 1.5,
    sugar: 3,
    sodium: 900,
    cholesterol: 95,
    saturatedFat: 4,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },

  // ── Bánh / sandwiches ─────────────────────────────────────────────────────
  {
    name: 'Bánh mì thịt',
    nameEn: 'Vietnamese Sandwich with Pork',
    category: FoodCategory.VIETNAMESE,
    description: 'Bánh mì với thịt nguội, pa tê, rau, dưa cải, tương ớt',
    servingSize: 200,
    servingUnit: 'g (1 ổ)',
    calories: 380,
    protein: 18,
    carbohydrates: 42,
    fat: 15,
    fiber: 3,
    sugar: 5,
    sodium: 850,
    cholesterol: 45,
    saturatedFat: 4.5,
    transFat: 0.2,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Bánh cuốn nhân thịt',
    nameEn: 'Steamed Rice Roll',
    category: FoodCategory.VIETNAMESE,
    description: 'Bánh cuốn hấp nhân thịt heo băm, mộc nhĩ, hành phi',
    servingSize: 300,
    servingUnit: 'g (1 phần 5 cuốn)',
    calories: 320,
    protein: 16,
    carbohydrates: 45,
    fat: 8,
    fiber: 1.5,
    sugar: 2,
    sodium: 700,
    cholesterol: 40,
    saturatedFat: 2.5,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },

  // ── Món cuốn / salad ──────────────────────────────────────────────────────
  {
    name: 'Gỏi cuốn tôm thịt',
    nameEn: 'Fresh Spring Rolls with Shrimp and Pork',
    category: FoodCategory.VIETNAMESE,
    description: 'Gỏi cuốn với tôm, thịt luộc, bún, rau sống, bánh tráng',
    servingSize: 180,
    servingUnit: 'g (2 cuốn)',
    calories: 185,
    protein: 14,
    carbohydrates: 22,
    fat: 4,
    fiber: 2.5,
    sugar: 2,
    sodium: 380,
    cholesterol: 70,
    saturatedFat: 1,
    transFat: 0,
    vitaminC: 8,
    isVerified: true,
    imageUrl: null,
  },

  // ── Đồ uống ───────────────────────────────────────────────────────────────
  {
    name: 'Trà sữa trân châu đường đen',
    nameEn: 'Brown Sugar Bubble Tea',
    category: FoodCategory.BEVERAGE,
    description: 'Trà sữa với trân châu đường đen, sữa tươi, đường',
    servingSize: 500,
    servingUnit: 'ml (1 ly lớn)',
    calories: 420,
    protein: 5,
    carbohydrates: 78,
    fat: 9,
    fiber: 0.5,
    sugar: 52,
    sodium: 120,
    cholesterol: 25,
    saturatedFat: 5,
    transFat: 0,
    calcium: 180,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Cà phê sữa đá',
    nameEn: 'Vietnamese Iced Coffee with Condensed Milk',
    category: FoodCategory.BEVERAGE,
    description: 'Cà phê phin truyền thống với sữa đặc, đá viên',
    servingSize: 250,
    servingUnit: 'ml (1 ly)',
    calories: 165,
    protein: 3,
    carbohydrates: 28,
    fat: 5,
    fiber: 0,
    sugar: 26,
    sodium: 60,
    cholesterol: 18,
    saturatedFat: 3,
    transFat: 0,
    calcium: 90,
    isVerified: true,
    imageUrl: null,
  },
]

// ─── Additional common foods ──────────────────────────────────────────────────
const commonFoods = [
  {
    name: 'Cơm trắng',
    nameEn: 'Steamed White Rice',
    category: FoodCategory.GRAIN,
    description: 'Cơm trắng nấu chín',
    servingSize: 180,
    servingUnit: 'g (1 chén)',
    calories: 234,
    protein: 4.8,
    carbohydrates: 51,
    fat: 0.4,
    fiber: 0.6,
    sugar: 0,
    sodium: 5,
    cholesterol: 0,
    saturatedFat: 0.1,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Trứng gà luộc',
    nameEn: 'Boiled Chicken Egg',
    category: FoodCategory.PROTEIN,
    description: 'Trứng gà luộc chín',
    servingSize: 50,
    servingUnit: 'g (1 quả)',
    calories: 72,
    protein: 6.3,
    carbohydrates: 0.4,
    fat: 4.8,
    fiber: 0,
    sugar: 0.2,
    sodium: 71,
    cholesterol: 186,
    saturatedFat: 1.6,
    transFat: 0,
    vitaminD: 1.1,
    calcium: 28,
    iron: 0.9,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Ức gà nướng',
    nameEn: 'Grilled Chicken Breast',
    category: FoodCategory.PROTEIN,
    description: 'Ức gà nướng không da',
    servingSize: 150,
    servingUnit: 'g (1 miếng vừa)',
    calories: 231,
    protein: 43.5,
    carbohydrates: 0,
    fat: 5,
    fiber: 0,
    sugar: 0,
    sodium: 104,
    cholesterol: 130,
    saturatedFat: 1.4,
    transFat: 0,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Chuối tiêu',
    nameEn: 'Banana',
    category: FoodCategory.FRUIT,
    description: 'Chuối tiêu chín',
    servingSize: 118,
    servingUnit: 'g (1 quả vừa)',
    calories: 105,
    protein: 1.3,
    carbohydrates: 27,
    fat: 0.4,
    fiber: 3.1,
    sugar: 14.4,
    sodium: 1,
    cholesterol: 0,
    saturatedFat: 0.1,
    transFat: 0,
    vitaminC: 10.3,
    potassium: 422,
    isVerified: true,
    imageUrl: null,
  },
  {
    name: 'Sữa chua không đường',
    nameEn: 'Plain Yogurt',
    category: FoodCategory.DAIRY,
    description: 'Sữa chua không đường nguyên chất',
    servingSize: 150,
    servingUnit: 'g (1 hộp nhỏ)',
    calories: 90,
    protein: 9,
    carbohydrates: 6,
    fat: 2.5,
    fiber: 0,
    sugar: 5,
    sodium: 105,
    cholesterol: 10,
    saturatedFat: 1.5,
    transFat: 0,
    calcium: 300,
    isVerified: true,
    imageUrl: null,
  },
]

// ─── Main seed function ───────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Bắt đầu seed database NutriScan AI...\n')

  // ── 1. Upsert food items ────────────────────────────────────────────────
  console.log('📦 Seeding food items...')
  const allFoods = [...vietnameseFoods, ...commonFoods]

  let foodCreated = 0
  let foodUpdated = 0

  for (const food of allFoods) {
    const existing = await prisma.foodItem.findFirst({
      where: { name: food.name },
    })

    if (existing) {
      await prisma.foodItem.update({
        where: { id: existing.id },
        data: food,
      })
      foodUpdated++
    } else {
      await prisma.foodItem.create({ data: food })
      foodCreated++
    }
  }

  console.log(`  ✅ ${foodCreated} món mới, ${foodUpdated} món cập nhật\n`)

  // ── 2. Demo user ────────────────────────────────────────────────────────
  console.log('👤 Seeding demo user...')
  const hashedPassword = await bcrypt.hash('Password123!', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@nutriscan.ai' },
    update: { name: 'Demo User', isActive: true },
    create: {
      email: 'demo@nutriscan.ai',
      name: 'Demo User',
      password: hashedPassword,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      role: 'USER',
    },
  })
  console.log(`  ✅ Demo user: ${demoUser.email}\n`)

  // ── 3. Health profile cho demo user ─────────────────────────────────────
  console.log('💪 Seeding health profile...')

  // Import health engine để tính BMR/TDEE
  const { calculateHealthMetrics, Gender, ActivityLevel, GoalType } = await import(
    '../src/utils/health-engine/index'
  )

  const birthDate = new Date('1993-05-15') // 31 tuổi
  const metrics = calculateHealthMetrics({
    gender: Gender.MALE,
    weightKg: 70,
    heightCm: 170,
    ageYears: 31,
    activityLevel: ActivityLevel.MODERATE,
    goalType: GoalType.MAINTENANCE,
  })

  await prisma.healthProfile.upsert({
    where: { userId: demoUser.id },
    update: {
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      calorieTarget: metrics.calorieTarget,
      proteinTarget: metrics.macros.proteinG,
      carbTarget: metrics.macros.carbG,
      fatTarget: metrics.macros.fatG,
    },
    create: {
      userId: demoUser.id,
      gender: 'MALE',
      birthDate,
      height: 170,
      heightUnit: 'CM',
      weight: 70,
      weightUnit: 'KG',
      targetWeight: 68,
      activityLevel: 'MODERATE',
      goalType: 'MAINTENANCE',
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      calorieTarget: metrics.calorieTarget,
      proteinTarget: metrics.macros.proteinG,
      carbTarget: metrics.macros.carbG,
      fatTarget: metrics.macros.fatG,
    },
  })
  console.log(`  ✅ Health profile: BMR=${metrics.bmr}, TDEE=${metrics.tdee}, Calo=${metrics.calorieTarget}`)
  console.log(`  📊 Macros: Protein ${metrics.macros.proteinG}g / Carb ${metrics.macros.carbG}g / Fat ${metrics.macros.fatG}g\n`)

  // ── 4. Sample weight tracking ────────────────────────────────────────────
  console.log('⚖️  Seeding weight tracking...')
  const weightHistory = [
    { daysAgo: 30, weight: 72.5 },
    { daysAgo: 25, weight: 72.0 },
    { daysAgo: 20, weight: 71.5 },
    { daysAgo: 15, weight: 71.2 },
    { daysAgo: 10, weight: 70.8 },
    { daysAgo: 5, weight: 70.3 },
    { daysAgo: 0, weight: 70.0 },
  ]

  for (const entry of weightHistory) {
    const logDate = new Date()
    logDate.setDate(logDate.getDate() - entry.daysAgo)
    const dateOnly = new Date(logDate.toISOString().split('T')[0])

    await prisma.weightTracking.upsert({
      where: { userId_logDate: { userId: demoUser.id, logDate: dateOnly } },
      update: { weight: entry.weight },
      create: {
        userId: demoUser.id,
        weight: entry.weight,
        weightUnit: 'KG',
        logDate: dateOnly,
        bmi: parseFloat((entry.weight / (1.7 * 1.7)).toFixed(1)),
      },
    })
  }
  console.log(`  ✅ ${weightHistory.length} bản ghi cân nặng\n`)

  // ── 5. Sample meal for today ──────────────────────────────────────────────
  console.log('🍜 Seeding sample meal...')
  const pho = await prisma.foodItem.findFirst({ where: { name: 'Phở bò' } })
  const caPheSua = await prisma.foodItem.findFirst({ where: { name: 'Cà phê sữa đá' } })

  if (pho && caPheSua) {
    const today = new Date()
    const todayDate = new Date(today.toISOString().split('T')[0])

    const existingMeal = await prisma.meal.findFirst({
      where: { userId: demoUser.id, mealDate: todayDate, mealType: 'BREAKFAST' },
    })

    if (!existingMeal) {
      const totalCalories = pho.calories + caPheSua.calories
      const totalProtein = pho.protein + caPheSua.protein
      const totalCarbs = pho.carbohydrates + caPheSua.carbohydrates
      const totalFat = pho.fat + caPheSua.fat
      const totalFiber = pho.fiber + caPheSua.fiber

      const meal = await prisma.meal.create({
        data: {
          userId: demoUser.id,
          mealType: 'BREAKFAST',
          mealDate: todayDate,
          notes: 'Bữa sáng mẫu',
          totalCalories,
          totalProtein,
          totalCarbohydrates: totalCarbs,
          totalFat,
          totalFiber,
          mealItems: {
            create: [
              {
                foodItemId: pho.id,
                quantity: 500,
                unit: 'g',
                calories: pho.calories,
                protein: pho.protein,
                carbohydrates: pho.carbohydrates,
                fat: pho.fat,
                fiber: pho.fiber,
              },
              {
                foodItemId: caPheSua.id,
                quantity: 250,
                unit: 'ml',
                calories: caPheSua.calories,
                protein: caPheSua.protein,
                carbohydrates: caPheSua.carbohydrates,
                fat: caPheSua.fat,
                fiber: caPheSua.fiber,
              },
            ],
          },
        },
      })
      console.log(`  ✅ Bữa sáng mẫu: ${meal.totalCalories} kcal (Phở bò + Cà phê sữa đá)\n`)
    } else {
      console.log(`  ⏭️  Bữa sáng mẫu đã tồn tại\n`)
    }
  }

  // ── 6. Sample water tracking ──────────────────────────────────────────────
  console.log('💧 Seeding water tracking...')
  const today = new Date()
  const todayDate = new Date(today.toISOString().split('T')[0])

  const waterEntries = [250, 300, 200]
  for (const amount of waterEntries) {
    await prisma.waterTracking.create({
      data: {
        userId: demoUser.id,
        amount,
        logDate: todayDate,
      },
    })
  }
  const totalWater = waterEntries.reduce((a, b) => a + b, 0)
  console.log(`  ✅ ${waterEntries.length} lần uống nước, tổng ${totalWater}ml hôm nay\n`)

  // ─── Summary ───────────────────────────────────────────────────────────────
  const counts = await prisma.$transaction([
    prisma.foodItem.count(),
    prisma.user.count(),
    prisma.healthProfile.count(),
    prisma.meal.count(),
    prisma.waterTracking.count(),
    prisma.weightTracking.count(),
  ])

  console.log('═══════════════════════════════════════')
  console.log('🎉 Seed hoàn thành!')
  console.log(`   Food Items:      ${counts[0]}`)
  console.log(`   Users:           ${counts[1]}`)
  console.log(`   Health Profiles: ${counts[2]}`)
  console.log(`   Meals:           ${counts[3]}`)
  console.log(`   Water Tracking:  ${counts[4]}`)
  console.log(`   Weight Tracking: ${counts[5]}`)
  console.log('═══════════════════════════════════════')
  console.log('\n📧 Demo login:')
  console.log('   Email:    demo@nutriscan.ai')
  console.log('   Password: Password123!')
}

main()
  .catch(e => {
    console.error('❌ Seed thất bại:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

// ── Phase 5: Seed food aliases ─────────────────────────────────────────────────
async function seedFoodAliases() {
  console.log('🔤 Seeding food aliases...')

  const aliasMap: Record<string, string[]> = {
    'Phở bò': ['pho', 'pho bo', 'beef pho', 'beef noodle soup', 'noodle soup', 'rice noodle soup', 'pho noodle', 'vietnamese noodle'],
    'Phở gà': ['pho ga', 'chicken pho', 'chicken noodle soup', 'ga pho'],
    'Bún bò Huế': ['bun bo hue', 'bun bo', 'hue beef noodle', 'spicy beef noodle', 'lemongrass beef noodle'],
    'Bún riêu cua': ['bun rieu', 'bun rieu cua', 'crab noodle soup', 'tomato crab noodle', 'vermicelli crab'],
    'Hủ tiếu Nam Vang': ['hu tieu', 'hu tieu nam vang', 'phnom penh noodle', 'clear broth noodle'],
    'Cơm tấm sườn bì chả': ['com tam', 'broken rice', 'com tam suon', 'vietnamese broken rice', 'grilled pork rice', 'broken rice pork'],
    'Cơm gà Hội An': ['com ga', 'com ga hoi an', 'hoi an chicken rice', 'chicken rice', 'vietnamese chicken rice'],
    'Bánh mì thịt': ['banh mi', 'vietnamese sandwich', 'banh mi sandwich', 'baguette sandwich', 'vietnamese baguette', 'banh my'],
    'Bánh cuốn nhân thịt': ['banh cuon', 'steamed rice roll', 'rice roll', 'vietnamese rice roll'],
    'Gỏi cuốn tôm thịt': ['goi cuon', 'spring roll', 'fresh spring roll', 'summer roll', 'rice paper roll', 'nem cuon'],
    'Trà sữa trân châu đường đen': ['bubble tea', 'boba tea', 'boba', 'milk tea', 'tra sua', 'brown sugar bubble tea', 'pearl milk tea'],
    'Cà phê sữa đá': ['ca phe sua da', 'vietnamese iced coffee', 'ca phe', 'iced coffee', 'vietnamese coffee', 'coffee with condensed milk'],
  }

  let created = 0
  let skipped = 0

  for (const [foodName, aliases] of Object.entries(aliasMap)) {
    const food = await prisma.foodItem.findFirst({ where: { name: foodName } })
    if (!food) { skipped++; continue }

    for (const alias of aliases) {
      await prisma.foodAlias.upsert({
        where: { foodItemId_alias: { foodItemId: food.id, alias } },
        create: { foodItemId: food.id, alias, language: alias.match(/[àáảãạăắặẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i) ? 'vi' : 'romanized' },
        update: {},
      })
      created++
    }
  }

  console.log(`  ✅ ${created} aliases created, ${skipped} foods not found\n`)
}

// Run alias seeding at the end
seedFoodAliases()
  .catch(e => { console.error('Alias seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
