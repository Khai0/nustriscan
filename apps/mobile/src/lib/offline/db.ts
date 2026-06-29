import * as SQLite from 'expo-sqlite'

const DB_NAME = 'nutriscan_offline.db'

let db: SQLite.SQLiteDatabase | null = null

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync(DB_NAME)

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS offline_meals (
      localId    TEXT PRIMARY KEY,
      userId     TEXT NOT NULL,
      mealType   TEXT NOT NULL,
      mealDate   TEXT NOT NULL,
      notes      TEXT,
      totalCalories REAL NOT NULL DEFAULT 0,
      totalProtein  REAL NOT NULL DEFAULT 0,
      totalCarbs    REAL NOT NULL DEFAULT 0,
      totalFat      REAL NOT NULL DEFAULT 0,
      totalFiber    REAL NOT NULL DEFAULT 0,
      items      TEXT NOT NULL DEFAULT '[]',
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      serverId   TEXT,
      syncError  TEXT,
      createdAt  TEXT NOT NULL,
      updatedAt  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_water (
      localId    TEXT PRIMARY KEY,
      userId     TEXT NOT NULL,
      amount     REAL NOT NULL,
      logDate    TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      serverId   TEXT,
      createdAt  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_meals_sync ON offline_meals(syncStatus);
    CREATE INDEX IF NOT EXISTS idx_meals_user ON offline_meals(userId);
    CREATE INDEX IF NOT EXISTS idx_water_sync ON offline_water(syncStatus);
  `)

  return db
}

// ── Meal operations ────────────────────────────────────────────────────────────
export interface OfflineMeal {
  localId:       string
  userId:        string
  mealType:      'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  mealDate:      string
  notes?:        string
  totalCalories: number
  totalProtein:  number
  totalCarbs:    number
  totalFat:      number
  totalFiber:    number
  items:         any[]
  syncStatus:    'pending' | 'syncing' | 'synced' | 'failed'
  serverId?:     string
  syncError?:    string
  createdAt:     string
  updatedAt:     string
}

export const offlineMealsDB = {
  async save(meal: OfflineMeal): Promise<void> {
    const db = await getDB()
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_meals
       (localId,userId,mealType,mealDate,notes,totalCalories,totalProtein,totalCarbs,totalFat,totalFiber,items,syncStatus,serverId,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [meal.localId, meal.userId, meal.mealType, meal.mealDate, meal.notes ?? null,
       meal.totalCalories, meal.totalProtein, meal.totalCarbs, meal.totalFat, meal.totalFiber,
       JSON.stringify(meal.items), meal.syncStatus, meal.serverId ?? null, meal.createdAt, meal.updatedAt]
    )
  },

  async getPending(): Promise<OfflineMeal[]> {
    const db   = await getDB()
    const rows = await db.getAllAsync<any>(`SELECT * FROM offline_meals WHERE syncStatus='pending' ORDER BY createdAt ASC`)
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }))
  },

  async getPendingCount(): Promise<number> {
    const db  = await getDB()
    const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM offline_meals WHERE syncStatus='pending'`)
    return row?.count ?? 0
  },

  async updateStatus(localId: string, status: OfflineMeal['syncStatus'], serverId?: string, error?: string): Promise<void> {
    const db = await getDB()
    await db.runAsync(
      `UPDATE offline_meals SET syncStatus=?, serverId=?, syncError=?, updatedAt=? WHERE localId=?`,
      [status, serverId ?? null, error ?? null, new Date().toISOString(), localId]
    )
  },

  async getByUser(userId: string): Promise<OfflineMeal[]> {
    const db   = await getDB()
    const rows = await db.getAllAsync<any>(`SELECT * FROM offline_meals WHERE userId=? ORDER BY createdAt DESC`, [userId])
    return rows.map(r => ({ ...r, items: JSON.parse(r.items) }))
  },
}

// ── Water operations ───────────────────────────────────────────────────────────
export interface OfflineWater {
  localId:    string
  userId:     string
  amount:     number
  logDate:    string
  syncStatus: 'pending' | 'synced' | 'failed'
  serverId?:  string
  createdAt:  string
}

export const offlineWaterDB = {
  async save(entry: OfflineWater): Promise<void> {
    const db = await getDB()
    await db.runAsync(
      `INSERT OR REPLACE INTO offline_water (localId,userId,amount,logDate,syncStatus,serverId,createdAt) VALUES (?,?,?,?,?,?,?)`,
      [entry.localId, entry.userId, entry.amount, entry.logDate, entry.syncStatus, entry.serverId ?? null, entry.createdAt]
    )
  },

  async getPending(): Promise<OfflineWater[]> {
    const db = await getDB()
    return db.getAllAsync<OfflineWater>(`SELECT * FROM offline_water WHERE syncStatus='pending'`)
  },

  async getPendingCount(): Promise<number> {
    const db  = await getDB()
    const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM offline_water WHERE syncStatus='pending'`)
    return row?.count ?? 0
  },

  async updateStatus(localId: string, status: 'synced' | 'failed', serverId?: string): Promise<void> {
    const db = await getDB()
    await db.runAsync(`UPDATE offline_water SET syncStatus=?, serverId=? WHERE localId=?`, [status, serverId ?? null, localId])
  },
}

export async function getTotalPendingCount(): Promise<number> {
  const [meals, water] = await Promise.all([
    offlineMealsDB.getPendingCount(),
    offlineWaterDB.getPendingCount(),
  ])
  return meals + water
}
