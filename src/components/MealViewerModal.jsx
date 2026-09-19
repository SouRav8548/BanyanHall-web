import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export default function MealViewerModal({ isOpen, onClose, isManager, isMessPrefect, isAuditor }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedMealSession, setSelectedMealSession] = useState('Morning');

  const [logs, setLogs] = useState([]);
  const [guestLogs, setGuestLogs] = useState([]);
  const [offLogs, setOffLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState('');
  const [isLockedTimeReached, setIsLockedTimeReached] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Access check for detailed audit records
  const hasSpecialAccess = isManager || isMessPrefect || isAuditor;

  useEffect(() => {
    if (isOpen) {
      checkTimeWindow();
      fetchMealDetails();
    }
  }, [isOpen, selectedDate, selectedMealSession]);

  const checkTimeWindow = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeVal = hours * 60 + minutes;

    if (selectedMealSession === 'Morning') {
      setIsLockedTimeReached(currentTimeVal >= 390); // 6:30 AM
    } else {
      setIsLockedTimeReached(currentTimeVal >= 1080); // 6:00 PM
    }
  };

  const fetchMealDetails = async () => {
    setLoading(true);
    const isToday = selectedDate === todayStr;

    try {
      // 1. Fetch Regular Active Profiles
      const { data: profilesData, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, room_no, mobile_number, meal_status, roles(role_name), guest_veg_count, guest_egg_count, guest_fish_count, guest_chicken_count')
        .eq('is_approved', true);

      if (profErr) throw profErr;

      const validUsers = profilesData?.filter(p => p.roles?.role_name !== 'Superintendent') || [];
      const activeMealList = [];
      const offMealList = [];

      validUsers.forEach(p => {
        if (p.meal_status) activeMealList.push(p);
        else offMealList.push(p);
      });

      setLogs(activeMealList);
      setOffLogs(offMealList);

      // 2. Fetch Guest Meal Data (Archived History vs Live)
      // Check if history records exist for the selected date and session
      const { data: historyData, error: histErr } = await supabase
        .from('guest_meal_history')
        .select('*, profiles(full_name, room_no, mobile_number)')
        .eq('log_date', selectedDate)
        .eq('meal_session', selectedMealSession);

      if (!histErr && historyData && historyData.length > 0) {
        // Load from archived guest history
        const formattedHistory = historyData.map(h => {
          const v = h.veg_count || 0;
          const e = h.egg_count || 0;
          const f = h.fish_count || 0;
          const c = h.chicken_count || 0;
          let prefStr = [];
          if (v > 0) prefStr.push(`Veg: ${v}`);
          if (e > 0) prefStr.push(`Egg: ${e}`);
          if (f > 0) prefStr.push(`Fish: ${f}`);
          if (c > 0) prefStr.push(`Chicken: ${c}`);

          return {
            hostName: h.profiles?.full_name || 'Unknown',
            hostRoom: h.profiles?.room_no || 'N/A',
            hostPhone: h.profiles?.mobile_number || 'N/A',
            totalGuests: v + e + f + c,
            pref: prefStr.join(', '),
            isArchived: true
          };
        });
        setGuestLogs(formattedHistory);
      } else if (isToday) {
        // If today and before reset, fetch live from profiles
        const liveGuests = [];
        validUsers.forEach(p => {
          const v = p.guest_veg_count || 0;
          const e = p.guest_egg_count || 0;
          const f = p.guest_fish_count || 0;
          const c = p.guest_chicken_count || 0;
          const total = v + e + f + c;

          if (total > 0) {
            let prefStr = [];
            if (v > 0) prefStr.push(`Veg: ${v}`);
            if (e > 0) prefStr.push(`Egg: ${e}`);
            if (f > 0) prefStr.push(`Fish: ${f}`);
            if (c > 0) prefStr.push(`Chicken: ${c}`);

            liveGuests.push({
              hostName: p.full_name,
              hostRoom: p.room_no || 'N/A',
              hostPhone: p.mobile_number || 'N/A',
              totalGuests: total,
              pref: prefStr.join(', '),
              isArchived: false
            });
          }
        });
        setGuestLogs(liveGuests);
      } else {
        setGuestLogs([]);
      }
    } catch (err) {
      console.error("Error fetching meal details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockAndSave = async () => {
    if (!window.confirm("Are you sure you want to lock and save today's logs for the cook?")) return;
    
    const today = new Date().toISOString().split('T')[0];
    const finalMenu = menuName.trim() ? `Rice & Dal + ${menuName}` : 'Rice & Dal';

    for (const boarder of logs) {
      await supabase.from('meal_logs').upsert({
        boarder_id: boarder.id,
        log_date: today,
        meal_session: selectedMealSession,
        menu_name: finalMenu
      }, { onConflict: 'boarder_id, log_date, meal_session' });
    }

    setSuccessMsg('Logs successfully locked, saved, and sent to kitchen!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-24 md:pt-28 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Detailed Meal List & Report</h3>
            
            {/* Date Selector */}
            <input 
              type="date" 
              value={selectedDate} 
              max={todayStr} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            />

            {/* Session Selector */}
            <select 
              value={selectedMealSession} 
              onChange={(e) => setSelectedMealSession(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="Morning">Morning (Lunch)</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md transition">
              <i className="fas fa-print mr-2"></i> Print Report
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="my-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 font-bold rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {/* MANAGER LOCK & SAVE BOX */}
        {isManager && selectedDate === todayStr && (
          <div className="my-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800">
            <h4 className="font-black text-amber-800 dark:text-amber-400 mb-2">Manager Control Panel</h4>
            {!isLockedTimeReached ? (
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                <i className="fas fa-clock mr-2 text-amber-500"></i> Meal window is OPEN. Locking available after cutoff time.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Enter special dish (e.g. Egg Curry / Fish Fry)" 
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  className="flex-grow px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 outline-none font-medium text-slate-800 dark:text-white text-sm"
                />
                <button 
                  onClick={handleLockAndSave}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg transition text-sm whitespace-nowrap"
                >
                  <i className="fas fa-lock mr-2"></i> Lock & Save Logs
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-bold">Loading meal records...</div>
        ) : (
          <div className="space-y-8 mt-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            
            {/* 1. REGULAR ACTIVE MEALS */}
            <div>
              <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-3">
                <i className="fas fa-check-circle text-emerald-500 mr-2"></i> Regular Active Meals ({logs.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Boarder Name</th>
                      <th className="p-3">Room No</th>
                      <th className="p-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {logs.length === 0 ? (
                      <tr><td colSpan="4" className="p-4 text-center text-slate-400 font-bold">No regular meals found.</td></tr>
                    ) : (
                      logs.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{item.full_name}</td>
                          <td className="p-3 font-medium">{item.room_no || 'N/A'}</td>
                          <td className="p-3 font-medium">
                            <a href={`tel:${item.mobile_number}`} className="text-blue-500 hover:underline">
                              {item.mobile_number || 'N/A'}
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. GUEST MEALS (Live & Archived History for Auditor/Mess Prefect/Manager) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-black text-amber-700 dark:text-amber-400">
                  <i className="fas fa-user-friends mr-2"></i> Guest Meals ({guestLogs.length})
                </h4>
                {guestLogs.length > 0 && guestLogs[0]?.isArchived && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <i className="fas fa-archive mr-1"></i> Archived Log
                  </span>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Host Boarder</th>
                      <th className="p-3">Total Guest Meals</th>
                      <th className="p-3">Room</th>
                      <th className="p-3">Host Contact</th>
                      <th className="p-3">Guest Preferences</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-200 dark:divide-amber-900/30">
                    {guestLogs.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-slate-400 font-bold">No guest meals recorded for this session.</td></tr>
                    ) : (
                      guestLogs.map((g, idx) => (
                        <tr key={idx} className="hover:bg-amber-100/30">
                          <td className="p-3 font-semibold text-amber-700">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{g.hostName}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 bg-amber-500 text-white font-black rounded-lg text-xs shadow-sm">
                              {g.totalGuests}
                            </span>
                          </td>
                          <td className="p-3 font-medium">{g.hostRoom}</td>
                          <td className="p-3 font-medium">
                            <a href={`tel:${g.hostPhone}`} className="text-blue-500 hover:underline">{g.hostPhone}</a>
                          </td>
                          <td className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-400">{g.pref}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. OFF MEALS */}
            <div>
              <h4 className="text-lg font-black text-slate-500 mb-3">
                <i className="fas fa-times-circle text-rose-500 mr-2"></i> Meal OFF ({offLogs.length})
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-sm opacity-75">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      <th className="p-3">#</th>
                      <th className="p-3">Boarder Name</th>
                      <th className="p-3">Room No</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {offLogs.length === 0 ? (
                      <tr><td colSpan="3" className="p-4 text-center text-slate-400 font-bold">No meals are currently OFF.</td></tr>
                    ) : (
                      offLogs.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-3">{idx + 1}</td>
                          <td className="p-3 font-bold">{item.full_name}</td>
                          <td className="p-3">{item.room_no || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}