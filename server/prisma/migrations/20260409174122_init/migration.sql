-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WORKING', 'IDLE', 'ABSENT', 'PRODUCT_COUNT', 'CAMERA_MALFUNCTION');

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workstation" (
    "id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workstation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" "EventType" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "count" INTEGER NOT NULL DEFAULT 0,
    "workerId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,

    CONSTRAINT "AIEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkstationSession" (
    "id" TEXT NOT NULL,
    "state" "EventType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationSec" INTEGER,
    "workerId" TEXT NOT NULL,
    "workstationId" TEXT NOT NULL,

    CONSTRAINT "WorkstationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkstationDailyStats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "working_sec" INTEGER NOT NULL DEFAULT 0,
    "idle_sec" INTEGER NOT NULL DEFAULT 0,
    "malfunction_sec" INTEGER NOT NULL DEFAULT 0,
    "workstationId" TEXT NOT NULL,

    CONSTRAINT "WorkstationDailyStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_worker_id_key" ON "Worker"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "Workstation_station_id_key" ON "Workstation"("station_id");

-- CreateIndex
CREATE INDEX "AIEvent_timestamp_idx" ON "AIEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AIEvent_workerId_timestamp_idx" ON "AIEvent"("workerId", "timestamp");

-- CreateIndex
CREATE INDEX "WorkstationSession_startTime_endTime_idx" ON "WorkstationSession"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "WorkstationSession_state_idx" ON "WorkstationSession"("state");

-- CreateIndex
CREATE INDEX "WorkstationDailyStats_date_idx" ON "WorkstationDailyStats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkstationDailyStats_workstationId_date_key" ON "WorkstationDailyStats"("workstationId", "date");

-- AddForeignKey
ALTER TABLE "AIEvent" ADD CONSTRAINT "AIEvent_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvent" ADD CONSTRAINT "AIEvent_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkstationSession" ADD CONSTRAINT "WorkstationSession_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkstationSession" ADD CONSTRAINT "WorkstationSession_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkstationDailyStats" ADD CONSTRAINT "WorkstationDailyStats_workstationId_fkey" FOREIGN KEY ("workstationId") REFERENCES "Workstation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
