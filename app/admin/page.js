"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { Menu, X, LayoutDashboard, Users, Package, LogOut, ClipboardList, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  
  // States
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [employees, setEmployees] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [inventory, setInventory] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile Sidebar State

  // রিয়েল-টাইমে ডেটা লোড
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), { name: empName, role: empRole, status: "Active", createdAt: serverTimestamp() });
      setEmpName("");
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inventory"), { itemName, quantity: Number(quantity), unit, createdAt: serverTimestamp() });
      setItemName(""); setQuantity("");
    } catch (error) { alert(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row font-sans text-slate-900">
      
      {/* --- Mobile Header & Menu Button --- */}
      <div className="lg:hidden bg-[#C83E0D] p-4 flex justify-between items-center text-white sticky top-0 z-50 shadow-md">
        <h1 className="text-xl font-black italic tracking-tighter">Bonomaya</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/10 rounded-xl">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Sidebar (Mobile & Desktop) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#C83E0D] text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col
      `}>
        <div className="p-10 border-b border-white/10 text-center hidden lg:block">
          <p className="text-3xl font-black italic tracking-tighter">Bonomaya</p>
          <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mt-1 opacity-70">Admin Control</p>
        </div>

        <nav className="flex-1 px-6 py-8 space-y-3 font-bold text-sm">
          <button className="w-full text-left p-4 rounded-2xl bg-white/10 flex items-center gap-4"><LayoutDashboard size={20}/> Dashboard</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-70"><Package size={20}/> Inventory</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-70"><Users size={20}/> Employees</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-70"><ClipboardList size={20}/> Reports</button>
        </nav>

        <button onClick={handleLogout} className="m-8 p-4 bg-black/20 hover:bg-black/40 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest text-center flex items-center justify-center gap-2 transition">
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-10 space-y-6">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight italic">Admin Hub</h1>
            <p className="text-xs font-bold text-slate-400">Welcome, Masum Billah</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-3xl shadow-sm border border-slate-100">
             <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-100">M</div>
             <span className="text-sm font-black text-slate-700 italic">DIU SE-43</span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border-l-8 border-orange-500 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Team Members</h3>
            <p className="text-2xl font-black">{employees.length} <span className="text-xs font-bold italic opacity-40 uppercase">Active</span></p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border-l-8 border-blue-500 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Low Stock Alert</h3>
            <p className={`text-2xl font-black ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-500' : ''}`}>
              {inventory.filter(i => i.quantity < 10).length} <span className="text-xs font-bold italic opacity-40 uppercase">Items Low</span>
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border-l-8 border-green-500 shadow-sm hidden sm:block">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">System Status</h3>
            <p className="text-2xl font-black text-green-600 italic uppercase">Live</p>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Employee Form */}
          <section className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-md font-black mb-6 text-slate-700 uppercase italic flex items-center gap-2"><Users size={18}/> New Member</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <input type="text" placeholder="Full Name" value={empName} onChange={(e) => setEmpName(e.target.value)} required className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" />
              <select value={empRole} onChange={(e) => setEmpRole(e.target.value)} className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none font-bold">
                <option value="chef">Chef (শেফ)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
              </select>
              <button disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition shadow-lg shadow-orange-100 disabled:opacity-50">Add Member</button>
            </form>
          </section>

          {/* Inventory Form */}
          <section className="bg-white p-6 lg:p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 className="text-md font-black mb-6 text-slate-700 uppercase italic flex items-center gap-2"><Package size={18}/> Update Stock</h2>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <input type="text" placeholder="Item Name (e.g. Flour)" value={itemName} onChange={(e) => setItemName(e.target.value)} required className="w-full bg-slate-50 border-none p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              <div className="flex gap-4">
                <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="flex-1 bg-slate-50 border-none p-4 rounded-2xl outline-none font-bold" />
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-24 lg:w-32 bg-slate-50 border-none p-4 rounded-2xl outline-none font-bold">
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="pcs">Pcs</option>
                </select>
              </div>
              <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50">Update Stock</button>
            </form>
          </section>
        </div>

        {/* Inventory Status Grid */}
        <section className="bg-white p-6 lg:p-10 rounded-[2.5rem] shadow-sm border border-orange-100 overflow-hidden mt-6">
          <h2 className="text-md font-black mb-8 text-slate-800 uppercase italic flex items-center gap-2">📊 Live Inventory Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.id} className={`p-5 rounded-3xl border-2 transition-all hover:scale-105 flex flex-col items-center justify-center ${item.quantity < 10 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-[#FFF8F5] border-orange-50 text-orange-700'}`}>
                  {item.quantity < 10 && <AlertTriangle size={14} className="mb-2 animate-bounce" />}
                  <p className="text-[9px] uppercase font-black tracking-widest opacity-60 mb-1">{item.itemName}</p>
                  <p className="text-xl font-black">{item.quantity} <span className="text-[10px] uppercase font-bold">{item.unit}</span></p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-slate-300 italic font-bold">No inventory data available.</div>
            )}
          </div>
        </section>

      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden" />}
    </div>
  );
}