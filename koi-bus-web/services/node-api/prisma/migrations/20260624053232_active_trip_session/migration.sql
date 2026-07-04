-- AlterTable
ALTER TABLE "TripAssignment" ADD COLUMN     "assignedBy" INTEGER;

-- CreateTable
CREATE TABLE "ActiveTripSession" (
    "id" SERIAL NOT NULL,
    "sessionUuid" TEXT NOT NULL,
    "tripId" INTEGER NOT NULL,
    "status" "TripStatus" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "distanceMeters" DOUBLE PRECISION DEFAULT 0,
    "telemetryCount" INTEGER NOT NULL DEFAULT 0,
    "averageSpeed" DOUBLE PRECISION,

    CONSTRAINT "ActiveTripSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveTripSession_sessionUuid_key" ON "ActiveTripSession"("sessionUuid");

-- CreateIndex
CREATE INDEX "ActiveTripSession_tripId_status_idx" ON "ActiveTripSession"("tripId", "status");

-- AddForeignKey
ALTER TABLE "ActiveTripSession" ADD CONSTRAINT "ActiveTripSession_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
