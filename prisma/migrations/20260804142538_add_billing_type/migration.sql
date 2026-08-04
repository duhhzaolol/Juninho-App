-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "billingType" TEXT NOT NULL DEFAULT 'UNICA';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "purchaseDate" TIMESTAMP(3);
