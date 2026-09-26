import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function UserDashboard({ profile, setActiveTab }) {
  const isSuperintendent = profile?.roles?.role_name === "Superintendent";

  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [paymentData, setPaymentData] = useState({
    amount: "",
    transactionId: "",
  });
  const [pendingAmount, setPendingAmount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // 🔥 Live Due State for Self-Healing
  const [liveDue, setLiveDue] = useState(0);

  // EDIT AUDIT STATES
  const [editAuditData, setEditAuditData] = useState({
    isOpen: false,
    id: null,
    month: "",
    year: "",
    fixedCharge: "",
    totalExpense: "",
    extraNote: "",
    oldCharge: 0,
  });
  const [isEditingAudit, setIsEditingAudit] = useState(false);

  // CUSTOM FEEDBACK & CONFIRM MODAL STATE
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
    onConfirm: null,
  });

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear().toString();

  const [auditData, setAuditData] = useState({
    month: currentMonth,
    year: currentYear,
    fixedCharge: "",
    totalExpense: "",
    extraNote: "",
  });

  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentY = currentDate.getFullYear();
  const yearsList = Array.from({ length: 6 }, (_, i) =>
    (currentY - 1 + i).toString(),
  );

  useEffect(() => {
    if (profile?.id) {
      setLiveDue(Number(profile.total_due) || 0);

      fetchAuditHistory();

      if (isSuperintendent) {
        fetchPendingApprovals();
      } else {
        fetchPendingPayments();
        fetchPaymentHistory();
      }
    }
  }, [profile, isSuperintendent]);

  // 🔥 SELF-HEALING FUNCTION: Auto-calculate and sync exact due
  const checkAndSyncDue = async (applicableAudits) => {
    try {
      const { data: approvedPayments, error } = await supabase
        .from("payment_requests")
        .select("amount")
        .eq("boarder_id", profile.id)
        .eq("status", "approved");

      if (error) throw error;

      let totalPaid = 0;
      if (approvedPayments) {
        approvedPayments.forEach((p) => {
          totalPaid += Number(p.amount) || 0;
        });
      }

      let totalCharges = 0;
      applicableAudits.forEach((audit) => {
        totalCharges += Number(audit.fixed_charge) || 0;
      });

      const exactDue = totalCharges - totalPaid;

      // Jodi backend er due ar ashol due na mele tahole theek kore debe
      if (Number(profile.total_due) !== exactDue) {
        await supabase
          .from("profiles")
          .update({ total_due: exactDue })
          .eq("id", profile.id);
        setLiveDue(exactDue);
      }
    } catch (err) {
      console.error("Sync Due Error:", err);
    }
  };

  const fetchAuditHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        if (isSuperintendent) {
          setAuditHistory(data);
        } else {
          // 🔥 HIDDEN OLD AUDITS: Filter applicable audits based on admission_date
          const joinDateStr = profile.admission_date || profile.created_at;
          const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
          const userYear = joinDate.getFullYear();
          const userMonth = joinDate.getMonth();

          const applicableAudits = data.filter((audit) => {
            const auditDate = new Date(`${audit.month} 1, ${audit.year}`);
            const auditYear = auditDate.getFullYear();
            const auditMonth = auditDate.getMonth();
            // Boarder join korar mashe ba tar porer audit guloi shudhu asbe
            return (
              auditYear > userYear ||
              (auditYear === userYear && auditMonth >= userMonth)
            );
          });

          setAuditHistory(applicableAudits);
          checkAndSyncDue(applicableAudits); // Call self-healing
        }
      }
    } catch (error) {
      console.error("Error fetching audit history:", error);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_requests")
        .select("*")
        .eq("boarder_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPaymentHistory(data);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_requests")
        .select(
          `
          id, amount, transaction_id, created_at, boarder_id,
          profiles (full_name, room_no, total_due)
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) setPendingApprovals(data);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    }
  };

  const handleApprovePayment = (request) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      title: "Approve Payment",
      message: `Are you sure you want to approve the payment of ₹${request.amount} for ${request.profiles?.full_name}?`,
      onConfirm: async () => {
        try {
          const currentDue = Number(request.profiles?.total_due) || 0;
          const paidAmount = Number(request.amount) || 0;
          const newDue = currentDue - paidAmount;

          await supabase
            .from("payment_requests")
            .update({ status: "approved" })
            .eq("id", request.id);
          await supabase
            .from("profiles")
            .update({ total_due: newDue })
            .eq("id", request.boarder_id);

          setFeedbackModal({
            isOpen: true,
            type: "success",
            title: "Payment Approved",
            message:
              "The payment has been successfully approved and balance updated.",
            onConfirm: null,
          });
          fetchPendingApprovals();
        } catch (error) {
          setFeedbackModal({
            isOpen: true,
            type: "error",
            title: "Approval Failed",
            message:
              "There was an error approving the payment. Please try again.",
            onConfirm: null,
          });
          console.error(error);
        }
      },
    });
  };

  const handleRejectPayment = (id) => {
    setFeedbackModal({
      isOpen: true,
      type: "confirm",
      title: "Reject Payment",
      message: "Are you sure you want to REJECT this payment request?",
      onConfirm: async () => {
        try {
          await supabase
            .from("payment_requests")
            .update({ status: "rejected" })
            .eq("id", id);
          setFeedbackModal({
            isOpen: false,
            title: "",
            message: "",
            type: "",
            onConfirm: null,
          });
          fetchPendingApprovals();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const fetchPendingPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_requests")
        .select("amount")
        .eq("boarder_id", profile.id)
        .eq("status", "pending");

      if (error) throw error;
      if (data) {
        const totalPending = data.reduce(
          (sum, req) => sum + Number(req.amount),
          0,
        );
        setPendingAmount(totalPending);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsPaying(true);
    try {
      const { error } = await supabase.from("payment_requests").insert([
        {
          boarder_id: profile.id,
          amount: Number(paymentData.amount),
          transaction_id: paymentData.transactionId,
        },
      ]);

      if (error) throw error;

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Request Sent Successfully",
        message:
          "Your payment request has been sent! Superintendent will approve it soon.",
        onConfirm: null,
      });

      setShowPaymentModal(false);
      setPaymentData({ amount: "", transactionId: "" });
      fetchPendingPayments();
      fetchPaymentHistory();
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Submission Failed",
        message: "Error submitting payment request. Please try again.",
        onConfirm: null,
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handlePublishAudit = async (e) => {
    e.preventDefault();

    const isDuplicate = auditHistory.some(
      (audit) =>
        audit.month === auditData.month && audit.year === auditData.year,
    );

    if (isDuplicate) {
      setShowAuditModal(false);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Audit Already Exists",
        message: `An audit for ${auditData.month} ${auditData.year} has already been published. You can edit it from the Audit History panel instead.`,
        onConfirm: null,
      });
      return;
    }

    setIsPublishing(true);

    const chargeAmount = Number(auditData.fixedCharge) || 0;
    const expenseAmount = Number(auditData.totalExpense) || 0;

    const auditDate = new Date(`${auditData.month} 1, ${auditData.year}`);
    const auditYear = auditDate.getFullYear();
    const auditMonth = auditDate.getMonth();

    try {
      const { error: historyError } = await supabase
        .from("audit_history")
        .insert([
          {
            month: auditData.month,
            year: auditData.year,
            fixed_charge: chargeAmount,
            total_expense: expenseAmount,
            extra_note: auditData.extraNote,
          },
        ]);

      if (historyError) throw historyError;

      const { data: users, error: fetchError } = await supabase
        .from("profiles")
        .select("id, total_due, role_id, admission_date, created_at")
        .eq("is_approved", true);

      if (fetchError) throw fetchError;

      if (users && users.length > 0) {
        const boardersToUpdate = users.filter((u) => {
          if (u.role_id === 3) return false;

          const joinDateStr = u.admission_date || u.created_at;
          const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
          const userYear = joinDate.getFullYear();
          const userMonth = joinDate.getMonth();

          return (
            auditYear > userYear ||
            (auditYear === userYear && auditMonth >= userMonth)
          );
        });

        const updatePromises = boardersToUpdate.map((u) => {
          const currentDue = Number(u.total_due) || 0;
          const newDue = currentDue + chargeAmount;
          return supabase
            .from("profiles")
            .update({ total_due: newDue })
            .eq("id", u.id);
        });
        await Promise.all(updatePromises);
      }

      setShowAuditModal(false);

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Audit Published",
        message: `Audit published successfully! ₹${chargeAmount} has been added to the eligible boarders' accounts.`,
        onConfirm: () => window.location.reload(),
      });
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Action Failed",
        message: "Error publishing audit. Please try again.",
        onConfirm: null,
      });
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEditAuditSubmit = async (e) => {
    e.preventDefault();
    setIsEditingAudit(true);

    const newCharge = Number(editAuditData.fixedCharge) || 0;
    const oldCharge = Number(editAuditData.oldCharge) || 0;
    const chargeDifference = newCharge - oldCharge;
    const expenseAmount = Number(editAuditData.totalExpense) || 0;

    const auditDate = new Date(
      `${editAuditData.month} 1, ${editAuditData.year}`,
    );
    const auditYear = auditDate.getFullYear();
    const auditMonth = auditDate.getMonth();

    try {
      const { error: updateError } = await supabase
        .from("audit_history")
        .update({
          fixed_charge: newCharge,
          total_expense: expenseAmount,
          extra_note: editAuditData.extraNote,
        })
        .eq("id", editAuditData.id);

      if (updateError) throw updateError;

      if (chargeDifference !== 0) {
        const { data: users, error: fetchError } = await supabase
          .from("profiles")
          .select("id, total_due, role_id, admission_date, created_at")
          .eq("is_approved", true);

        if (fetchError) throw fetchError;

        if (users && users.length > 0) {
          const boardersToUpdate = users.filter((u) => {
            if (u.role_id === 3) return false;

            const joinDateStr = u.admission_date || u.created_at;
            const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
            const userYear = joinDate.getFullYear();
            const userMonth = joinDate.getMonth();

            return (
              auditYear > userYear ||
              (auditYear === userYear && auditMonth >= userMonth)
            );
          });

          const updatePromises = boardersToUpdate.map((u) => {
            const currentDue = Number(u.total_due) || 0;
            const newDue = currentDue + chargeDifference;
            return supabase
              .from("profiles")
              .update({ total_due: newDue })
              .eq("id", u.id);
          });
          await Promise.all(updatePromises);
        }
      }

      setEditAuditData({ ...editAuditData, isOpen: false });

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Audit Updated",
        message: `Audit for ${editAuditData.month} ${editAuditData.year} updated successfully! Due balances adjusted by ₹${chargeDifference} for eligible boarders.`,
        onConfirm: () => window.location.reload(),
      });
    } catch (error) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Error updating audit. Please try again.",
        onConfirm: null,
      });
      console.error(error);
    } finally {
      setIsEditingAudit(false);
    }
  };

  // 🔥 Using liveDue for Boarder's UI
  const numericDue = Number(liveDue) || 0;
  const isAdvance = numericDue <= 0;
  const displayDue = Math.abs(numericDue);

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-200 font-sans animate-fade-in-up mb-12">
      {/* 🔙 Header */}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <div>
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors font-bold mb-2"
          >
            <i className="fas fa-arrow-left"></i> Back to Main Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">
            {isSuperintendent ? "Admin " : "My "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-cyan-400 dark:to-blue-500">
              {isSuperintendent ? "Approvals" : "Overview"}
            </span>
          </h1>
        </div>

        {isSuperintendent && (
          <button
            onClick={() => setShowAuditModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
          >
            <i className="fas fa-file-invoice-dollar"></i>
            <span className="hidden sm:inline">Publish Audit Sheet</span>
          </button>
        )}
      </div>

      {/* ================= CONDITION 1: SUPERINTENDENT VIEW ================= */}
      {isSuperintendent ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[550px]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
                <i className="fas fa-check-double"></i>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Pending Payment Requests
                </h2>
                <p className="text-xs font-bold text-slate-500">
                  Approve to deduct from boarder's balance
                </p>
              </div>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <i className="fas fa-clipboard-check text-5xl text-emerald-500/30 mb-4"></i>
                <h3 className="text-lg font-bold text-slate-400">
                  All caught up!
                </h3>
                <p className="text-sm text-slate-500">
                  No pending payments to approve.
                </p>
              </div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                  {pendingApprovals.map((req) => {
                    const reqDue = Number(req.profiles?.total_due) || 0;
                    const reqIsAdvance = reqDue < 0;
                    const reqDisplayDue = Math.abs(reqDue);

                    return (
                      <div
                        key={req.id}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:border-indigo-300 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {req.profiles?.full_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              Room: {req.profiles?.room_no}
                            </span>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-slate-500 font-bold">
                              Transaction ID:
                            </p>
                            <p className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded mt-1">
                              {req.transaction_id}
                            </p>
                          </div>

                          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-800 border-dashed">
                            <div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Amount Paid
                              </p>
                              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                ₹{req.amount}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                {reqIsAdvance ? "Advance Bal" : "Remaining Due"}
                              </p>
                              <p
                                className={`text-sm font-black ${reqIsAdvance ? "text-emerald-500" : "text-rose-500"}`}
                              >
                                ₹{reqDisplayDue}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => handleRejectPayment(req.id)}
                            className="flex-1 py-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-500/10 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprovePayment(req)}
                            className="flex-[2] py-2 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 shadow-md font-bold text-xs transition-colors"
                          >
                            Approve Payment
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-[550px]">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
              <i className="fas fa-history text-indigo-500"></i> Audit History
            </h3>
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {auditHistory.length > 0 ? (
                auditHistory.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group"
                  >
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        {audit.month} {audit.year}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Expense: ₹{audit.total_expense}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg">
                        ₹{audit.fixed_charge}
                      </span>
                      <button
                        onClick={() =>
                          setEditAuditData({
                            isOpen: true,
                            id: audit.id,
                            month: audit.month,
                            year: audit.year,
                            fixedCharge: audit.fixed_charge,
                            totalExpense: audit.total_expense,
                            extraNote: audit.extra_note || "",
                            oldCharge: audit.fixed_charge,
                          })
                        }
                        className="text-slate-400 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                        title="Edit Audit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-sm font-medium">
                  No history found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= CONDITION 2: REGULAR BOARDER VIEW ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 dark:bg-cyan-900/20 rounded-bl-full -z-10"></div>
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl shadow-lg mb-6">
                <i className="fas fa-user-graduate"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                {profile?.full_name}
              </h2>
              <p className="text-emerald-600 dark:text-cyan-400 font-bold text-sm mb-6 uppercase tracking-wider">
                {profile?.prefect_title ||
                  profile?.roles?.role_name ||
                  "Boarder"}
              </p>

              <div className="space-y-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-door-open w-4"></i> Room No
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {profile?.room_no || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-phone-alt w-4"></i> Phone
                  </span>
                  {profile?.mobile_number ? (
                    <a
                      href={`tel:${profile.mobile_number}`}
                      className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      {profile.mobile_number}
                    </a>
                  ) : (
                    <span className="text-slate-900 dark:text-white">N/A</span>
                  )}
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-envelope w-4"></i> Email
                  </span>
                  {profile?.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-slate-900 dark:text-white hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate max-w-[150px] sm:max-w-[180px]"
                      title={profile.email}
                    >
                      {profile.email}
                    </a>
                  ) : (
                    <span className="text-slate-900 dark:text-white">N/A</span>
                  )}
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-graduation-cap w-4"></i> Course
                  </span>
                  <span className="text-slate-900 dark:text-white text-right">
                    {profile?.course || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-building w-4"></i> Department
                  </span>
                  <span className="text-slate-900 dark:text-white text-right">
                    {profile?.department || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="flex items-center gap-2">
                    <i className="fas fa-calendar-alt w-4"></i> Admission
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {profile?.admission_date
                      ? new Date(profile.admission_date).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )
                      : profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )
                        : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div
                className={`p-6 rounded-3xl shadow-lg border relative overflow-hidden group flex flex-col justify-between ${
                  isAdvance
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-700"
                    : "bg-gradient-to-br from-rose-500 to-red-600 border-rose-700"
                }`}
              >
                <i
                  className={`fas ${isAdvance ? "fa-check-circle" : "fa-exclamation-circle"} absolute -right-4 -bottom-4 text-6xl text-white/10 group-hover:scale-110 transition-transform`}
                ></i>
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${isAdvance ? "text-emerald-100" : "text-rose-100"}`}
                  >
                    {isAdvance
                      ? "Current Extra Payment"
                      : "Current Remaining Due"}
                  </p>
                  <h3 className="text-3xl font-black text-white mb-1 flex flex-wrap items-end gap-3">
                    ₹{displayDue}
                    {pendingAmount > 0 && (
                      <span className="text-[10px] bg-white/20 px-2 py-1 rounded-md text-white mb-1.5 whitespace-nowrap">
                        (₹{pendingAmount} Pending)
                      </span>
                    )}
                  </h3>
                  <p
                    className={`text-xs font-medium mb-4 ${isAdvance ? "text-emerald-100/80" : "text-rose-100/80"}`}
                  >
                    {isAdvance
                      ? "Advance balance in your account"
                      : "Total charges minus approved payments"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className={`w-full py-2 bg-white font-bold rounded-xl text-sm shadow-md transition-colors z-10 flex items-center justify-center gap-2 ${
                    isAdvance
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-rose-600 hover:bg-rose-50"
                  }`}
                >
                  <i className="fas fa-credit-card"></i> Submit Payment Info
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                <i className="fas fa-receipt absolute -right-4 -bottom-4 text-6xl text-slate-100 dark:text-slate-800 group-hover:scale-110 transition-transform"></i>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Latest Meal Charge
                </p>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                  {auditHistory.length > 0
                    ? `₹${auditHistory[0].fixed_charge}`
                    : "No Active Charge"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  {auditHistory.length > 0
                    ? `For ${auditHistory[0].month} ${auditHistory[0].year}`
                    : "Check back later"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-[380px]">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                  <i className="fas fa-history text-indigo-500"></i> Charge
                  History
                </h3>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                  {auditHistory.length > 0 ? (
                    auditHistory.map((audit) => (
                      <div
                        key={audit.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            {audit.month} {audit.year}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Expense: ₹{audit.total_expense}
                          </span>
                        </div>
                        <span className="text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg shadow-sm">
                          ₹{audit.fixed_charge}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-sm font-medium">
                      No history found.
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col h-[380px]">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
                  <i className="fas fa-wallet text-emerald-500"></i> Payment
                  History
                </h3>
                <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                      >
                        <div>
                          <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            ₹{payment.amount}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 font-mono">
                            Ref: {payment.transaction_id}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span
                            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
                              payment.status === "approved"
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                                : payment.status === "rejected"
                                  ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                                  : "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                            }`}
                          >
                            {payment.status}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-bold mt-1">
                            {new Date(payment.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 text-sm font-medium">
                      No payments found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODALS START HERE 🔥 */}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-credit-card text-emerald-500"></i> Clear
                Dues
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-rose-500"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: e.target.value })
                  }
                  placeholder="E.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Transaction ID / UPI Ref
                </label>
                <input
                  required
                  type="text"
                  value={paymentData.transactionId}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      transactionId: e.target.value,
                    })
                  }
                  placeholder="Enter Bank Ref No."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPaying}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black hover:shadow-lg disabled:opacity-50"
                >
                  {isPaying ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Submit for Approval"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT PUBLISH MODAL */}
      {showAuditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-file-invoice-dollar text-amber-500"></i>{" "}
                Publish Audit
              </h2>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-rose-500"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handlePublishAudit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Audit Month
                  </label>
                  <select
                    required
                    value={auditData.month}
                    onChange={(e) =>
                      setAuditData({ ...auditData, month: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white cursor-pointer"
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Audit Year
                  </label>
                  <select
                    required
                    value={auditData.year}
                    onChange={(e) =>
                      setAuditData({ ...auditData, year: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white cursor-pointer"
                  >
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Mess Charge/Dues (₹)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={auditData.fixedCharge}
                    onChange={(e) =>
                      setAuditData({
                        ...auditData,
                        fixedCharge: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Total Expense (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={auditData.totalExpense}
                    onChange={(e) =>
                      setAuditData({
                        ...auditData,
                        totalExpense: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Extra Note (Optional)
                </label>
                <textarea
                  rows="2"
                  value={auditData.extraNote}
                  onChange={(e) =>
                    setAuditData({ ...auditData, extraNote: e.target.value })
                  }
                  placeholder="Clear dues by..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-sm dark:text-white resize-none"
                ></textarea>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black hover:shadow-lg disabled:opacity-50"
                >
                  {isPublishing ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Publish Notice & Update Dues"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 EDIT AUDIT MODAL */}
      {editAuditData.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-edit text-indigo-500"></i> Edit Audit
              </h2>
              <button
                onClick={() =>
                  setEditAuditData({ ...editAuditData, isOpen: false })
                }
                className="text-slate-400 hover:text-rose-500"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <p className="text-xs font-bold text-rose-500 mb-4 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
              <i className="fas fa-info-circle"></i> Modifying the Mess Charge
              will automatically adjust every eligible boarder's Remaining Due
              based on the difference.
            </p>

            <form onSubmit={handleEditAuditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Audit Month
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editAuditData.month}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Audit Year
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editAuditData.year}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    New Mess Charge (₹)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editAuditData.fixedCharge}
                    onChange={(e) =>
                      setEditAuditData({
                        ...editAuditData,
                        fixedCharge: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    New Total Expense (₹)
                  </label>
                  <input
                    required
                    type="number"
                    value={editAuditData.totalExpense}
                    onChange={(e) =>
                      setEditAuditData({
                        ...editAuditData,
                        totalExpense: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Extra Note (Optional)
                </label>
                <textarea
                  rows="2"
                  value={editAuditData.extraNote}
                  onChange={(e) =>
                    setEditAuditData({
                      ...editAuditData,
                      extraNote: e.target.value,
                    })
                  }
                  placeholder="Clear dues by..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setEditAuditData({ ...editAuditData, isOpen: false })
                  }
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingAudit}
                  className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black hover:shadow-lg disabled:opacity-50 transition-colors"
                >
                  {isEditingAudit ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Save Updates"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 CUSTOM FEEDBACK MODAL */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative border border-slate-200 dark:border-slate-800 text-center animate-fade-in-up">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                feedbackModal.type === "error"
                  ? "bg-rose-100 text-rose-500 dark:bg-rose-500/20"
                  : feedbackModal.type === "confirm"
                    ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20"
                    : "bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20"
              }`}
            >
              <i
                className={`fas text-2xl ${
                  feedbackModal.type === "error"
                    ? "fa-exclamation-circle"
                    : feedbackModal.type === "confirm"
                      ? "fa-question-circle"
                      : "fa-check-circle"
                }`}
              ></i>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {feedbackModal.title}
            </h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6">
              {feedbackModal.message}
            </p>

            <div className="flex justify-center gap-3">
              {feedbackModal.type === "confirm" ? (
                <>
                  <button
                    onClick={() =>
                      setFeedbackModal({
                        isOpen: false,
                        title: "",
                        message: "",
                        type: "",
                        onConfirm: null,
                      })
                    }
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (feedbackModal.onConfirm) feedbackModal.onConfirm();
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md transition-colors"
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setFeedbackModal({
                      isOpen: false,
                      title: "",
                      message: "",
                      type: "",
                      onConfirm: null,
                    });
                    if (feedbackModal.onConfirm) feedbackModal.onConfirm();
                  }}
                  className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-colors ${
                    feedbackModal.type === "error"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
