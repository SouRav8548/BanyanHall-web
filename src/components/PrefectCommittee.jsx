import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function PrefectCommittee() {
  const [prefects, setPrefects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrefects();
  }, []);

  const fetchPrefects = async () => {
    setLoading(true);
    // 🔥 MAIN FIX: role_id er bodole 'prefect_title' null na holei fetch korbe.
    // Ete Manager/Cashier jara prefect, tarao committee list e thakbe!
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .not('prefect_title', 'is', null) 
      .eq('is_approved', true)
      .order('prefect_title');

    if (!error && data) {
      setPrefects(data);
    }
    setLoading(false);
  };

  // Helper function to show dynamic icons based on Prefect role
  const getPrefectIcon = (title) => {
    switch (title) {
      case 'Mess Prefect': return 'fa-utensils';
      case 'Auditor': return 'fa-file-invoice-dollar';
      case 'Maintenance': return 'fa-tools';
      case 'Game Prefect': return 'fa-futbol';
      case 'Garden Prefect': return 'fa-leaf';
      case 'Cultural Prefect': return 'fa-music';
      default: return 'fa-user-shield';
    }
  };

  if (loading) return null;
  if (prefects.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
      <div className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
          <i className="fas fa-users text-indigo-500"></i>
          Prefect Committee
        </h2>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
          Emergency contacts and committee members of the hostel.
        </p>
      </div>

      <div className="p-3 md:p-5">
        <div className="flex flex-row justify-between gap-2 md:gap-4 w-full items-start">
          
          {prefects.map((p) => (
            <div 
              key={p.id} 
              className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 md:p-4 flex flex-col items-center transition-all h-auto"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center mb-2 shadow-sm shrink-0">
                 <i className={`fas ${getPrefectIcon(p.prefect_title)} text-sm md:text-lg text-slate-700 dark:text-slate-300`}></i>
              </div>
              
              <h3 className="font-black text-[11px] md:text-sm text-slate-900 dark:text-white text-center w-full truncate" title={p.full_name}>
                {p.full_name}
              </h3>
              
              <span className="mt-1 px-1.5 md:px-2 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm w-full max-w-[120px] text-center truncate" title={p.prefect_title || 'PREFECT'}>
                {p.prefect_title || 'PREFECT'}
              </span>
              
              {/* Info Section - highly compact */}
              <div className="border-t border-slate-200 dark:border-slate-800 mt-2 pt-2 w-full flex flex-col gap-1.5 text-[9px] md:text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center w-full">
                  <span className="opacity-70 flex items-center gap-1 shrink-0">
                    <i className="fas fa-door-closed"></i> <span className="hidden md:inline">Rm</span>
                  </span>
                  <span className="text-slate-900 dark:text-white font-black truncate ml-1 text-right" title={p.room_no || 'N/A'}>{p.room_no || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center w-full">
                  <span className="opacity-70 flex items-center gap-1 shrink-0">
                    <i className="fas fa-phone-alt"></i> <span className="hidden md:inline">Ph</span>
                  </span>
                  <a href={`tel:${p.mobile_number}`} className="text-indigo-500 hover:text-indigo-600 transition-colors truncate ml-1 text-right" title={p.mobile_number || 'N/A'}>
                    {p.mobile_number || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
}