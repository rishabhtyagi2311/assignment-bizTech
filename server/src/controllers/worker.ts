import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const addWorker = async (req: Request, res: Response) => {
  const { worker_id, name } = req.body;

  if (!worker_id || !name) {
    return res.status(400).json({ error: "worker_id and name are required" });
  }

  try {
    const worker = await prisma.worker.create({
      data: { worker_id, name }
    });
    res.status(201).json(worker);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Worker ID already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllWorkers = async (_req: Request, res: Response) => {
  const workers = await prisma.worker.findMany();
  res.json(workers);
};