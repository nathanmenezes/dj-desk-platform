/*
  Warnings:

  - You are about to drop the column `eventName` on the `events` table. All the data in the column will be lost.
  - Added the required column `name` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "eventName",
ADD COLUMN     "clientEmail" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "eventDate" DROP NOT NULL,
ALTER COLUMN "deadline" DROP NOT NULL;
