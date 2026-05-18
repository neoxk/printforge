-- Drop display_mode from option_items and container_option_items
ALTER TABLE "option_items" DROP COLUMN "display_mode";
ALTER TABLE "container_option_items" DROP COLUMN "display_mode";

-- Drop the display_mode enum
DROP TYPE "display_mode";

-- Create ContainerType enum
CREATE TYPE "ContainerType" AS ENUM ('SINGLE_SELECT', 'MULTI_SELECT', 'AUTO_APPLIED');

-- Add container_type to options_containers (backfill existing rows as SINGLE_SELECT, then drop the default)
ALTER TABLE "options_containers" ADD COLUMN "containerType" "ContainerType" NOT NULL DEFAULT 'SINGLE_SELECT';
ALTER TABLE "options_containers" ALTER COLUMN "containerType" DROP DEFAULT;

-- Add is_hidden and is_required flags
ALTER TABLE "options_containers" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "options_containers" ADD COLUMN "is_required" BOOLEAN NOT NULL DEFAULT false;

-- Add name override column to container_option_items
ALTER TABLE "container_option_items" ADD COLUMN "name" VARCHAR(120);
