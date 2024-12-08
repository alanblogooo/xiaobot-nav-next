/*
  Warnings:

  - You are about to drop the `Rebate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Rebate";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "rebates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "rebates_code_idx" ON "rebates"("code");
