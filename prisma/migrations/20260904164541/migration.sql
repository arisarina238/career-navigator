-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'COMPLETED');

-- AlterTable
ALTER TABLE "vacancies" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ai_user_facts" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fact" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_user_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "relatedTrialId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_invitations" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vacancyId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "interviewDate" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_user_facts_studentId_idx" ON "ai_user_facts"("studentId");

-- CreateIndex
CREATE INDEX "ai_recommendations_studentId_idx" ON "ai_recommendations"("studentId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- AddForeignKey
ALTER TABLE "ai_user_facts" ADD CONSTRAINT "ai_user_facts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_relatedTrialId_fkey" FOREIGN KEY ("relatedTrialId") REFERENCES "pro_trials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "employer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_invitations" ADD CONSTRAINT "job_invitations_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "vacancies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
