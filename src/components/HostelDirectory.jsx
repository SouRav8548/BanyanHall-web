import React from 'react';

export default function HostelDirectory({
  boardersList, loadingList, isSuperintendent, isMessPrefect, canApproveNew, canRejectNew, canSuspendActive,
  onRefresh, handleApprove, handleReject, handleSuspend,
  handleMakePrefect, handleMakeBoarder, handleMakeManager, handleMakeCashier
}) {
  
  const activeBoarders = boardersList.filter(b => b.is_approved);
  const pendingBoarders = boardersList.filter(b => !b.is_approved);

  const canManageRoles = isSuperintendent || isMessPrefect;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
      
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <i className="fas fa-address-book text-indigo-500"></i>
            Hostel Directory
            
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] md:text-xs px-3 py-1 rounded-full font-black shadow-sm tracking-wider uppercase">
              {activeBoarders.length} Active Boarders
            </span>
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {canManageRoles ? "View boarder information and manage roles." : "Contact list and information of all active boarders."}
          </p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={loadingList} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 transition-colors shadow-sm disabled:opacity-50"
        >
          <i className={`fas fa-sync-alt ${loadingList ? 'fa-spin' : ''}`}></i>
        </button>
      </div>

      <div className="p-6">
        
        {canApproveNew && pendingBoarders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-user-clock"></i> Pending Approvals ({pendingBoarders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBoarders.map(b => (
                <div key={b.id} className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl">
                  <p className="font-bold text-slate-900 dark:text-white">{b.full_name}</p>
                  <p className="text-xs font-bold text-slate-500 mb-3">Room: {b.room_no || 'N/A'} | Phone: {b.mobile_number || 'N/A'}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(b.id, b.full_name)} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">Approve</button>
                    {canRejectNew && (
                      <button onClick={() => handleReject(b.id, b.full_name)} className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors">Reject</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">Boarder List</h3>
          
          {activeBoarders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <i className="fas fa-users text-4xl mb-3 opacity-50"></i>
              <p className="font-medium">No active boarders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 pl-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Room</th>
                    <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Contact Number</th>
                    
                    {canManageRoles && (
                      <>
                        <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="p-3 pr-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeBoarders.map(b => (
                    <tr key={b.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 pl-6 font-bold text-slate-700 dark:text-slate-300">
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs shadow-sm">
                          {b.room_no || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white text-sm">
                        {b.full_name}
                      </td>
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400 text-sm">
                        {b.mobile_number ? (
                          <a href={`tel:${b.mobile_number}`} className="hover:text-indigo-500 flex items-center gap-2 transition-colors">
                            <i className="fas fa-phone-alt text-xs opacity-50"></i> {b.mobile_number}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Not Provided</span>
                        )}
                      </td>
                      
                      {canManageRoles && (
                        <>
                          <td className="p-3">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                              b.roles?.role_name === 'Manager' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                              b.roles?.role_name === 'Prefect Committee' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                              b.roles?.role_name === 'Cashier' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {b.roles?.role_name} {b.prefect_title && `(${b.prefect_title})`}
                            </span>
                          </td>
                          <td className="p-3 pr-6 text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              
                              {/* Manager & Cashier Button - Mess Prefect can assign manager/cashier to boarders or prefects */}
                              {b.roles?.role_name !== 'Manager' && b.roles?.role_name !== 'Cashier' && isMessPrefect && (
                                <>
                                  <button onClick={() => handleMakeManager(b.id, b.full_name)} className="px-2.5 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-amber-600">
                                    <i className="fas fa-user-tie"></i> Manager
                                  </button>
                                  <button onClick={() => handleMakeCashier(b.id, b.full_name)} className="px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-emerald-600">
                                    <i className="fas fa-money-bill-wave"></i> Cashier
                                  </button>
                                </>
                              )}

                              {/* Prefect Button - Only Superintendent can assign Prefect role */}
                              {b.roles?.role_name !== 'Prefect Committee' && isSuperintendent && (
                                <button onClick={() => handleMakePrefect(b.id, b.full_name)} className="px-2.5 py-1.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-purple-600">
                                  <i className="fas fa-user-shield"></i> Prefect
                                </button>
                              )}
                              
                              {/* Demote Button - Mess Prefect can ONLY demote Manager or Cashier. Superintendent can demote Prefect Committee, Manager, or Cashier. */}
                              {((isMessPrefect && (b.roles?.role_name === 'Manager' || b.roles?.role_name === 'Cashier')) || 
                                (isSuperintendent && (b.roles?.role_name === 'Prefect Committee' || b.roles?.role_name === 'Manager' || b.roles?.role_name === 'Cashier'))) && (
                                <button onClick={() => handleMakeBoarder(b.id, b.full_name)} className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-500 hover:text-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-slate-600">
                                  <i className="fas fa-level-down-alt"></i> Demote
                                </button>
                              )}
                              
                              {/* Suspend Button - Only Superintendent can suspend */}
                              {canSuspendActive && (
                                <button onClick={() => handleSuspend(b.id, b.full_name)} className="px-2.5 py-1.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-colors flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-rose-600">
                                  <i className="fas fa-ban"></i> Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
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