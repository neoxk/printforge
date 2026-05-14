/*
  Warnings:

  - Added the required column `name` to the `pricing_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `pricing_rules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "validation_severity" AS ENUM ('Critical', 'Warning', 'Info');

-- AlterTable
ALTER TABLE "pricing_rules" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" VARCHAR(120) NOT NULL,
ADD COLUMN     "status" VARCHAR(40) NOT NULL DEFAULT 'Draft',
ADD COLUMN     "trigger_label" VARCHAR(120) NOT NULL DEFAULT 'General',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(120) NOT NULL,
    "summary" VARCHAR(255) NOT NULL,
    "severity" "validation_severity" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "validation_rules_is_active_idx" ON "validation_rules"("is_active");
