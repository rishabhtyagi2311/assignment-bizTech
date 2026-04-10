import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const addWorkstation = async (req: Request, res: Response) => {
  const { station_id, name } = req.body;

  if (!station_id || !name) {
    return res.status(400).json({ error: "station_id and name are required" });
  }

  try {
    const station = await prisma.workstation.create({
      data: { station_id, name }
    });
    res.status(201).json(station);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: "Workstation ID already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};