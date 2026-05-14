/*
  Warnings:

  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "woo_auth_method" AS ENUM ('public_store_api', 'consumer_keys');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" VARCHAR(120) NOT NULL,
ADD COLUMN     "tenant_name" VARCHAR(160) NOT NULL;

-- CreateTable
CREATE TABLE "integration_connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_name" VARCHAR(120) NOT NULL,
    "store_url" VARCHAR(255) NOT NULL,
    "rest_api_base" VARCHAR(255) NOT NULL,
    "auth_method" "woo_auth_method" NOT NULL,
    "consumer_key" VARCHAR(255),
    "consumer_secret" VARCHAR(255),
    "api_status" VARCHAR(80) NOT NULL DEFAULT 'Not tested',
    "last_sync" TIMESTAMP(3),
    "mode" VARCHAR(120) NOT NULL DEFAULT 'Manual sync with audit trail',
    "import_published_products" BOOLEAN NOT NULL DEFAULT true,
    "import_attributes" BOOLEAN NOT NULL DEFAULT true,
    "import_variations" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synced_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID NOT NULL,
    "woo_product_id" BIGINT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "status" VARCHAR(80) NOT NULL,
    "sync_status" VARCHAR(120) NOT NULL,
    "sku" VARCHAR(255) NOT NULL,
    "material" VARCHAR(255) NOT NULL,
    "print_area" VARCHAR(255) NOT NULL,
    "template" VARCHAR(255) NOT NULL,
    "base_price" VARCHAR(80) NOT NULL,
    "updated_at_label" VARCHAR(120) NOT NULL,
    "imported_fields" JSONB,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "synced_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_configurations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "connection_id" UUID NOT NULL,
    "woo_product_id" BIGINT NOT NULL,
    "fields" JSONB NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "synced_products_connection_id_idx" ON "synced_products"("connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "synced_products_connection_id_woo_product_id_key" ON "synced_products"("connection_id", "woo_product_id");

-- CreateIndex
CREATE INDEX "product_configurations_connection_id_idx" ON "product_configurations"("connection_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_configurations_connection_id_woo_product_id_key" ON "product_configurations"("connection_id", "woo_product_id");

-- AddForeignKey
ALTER TABLE "synced_products" ADD CONSTRAINT "synced_products_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_configurations" ADD CONSTRAINT "product_configurations_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "integration_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
