"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Users, Package, LogOut, Plus, Trash2, ChevronRight } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Form States
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("Chef");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, "users"), orderBy("createdAt", "desc")), (snap) => {
      setEmployees(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubInv = onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubUsers(); unsubInv(); };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const addEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), { name: empName, role: empRole, status: "Active", createdAt: serverTimestamp() });
      setEmpName("");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const addInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inventory"), { itemName, quantity: Number(quantity), unit, createdAt: serverTimestamp() });
      setItemName(""); setQuantity("");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const deleteEntry = async (col, id) => {
    if(confirm("Confirm Delete?")) await deleteDoc(doc(db, col, id));
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex font-sans text-gray-800">
      
      {/* SIDEBAR (Desktop Split Logic) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#D9480F] to-[#FF6B3F] text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static flex flex-col shadow-2xl
      `}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-3xl font-extrabold tracking-tight italic">Bonomaya</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">Smart Admin</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 font-bold transition-all border border-white/5 shadow-lg">
            <span className="flex items-center gap-4"><LayoutDashboard size={20}/> Dashboard</span>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 font-semibold transition-all opacity-80">
            <Package size={20}/> Inventory
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 font-semibold transition-all opacity-80">
            <Users size={20}/> Team Management
          </button>
        </nav>

        <div className="p-6">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-bold text-sm">
            <LogOut size={18}/> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md p-5 flex justify-between items-center sticky top-0 z-40 border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[#D9480F]"><Menu/></button>
            <h2 className="text-xl font-bold text-gray-700 hidden md:block">System Overview</h2>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 p-2 pr-6 rounded-full border border-gray-200">
            <div className="w-9 h-9 bg-gradient-to-r from-[#D9480F] to-[#FF6B3F] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md">M</div>
            <div className="text-xs">
              <p className="font-bold text-gray-800 tracking-tighter">Masum Billah</p>
              <p className="text-[#D9480F] font-semibold uppercase tracking-widest text-[8px]">DIU Maverick</p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 md:p-10 space-y-8 pb-24">
          
          {/* Stats Cards (White shadow style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6">
              <div className="w-14 h-14 bg-[#FFF8F0] rounded-2xl flex items-center justify-center text-[#D9480F] shadow-inner"><Users size={28}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Team</p>
                <p className="text-3xl font-black text-gray-800">{employees.length}</p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-6">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner"><Package size={28}/></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Low Supply</p>
                <p className={`text-3xl font-black ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                  {inventory.filter(i => i.quantity < 10).length}
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#D9480F] p-8 rounded-2xl shadow-2xl shadow-[#D9480F]/20 text-white flex items-center gap-6">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center"><LayoutDashboard size={28}/></div>
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Status</p>
                <p className="text-2xl font-black italic tracking-tighter uppercase">Live Sync</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Forms - Matching Login Inputs */}
            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-sm font-black text-[#D9480F] uppercase tracking-[0.2em] mb-8 border-b pb-4">Add New Employee</h3>
              <form onSubmit={addEmployee} className="space-y-5">
                <input type="text" placeholder="Member Name" required value={empName} onChange={e => setEmpName(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#D9480F]/40 focus:border-[#D9480F] outline-none font-semibold text-sm transition-all" />
                <select value={empRole} onChange={e => setEmpRole(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#D9480F] outline-none font-semibold text-sm text-gray-600 bg-white">
                  <option value="Chef">Chef (শেফ)</option>
                  <option value="Manager">Manager (ম্যানেজার)</option>
                  <option value="Salesman">Salesman (বিক্রয়কর্মী)</option>
                </select>
                <button disabled={loading} className="w-full p-4 rounded-xl bg-[#D9480F] text-white font-bold uppercase tracking-widest shadow-lg shadow-[#D9480F]/20 active:scale-95 transition-all text-xs">Confirm Entry</button>
              </form>
            </section>

            <section className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
              <h3 className="text-sm font-black text-[#D9480F] uppercase tracking-[0.2em] mb-8 border-b pb-4">Refill Inventory</h3>
              <form onSubmit={addInventory} className="space-y-5">
                <input type="text" placeholder="Item Name" required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#D9480F] outline-none font-semibold text-sm transition-all" />
                <div className="flex gap-4">
                  <input type="number" placeholder="Qty" required value={quantity} onChange={e => setQuantity(e.target.value)} className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-[#D9480F] outline-none font-semibold text-sm transition-all" />
                  <select value={unit} onChange={e => setUnit(e.target.value)} className="w-28 p-4 rounded-xl border border-gray-200 font-bold text-xs bg-white text-gray-500 uppercase tracking-widest">
                    <option value="kg">KG</option>
                    <option value="pcs">Pcs</option>
                    <option value="ltr">Ltr</option>
                  </select>
                </div>
                <button disabled={loading} className="w-full p-4 rounded-xl bg-gray-800 text-white font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-all text-xs">Update Stock</button>
              </form>
            </section>
          </div>

          {/* Table Feed (Clean Split Logic) */}
          <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-10">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Live Inventory Feed</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-200"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 p-8">
              {inventory.map((item) => (
                <div key={item.id} className="relative group p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center hover:bg-white hover:shadow-xl transition-all duration-300">
                  <button onClick={() => deleteEntry("inventory", item.id)} className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">{item.itemName}</p>
                  <p className={`text-2xl font-black ${item.quantity < 10 ? 'text-red-500' : 'text-gray-800'}`}>{item.quantity} <span className="text-[10px] opacity-40 uppercase">{item.unit}</span></p>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[10px] pb-10 uppercase tracking-widest">
          Designed for Bonomaya Logistics • Maverick
        </p>
      </div>

      {/* Mobile Close Logic Overlay */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
      )}
    </div>
  );
}