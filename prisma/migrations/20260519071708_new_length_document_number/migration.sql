-- AlterTable
ALTER TABLE "inbound_plan" ALTER COLUMN "document_number" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "outbound_plan" ALTER COLUMN "document_number" SET DATA TYPE VARCHAR(30);

-- AlterTable
ALTER TABLE "work_order" ALTER COLUMN "work_order_number" SET DATA TYPE VARCHAR(30);
