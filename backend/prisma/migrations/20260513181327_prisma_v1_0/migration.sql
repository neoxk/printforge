-- CreateEnum
CREATE TYPE "option_type" AS ENUM ('select', 'boolean', 'integer', 'decimal');

-- CreateEnum
CREATE TYPE "pricing_rule_type" AS ENUM ('flat_surcharge', 'percentage', 'quantity_discount');

-- CreateEnum
CREATE TYPE "pricing_rule_operator" AS ENUM ('eq', 'gte', 'lte');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "option_type" "option_type" NOT NULL,
    "unit" VARCHAR(20),
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_values" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "option_group_id" UUID NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_options" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "woo_product_id" BIGINT NOT NULL,
    "option_group_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" BIGINT NOT NULL,
    "option_group_id" UUID,
    "operator" "pricing_rule_operator" NOT NULL,
    "trigger_value" VARCHAR(50) NOT NULL,
    "rule_type" "pricing_rule_type" NOT NULL,
    "amount" DECIMAL(10,4) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "option_groups_name_key" ON "option_groups"("name");

-- CreateIndex
CREATE INDEX "option_values_option_group_id_idx" ON "option_values"("option_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "option_values_option_group_id_value_key" ON "option_values"("option_group_id", "value");

-- CreateIndex
CREATE INDEX "product_options_woo_product_id_idx" ON "product_options"("woo_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_options_woo_product_id_option_group_id_key" ON "product_options"("woo_product_id", "option_group_id");

-- CreateIndex
CREATE INDEX "pricing_rules_product_id_idx" ON "pricing_rules"("product_id");

-- CreateIndex
CREATE INDEX "pricing_rules_option_group_id_idx" ON "pricing_rules"("option_group_id");

-- CreateIndex
CREATE INDEX "pricing_rules_is_active_idx" ON "pricing_rules"("is_active");

-- AddForeignKey
ALTER TABLE "option_values" ADD CONSTRAINT "option_values_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "option_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "option_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_option_group_id_fkey" FOREIGN KEY ("option_group_id") REFERENCES "option_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
