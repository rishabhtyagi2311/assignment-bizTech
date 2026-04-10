
export enum EventType {
  WORKING = 'WORKING',
  IDLE = 'IDLE',
  ABSENT = 'ABSENT',
  PRODUCT_COUNT = 'PRODUCT_COUNT',
  CAMERA_MALFUNCTION = 'CAMERA_MALFUNCTION'
}

export interface AIEventPayload {
  timestamp: string;      
  worker_id: string;      
  workstation_id: string; 
  event_type: EventType;  
  confidence: number;
  count?: number;         
}


export interface CustomSeedPayload {
  workers: { worker_id: string; name: string }[];
  workstations: { station_id: string; name: string }[];
  events:AIEventPayload[];
}