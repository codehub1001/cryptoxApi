/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `InvestmentPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."TransactionType" ADD VALUE 'DEBIT';
ALTER TYPE "public"."TransactionType" ADD VALUE 'BONUS';

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentPlan_name_key" ON "public"."InvestmentPlan"("name");
