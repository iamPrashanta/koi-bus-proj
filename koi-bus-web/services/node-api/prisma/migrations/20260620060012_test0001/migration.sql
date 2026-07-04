/*
  Warnings:

  - You are about to drop the column `reportType` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `endPoint` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `startPoint` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `distanceKm` on the `StopConnection` table. All the data in the column will be lost.
  - You are about to drop the column `travelTime` on the `StopConnection` table. All the data in the column will be lost.
  - Added the required column `status` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `operatorId` to the `Route` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distanceMeters` to the `StopConnection` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OperatorType" AS ENUM ('WBTC', 'CSTC', 'SBSTC', 'NBSTC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('BUS_MISSING', 'ROUTE_CHANGED', 'ACCIDENT', 'DIVERSION', 'DELAY');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "OccupancyLevel" AS ENUM ('EMPTY', 'MODERATE', 'CROWDED', 'FULL');

-- CreateEnum
CREATE TYPE "RouteDirection" AS ENUM ('FORWARD', 'REVERSE');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('ROUTE', 'TRANSFER', 'WALKING');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('LOCAL', 'EXPRESS', 'AC', 'SUPER');

-- DropIndex
DROP INDEX "Route_code_key";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "reportType",
ADD COLUMN     "status" "ReportStatus" NOT NULL,
ADD COLUMN     "type" "ReportType" NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "endPoint",
DROP COLUMN "startPoint",
ADD COLUMN     "operatorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StopConnection" DROP COLUMN "distanceKm",
DROP COLUMN "travelTime",
ADD COLUMN     "direction" "RouteDirection",
ADD COLUMN     "distanceMeters" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "edgeType" "EdgeType" NOT NULL DEFAULT 'ROUTE',
ADD COLUMN     "estimatedMinutes" INTEGER,
ADD COLUMN     "fareAmount" DOUBLE PRECISION,
ADD COLUMN     "fromRouteId" INTEGER,
ADD COLUMN     "routeId" INTEGER,
ADD COLUMN     "serviceType" "ServiceType",
ADD COLUMN     "toRouteId" INTEGER,
ADD COLUMN     "transferCost" INTEGER;

-- CreateTable
CREATE TABLE "Operator" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OperatorType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OccupancyReport" (
    "id" SERIAL NOT NULL,
    "routeId" INTEGER NOT NULL,
    "occupancyLevel" "OccupancyLevel" NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "OccupancyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedJourney" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sourceStopId" INTEGER NOT NULL,
    "destinationStopId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "SavedJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metadata" (
    "id" SERIAL NOT NULL,
    "dataVersion" TEXT NOT NULL,
    "osmVersion" TEXT,
    "routeVersion" TEXT,
    "stopCount" INTEGER NOT NULL,
    "routeCount" INTEGER NOT NULL,
    "edgeCount" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Metadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Operator_code_key" ON "Operator"("code");

-- CreateIndex
CREATE INDEX "StopConnection_fromStopId_idx" ON "StopConnection"("fromStopId");

-- CreateIndex
CREATE INDEX "StopConnection_toStopId_idx" ON "StopConnection"("toStopId");

-- CreateIndex
CREATE INDEX "StopConnection_fromStopId_toStopId_idx" ON "StopConnection"("fromStopId", "toStopId");

-- CreateIndex
CREATE INDEX "StopConnection_routeId_idx" ON "StopConnection"("routeId");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
