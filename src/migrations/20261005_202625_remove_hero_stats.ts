import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" DROP COLUMN "hero_stats_years";
  ALTER TABLE "home_page" DROP COLUMN "hero_stats_devices_sold";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_page" ADD COLUMN "hero_stats_years" varchar;
  ALTER TABLE "home_page" ADD COLUMN "hero_stats_devices_sold" varchar;`)
}
