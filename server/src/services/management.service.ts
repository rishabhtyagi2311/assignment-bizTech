import { prisma } from '../lib/prisma';

export const createWorker = async (worker_id: string, name: string) => {
  return await prisma.worker.upsert({
    where: { worker_id },
    update: { name },
    create: { worker_id, name },
  });
};

export const createWorkstation = async (station_id: string, name: string) => {
  return await prisma.workstation.upsert({
    where: { station_id },
    update: { name },
    create: { station_id, name },
  });
};