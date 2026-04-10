import React, { useEffect, useState, useMemo } from 'react';
import { checkAndSeedSystem,refreshDatabase } from '../services/seed';
import { 
  getFactoryMetrics, 
  getAllWorkstationsMetrics, 
  getAllWorkersMetrics,
  getRecentActivity,
  type FactoryStats, 
  type WorkstationStats, 
  type WorkerStats,
  type RecentEvent
} from '../services/analytics';

import FactoryMetrics from '../components/factoryMetrics';
import WorkstationGrid from '../components/workstationGrid';
import WorkerLeaderboard from '../components/workerLeaderBoard';
import RecentActivity from '../components/recentActivity';
import ActionBar from '../components/actionBar';

import { 
  RefreshCw, 
  ServerOff, 
  Database, 
  LayoutDashboard, 
  Activity,
  XCircle,
  User,
  Factory,
  Zap,
  Clock
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Data States
  const [factoryStats, setFactoryStats] = useState<FactoryStats | null>(null);
  const [stations, setStations] = useState<WorkstationStats[]>([]);
  const [workers, setWorkers] = useState<WorkerStats[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  
  // Filter States
  const [stationFilter, setStationFilter] = useState<string>('all');
  const [workerFilter, setWorkerFilter] = useState<string>('all');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('all');
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized Filtered Data
  const filteredStations = useMemo(() => 
    stationFilter === 'all' ? stations : stations.filter(s => s.id === stationFilter),
    [stations, stationFilter]
  );

  const filteredWorkers = useMemo(() => 
    workerFilter === 'all' ? workers : workers.filter(w => w.id === workerFilter),
    [workers, workerFilter]
  );

  const filteredEvents = useMemo(() => 
    eventCategoryFilter === 'all' ? recentEvents : recentEvents.filter(e => e.event_type === eventCategoryFilter),
    [recentEvents, eventCategoryFilter]
  );

  const loadAllData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      await checkAndSeedSystem();
      const [fData, sData, wData, rData] = await Promise.all([
        getFactoryMetrics(),
        getAllWorkstationsMetrics(),
        getAllWorkersMetrics(),
        getRecentActivity()
      ]);

      setFactoryStats(fData);
      setStations(sData);
      setWorkers(wData);
      setRecentEvents(rData);
    } catch (err: any) {
      console.error(err);
      setError(err.code === 'ERR_NETWORK' ? 'Server Connection Lost' : 'Failed to sync data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 const handleRefresh = async () => {
  setRefreshing(true);
  try {
    await refreshDatabase(); // The systemService call
    await loadAllData(true);  // Re-fetch everything
  } catch (err) {
    console.error("Failed to refresh system:", err);
  } finally {
    setRefreshing(false);
  }
};

  useEffect(() => {
    loadAllData();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <ServerOff size={60} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">{error}</h2>
        <button onClick={() => loadAllData()} className="mt-6 flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-200">
          <RefreshCw size={20} /> Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Activity size={20} />
            </div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
              Biz-<span className="text-blue-600">tech</span>
            </h1>
          </div>
          
          
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Section */}
        <div className="flex flex-row md:flex-row md:items-center justify-between gap-4">
          <div className='align-middle'>
            
            <h2 className="text-3xl font-bold text-gray-900">Intelligence Overview</h2>
            <p className="text-gray-500">Real-time breakdown of factory output and human capital.</p>
          </div>

         <ActionBar onRefreshData={handleRefresh} isSyncing={refreshing} />
        </div>

        {/* FACTORY LEVEL */}
        <section className="space-y-6">
            <div className="flex items-center gap-2 text-gray-400">
                <Activity size={18}/>
                <span className="text-sm font-bold uppercase tracking-widest">Global Metrics</span>
            </div>
            {loading ? <SkeletonGrid count={4} /> : <FactoryMetrics stats={factoryStats} />}
        </section>

        {/* WORKSTATION LEVEL */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={20} className="text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">Production Lines</h3>
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                <Factory size={16} className="text-gray-400"/>
                <select 
                    value={stationFilter}
                    onChange={(e) => setStationFilter(e.target.value)}
                    className="text-sm font-medium bg-transparent outline-none min-w-[150px]"
                >
                    <option value="all">View All Stations</option>
                    {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {stationFilter !== 'all' && (
                    <button onClick={() => setStationFilter('all')} className="text-gray-400 hover:text-red-500">
                        <XCircle size={16}/>
                    </button>
                )}
            </div>
          </div>

          {loading ? <SkeletonGrid count={3} height="h-48" /> : <WorkstationGrid stations={filteredStations} />}
        </section>

        {/* BOTTOM SECTION: WORKERS & ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          
          {/* Worker Rankings (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <User size={20} className="text-purple-600" />
                <h3 className="text-xl font-bold text-gray-800">Operator Performance</h3>
              </div>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                  <User size={16} className="text-gray-400"/>
                  <select 
                      value={workerFilter}
                      onChange={(e) => setWorkerFilter(e.target.value)}
                      className="text-sm font-medium bg-transparent outline-none min-w-[150px]"
                  >
                      <option value="all">All Personnel</option>
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
              </div>
            </div>
            {loading ? <div className="h-64 bg-white rounded-2xl animate-pulse" /> : <WorkerLeaderboard workers={filteredWorkers} />}
          </div>

          {/* Recent Activity (1/3 width) */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-orange-500" />
                <h3 className="text-xl font-bold text-gray-800">Live Feed Log</h3>
              </div>
              
              {/* Event Category Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
                  <Zap size={16} className="text-gray-400"/>
                  <select 
                      value={eventCategoryFilter}
                      onChange={(e) => setEventCategoryFilter(e.target.value)}
                      className="text-xs font-bold uppercase bg-transparent outline-none"
                  >
                      <option value="all">All Events</option>
                      <option value="WORKING">Working</option>
                      <option value="IDLE">Idle</option>
                      <option value="PRODUCT_COUNT">Products</option>
                  </select>
              </div>
            </div>
            {loading ? <div className="h-64 bg-white rounded-2xl animate-pulse" /> : <RecentActivity events={filteredEvents} />}
          </div>

        </div>
      </main>
    </div>
  );
};

const SkeletonGrid = ({ count, height = "h-32" }: { count: number, height?: string }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${count} gap-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-white rounded-2xl border border-gray-100 animate-pulse`} />
    ))}
  </div>
);

export default Dashboard;