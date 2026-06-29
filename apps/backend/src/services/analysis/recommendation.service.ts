import { logger } from '@utils/logger'
import type { ScoringResult } from '@utils/health-rules/scoring-engine'
import type { WeeklyInsightData } from '@utils/health-rules/weekly-analyzer'

// ── Prompt templates ───────────────────────────────────────────────────────────
/**
 * Build a grounded daily recommendation prompt.
 * All facts come from actual nutrition data — no hallucination possible.
 */
function buildDailyPrompt(params: {
  userName:        string
  date:            string
  nutrition:       { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number }
  targets:         { calories?: number; protein?: number }
  scoring:         ScoringResult
  conditions:      string[]
  meals:           Array<{ name: string; calories: number; mealType: string }>
}): string {
  const { userName, date, nutrition, targets, scoring, conditions, meals } = params

  const mealList = meals.length
    ? meals.map(m => `- ${m.name} (${m.mealType.toLowerCase()}, ${m.calories} kcal)`).join('\n')
    : '- Chưa có bữa ăn nào được ghi nhận'

  const alertList = scoring.alerts.length
    ? scoring.alerts.map(a => `- [${a.severity}] ${a.title}: ${a.message}`).join('\n')
    : '- Không có cảnh báo'

  const conditionStr = conditions.length ? conditions.join(', ') : 'Không có'

  return `Bạn là chuyên gia dinh dưỡng của NutriScan AI. Phân tích chế độ ăn hôm nay của ${userName} và đưa ra lời khuyên ngắn gọn, thực tế, thân thiện bằng tiếng Việt.

## Dữ liệu thực tế ngày ${date}

**Bữa ăn đã ghi nhận:**
${mealList}

**Dinh dưỡng tổng hợp:**
- Calo: ${nutrition.calories.toFixed(0)} kcal ${targets.calories ? `(mục tiêu: ${targets.calories} kcal)` : ''}
- Protein: ${nutrition.protein.toFixed(0)}g ${targets.protein ? `(mục tiêu: ${targets.protein}g)` : ''}
- Carbs: ${nutrition.carbs.toFixed(0)}g
- Chất béo: ${nutrition.fat.toFixed(0)}g
- Chất xơ: ${nutrition.fiber.toFixed(0)}g (mục tiêu: 25g)
- Đường: ${nutrition.sugar.toFixed(0)}g (giới hạn: 50g)
- Natri: ${nutrition.sodium.toFixed(0)}mg (giới hạn: 2300mg)

**Điểm sức khoẻ: ${scoring.scores.overall}/100 (${scoring.grade})**

**Cảnh báo từ hệ thống:**
${alertList}

**Tình trạng sức khoẻ:** ${conditionStr}

## Yêu cầu
Viết 2–3 câu nhận xét ngắn gọn và 2–3 lời khuyên cụ thể, thực tế cho ngày hôm nay.
- CHỈ đề cập đến thứ có trong dữ liệu trên. Không bịa số liệu.
- Giọng văn thân thiện, động viên, không phán xét.
- Đề xuất món ăn Việt Nam cụ thể khi cần.
- Không dùng markdown. Viết như tin nhắn từ người bạn am hiểu dinh dưỡng.
- Tối đa 150 từ.`
}

function buildWeeklyPrompt(params: {
  userName:    string
  weekLabel:   string
  insight:     WeeklyInsightData
  conditions:  string[]
  avgNutrition:{ calories: number; protein: number; fiber: number; sodium: number; sugar: number }
  targets:     { calories?: number; protein?: number }
}): string {
  const { userName, weekLabel, insight, conditions, avgNutrition, targets } = params

  const habitsStr = insight.habits.map(h => `- [${h.type}] ${h.title} (${h.frequency})`).join('\n') || '- Không phát hiện thói quen đặc biệt'
  const defStr    = insight.deficiencies.map(d => `- Thiếu ${d.label}: TB ${d.avgValue} (cần ${d.target}), thiếu ${d.deficitPct}%`).join('\n') || '- Không có thiếu hụt đáng kể'
  const condStr   = conditions.length ? conditions.join(', ') : 'Không có'

  return `Bạn là chuyên gia dinh dưỡng của NutriScan AI. Viết tổng kết dinh dưỡng tuần cho ${userName} bằng tiếng Việt.

## Dữ liệu tuần ${weekLabel}

**Thống kê tổng quan:**
- Ngày ghi nhận: ${insight.daysLogged}/7 ngày
- Chuỗi ngày liên tiếp: ${insight.streakDays} ngày
- Điểm TB: ${insight.avgScore}/100

**Dinh dưỡng trung bình mỗi ngày:**
- Calo: ${avgNutrition.calories.toFixed(0)} kcal ${targets.calories ? `(mục tiêu: ${targets.calories})` : ''}
- Protein: ${avgNutrition.protein.toFixed(0)}g ${targets.protein ? `(mục tiêu: ${targets.protein}g)` : ''}
- Chất xơ: ${avgNutrition.fiber.toFixed(0)}g (cần: 25g)
- Natri: ${avgNutrition.sodium.toFixed(0)}mg (giới hạn: 2300mg)
- Đường: ${avgNutrition.sugar.toFixed(0)}g (giới hạn: 50g)

**Thiếu hụt dinh dưỡng:**
${defStr}

**Thói quen phát hiện:**
${habitsStr}

**Tình trạng sức khoẻ:** ${condStr}

## Yêu cầu
Viết đánh giá tuần gồm:
1. Một câu nhận xét tổng thể (tích cực)
2. 2 điểm cần cải thiện cụ thể nhất
3. 2 mục tiêu đơn giản cho tuần tới

CHỈ dùng số liệu từ dữ liệu trên. Không bịa thêm. Giọng động viên, thực tế. Không markdown. Tối đa 200 từ.`
}

// ── AI caller ─────────────────────────────────────────────────────────────────
async function callAnthropicAPI(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    logger.warn('ANTHROPIC_API_KEY not set — using rule-based fallback')
    return ''  // caller will use fallback
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5',
      max_tokens: 400,
      messages:   [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    logger.error('Anthropic API error', { status: response.status, text })
    return ''
  }

  const data = await response.json() as { content: Array<{ type: string; text: string }> }
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
}

// ── Rule-based fallbacks (no AI needed) ──────────────────────────────────────
function ruleBasedDailyRec(scoring: ScoringResult): string {
  const { scores, alerts, grade } = scoring
  const parts: string[] = []

  if (grade === 'excellent') {
    parts.push('Chúc mừng! Chế độ ăn hôm nay rất cân bằng và lành mạnh.')
  } else if (grade === 'good') {
    parts.push('Hôm nay bạn ăn khá tốt.')
  } else {
    parts.push('Chế độ ăn hôm nay cần điều chỉnh thêm để đạt mục tiêu sức khoẻ.')
  }

  const topAlerts = alerts.slice(0, 2)
  for (const a of topAlerts) {
    parts.push(a.recommendation)
  }

  if (scores.fiber < 60) parts.push('Hãy thêm rau xanh và trái cây vào các bữa ăn để tăng chất xơ.')
  if (scores.protein < 60) parts.push('Bổ sung protein từ thịt nạc, cá hoặc đậu phụ cho bữa tiếp theo.')

  return parts.slice(0, 3).join(' ')
}

function ruleBasedWeeklyRec(insight: WeeklyInsightData): string {
  const parts: string[] = []

  if (insight.daysLogged >= 6) {
    parts.push('Tuyệt vời! Bạn theo dõi ăn uống rất đều đặn trong tuần.')
  } else {
    parts.push(`Tuần này bạn ghi nhận ${insight.daysLogged}/7 ngày. Hãy cố gắng ghi nhận mỗi ngày để theo dõi tốt hơn.`)
  }

  for (const d of insight.deficiencies.slice(0, 2)) {
    parts.push(d.recommendation)
  }

  const negHabits = insight.habits.filter(h => h.type === 'negative')
  if (negHabits.length > 0) {
    parts.push(`Tuần tới hãy chú ý: ${negHabits[0].title.toLowerCase()}.`)
  }

  return parts.slice(0, 3).join(' ')
}

// ── Public API ─────────────────────────────────────────────────────────────────
export const recommendationService = {
  async getDailyRecommendation(params: Parameters<typeof buildDailyPrompt>[0]): Promise<string> {
    try {
      const prompt = buildDailyPrompt(params)
      const aiRec  = await callAnthropicAPI(prompt)
      return aiRec || ruleBasedDailyRec(params.scoring)
    } catch (err) {
      logger.error('Daily recommendation failed', err)
      return ruleBasedDailyRec(params.scoring)
    }
  },

  async getWeeklyRecommendation(params: Parameters<typeof buildWeeklyPrompt>[0]): Promise<string> {
    try {
      const prompt = buildWeeklyPrompt(params)
      const aiRec  = await callAnthropicAPI(prompt)
      return aiRec || ruleBasedWeeklyRec(params.insight)
    } catch (err) {
      logger.error('Weekly recommendation failed', err)
      return ruleBasedWeeklyRec(params.insight)
    }
  },
}
