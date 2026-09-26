import React from "react";

export default function HostelDirectory({
  boardersList,
  loadingList,
  isSuperintendent,
  isMessPrefect,
  canApproveNew,
  canRejectNew,
  canSuspendActive,
  onRefresh,
  handleApprove,
  handleReject,
  handleSuspend,
  handleMakePrefect,
  handleMakeBoarder,
  handleMakeManager,
  handleMakeCashier,
}) {
  const activeBoarders = boardersList.filter((b) => b.is_approved);
  const pendingBoarders = boardersList.filter((b) => !b.is_approved);

  // We are assuming `isMessPrefect` implies Maintenance/Admin rights in the scope of viewing dues based on your prompt.
  // If you strictly want *only* Superintendent or Maintenance, ensure the parent component passes the correct boolean.
  const canManageRoles = isSuperintendent || isMessPrefect;
  const canViewDues = isSuperintendent || isMessPrefect; // Controls visibility of the "Total Due" column

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
      {/* HEADER SECTION */}
      <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 md:gap-3">
            <i className="fas fa-address-book text-indigo-500"></i>
            Hostel Directory
            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-black shadow-sm tracking-wider uppercase whitespace-nowrap">
              {activeBoarders.length} Boarders
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            {canManageRoles
              ? "Manage roles and view boarder dues."
              : "Contact list and information of all active boarders."}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loadingList}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 transition-colors shadow-sm disabled:opacity-50"
        >
          <i className={`fas fa-sync-alt ${loadingList ? "fa-spin" : ""}`}></i>
        </button>
      </div>

      <div className="p-4 md:p-6">
        {/* PENDING APPROVALS (If any) */}
        {canApproveNew && pendingBoarders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-black text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-user-clock"></i> Pending Approvals (
              {pendingBoarders.length})
            </h3>

            {/* 🔥 NEW DETAILED PENDING CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {pendingBoarders.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {user.full_name}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 px-2 py-1 rounded-lg">
                        New
                      </span>
                    </div>

                    {/* DETAILED INFO GRID */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          <i className="fas fa-calendar-alt mr-1"></i> Admission
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">
                          {user.admission_date
                            ? new Date(user.admission_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : user.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          <i className="fas fa-phone-alt mr-1"></i> Phone
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">
                          {user.mobile_number || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          <i className="fas fa-graduation-cap mr-1"></i> Course
                        </span>
                        <span
                          className="text-slate-800 dark:text-slate-200 font-bold truncate"
                          title={user.course || "N/A"}
                        >
                          {user.course || "N/A"}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          <i className="fas fa-building mr-1"></i> Dept
                        </span>
                        <span
                          className="text-slate-800 dark:text-slate-200 font-bold truncate"
                          title={user.department || "N/A"}
                        >
                          {user.department || "N/A"}
                        </span>
                      </div>

                      {/* Address Row (Full Width) */}
                      <div className="flex flex-col col-span-2 mt-1 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                          <i className="fas fa-map-marker-alt mr-1"></i> Address
                        </span>
                        <span
                          className="text-slate-800 dark:text-slate-200 font-bold truncate"
                          title={user.address || "N/A"}
                        >
                          {user.address || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleApprove(user.id, user.full_name)}
                      className="flex-1 py-2.5 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 font-black text-sm transition-all hover:scale-105"
                    >
                      Approve
                    </button>
                    {canRejectNew && (
                      <button
                        onClick={() => handleReject(user.id, user.full_name)}
                        className="flex-1 py-2.5 rounded-xl text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/30 font-black text-sm transition-all hover:scale-105"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE BOARDERS LIST (Responsive Table) */}
        <div>
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-4">
            Boarder List
          </h3>

          {activeBoarders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <i className="fas fa-users text-4xl mb-3 opacity-50"></i>
              <p className="font-medium">No active boarders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 pl-4 md:pl-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">
                      Contact Number
                    </th>

                    {/* Only Show Dues to Authorized Roles */}
                    {canViewDues && (
                      <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">
                        Total Due
                      </th>
                    )}

                    {canManageRoles && (
                      <>
                        <th className="p-3 font-bold text-xs text-slate-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="p-3 pr-4 md:pr-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeBoarders.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* ROOM */}
                      <td className="p-3 pl-4 md:pl-6 font-bold text-slate-700 dark:text-slate-300">
                        <span className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-xs shadow-sm">
                          {b.room_no || "N/A"}
                        </span>
                      </td>

                      {/* NAME */}
                      <td className="p-3 font-bold text-slate-900 dark:text-white text-sm">
                        {b.full_name}
                      </td>

                      {/* CONTACT */}
                      <td className="p-3 font-medium text-slate-600 dark:text-slate-400 text-sm">
                        {b.mobile_number ? (
                          <a
                            href={`tel:${b.mobile_number}`}
                            className="hover:text-indigo-500 flex items-center gap-2 transition-colors"
                          >
                            <i className="fas fa-phone-alt text-xs opacity-50"></i>{" "}
                            {b.mobile_number}
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-xs">
                            Not Provided
                          </span>
                        )}
                      </td>

                      {/* TOTAL DUE (Protected Column) */}
                      {canViewDues && (
                        <td className="p-3">
                          <span
                            className={`text-sm font-black ${
                              parseFloat(b.total_due) > 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            ₹{b.total_due || 0}
                          </span>
                        </td>
                      )}

                      {/* ROLES & ACTIONS */}
                      {canManageRoles && (
                        <>
                          {/* ROLE BADGE */}
                          <td className="p-3">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                                b.roles?.role_name === "Manager"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                  : b.roles?.role_name === "Prefect Committee"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                                    : b.roles?.role_name === "Cashier"
                                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              {b.roles?.role_name}{" "}
                              {b.prefect_title && `(${b.prefect_title})`}
                            </span>
                          </td>

                          {/* ACTION BUTTONS */}
                          <td className="p-3 pr-4 md:pr-6 text-right">
                            <div className="flex justify-end gap-2">
                              {/* Manager & Cashier Button */}
                              {b.roles?.role_name !== "Manager" &&
                                b.roles?.role_name !== "Cashier" &&
                                isMessPrefect && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleMakeManager(b.id, b.full_name)
                                      }
                                      className="px-2.5 py-1.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-amber-600 shadow-sm"
                                    >
                                      <i className="fas fa-user-tie"></i>{" "}
                                      Manager
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleMakeCashier(b.id, b.full_name)
                                      }
                                      className="px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-emerald-600 shadow-sm"
                                    >
                                      <i className="fas fa-money-bill-wave"></i>{" "}
                                      Cashier
                                    </button>
                                  </>
                                )}

                              {/* Prefect Button */}
                              {b.roles?.role_name !== "Prefect Committee" &&
                                isSuperintendent && (
                                  <button
                                    onClick={() =>
                                      handleMakePrefect(b.id, b.full_name)
                                    }
                                    className="px-2.5 py-1.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-purple-600 shadow-sm"
                                  >
                                    <i className="fas fa-user-shield"></i>{" "}
                                    Prefect
                                  </button>
                                )}

                              {/* Demote Button */}
                              {((isMessPrefect &&
                                (b.roles?.role_name === "Manager" ||
                                  b.roles?.role_name === "Cashier")) ||
                                (isSuperintendent &&
                                  (b.roles?.role_name === "Prefect Committee" ||
                                    b.roles?.role_name === "Manager" ||
                                    b.roles?.role_name === "Cashier"))) && (
                                <button
                                  onClick={() =>
                                    handleMakeBoarder(b.id, b.full_name)
                                  }
                                  className="px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-500 hover:text-white dark:hover:bg-slate-700 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-slate-600 shadow-sm"
                                >
                                  <i className="fas fa-level-down-alt"></i>{" "}
                                  Demote
                                </button>
                              )}

                              {/* Suspend Button */}
                              {canSuspendActive && (
                                <button
                                  onClick={() =>
                                    handleSuspend(b.id, b.full_name)
                                  }
                                  className="px-2.5 py-1.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-rose-600 shadow-sm"
                                >
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
