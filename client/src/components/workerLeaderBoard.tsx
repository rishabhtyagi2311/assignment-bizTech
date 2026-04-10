import React from 'react';
import type { WorkerStats } from '../services/analytics';
import { TrendingUp, Clock } from 'lucide-react';

interface Props {
    workers: WorkerStats[];
}

const WorkerLeaderboard: React.FC<Props> = ({ workers }) => {
    // Sort by total units to show top performers first
    const sortedWorkers = [...workers].sort((a, b) => b.totalUnits - a.totalUnits);

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={20} className="text-green-500" />
                    Worker Performance
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-semibold">Worker</th>
                            <th className="px-6 py-4 font-semibold text-center">Utilization</th>
                            <th className="px-6 py-4 font-semibold text-center">Units</th>
                            <th className="px-6 py-4 font-semibold text-center">Units/Hour</th>

                            <th className="px-6 py-4 font-semibold text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedWorkers.map((w) => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                            {w.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{w.name}</p>
                                            <p className="text-[10px] text-gray-400 font-mono">{w.worker_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-sm font-semibold">{w.utilization.toFixed(1)}%</span>
                                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${w.utilization}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-gray-700">{w.totalUnits}</td>
                                <td className="px-6 py-4 text-center text-green-600 font-medium">
                                    {w.unitsPerHour.toFixed(1)}/hr
                                </td>
                                <td className="px-6 py-4 text-right text-xs text-gray-500">
                                    <div className="flex flex-col items-end">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {w.workingMin}m active</span>
                                        <span className="text-orange-400">{w.idleMin}m idle</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WorkerLeaderboard;