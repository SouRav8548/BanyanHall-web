import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function MyMealHistoryModal({ isOpen, onClose, profileId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Current month and year
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    if (isOpen && profileId) fetchHistory();
  }, [isOpen, profileId, month, year]);

  const fetchHistory = async () => {
    setLoading(true);
    
    // Formatting start and end date of the selected month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data } = await supabase
      .from('meal_logs')
      .select('log_date, meal_session, menu_name')
      .eq('boarder_id', profileId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false });
    
    if (data) {
      setHistory(data);
    } else {
      setHistory([]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">My Meal History</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Track your past meals and menus.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Filter & Summary Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Month</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Select Year</label>
              <select 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
              >
                {[currentDate.getFullYear() - 1, currentDate.getFullYear(), currentDate.getFullYear() + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-indigo-500 text-white px-5 py-2.5 rounded-xl shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Meals (This Month)</p>
            <p className="text-2xl font-black leading-none">{history.length}</p>
          </div>
        </div>

        {/* List Section */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-40">
              <i className="fas fa-spinner fa-spin text-4xl text-indigo-500 mb-4"></i>
              <p className="text-slate-500 font-bold">Loading your records...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-40 text-slate-400">
              <i className="fas fa-utensils text-5xl mb-4 opacity-30"></i>
              <p className="font-bold text-lg">No meals found!</p>
              <p className="text-sm">You haven't logged any meals for this month.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Session</th>
                    <th className="p-4 font-bold text-xs text-slate-500 uppercase tracking-wider">Menu Name</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {new Date(record.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${
                          record.meal_session === 'Morning' 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' 
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
                        }`}>
                          {record.meal_session === 'Morning' ? 'Lunch' : 'Dinner'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-sm text-slate-600 dark:text-slate-400">
                        {record.menu_name || 'Rice & Dal'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}