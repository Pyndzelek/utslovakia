import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'e2e-test@utslovakia.local',
  password: 'test',
}

/**
 * E2E admin tests create/delete users, so they must never touch the real database:
 * - the run has to opt in with E2E_ALLOW_DB_WRITES=true, and
 * - DATABASE_URL must differ from the one in `.env` (the app's main, production database).
 * Put both in `.env.test.local`, which the test configs load before `.env`.
 */
function assertTestDatabase(): void {
  if (process.env.E2E_ALLOW_DB_WRITES !== 'true') {
    throw new Error(
      'Refusing to seed users: set E2E_ALLOW_DB_WRITES=true in .env.test.local (with a non-production DATABASE_URL).',
    )
  }
  const mainEnvPath = path.resolve(process.cwd(), '.env')
  const mainDatabaseUrl = fs.existsSync(mainEnvPath)
    ? dotenv.parse(fs.readFileSync(mainEnvPath)).DATABASE_URL
    : undefined
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL === mainDatabaseUrl) {
    throw new Error(
      'Refusing to seed users: DATABASE_URL is the main database from .env. Point it at a local or Neon-branch database in .env.test.local.',
    )
  }
}

/**
 * Seeds a test user for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  assertTestDatabase()
  const payload = await getPayload({ config })

  // Delete existing test user if any
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })

  // Create fresh test user
  await payload.create({
    collection: 'users',
    data: { ...testUser, role: 'admin' },
  })
}

/**
 * Cleans up test user after tests
 */
export async function cleanupTestUser(): Promise<void> {
  assertTestDatabase()
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        equals: testUser.email,
      },
    },
  })
}
