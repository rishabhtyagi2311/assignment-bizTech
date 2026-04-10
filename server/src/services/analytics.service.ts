import { prisma } from '../lib/prisma';

export const AnalyticsService = {

  // --- BULK WORKER LEVEL ---
  async getAllWorkersStats(date: Date) {
    const workers = await prisma.worker.findMany();
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const workerStats = await Promise.all(workers.map(async (worker) => {

      const sessions = await prisma.workstationSession.findMany({
        where: {
          workerId: worker.id,
          startTime: { gte: date, lt: nextDay }
        },
      });

      const workingSec = sessions.filter(s => s.state === 'WORKING').reduce((acc, s) => acc + (s.durationSec || 0), 0);
      const idleSec = sessions.filter(s => s.state === 'IDLE').reduce((acc, s) => acc + (s.durationSec || 0), 0);


      const events = await prisma.aIEvent.findMany({
        where: {
          workerId: worker.id,
          event_type: 'PRODUCT_COUNT',
          timestamp: { gte: date, lt: nextDay }
        }
      });
      const totalUnits = events.reduce((acc, e) => acc + e.count, 0);

      const activeTimeSec = workingSec + idleSec;
      const activeTimeHours = activeTimeSec / 3600;
      const workingTimeHours = workingSec / 3600;

      return {
        id: worker.id,
        worker_id: worker.worker_id,
        name: worker.name,
        workingMin: Math.round(workingSec / 60),
        idleMin: Math.round(idleSec / 60),
        utilization: activeTimeSec > 0 ? (workingSec / activeTimeSec) * 100 : 0,
        totalUnits,
        unitsPerHour: activeTimeHours > 0 ? parseFloat((totalUnits / activeTimeHours).toFixed(2)) : 0,

        pureWorkingRate: workingTimeHours > 0 ? parseFloat((totalUnits / workingTimeHours).toFixed(2)) : 0
      };
    }));

    return workerStats;
  },
  // --- WORKSTATION LEVEL ---
  async getAllWorkstationsStats(date: Date) {
    const allStats = await prisma.workstationDailyStats.findMany({
      where: { date },
      include: {
        workstation: true // To get the 'name' and 'station_id' (e.g., "S1")
      }
    });

    return allStats.map(stat => {
      const occupancyTime = stat.working_sec + stat.idle_sec;
      return {
        id: stat.workstationId,
        station_id: stat.workstation.station_id,
        name: stat.workstation.name,
        occupancyTimeMin: Math.round(occupancyTime / 60),
        malfunctionTimeMin: Math.round(stat.malfunction_sec / 60),
        utilization: occupancyTime > 0 ? (stat.working_sec / occupancyTime) * 100 : 0,
        totalUnits: stat.total_products,
        throughputPerHour: occupancyTime > 0
          ? parseFloat((stat.total_products / (occupancyTime / 3600)).toFixed(2))
          : 0
      };
    });
  },
  // --- FACTORY LEVEL ---
  async getFactoryStats(date: Date) {
    const allStats = await prisma.workstationDailyStats.findMany({
      where: { date }
    });

    const totalProductiveSec = allStats.reduce((acc, s) => acc + s.working_sec, 0);
    const totalUnits = allStats.reduce((acc, s) => acc + s.total_products, 0);
    const totalActiveSec = allStats.reduce((acc, s) => acc + (s.working_sec + s.idle_sec), 0);

    return {
      totalProductiveHours: (totalProductiveSec / 3600).toFixed(2),
      totalProductionCount: totalUnits,
      avgProductionRate: allStats.length > 0 ? totalUnits / allStats.length : 0,
      avgFactoryUtilization: totalActiveSec > 0 ? (totalProductiveSec / totalActiveSec) * 100 : 0
    };
  },

  async getRecentActivity() {
    return await prisma.aIEvent.findMany({
      where: {
        event_type: {
          notIn: ['CAMERA_MALFUNCTION'] as any
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 5,
      include: {
        // The names match your model exactly now
        worker: { select: { name: true } },
        workstation: { select: { name: true, station_id: true } }
      }
    });
  }
}