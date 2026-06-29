import crypto from 'crypto'
import { prisma } from '@config/database'

export type AuthTokenType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'CHANGE_EMAIL'

export async function createAuthToken(
  userId: string,
  type: AuthTokenType,
  expiresInMinutes: number
): Promise<string> {
  await prisma.authToken.deleteMany({ where: { userId, type } })
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)
  await prisma.authToken.create({ data: { userId, token, type, expiresAt } })
  return token
}

export async function consumeAuthToken(token: string, type: AuthTokenType): Promise<string> {
  const record = await prisma.authToken.findUnique({ where: { token } })
  if (!record)                       throw new Error('TOKEN_NOT_FOUND')
  if (record.type !== type)          throw new Error('TOKEN_WRONG_TYPE')
  if (record.usedAt)                 throw new Error('TOKEN_ALREADY_USED')
  if (record.expiresAt < new Date()) throw new Error('TOKEN_EXPIRED')
  await prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
  return record.userId
}

export async function purgeExpiredTokens(): Promise<number> {
  const result = await prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  return result.count
}
