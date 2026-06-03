-- AlterTable
ALTER TABLE "menu" ADD COLUMN "path_key" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "menu_path_key_key" ON "menu"("path_key");
