import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__products_v_version_variants_stock_status" AS ENUM('inherit', 'in_stock', 'out_of_stock', 'preorder');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('published', 'draft', 'archived');
  CREATE TYPE "public"."enum__products_v_version_badge" AS ENUM('new', 'bestseller');
  CREATE TYPE "public"."enum__products_v_version_stock_status" AS ENUM('in_stock', 'out_of_stock', 'preorder');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('active', 'hidden');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TABLE "_products_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_images_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_key_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_key_features_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sku" varchar,
  	"stock_status" "enum__products_v_version_variants_stock_status" DEFAULT 'inherit',
  	"price_overrides_pln" numeric,
  	"price_overrides_eur" numeric,
  	"price_overrides_usd" numeric,
  	"price_overrides_brl" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_variants_locales" (
  	"model_name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar NOT NULL,
  	"version_sku" varchar,
  	"version_status" "enum__products_v_version_status" DEFAULT 'published' NOT NULL,
  	"version_badge" "enum__products_v_version_badge",
  	"version_stock_status" "enum__products_v_version_stock_status" DEFAULT 'in_stock' NOT NULL,
  	"version_brand_id" integer,
  	"version_link" varchar,
  	"version_warranty" numeric,
  	"version_prices_pln" numeric NOT NULL,
  	"version_prices_eur" numeric,
  	"version_prices_usd" numeric,
  	"version_prices_brl" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_locales" (
  	"version_title" varchar NOT NULL,
  	"version_description" varchar NOT NULL,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"categories_id" integer
  );
  
  CREATE TABLE "_categories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_image_id" integer NOT NULL,
  	"version_order" numeric DEFAULT 0,
  	"version_status" "enum__categories_v_version_status" DEFAULT 'active' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_categories_v_locales" (
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_description" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_phones_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_emails_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company_name" varchar NOT NULL,
  	"company_id" varchar,
  	"vat_id" varchar,
  	"address_street" varchar NOT NULL,
  	"address_postal_code" varchar NOT NULL,
  	"address_city" varchar NOT NULL,
  	"social_facebook" varchar,
  	"social_instagram" varchar,
  	"social_linkedin" varchar,
  	"hero_stats_years" varchar,
  	"hero_stats_devices_sold" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"registration" varchar,
  	"address_region" varchar,
  	"address_country" varchar,
  	"opening_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_phones_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_emails_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_company_name" varchar NOT NULL,
  	"version_company_id" varchar,
  	"version_vat_id" varchar,
  	"version_address_street" varchar NOT NULL,
  	"version_address_postal_code" varchar NOT NULL,
  	"version_address_city" varchar NOT NULL,
  	"version_social_facebook" varchar,
  	"version_social_instagram" varchar,
  	"version_social_linkedin" varchar,
  	"version_hero_stats_years" varchar,
  	"version_hero_stats_devices_sold" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_registration" varchar,
  	"version_address_region" varchar,
  	"version_address_country" varchar,
  	"version_opening_hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "name" varchar;
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_images" ADD CONSTRAINT "_products_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_images_locales" ADD CONSTRAINT "_products_v_version_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_key_features" ADD CONSTRAINT "_products_v_version_key_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_key_features_locales" ADD CONSTRAINT "_products_v_version_key_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_key_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants_locales" ADD CONSTRAINT "_products_v_version_variants_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_version_variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_phones" ADD CONSTRAINT "site_settings_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_phones_locales" ADD CONSTRAINT "site_settings_phones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_phones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_emails" ADD CONSTRAINT "site_settings_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_emails_locales" ADD CONSTRAINT "site_settings_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_faq" ADD CONSTRAINT "site_settings_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_phones" ADD CONSTRAINT "_site_settings_v_version_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_phones_locales" ADD CONSTRAINT "_site_settings_v_version_phones_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_phones"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_emails" ADD CONSTRAINT "_site_settings_v_version_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_emails_locales" ADD CONSTRAINT "_site_settings_v_version_emails_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v_version_emails"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_faq" ADD CONSTRAINT "_site_settings_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_products_v_version_images_order_idx" ON "_products_v_version_images" USING btree ("_order");
  CREATE INDEX "_products_v_version_images_parent_id_idx" ON "_products_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_images_image_idx" ON "_products_v_version_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_products_v_version_images_locales_locale_parent_id_unique" ON "_products_v_version_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_key_features_order_idx" ON "_products_v_version_key_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_key_features_parent_id_idx" ON "_products_v_version_key_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_key_features_locales_locale_parent_id_un" ON "_products_v_version_key_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_products_v_version_variants_locales_locale_parent_id_unique" ON "_products_v_version_variants_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_sku_idx" ON "_products_v" USING btree ("version_sku");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_image_idx" ON "_categories_v" USING btree ("version_image_id");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v_locales" USING btree ("version_slug","_locale");
  CREATE INDEX "_categories_v_version_meta_version_meta_image_idx" ON "_categories_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_categories_v_locales_locale_parent_id_unique" ON "_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_phones_order_idx" ON "site_settings_phones" USING btree ("_order");
  CREATE INDEX "site_settings_phones_parent_id_idx" ON "site_settings_phones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_phones_locales_locale_parent_id_unique" ON "site_settings_phones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_emails_order_idx" ON "site_settings_emails" USING btree ("_order");
  CREATE INDEX "site_settings_emails_parent_id_idx" ON "site_settings_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_emails_locales_locale_parent_id_unique" ON "site_settings_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_faq_order_idx" ON "site_settings_faq" USING btree ("_order");
  CREATE INDEX "site_settings_faq_parent_id_idx" ON "site_settings_faq" USING btree ("_parent_id");
  CREATE INDEX "site_settings_faq_locale_idx" ON "site_settings_faq" USING btree ("_locale");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_phones_order_idx" ON "_site_settings_v_version_phones" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_phones_parent_id_idx" ON "_site_settings_v_version_phones" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_phones_locales_locale_parent_id_uni" ON "_site_settings_v_version_phones_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_emails_order_idx" ON "_site_settings_v_version_emails" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_emails_parent_id_idx" ON "_site_settings_v_version_emails" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_site_settings_v_version_emails_locales_locale_parent_id_uni" ON "_site_settings_v_version_emails_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_faq_order_idx" ON "_site_settings_v_version_faq" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_faq_parent_id_idx" ON "_site_settings_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_faq_locale_idx" ON "_site_settings_v_version_faq" USING btree ("_locale");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");`)

  // Accounts that existed before roles keep full access (incl. managing users).
  await db.execute(sql`UPDATE "users" SET "role" = 'admin';`)

  // Seed company/contact data with the values previously hardcoded in the footer, so the
  // site looks unchanged after deploy. The client verifies/edits them in the admin panel.
  const context = { disableRevalidate: true } // no Next.js request context in a migration
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'pl',
    req,
    context,
    data: {
      companyName: 'Unique Technology Solution s.r.o.',
      vatId: 'SK2120871324',
      address: {
        street: 'Trojičné námestie 191/11',
        postalCode: '027 44',
        city: 'Tvrdošín',
        region: 'kraj żyliński',
        country: 'Słowacja',
      },
      phones: [{ number: '+421 2 5478 9630' }],
      emails: [{ email: 'sales@utslovakia.sk' }],
      openingHours: 'pon.–pt., 8:00 – 16:30',
      heroStats: { years: '5+', devicesSold: '1000+' },
    },
  })
  const localized = {
    en: { region: 'Žilina Region', country: 'Slovakia', openingHours: 'Mon–Fri, 8:00 – 16:30' },
    sk: { region: 'Žilinský kraj', country: 'Slovensko', openingHours: 'po–pia, 8:00 – 16:30' },
    'pt-br': { region: 'Região de Žilina', country: 'Eslováquia', openingHours: 'seg–sex, 8:00 – 16:30' },
  } as const
  for (const [locale, { region, country, openingHours }] of Object.entries(localized)) {
    await payload.updateGlobal({
      slug: 'site-settings',
      locale: locale as keyof typeof localized,
      req,
      context,
      data: { address: { region, country }, openingHours },
    })
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_products_v_version_images" CASCADE;
  DROP TABLE "_products_v_version_images_locales" CASCADE;
  DROP TABLE "_products_v_version_key_features" CASCADE;
  DROP TABLE "_products_v_version_key_features_locales" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v_version_variants_locales" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_locales" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_locales" CASCADE;
  DROP TABLE "site_settings_phones" CASCADE;
  DROP TABLE "site_settings_phones_locales" CASCADE;
  DROP TABLE "site_settings_emails" CASCADE;
  DROP TABLE "site_settings_emails_locales" CASCADE;
  DROP TABLE "site_settings_faq" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v_version_phones" CASCADE;
  DROP TABLE "_site_settings_v_version_phones_locales" CASCADE;
  DROP TABLE "_site_settings_v_version_emails" CASCADE;
  DROP TABLE "_site_settings_v_version_emails_locales" CASCADE;
  DROP TABLE "_site_settings_v_version_faq" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  ALTER TABLE "users" DROP COLUMN "name";
  ALTER TABLE "users" DROP COLUMN "role";
  DROP TYPE "public"."enum__products_v_version_variants_stock_status";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum__products_v_version_badge";
  DROP TYPE "public"."enum__products_v_version_stock_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum_users_role";`)
}
