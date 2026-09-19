export default function ManagerBanner({ managersInfo, cashierInfo }) {
  // Jodi Manager abong Cashier keui na thake tahole kichu dekhabe na
  if ((!managersInfo || managersInfo.length === 0) && !cashierInfo) return null;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-2">
        Current Month Officials
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Manager Cards */}
        {managersInfo && managersInfo.map((manager, index) => (
          <div key={`manager-${index}`} className="bg-gradient-to-r from-amber-500 to-orange-500 dark:from-indigo-600 dark:to-blue-600 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between border border-amber-400/50 dark:border-indigo-400/30">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-user-tie text-xl"></i>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Manager</h3>
                <p className="text-lg font-black leading-tight truncate" title={manager.full_name}>
                  {manager.full_name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold bg-black/10 dark:bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm mt-2">
              <p><i className="fas fa-door-closed mr-1.5 opacity-80"></i> Rm: {manager.room_no || 'N/A'}</p>
              <p><i className="fas fa-phone mr-1.5 opacity-80"></i> {manager.mobile_number || 'N/A'}</p>
            </div>
          </div>
        ))}

        {/* Cashier Card (Strictly 1 person) */}
        {cashierInfo && (
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-800 rounded-2xl p-4 text-white shadow-lg flex flex-col justify-between border border-teal-400/50 dark:border-teal-500/30">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <i className="fas fa-money-bill-wave text-xl"></i>
              </div>
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Cashier</h3>
                <p className="text-lg font-black leading-tight truncate" title={cashierInfo.full_name}>
                  {cashierInfo.full_name}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold bg-black/10 dark:bg-black/20 px-3 py-2 rounded-xl backdrop-blur-sm mt-2">
              <p><i className="fas fa-door-closed mr-1.5 opacity-80"></i> Rm: {cashierInfo.room_no || 'N/A'}</p>
              <p><i className="fas fa-phone mr-1.5 opacity-80"></i> {cashierInfo.mobile_number || 'N/A'}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}