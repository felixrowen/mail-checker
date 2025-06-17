/*
  Warnings:

  - A unique constraint covering the columns `[domain,userId]` on the table `Check` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Check` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add updatedAt column with default value
ALTER TABLE "Check" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Step 2: Remove duplicate records, keeping only the most recent one for each domain+userId combination
DELETE FROM "Check" 
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY domain, "userId" ORDER BY "createdAt" DESC) as rn
        FROM "Check"
    ) t
    WHERE t.rn > 1
);

-- Step 3: Create the unique constraint
CREATE UNIQUE INDEX "Check_domain_userId_key" ON "Check"("domain", "userId");
