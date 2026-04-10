import api from './api';

export interface FactoryStats {
  totalProductiveHours: string;
  totalProductionCount: number;
  avgProductionRate: number;
  avgFactoryUtilization: number;
}


export interface WorkstationStats {
  id: string;
  station_id: string;
  name: string;
  occupancyTimeMin: number;
  malfunctionTimeMin: number;
  utilization: number;
  totalUnits: number;
  throughputPerHour: number;
}

export interface WorkerStats {
  id: string;
  worker_id: string;
  name: string;
  workingMin: number;
  idleMin: number;
  utilization: number;
  totalUnits: number;
  unitsPerHour: number;

}

export interface RecentEvent {
  id: string;
  timestamp: string;
  event_type: string;
  confidence: number;
  count: number;
  worker: { name: string };
  workstation: { name: string; station_id: string };
}


export const getFactoryMetrics = async (date?: string): Promise<FactoryStats> => {
  const response = await api.get<FactoryStats>('/analytics/factory', {
    params: { date },
  });
  return response.data;
};



export const getAllWorkstationsMetrics = async (date?: string): Promise<WorkstationStats[]> => {
  const response = await api.get<WorkstationStats[]>('/analytics/workstations', {
    params: { date },
  });
  return response.data;
};



export const getAllWorkersMetrics = async (date?: string): Promise<WorkerStats[]> => {
  const response = await api.get<WorkerStats[]>('/analytics/workers', {
    params: { date },
  });
  return response.data;
};




export const getRecentActivity = async (): Promise<RecentEvent[]> => {
  const response = await api.get<RecentEvent[]>('/analytics/recent');
  return response.data;
};