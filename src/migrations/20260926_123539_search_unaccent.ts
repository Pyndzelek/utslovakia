import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Catalogue search (`searchProductIds` in src/lib/data/products.ts) folds diacritics with
// `unaccent()`, so "wyswietlacz" finds "wyświetlacz". No schema change — the snapshot JSON
// is identical to the previous migration's.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP EXTENSION IF EXISTS unaccent;`)
}
