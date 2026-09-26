import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function SupplierWidget({ profile }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    category: "Vegetable Supplier",
    phone: "",
  });

  const roleName = profile?.roles?.role_name;
  // Mess Prefect ba Superintendent dutor je keu manage korte parbe
  const canManage =
    (roleName === "Prefect Committee" &&
      profile?.prefect_title === "Mess Prefect") ||
    roleName === "Superintendent";

  const categoriesList = [
    "Vegetable Supplier",
    "Fish Supplier",
    "Grocery Supplier",
    "Hostel Staff",
    "Other Officials",
    "Meat Supplier",
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("supplier_contacts")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      if (data) setContacts(data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (formData.id) {
        await supabase
          .from("supplier_contacts")
          .update({
            name: formData.name,
            category: formData.category,
            phone: formData.phone,
          })
          .eq("id", formData.id);
      } else {
        await supabase.from("supplier_contacts").insert([
          {
            name: formData.name,
            category: formData.category,
            phone: formData.phone,
          },
        ]);
      }
      setShowModal(false);
      setFormData({
        id: null,
        name: "",
        category: "Vegetable Supplier",
        phone: "",
      });
      fetchContacts();
    } catch (error) {
      console.error("Error saving contact:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      await supabase.from("supplier_contacts").delete().eq("id", id);
      fetchContacts();
    }
  };

  // Group contacts by category
  const groupedContacts = contacts.reduce((acc, contact) => {
    if (!acc[contact.category]) acc[contact.category] = [];
    acc[contact.category].push(contact);
    return acc;
  }, {});

  return (
    <>
      {/* Backdrop for closing when clicked outside */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[250] bg-transparent"
          onClick={() => setIsExpanded(false)}
        ></div>
      )}

      {/* Left-side Floating Widget */}
      <div
        className={`fixed top-1/3 left-0 z-[260] transition-transform duration-300 ease-out flex ${isExpanded ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Expanded Panel */}
        <div className="bg-white dark:bg-slate-900 border-r-4 border-indigo-500 shadow-[10px_10px_30px_rgba(0,0,0,0.15)] rounded-r-2xl p-5 w-72 md:w-80 relative flex flex-col max-h-[70vh]">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-4 text-slate-400 hover:text-indigo-500 transition-colors z-10"
          >
            <i className="fas fa-times text-lg"></i>
          </button>

          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-address-book"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                Hostel Contacts
              </h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Suppliers & Staff
              </p>
            </div>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 shrink-0 space-y-4 pr-2">
            {Object.keys(groupedContacts).length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">
                No contacts added yet.
              </div>
            ) : (
              Object.keys(groupedContacts).map((category) => (
                <div key={category} className="mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {groupedContacts[category].map((contact) => (
                      <div
                        key={contact.id}
                        className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {contact.name}
                          </p>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5"
                          >
                            <i className="fas fa-phone-alt text-[9px]"></i>{" "}
                            {contact.phone}
                          </a>
                        </div>
                        {canManage && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setFormData(contact);
                                setShowModal(true);
                              }}
                              className="text-slate-400 hover:text-emerald-500 transition-colors"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Button for Mess Prefect */}
          {canManage && (
            <button
              onClick={() => {
                setFormData({
                  id: null,
                  name: "",
                  category: "Vegetable Supplier",
                  phone: "",
                });
                setShowModal(true);
              }}
              className="mt-4 shrink-0 w-full py-2.5 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> Add New Contact
            </button>
          )}
        </div>

        {/* Handle to click & open (Placed on the right side of the hidden panel) */}
        <button
          onClick={() => setIsExpanded(true)}
          className={`absolute left-full top-4 bg-indigo-500 text-white py-4 px-2 rounded-r-xl shadow-[4px_4px_10px_rgba(99,102,241,0.3)] flex flex-col items-center gap-2 transition-opacity duration-200 ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100 hover:pl-3"}`}
        >
          <i className="fas fa-address-book"></i>
          <span
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          >
            Contacts
          </span>
        </button>
      </div>

      {/* Add/Edit Modal (Only accessible by Mess Prefect) */}
      {showModal && canManage && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-address-book text-indigo-500"></i>{" "}
                {formData.id ? "Edit Contact" : "Add Contact"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-rose-500"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Contact Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Supplier Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white cursor-pointer"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Phone Number
                </label>

                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                  placeholder="10-digit number"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black hover:shadow-lg disabled:opacity-50 transition-colors"
                >
                  {isSaving ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Save Contact"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
