import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

import UpdatePasswordModal from "./components/UpdatePasswordModal";

import DashboardNavbar from "./components/DashboardNavbar";
import ManagerBanner from "./components/ManagerBanner";
import ProfilePanel from "./components/ProfilePanel";
import HostelSlideshow from "./components/HostelSlideshow";
import MealControl from "./components/MealControl";
import KitchenReport from "./components/KitchenReport";
import HostelDirectory from "./components/HostelDirectory";
import MealViewerModal from "./components/MealViewerModal";
import MealLogger from "./components/MealLogger";
import PrefectCommittee from "./components/PrefectCommittee";
import GuestMealLogModal from "./components/GuestMealLogModal";
import EditProfileModal from "./components/EditProfileModal";
import NewAuditWidget from "./components/NewAuditWidget";
import SupplierWidget from "./components/SupplierWidget";
import MyMealHistoryModal from "./components/MyMealHistoryModal";
import Footer from "./components/Footer";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [boardersList, setBoardersList] = useState([]);
  const [managersInfo, setManagersInfo] = useState([]);
  const [cashierInfo, setCashierInfo] = useState(null);

  const [notices, setNotices] = useState([]);

  const [loadingList, setLoadingList] = useState(false);
  const [mealStats, setMealStats] = useState(null);
  const [activeGuests, setActiveGuests] = useState([]);

  const [isMealUpdating, setIsMealUpdating] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);

  const [showGuestLogModal, setShowGuestLogModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Profile Panel Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);

  // --- UI MODALS & TOAST STATES ---
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });
  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    inputValue: "",
    onConfirm: null,
  });
  const [prefectModal, setPrefectModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    selectedRole: "Maintenance",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3500);
  };

  // 🔥 NOTUN: 2-Minute Auto Refresh Timer
  useEffect(() => {
    const autoRefreshTimer = setInterval(() => {
      // 120,000 milliseconds = 2 minutes
      fetchUserData();
      fetchNotice();
    }, 120000);
    return () => clearInterval(autoRefreshTimer);
  }, []);

  const fetchNotice = async () => {
    try {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(40);
      if (data) setNotices(data);
    } catch (error) {
      console.error("Notice error:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      console.log("1. Checking auth session...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.warn("No active user found, redirecting to login...");
        setLoading(false);
        navigate("/");
        return;
      }

      console.log("2. User found:", user.id, "- Fetching profile...");

      const [profileRes, managersRes, cashierRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*, roles(role_name)")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("full_name, room_no, mobile_number")
          .eq("role_id", 4),
        supabase
          .from("profiles")
          .select("full_name, room_no, mobile_number")
          .eq("role_id", 5)
          .maybeSingle(),
      ]);

      if (managersRes.data) setManagersInfo(managersRes.data);
      if (cashierRes.data) setCashierInfo(cashierRes.data);

      if (profileRes.data) {
        console.log("3. Profile loaded successfully");
        setProfile(profileRes.data);
        const role = profileRes.data.roles?.role_name;
        if (role !== "Superintendent") fetchManagerStats();
        if (role === "Superintendent" || role === "Prefect Committee")
          fetchSuperintendentList();
      } else {
        console.error("Profile not found or error:", profileRes.error);
        showToast("Profile data could not be loaded.", "error");
      }
    } catch (error) {
      console.error("Dashboard Load Error:", error);
      showToast("Network issue detected. Please refresh.", "error");
    } finally {
      // Guaranteed loading stop
      setLoading(false);
    }
  };

  const fetchSuperintendentList = async () => {
    try {
      setLoadingList(true);
      const { data } = await supabase
        .from("profiles")
        .select("*, roles(role_name)")
        .in("role_id", [1, 2, 4, 5])
        .order("created_at", { ascending: false });
      if (data) setBoardersList(data);
    } catch (error) {
      console.error("List load error:", error);
    } finally {
      setLoadingList(false);
    }
  };

  // 🔥 UPDATED: Added guest_paneer_count to fetch and calculations
  const fetchManagerStats = async () => {
    try {
      setLoadingList(true);
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, full_name, room_no, mobile_number, food_egg, food_fish, food_chicken, meal_status, guest_veg_count, guest_paneer_count, guest_egg_count, guest_fish_count, guest_chicken_count, roles(role_name)",
        )
        .eq("is_approved", true);

      if (data) {
        const validUsers = data.filter(
          (p) => p.roles?.role_name !== "Superintendent",
        );
        let stats = {
          totalMeal: 0,
          totalBoarders: validUsers.length,
          eggVeg: 0,
          eggNon: 0,
          fishVeg: 0,
          fishNon: 0,
          chickenVeg: 0,
          chickenNon: 0,
        };
        let guests = [];

        validUsers.forEach((p) => {
          if (p.meal_status) {
            stats.totalMeal++;
            p.food_egg === "Veg" ? stats.eggVeg++ : stats.eggNon++;
            p.food_fish === "Veg" ? stats.fishVeg++ : stats.fishNon++;
            p.food_chicken === "Veg" ? stats.chickenVeg++ : stats.chickenNon++;
          }
          const guestTotal =
            (p.guest_veg_count || 0) +
            (p.guest_paneer_count || 0) +
            (p.guest_egg_count || 0) +
            (p.guest_fish_count || 0) +
            (p.guest_chicken_count || 0);

          if (guestTotal > 0) {
            stats.totalMeal += guestTotal;
            // Treating Paneer as Veg meal in the overall Kitchen calculation
            stats.eggVeg +=
              (p.guest_veg_count || 0) + (p.guest_paneer_count || 0);
            stats.eggNon += p.guest_egg_count || 0;
            stats.fishNon += p.guest_fish_count || 0;
            stats.chickenNon += p.guest_chicken_count || 0;
            guests.push(p);
          }
        });
        setMealStats(stats);
        setActiveGuests(guests);
      }
    } catch (error) {
      console.error("Stats load error:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const toggleMealStatus = async () => {
    if (isMealUpdating) return;
    setIsMealUpdating(true);
    const newStatus = !profile.meal_status;
    const { error } = await supabase
      .from("profiles")
      .update({ meal_status: newStatus })
      .eq("id", profile.id);
    if (!error) {
      setProfile({ ...profile, meal_status: newStatus });
      showToast(
        `Meal turned ${newStatus ? "ON" : "OFF"} successfully!`,
        "success",
      );
    }
    setIsMealUpdating(false);
  };

  const handleApprove = (userId, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Boarder",
      message: `Are you sure you want to approve ${name}? (Any missed meal charges since their admission date will be auto-calculated).`,
      type: "info",
      onConfirm: async () => {
        try {
          const targetUser = boardersList.find((b) => b.id === userId);
          let totalRetroactiveDue = 0;

          const isFirstApproval = !targetUser?.approved_at;

          if (
            targetUser &&
            targetUser?.roles?.role_name !== "Superintendent" &&
            isFirstApproval
          ) {
            const joinDateStr =
              targetUser.admission_date || targetUser.created_at;
            const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
            const userYear = joinDate.getFullYear();
            const userMonth = joinDate.getMonth();

            const { data: audits } = await supabase
              .from("audit_history")
              .select("*");

            if (audits) {
              audits.forEach((audit) => {
                const auditDate = new Date(`${audit.month} 1, ${audit.year}`);
                const auditYear = auditDate.getFullYear();
                const auditMonth = auditDate.getMonth();

                if (
                  auditYear > userYear ||
                  (auditYear === userYear && auditMonth >= userMonth)
                ) {
                  totalRetroactiveDue += Number(audit.fixed_charge) || 0;
                }
              });
            }
          }

          const currentDue = Number(targetUser?.total_due) || 0;
          const newDue = currentDue + totalRetroactiveDue;

          await supabase
            .from("profiles")
            .update({
              is_approved: true,
              approved_by: profile?.full_name || "Admin",
              approved_at: new Date().toISOString(),
              total_due: newDue,
            })
            .eq("id", userId);

          fetchSuperintendentList();

          if (totalRetroactiveDue > 0) {
            showToast(
              `${name} approved! ₹${totalRetroactiveDue} auto-added for past audits.`,
              "success",
            );
          } else {
            showToast(`${name} has been approved!`, "success");
          }

          setConfirmModal({ isOpen: false });
        } catch (error) {
          console.error("Error approving:", error);
          showToast("Error approving boarder.", "error");
          setConfirmModal({ isOpen: false });
        }
      },
    });
  };

  const handleReject = (userId, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Reject & Delete Account",
      message: `Are you absolutely sure you want to REJECT and DELETE ${name}?\n\nThis will permanently wipe their account from Authentication and the Database.`,
      type: "danger",
      onConfirm: async () => {
        const { error } = await supabase.rpc("delete_auth_user", {
          user_id: userId,
        });
        if (error) showToast("Error deleting user: " + error.message, "error");
        else {
          fetchSuperintendentList();
          fetchUserData();
          showToast(`${name} has been permanently deleted.`, "success");
        }
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleSuspend = (userId, name) => {
    if (userId === profile.id)
      return showToast("You cannot suspend yourself!", "error");
    setConfirmModal({
      isOpen: true,
      title: "Suspend Boarder",
      message: `Suspend ${name}? They will lose meal access temporarily, but their data will remain safe.`,
      type: "warning",
      onConfirm: async () => {
        await supabase
          .from("profiles")
          .update({ is_approved: false, meal_status: false })
          .eq("id", userId);
        fetchSuperintendentList();
        showToast(`${name} has been suspended.`, "warning");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleMakePrefect = (userId, name) => {
    setPrefectModal({
      isOpen: true,
      userId: userId,
      userName: name,
      selectedRole: "Maintenance",
    });
  };

  const confirmMakePrefect = async () => {
    if (!prefectModal.userId || !prefectModal.selectedRole) return;
    await supabase
      .from("profiles")
      .update({ role_id: 2, prefect_title: prefectModal.selectedRole })
      .eq("id", prefectModal.userId);
    setPrefectModal({
      isOpen: false,
      userId: null,
      userName: "",
      selectedRole: "Maintenance",
    });
    fetchSuperintendentList();
    showToast(
      `${prefectModal.userName} is now ${prefectModal.selectedRole}`,
      "success",
    );
  };

  const handleMakeBoarder = (userId, name) => {
    if (userId === profile.id)
      return showToast("You cannot demote yourself!", "error");
    const targetUser = boardersList.find((b) => b.id === userId);
    const currentRole = targetUser?.roles?.role_name;
    const hasPrefectTitle = !!targetUser?.prefect_title;

    let updatePayload = { role_id: 1, prefect_title: null };
    let modalTitle = "Demote to Boarder";
    let modalMessage = `Demote ${name} back to standard Boarder?`;

    if (
      (currentRole === "Manager" || currentRole === "Cashier") &&
      hasPrefectTitle
    ) {
      updatePayload = { role_id: 2 };
      modalTitle = "Remove Duty";
      modalMessage = `Remove Manager/Cashier duty from ${name}? They will revert to their ${targetUser.prefect_title} role.`;
    } else if (currentRole === "Prefect Committee") {
      updatePayload = { role_id: 1, prefect_title: null };
      modalTitle = "Demote Prefect";
      modalMessage = `Demote ${name} from ${targetUser.prefect_title} to standard Boarder?`;
    }

    setConfirmModal({
      isOpen: true,
      title: modalTitle,
      message: modalMessage,
      type: "warning",
      onConfirm: async () => {
        await supabase.from("profiles").update(updatePayload).eq("id", userId);
        fetchSuperintendentList();
        fetchUserData();
        showToast(`${name} has been demoted.`, "success");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleMakeManager = (userId, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Appoint Manager",
      message: `Appoint ${name} as a Manager?`,
      type: "info",
      onConfirm: async () => {
        await supabase.from("profiles").update({ role_id: 4 }).eq("id", userId);
        fetchSuperintendentList();
        fetchUserData();
        showToast(`${name} is now a Manager!`, "success");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleMakeCashier = (userId, name) => {
    setConfirmModal({
      isOpen: true,
      title: "Appoint Cashier",
      message: `Appoint ${name} as Cashier?\n(Current Cashier will be demoted)`,
      type: "info",
      onConfirm: async () => {
        const currentCashier = boardersList.find(
          (b) => b.roles?.role_name === "Cashier",
        );
        if (currentCashier) {
          const revertRole = currentCashier.prefect_title ? 2 : 1;
          await supabase
            .from("profiles")
            .update({ role_id: revertRole })
            .eq("id", currentCashier.id);
        }
        await supabase.from("profiles").update({ role_id: 5 }).eq("id", userId);
        fetchSuperintendentList();
        fetchUserData();
        showToast(`${name} is now the Cashier!`, "success");
        setConfirmModal({ isOpen: false });
      },
    });
  };

  const handleAddNotice = () => {
    setPromptModal({
      isOpen: true,
      title: "Update Notice Board",
      message: "Enter your new notice message below:",
      inputValue: "",
      onConfirm: async (msg) => {
        if (msg.trim()) {
          await supabase
            .from("notices")
            .insert([{ title: `${roleName} Update`, message: msg }]);
          fetchNotice();
          showToast("Notice updated successfully!", "success");
        }
        setPromptModal({ isOpen: false });
      },
    });
  };

  if (loading)
    return (
      <>
        <UpdatePasswordModal />
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <i className="fas fa-circle-notch fa-spin text-4xl text-emerald-500"></i>
        </div>
      </>
    );

  const roleName = profile?.roles?.role_name || "Boarder";
  const isSuperintendent = roleName === "Superintendent";
  const isPrefect = roleName === "Prefect Committee";
  const isManager = roleName === "Manager";
  const isCashier = roleName === "Cashier";
  const isMaintenance = isPrefect && profile?.prefect_title === "Maintenance";
  const isMessPrefect = isPrefect && profile?.prefect_title === "Mess Prefect";
  const isAuditor = isPrefect && profile?.prefect_title === "Auditor";

  const canApproveNew = isSuperintendent || isMaintenance;
  const canRejectNew = isSuperintendent;
  const canSuspendActive = isSuperintendent;
  const canSeeStats = !isSuperintendent;
  const canViewMealList = true;
  const canLogMeals = isManager || isCashier || isMessPrefect;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const displayedNotices = isSuperintendent
    ? notices
    : notices.filter((n) => new Date(n.created_at) > twentyFourHoursAgo);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-500 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-cyan-500/5 pointer-events-none z-0"></div>

      <NewAuditWidget
        isSuperintendent={isSuperintendent}
        setActiveTab={setActiveTab}
      />
      <SupplierWidget profile={profile} />

      <DashboardNavbar
        profile={profile}
        roleName={roleName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowProfileModal={setShowProfileModal}
      />

      <div className="flex-1 max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-12 relative z-10 w-full">
        {activeTab === "home" ? (
          <>
            <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fas fa-bullhorn text-rose-500"></i> Notice Board
                </h3>

                {(isSuperintendent || isPrefect) && (
                  <button
                    onClick={handleAddNotice}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Add New Notice
                  </button>
                )}
              </div>

              {displayedNotices.length === 0 ? (
                <p className="text-slate-500 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  No new notices currently available.
                </p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {displayedNotices.map((noticeItem) => {
                    const isExpired =
                      new Date(noticeItem.created_at) < twentyFourHoursAgo;

                    return (
                      <div
                        key={noticeItem.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isExpired
                            ? "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-80"
                            : "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`font-bold ${isExpired ? "text-slate-600 dark:text-slate-400" : "text-rose-700 dark:text-rose-400"}`}
                          >
                            {noticeItem.title}
                          </h4>
                          {isSuperintendent && isExpired && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                              Expired
                            </span>
                          )}
                          {isSuperintendent && !isExpired && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              Live
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm font-medium ${isExpired ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-300"}`}
                        >
                          {noticeItem.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-2">
                          <i className="far fa-clock"></i>
                          {new Date(noticeItem.created_at).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8 items-start">
              {isSuperintendent ? (
                <div className="xl:col-span-5 flex flex-col gap-6">
                  <ProfilePanel
                    profile={profile}
                    roleName={roleName}
                    isSuperintendent={isSuperintendent}
                    fetchUserData={fetchUserData}
                    onEditClick={() => setShowEditProfile(true)}
                    onViewHistory={() => setShowHistoryModal(true)}
                  />
                  <HostelSlideshow />
                </div>
              ) : (
                <>
                  <div className="xl:col-span-3 flex flex-col gap-6">
                    <HostelSlideshow />
                    <ManagerBanner
                      managersInfo={managersInfo}
                      cashierInfo={cashierInfo}
                    />
                  </div>

                  <div className="xl:col-span-2 flex flex-col gap-6">
                    <MealControl
                      profile={profile}
                      roleName={roleName}
                      isMealUpdating={isMealUpdating}
                      toggleMealStatus={toggleMealStatus}
                      onOpenGuestHistory={() => setShowGuestLogModal(true)}
                    />
                  </div>
                </>
              )}
            </div>

            {canSeeStats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 bg-emerald-500 dark:bg-slate-800 rounded-3xl shadow-lg border border-emerald-400 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center text-white h-full min-h-[320px]">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-100 dark:text-slate-400 mb-2">
                    Total Meal / Total Boarders
                  </h2>
                  <p className="text-4xl md:text-5xl font-black drop-shadow-md">
                    {mealStats ? mealStats.totalMeal : 0}{" "}
                    <span className="text-2xl md:text-3xl opacity-75">
                      / {mealStats ? mealStats.totalBoarders : 0}
                    </span>
                  </p>
                  <div className="flex flex-col gap-3 justify-center z-10 mt-6 w-full">
                    <button
                      onClick={fetchManagerStats}
                      className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      <i className="fas fa-sync-alt mr-2"></i> Refresh Count
                    </button>
                    {canViewMealList && (
                      <button
                        onClick={() => setShowMealModal(true)}
                        className="w-full py-2.5 bg-slate-900 text-white dark:bg-emerald-400 dark:text-slate-900 rounded-lg text-sm font-black transition-all hover:scale-105 shadow-md"
                      >
                        <i className="fas fa-list-ul mr-2"></i> View Detailed
                        Meal List
                      </button>
                    )}
                  </div>
                </div>

                {canViewMealList && (
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-[320px] max-h-[400px] overflow-hidden">
                    <div className="bg-amber-50 dark:bg-amber-900/20 px-6 py-5 border-b border-amber-100 dark:border-amber-900/50 flex justify-between items-center sticky top-0 z-10">
                      <h3 className="text-lg font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                        <i className="fas fa-user-plus"></i> Live Guest Meals
                      </h3>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowGuestLogModal(true)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-200/50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30 text-[10px] font-black uppercase tracking-wider transition-all border border-amber-300/50 dark:border-amber-500/30 shadow-sm hover:scale-105"
                          title="View Past 3 Months Log"
                        >
                          <i className="fas fa-history"></i> Log History
                        </button>

                        <span className="bg-amber-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                          {activeGuests.length} Hosts
                        </span>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 custom-scrollbar">
                      {activeGuests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400 min-h-[200px]">
                          <i className="fas fa-user-friends text-5xl mb-4 opacity-30"></i>
                          <p className="font-bold text-base">
                            No active guest meals right now.
                          </p>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950/90 backdrop-blur-md shadow-sm z-10">
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                              <th className="p-4 pl-6 font-bold text-xs text-slate-500 uppercase">
                                Host Details
                              </th>
                              <th className="p-4 pr-6 font-bold text-xs text-slate-500 uppercase">
                                Guest Preference
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeGuests.map((g, idx) => (
                              <tr
                                key={`guest-${idx}`}
                                className="border-b border-slate-50 dark:border-slate-800/50"
                              >
                                <td className="p-4 pl-6">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                                      {g.full_name}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-3">
                                      <span>
                                        Room:{" "}
                                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                          {g.room_no || "N/A"}
                                        </span>
                                      </span>
                                      {g.mobile_number ? (
                                        <a
                                          href={`tel:${g.mobile_number}`}
                                          className="text-indigo-500 dark:text-indigo-400 hover:underline"
                                        >
                                          <i className="fas fa-phone-alt opacity-70"></i>{" "}
                                          {g.mobile_number}
                                        </a>
                                      ) : (
                                        <span>No Phone</span>
                                      )}
                                    </span>

                                    {/* 🔥 UPDATED TOTAL COUNT HERE */}
                                    <span className="mt-0.5 inline-flex items-center text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 w-fit shadow-sm">
                                      <i className="fas fa-users mr-1.5 opacity-70"></i>{" "}
                                      Total Guest Meals:{" "}
                                      {(g.guest_veg_count || 0) +
                                        (g.guest_paneer_count || 0) +
                                        (g.guest_egg_count || 0) +
                                        (g.guest_fish_count || 0) +
                                        (g.guest_chicken_count || 0)}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 pr-6">
                                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                                    {g.guest_veg_count > 0 && (
                                      <span className="px-2 py-1 rounded border text-emerald-600 bg-emerald-50/50 border-emerald-200 dark:bg-transparent dark:border-emerald-500/20">
                                        Veg: {g.guest_veg_count}
                                      </span>
                                    )}
                                    {/* 🔥 ADDED PANEER BADGE HERE */}
                                    {g.guest_paneer_count > 0 && (
                                      <span className="px-2 py-1 rounded border text-yellow-600 bg-yellow-50/50 border-yellow-200 dark:bg-transparent dark:border-yellow-500/20">
                                        Paneer: {g.guest_paneer_count}
                                      </span>
                                    )}
                                    {g.guest_egg_count > 0 && (
                                      <span className="px-2 py-1 rounded border text-orange-600 bg-orange-50/50 border-orange-200 dark:bg-transparent dark:border-orange-500/20">
                                        Egg: {g.guest_egg_count}
                                      </span>
                                    )}
                                    {g.guest_fish_count > 0 && (
                                      <span className="px-2 py-1 rounded border text-blue-600 bg-blue-50/50 border-blue-200 dark:bg-transparent dark:border-blue-500/20">
                                        Fish: {g.guest_fish_count}
                                      </span>
                                    )}
                                    {g.guest_chicken_count > 0 && (
                                      <span className="px-2 py-1 rounded border text-rose-600 bg-rose-50/50 border-rose-200 dark:bg-transparent dark:border-rose-500/20">
                                        Chicken: {g.guest_chicken_count}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {canSeeStats && (
              <>
                {canLogMeals && <MealLogger isManager={isManager} />}
                <KitchenReport
                  mealStats={mealStats}
                  loadingList={loadingList}
                />
              </>
            )}

            <div id="directory">
              {(isSuperintendent || isPrefect) && (
                <HostelDirectory
                  boardersList={boardersList}
                  loadingList={loadingList}
                  isSuperintendent={isSuperintendent}
                  isMessPrefect={isMessPrefect}
                  canApproveNew={canApproveNew}
                  canRejectNew={canRejectNew}
                  canSuspendActive={canSuspendActive}
                  onRefresh={fetchSuperintendentList}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  handleSuspend={handleSuspend}
                  handleMakePrefect={handleMakePrefect}
                  handleMakeBoarder={handleMakeBoarder}
                  handleMakeManager={handleMakeManager}
                  handleMakeCashier={handleMakeCashier}
                />
              )}
            </div>
          </>
        ) : (
          <UserDashboard profile={profile} setActiveTab={setActiveTab} />
        )}

        <GuestMealLogModal
          isOpen={showGuestLogModal}
          onClose={() => setShowGuestLogModal(false)}
        />
        <MealViewerModal
          isOpen={showMealModal}
          onClose={() => setShowMealModal(false)}
          isManager={isManager}
          isMessPrefect={isMessPrefect}
          isAuditor={isAuditor}
        />
        <PrefectCommittee />
      </div>

      <div
        className={`fixed bottom-6 right-6 z-[120] px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3 text-white transition-all duration-300 transform ${toast.show ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"} ${toast.type === "error" ? "bg-rose-500" : toast.type === "warning" ? "bg-amber-500" : "bg-emerald-500"}`}
      >
        <i
          className={`fas ${toast.type === "error" ? "fa-exclamation-circle" : toast.type === "warning" ? "fa-exclamation-triangle" : "fa-check-circle"}`}
        ></i>{" "}
        {toast.message}
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative border border-slate-200 dark:border-slate-800 text-center transform scale-100 transition-transform">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${confirmModal.type === "danger" ? "bg-rose-100 text-rose-500 dark:bg-rose-500/20" : confirmModal.type === "warning" ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20" : "bg-indigo-100 text-indigo-500 dark:bg-indigo-500/20"}`}
            >
              <i
                className={`fas text-2xl ${confirmModal.type === "danger" ? "fa-trash-alt" : confirmModal.type === "warning" ? "fa-exclamation-triangle" : "fa-question-circle"}`}
              ></i>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {confirmModal.title}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 whitespace-pre-wrap">
              {confirmModal.message}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false })}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-colors ${confirmModal.type === "danger" ? "bg-rose-500 hover:bg-rose-600" : confirmModal.type === "warning" ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-500 hover:bg-indigo-600"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {promptModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl relative border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {promptModal.title}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
              {promptModal.message}
            </p>

            <textarea
              rows="5"
              value={promptModal.inputValue}
              onChange={(e) =>
                setPromptModal({ ...promptModal, inputValue: e.target.value })
              }
              className="w-full px-4 py-3 mb-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium resize-y min-h-[120px] custom-scrollbar"
              placeholder="Type your notice here... (Press Enter for new line)"
              autoFocus
            ></textarea>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPromptModal({ isOpen: false })}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => promptModal.onConfirm(promptModal.inputValue)}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md transition-colors"
              >
                Publish Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {prefectModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Assign Prefect Role
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              Select a designated role for{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {prefectModal.userName}
              </span>
              :
            </p>
            <div className="mb-6 relative">
              <label className="absolute -top-2 left-3 text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-1">
                Select Role
              </label>
              <select
                value={prefectModal.selectedRole}
                onChange={(e) =>
                  setPrefectModal({
                    ...prefectModal,
                    selectedRole: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white font-bold cursor-pointer appearance-none"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Mess Prefect">Mess Prefect</option>
                <option value="Auditor">Auditor</option>
                <option value="Game Prefect">Game Prefect</option>
                <option value="Garden Prefect">Garden Prefect</option>
                <option value="Cultural Prefect">Cultural Prefect</option>
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setPrefectModal({
                    isOpen: false,
                    userId: null,
                    userName: "",
                    selectedRole: "Maintenance",
                  })
                }
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMakePrefect}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL (For Non-Superintendents) */}
      {!isSuperintendent && showProfileModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute -top-4 -right-4 md:-top-6 md:-right-6 z-10 bg-rose-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 hover:scale-110 transition-all border-2 border-white dark:border-slate-900"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="shadow-2xl rounded-3xl overflow-hidden">
              <ProfilePanel
                profile={profile}
                roleName={roleName}
                isSuperintendent={isSuperintendent}
                fetchUserData={fetchUserData}
                onEditClick={() => {
                  setShowProfileModal(false);
                  setShowEditProfile(true);
                }}
                onViewHistory={() => {
                  setShowProfileModal(false);
                  setShowHistoryModal(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        fetchProfile={fetchUserData}
      />

      <MyMealHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        profileId={profile?.id}
        roleName={roleName}
        prefectTitle={profile?.prefect_title}
      />
      <UpdatePasswordModal />
      <Footer />
    </div>
  );
}
