/*
  Warnings:

  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_is_active_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_active";

-- CreateIndex
CREATE INDEX "tasks_created_at_desc_idx" ON "tasks"("created_at" DESC);

-- CreateIndex
CREATE INDEX "tasks_title_idx" ON "tasks" USING GIN ("title" gin_trgm_ops);

-- RenameIndex
ALTER INDEX "tasks_created_at_idx" RENAME TO "tasks_created_at_asc_idx";
