/*
  Warnings:

  - You are about to drop the column `reviewedId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewedUserId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_reviewedId_fkey";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "reviewedId",
ADD COLUMN     "reviewedUserId" INTEGER NOT NULL,
ADD COLUMN     "transactionId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_transactionId_key" ON "Review"("transactionId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewedUserId_fkey" FOREIGN KEY ("reviewedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
