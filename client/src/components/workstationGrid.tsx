import React from 'react';
import type { WorkstationStats } from '../services/analytics';
import { Clock, Box, Zap, AlertTriangle, BarChart3 } from 'lucide-react';

interface Props {
  stations: WorkstationStats[];
}

const WorkstationGrid: React.FC<Props> = ({ stations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stations.map((s) => (
        <div 
          key={s.id} 
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border-b-4 border-b-blue-600/10"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{s.name}</h3>
              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                {s.station_id}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
              s.utilization > 75 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            }`}>
              <BarChart3 size={14} />
              {s.utilization.toFixed(1)}% UTILIZED
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Occupancy</p>
                <p className="text-sm font-bold text-gray-900">{s.occupancyTimeMin}m</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Throughput</p>
                <p className="text-sm font-bold text-gray-900">{s.throughputPerHour.toFixed(1)}/hr</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Box size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Total Units</p>
                <p className="text-sm font-bold text-gray-900">{s.totalUnits}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Downtime</p>
                <p className="text-sm font-bold text-gray-900">{s.malfunctionTimeMin}m</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-50">
            <div className="flex justify-between items-center mb-1.5">
               <span className="text-[9px] font-bold text-gray-400 uppercase">Operational Efficiency</span>
               <span className="text-[9px] font-black text-gray-600">{s.utilization.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  s.utilization > 75 ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${s.utilization}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkstationGrid;