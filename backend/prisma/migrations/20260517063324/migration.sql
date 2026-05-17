/*
  Warnings:

  - You are about to drop the column `material` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the column `print_area` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the column `raw_payload` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the column `sync_status` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at_label` on the `synced_products` table. All the data in the column will be lost.
  - You are about to drop the `option_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `option_values` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pricing_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_configurations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `validation_rules` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "calculation_basis" AS ENUM ('YIELD_PCS', 'LINEAR_M', 'SQM', 'PERIMETER', 'PCS', 'ORDER', 'FREE');

-- CreateEnum
CREATE TYPE "display_mode" AS ENUM ('SELECTABLE', 'HIDDEN', 'REQUIRED');

-- DropForeignKey
ALTER TABLE "option_values" DROP CONSTRAINT "option_values_option_group_id_fkey";

-- DropForeignKey
ALTER TABLE "pricing_rules" DROP CONSTRAINT "pricing_rules_option_group_id_fkey";

-- DropForeignKey
ALTER TABLE "product_configurations" DROP CONSTRAINT "product_configurations_connection_id_fkey";

-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_option_group_id_fkey";

-- AlterTable
ALTER TABLE "synced_products" DROP COLUMN "material",
DROP COLUMN "print_area",
DROP COLUMN "raw_payload",
DROP COLUMN "sync_status",
DROP COLUMN "template",
DROP COLUMN "updated_at_label",
ADD COLUMN     "height" DECIMAL(10,2),
ADD COLUMN     "width" DECIMAL(10,2);

-- DropTable
DROP TABLE "option_groups";

-- DropTable
DROP TABLE "option_values";

-- DropTable
DROP TABLE "pricing_rules";

-- DropTable
DROP TABLE "product_configurations";

-- DropTable
DROP TABLE "product_options";

-- DropTable
DROP TABLE "validation_rules";

-- CreateTable
CREATE TABLE "options_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,

    CONSTRAINT "options_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "price_unit" DECIMAL(12,4) NOT NULL,
    "process_length_mm" INTEGER,
    "process_width_mm" INTEGER,
    "calculation_basis" "calculation_basis" NOT NULL,
    "display_mode" "display_mode" NOT NULL DEFAULT 'SELECTABLE',

    CONSTRAINT "option_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "options_containers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "default_item_id" UUID,

    CONSTRAINT "options_containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_option_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "container_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "price_unit" DECIMAL(12,4),
    "display_mode" "display_mode",

    CONSTRAINT "container_option_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "options_groups_name_key" ON "options_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "option_items_name_key" ON "option_items"("name");

-- CreateIndex
CREATE UNIQUE INDEX "option_items_slug_key" ON "option_items"("slug");

-- CreateIndex
CREATE INDEX "option_items_group_id_idx" ON "option_items"("group_id");

-- CreateIndex
CREATE INDEX "options_containers_product_id_idx" ON "options_containers"("product_id");

-- CreateIndex
CREATE INDEX "container_option_items_item_id_idx" ON "container_option_items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "container_option_items_container_id_item_id_key" ON "container_option_items"("container_id", "item_id");

-- AddForeignKey
ALTER TABLE "option_items" ADD CONSTRAINT "option_items_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "options_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_containers" ADD CONSTRAINT "options_containers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "synced_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options_containers" ADD CONSTRAINT "options_containers_default_item_id_fkey" FOREIGN KEY ("default_item_id") REFERENCES "option_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_option_items" ADD CONSTRAINT "container_option_items_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "options_containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_option_items" ADD CONSTRAINT "container_option_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "option_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
