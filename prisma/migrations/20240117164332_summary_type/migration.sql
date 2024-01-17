-- AlterTable
ALTER TABLE "PreOrder" ADD COLUMN     "reminderTime" TEXT;

-- AlterTable
ALTER TABLE "Summary" ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);
