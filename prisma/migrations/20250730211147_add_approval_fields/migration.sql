-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT;
