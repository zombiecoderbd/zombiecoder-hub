-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "expiresAt" DATETIME;
ALTER TABLE "sessions" ADD COLUMN "token" TEXT;
