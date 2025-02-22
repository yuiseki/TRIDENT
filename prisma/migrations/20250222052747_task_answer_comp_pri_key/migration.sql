/*
  Warnings:

  - The primary key for the `JGeoGLUEAnswer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `JGeoGLUEAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "JGeoGLUEAnswer" DROP CONSTRAINT "JGeoGLUEAnswer_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "JGeoGLUEAnswer_pkey" PRIMARY KEY ("taskId", "userId");
