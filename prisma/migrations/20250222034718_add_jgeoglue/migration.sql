-- CreateTable
CREATE TABLE "JGeoGLUETask" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JGeoGLUETask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JGeoGLUEAnswer" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JGeoGLUEAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JGeoGLUEAnswer" ADD CONSTRAINT "JGeoGLUEAnswer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "JGeoGLUETask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JGeoGLUEAnswer" ADD CONSTRAINT "JGeoGLUEAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
