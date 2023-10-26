-- DropIndex
DROP INDEX "user_publicId_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "refreshToken" DROP NOT NULL;
