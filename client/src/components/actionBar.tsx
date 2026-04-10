import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Layout, Database } from 'lucide-react';

interface ActionBarProps {
 
  onRefreshData: () => Promise<void>;

  isSyncing: boolean;
}

const ActionBar: React.FC<ActionBarProps> = ({ onRefreshData, isSyncing }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      {/* Left Side: Brand/Context */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600">
          <Layout size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
            Control Panel
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Manage system data and analytics sync
          </p>
        </div>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        
        {/* Secondary Action: Navigate to Developer/Seeding View */}
        <button
          type="button"
          onClick={() => navigate('/setdata')}
          disabled={isSyncing}
          className="flex-1 md:flex-none flex items-center justify-center cursor-pointer gap-2 px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Database size={16} />
          Set Custom Data
        </button>

        {/* Primary Action: Re-run default seeding and refresh UI */}
        <button
          type="button"
          onClick={onRefreshData}
          disabled={isSyncing}
          className="flex-1 md:flex-none flex items-center justify-center cursor-pointer gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw 
            size={16} 
            className={`${isSyncing ? 'animate-spin' : ''}`} 
          />
          <span>{isSyncing ? 'Syncing...' : 'Refresh Metrics'}</span>
        </button>
        
      </div>
    </div>
  );
};

export default ActionBar;