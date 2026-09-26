import { getPayload } from 'payload'
import config from '../../src/payload.config.js'

export const testUser = {
  email: 'e2e-test@utslovakia.local',
  password: 'test',
}

/**
 * E2E admin tests create/delete users. Refuse unless the env explicitly opts in, so
 * running them against the production DB from `.env` is impossible by accident.
 */
function assertTestDatabase(): void {
  if (process.env.E2E_ALLOW_DB_WRITES !== 'true') {
    throw new Error(
      'Refusing to seed users: set E2E_ALLOW_DB_WRITES=true in .env.test.local (with a non-production DATABASE_URL).',
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
