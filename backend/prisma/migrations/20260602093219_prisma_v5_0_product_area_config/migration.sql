-- CreateTable
CREATE TABLE "product_print_area_configs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "views_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_print_area_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_print_area_configs_product_id_key" ON "product_print_area_configs"("product_id");

-- AddForeignKey
ALTER TABLE "product_print_area_configs" ADD CONSTRAINT "product_print_area_configs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "synced_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
