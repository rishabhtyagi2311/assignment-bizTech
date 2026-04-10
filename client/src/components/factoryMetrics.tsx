import React from 'react';
import type { FactoryStats } from '../services/analytics';
import { Activity, Package, Clock, Gauge } from 'lucide-react';

// 1. Define the Interface for the props
interface FactoryMetricsProps {
  stats: FactoryStats | null;
}

// 2. Pass the interface to React.FC and destructure 'stats'
const FactoryMetrics: React.FC<FactoryMetricsProps> = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Factory Utilization',
      value: `${stats.avgFactoryUtilization.toFixed(1)}%`,
      icon: <Gauge className="text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Total Productive Hours',
      value: `${stats.totalProductiveHours}h`,
      icon: <Clock className="text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Total Production',
      value: stats.totalProductionCount.toLocaleString(),
      icon: <Package className="text-purple-600" />,
      color: 'bg-purple-50',
    },
    {
      title: 'Avg. Production Rate',
      value: stats.avgProductionRate.toFixed(1),
      icon: <Activity className="text-orange-600" />,
      color: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${card.color}`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FactoryMetrics;