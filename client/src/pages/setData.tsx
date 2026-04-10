import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSeedTemplate, postCustomSeed } from '../services/seed';
import { ChevronLeft, Database, Play, FileJson, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const SetData: React.FC = () => {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoadTemplate = async () => {
    try {
      const template = await getSeedTemplate();
      setJsonInput(JSON.stringify(template, null, 2));
      setStatus({ type: 'success', message: 'Template loaded!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to fetch template from server.' });
    }
  };

  const handleInjectData = async () => {
    setIsProcessing(true);
    setStatus({ type: null, message: '' });
    
    try {
      // 1. Validate JSON locally
      const parsedData = JSON.parse(jsonInput);
      
      // 2. Send to Backend
      const response = await postCustomSeed(parsedData);
      
      setStatus({ type: 'success', message: response.message || 'Data injected successfully!' });
      
      // Optional: Redirect to dashboard after 2 seconds to see results
      setTimeout(() => navigate('/'), 2000);
      
    } catch (err: any) {
      const errorMsg = err instanceof SyntaxError 
        ? 'Invalid JSON format. Please check your syntax.' 
        : err.response?.data?.details || err.message;
        
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium mb-8 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Live Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-2xl text-white shadow-lg shadow-red-200">
                <Database size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Custom Data Injector</h1>
                <p className="text-sm text-gray-500">Wipe and re-seed the timeline with custom JSON payload</p>
              </div>
            </div>
            
            <button 
              onClick={handleLoadTemplate}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <FileJson size={18} />
              Load Template
            </button>
          </div>

          <div className="p-8">
            {/* Status Messages */}
            {status.type && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}

            <div className="relative group">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">
                JSON Payload Editor
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{ "workers": [...], "workstations": [...], "events": [...] }'
                className="w-full h-[450px] p-6 bg-gray-900 text-green-400 font-mono text-sm rounded-2xl border-4 border-gray-800 focus:border-blue-500/30 outline-none transition-all resize-none shadow-inner"
                spellCheck={false}
              />
              <div className="absolute top-10 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <FileJson size={40} className="text-gray-500" />
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
              <button
                onClick={handleInjectData}
                disabled={isProcessing || !jsonInput.trim()}
                className="w-full md:w-auto flex-1 flex items-center justify-center gap-3 bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200"
              >
                {isProcessing ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Play size={20} />
                )}
                {isProcessing ? 'Injecting Data...' : 'Wipe & Inject Custom Timeline'}
              </button>
              
              <div className="text-xs text-gray-400 max-w-[200px] text-center md:text-left">
                Pressing this will permanently delete current records and build a new state.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetData;