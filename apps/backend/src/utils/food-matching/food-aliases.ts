/**
 * Alias dictionary for Vietnamese food matching.
 * Maps English/romanized labels (from Google Vision) → Vietnamese food names.
 *
 * Format: { [viName]: string[] }
 * The viName must match exactly with FoodItem.name in the database.
 */
export const FOOD_ALIAS_DICTIONARY: Record<string, string[]> = {
  // ── Phở ──────────────────────────────────────────────────────────────────
  'Phở bò': [
    'pho', 'pho bo', 'beef pho', 'beef noodle soup', 'vietnamese noodle soup',
    'pho soup', 'noodle soup', 'beef noodle', 'rice noodle soup', 'pho noodle',
    'vietnamese beef noodle', 'bo', 'pho bò', 'noodle',
  ],
  'Phở gà': [
    'pho ga', 'chicken pho', 'chicken noodle soup', 'ga pho',
    'chicken noodle', 'vietnamese chicken noodle',
  ],

  // ── Bún ──────────────────────────────────────────────────────────────────
  'Bún bò Huế': [
    'bun bo hue', 'bun bo', 'hue beef noodle', 'spicy beef noodle',
    'vietnamese spicy noodle', 'lemongrass beef noodle', 'bun bo hue soup',
  ],
  'Bún riêu cua': [
    'bun rieu', 'bun rieu cua', 'crab noodle soup', 'tomato crab noodle',
    'vermicelli crab', 'rieu cua',
  ],

  // ── Cơm ──────────────────────────────────────────────────────────────────
  'Cơm tấm sườn bì chả': [
    'com tam', 'broken rice', 'com tam suon', 'vietnamese broken rice',
    'broken rice pork', 'grilled pork rice', 'suon nuong com tam',
    'rice with grilled pork', 'steamed broken rice', 'com tam suon nuong',
  ],
  'Cơm gà Hội An': [
    'com ga', 'com ga hoi an', 'hoi an chicken rice', 'chicken rice',
    'vietnamese chicken rice', 'poached chicken rice',
  ],

  // ── Bánh mì ───────────────────────────────────────────────────────────────
  'Bánh mì thịt': [
    'banh mi', 'vietnamese sandwich', 'banh mi sandwich', 'baguette sandwich',
    'vietnamese baguette', 'banh my', 'vietnamese sub', 'bread sandwich',
    'baguette', 'stuffed baguette', 'banh mi thit',
  ],

  // ── Hủ tiếu ──────────────────────────────────────────────────────────────
  'Hủ tiếu Nam Vang': [
    'hu tieu', 'hu tieu nam vang', 'phnom penh noodle', 'rice noodle clear soup',
    'hu tieu soup', 'cambodian noodle', 'clear broth noodle',
  ],

  // ── Bánh cuốn ────────────────────────────────────────────────────────────
  'Bánh cuốn nhân thịt': [
    'banh cuon', 'steamed rice roll', 'rice roll', 'vietnamese rice roll',
    'steamed rolled rice', 'banh cuon thit', 'stuffed rice roll',
  ],

  // ── Gỏi cuốn ─────────────────────────────────────────────────────────────
  'Gỏi cuốn tôm thịt': [
    'goi cuon', 'spring roll', 'fresh spring roll', 'summer roll',
    'vietnamese spring roll', 'rice paper roll', 'fresh roll',
    'cold spring roll', 'goi cuon tom', 'nem cuon',
  ],

  // ── Đồ uống ──────────────────────────────────────────────────────────────
  'Trà sữa trân châu đường đen': [
    'bubble tea', 'boba tea', 'boba', 'milk tea', 'tra sua',
    'brown sugar bubble tea', 'pearl milk tea', 'taro milk tea',
    'black sugar boba', 'tapioca drink', 'tra sua tran chau',
  ],
  'Cà phê sữa đá': [
    'ca phe sua da', 'vietnamese iced coffee', 'ca phe', 'iced coffee',
    'vietnamese coffee', 'coffee with condensed milk', 'ca phe sua',
    'drip coffee', 'phin coffee',
  ],
}

// ── Reverse map: alias → canonical Vietnamese name ────────────────────────────
export const ALIAS_TO_CANONICAL = new Map<string, string>()

for (const [canonical, aliases] of Object.entries(FOOD_ALIAS_DICTIONARY)) {
  // The canonical name itself is also an alias
  ALIAS_TO_CANONICAL.set(canonical.toLowerCase(), canonical)
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL.set(alias.toLowerCase(), canonical)
  }
}
