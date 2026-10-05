import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"image_id" integer
  );
  
  CREATE TABLE "home_page_hero_slides_locales" (
  	"word" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_stats_years" varchar,
  	"hero_stats_devices_sold" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  -- Move the existing hero content over from site-settings before dropping it.
  INSERT INTO "home_page" ("hero_stats_years", "hero_stats_devices_sold", "updated_at", "created_at")
    SELECT "hero_stats_years", "hero_stats_devices_sold", now(), now() FROM "site_settings" ORDER BY "id" LIMIT 1;
  INSERT INTO "home_page_hero_slides" ("_order", "_parent_id", "id", "product_id", "image_id")
    SELECT s."_order", (SELECT "id" FROM "home_page" LIMIT 1), s."id", s."product_id", s."image_id"
    FROM "site_settings_hero_slides" s;
  INSERT INTO "home_page_hero_slides_locales" ("word", "_locale", "_parent_id")
    SELECT "word", "_locale", "_parent_id" FROM "site_settings_hero_slides_locales";
  
  DROP TABLE "site_settings_hero_slides" CASCADE;
  DROP TABLE "site_settings_hero_slides_locales" CASCADE;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides" ADD CONSTRAINT "home_page_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_hero_slides_locales" ADD CONSTRAINT "home_page_hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_hero_slides_order_idx" ON "home_page_hero_slides" USING btree ("_order");
  CREATE INDEX "home_page_hero_slides_parent_id_idx" ON "home_page_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "home_page_hero_slides_product_idx" ON "home_page_hero_slides" USING btree ("product_id");
  CREATE INDEX "home_page_hero_slides_image_idx" ON "home_page_hero_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "home_page_hero_slides_locales_locale_parent_id_unique" ON "home_page_hero_slides_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "site_settings" DROP COLUMN "hero_stats_years";
  ALTER TABLE "site_settings" DROP COLUMN "hero_stats_devices_sold";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"image_id" integer
  );
  
  CREATE TABLE "site_settings_hero_slides_locales" (
  	"word" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "hero_stats_years" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "hero_stats_devices_sold" varchar;
  UPDATE "site_settings" SET
    "hero_stats_years" = (SELECT "hero_stats_years" FROM "home_page" LIMIT 1),
    "hero_stats_devices_sold" = (SELECT "hero_stats_devices_sold" FROM "home_page" LIMIT 1);
  INSERT INTO "site_settings_hero_slides" ("_order", "_parent_id", "id", "product_id", "image_id")
    SELECT s."_order", (SELECT "id" FROM "site_settings" ORDER BY "id" LIMIT 1), s."id", s."product_id", s."image_id"
    FROM "home_page_hero_slides" s;
  INSERT INTO "site_settings_hero_slides_locales" ("word", "_locale", "_parent_id")
    SELECT "word", "_locale", "_parent_id" FROM "home_page_hero_slides_locales";
  
  DROP TABLE "home_page_hero_slides" CASCADE;
  DROP TABLE "home_page_hero_slides_locales" CASCADE;
  DROP TABLE "home_page" CASCADE;
  ALTER TABLE "site_settings_hero_slides" ADD CONSTRAINT "site_settings_hero_slides_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_hero_slides" ADD CONSTRAINT "site_settings_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_hero_slides" ADD CONSTRAINT "site_settings_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_hero_slides_locales" ADD CONSTRAINT "site_settings_hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_hero_slides_order_idx" ON "site_settings_hero_slides" USING btree ("_order");
  CREATE INDEX "site_settings_hero_slides_parent_id_idx" ON "site_settings_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "site_settings_hero_slides_product_idx" ON "site_settings_hero_slides" USING btree ("product_id");
  CREATE INDEX "site_settings_hero_slides_image_idx" ON "site_settings_hero_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "site_settings_hero_slides_locales_locale_parent_id_unique" ON "site_settings_hero_slides_locales" USING btree ("_locale","_parent_id");`)
}
