import React from 'react';
import type { RecentEvent } from '../services/analytics';
import { Zap, Package, UserCheck, Clock } from 'lucide-react';

const RecentActivity: React.FC<{ events: RecentEvent[] }> = ({ events }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT_COUNT': return <Package className="text-blue-500" size={16} />;
      case 'WORKING': return <UserCheck className="text-green-500" size={16} />;
      default: return <Zap className="text-purple-500" size={16} />;
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Clock size={18} className="text-gray-400" />
        Live Camera Feed Log
      </h3>
      <div className="space-y-6">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline Line */}
            {idx !== events.length - 1 && (
              <div className="absolute left-3.75 top-8 w-px h-10 bg-gray-100" />
            )}
            
            <div className="z-10 bg-gray-50 p-2 rounded-full h-8 w-8 flex items-center justify-center border border-white shadow-sm">
              {getIcon(event.event_type)}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-800">
                  {event.event_type.replace('_', ' ')}
                  {event.count > 0 && <span className="ml-1 text-blue-600">x{event.count}</span>}
                </p>
                <span className="text-[10px] font-mono text-gray-400">
                  {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{event.worker.name}</span> at 
                <span className="font-medium text-gray-700 ml-1">{event.workstation.name}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                 <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400" style={{ width: `${(event.confidence || 0) * 100}%` }} />
                 </div>
                 <span className="text-[9px] text-gray-400 uppercase tracking-tighter">AI Confidence: {Math.round((event.confidence || 0) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;