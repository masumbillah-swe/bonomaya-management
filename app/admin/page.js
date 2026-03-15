"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { Menu, X, LayoutDashboard, Users, Package, LogOut, ClipboardList, AlertTriangle, PlusCircle, Trash2 } from "lucide-react";

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
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col lg:flex-row font-sans text-slate-950">
      
      {/* --- Mobile Header --- */}
      <div className="lg:hidden bg-[#1A1C1E] p-5 flex justify-between items-center text-white sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">B</div>
            <h1 className="text-xl font-extrabold tracking-tighter">Bonomaya <span className="text-xs opacity-50 font-normal">Hub</span></h1>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* --- Sidebar --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#1A1C1E] text-white transform transition-transform duration-500 ease-[cubic-bezier(0.87, 0, 0.13, 1)]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] flex flex-col border-r border-white/5
      `}>
        <div className="p-12 border-b border-white/5 text-center hidden lg:flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-orange-950/30">B</div>
          <div>
            <p className="text-2xl font-black tracking-tighter">Bonomaya</p>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mt-1">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-3 font-bold text-sm">
          <button className="w-full text-left p-4 rounded-2xl bg-orange-600 text-white flex items-center gap-4 shadow-lg shadow-orange-950/20"><LayoutDashboard size={20}/> Dashboard</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><Package size={20}/> Inventory</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><Users size={20}/> Employees</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><ClipboardList size={20}/> Reports</button>
        </nav>

        <button onClick={handleLogout} className="m-8 p-4 bg-red-950/30 hover:bg-red-950/50 text-red-300 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center flex items-center justify-center gap-2 transition border border-red-900/50">
          <LogOut size={16} /> Logout System
        </button>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 h-screen overflow-y-auto p-5 lg:p-12 space-y-8">
        
        {/* Desktop Header */}
        <header className="hidden lg:flex justify-between items-center mb-12 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-950">Dashboard Overview</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Good Morning, Masum Billah! Here's your business status.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 pr-8 rounded-full shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-[#25282C] rounded-full flex items-center justify-center text-white font-black text-xl shadow-md border-4 border-slate-100">M</div>
             <div>
                <span className="text-sm font-black text-slate-900">Masum Billah</span>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Super Admin</p>
             </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Team Strength</h3>
                <Users size={20} className="text-orange-300"/>
            </div>
            <p className="text-4xl font-black tracking-tight">{employees.length} <span className="text-xs font-bold italic opacity-40 uppercase">Sactive</span></p>
            <p className="text-xs text-green-600 font-medium mt-2">+1 this week</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Low Stock Alerts</h3>
                <AlertTriangle size={20} className="text-red-300"/>
            </div>
            <p className={`text-4xl font-black ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-600' : ''}`}>
              {inventory.filter(i => i.quantity < 10).length} <span className="text-xs font-bold italic opacity-40 uppercase">Critical</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-2">Requires immediate attention</p>
          </div>
          <div className="bg-[#1A1C1E] p-8 rounded-[2.5rem] shadow-xl text-white sm:col-span-2 xl:col-span-1 transition-all hover:shadow-orange-950/20 hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-orange-300 text-[11px] font-black uppercase tracking-widest">System Status</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-950/50"></div>
            </div>
            <p className="text-4xl font-black text-white italic uppercase tracking-tighter">Live</p>
            <p className="text-xs text-slate-400 font-medium mt-2">All services operational</p>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
          {/* Employee Form */}
          <section className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Users size={22} className="text-orange-500"/> Add New Member</h2>
                <PlusCircle size={22} className="text-slate-300" />
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-5">
              <input type="text" placeholder="Full Name (e.g., Moshiur Bhai)" value={empName} onChange={(e) => setEmpName(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold transition text-sm placeholder:text-slate-300 placeholder:font-normal" />
              <select value={empRole} onChange={(e) => setEmpRole(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm text-slate-700">
                <option value="chef">Chef (শেফ)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
              </select>
              <button disabled={loading} className="w-full bg-[#1A1C1E] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg disabled:opacity-50 text-xs">Confirm & Add Member</button>
            </form>
          </section>

          {/* Inventory Form */}
          <section className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3"><Package size={22} className="text-blue-500"/> Update Stock</h2>
                <PlusCircle size={22} className="text-slate-300" />
            </div>
            <form onSubmit={handleAddInventory} className="space-y-5">
              <input type="text" placeholder="Item Name (e.g. Flour)" value={itemName} onChange={(e) => setItemName(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition text-sm placeholder:text-slate-300 placeholder:font-normal" />
              <div className="flex gap-4">
                <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm placeholder:text-slate-300 placeholder:font-normal" />
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-28 lg:w-36 bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm text-slate-700">
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="pcs">Pcs</option>
                </select>
              </div>
              <button disabled={loading} className="w-full bg-[#25282C] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg disabled:opacity-50 text-xs">Confirm & Update Stock</button>
            </form>
          </section>
        </div>

        {/* Inventory Status Grid */}
        <section className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-sm border border-orange-100 mt-10">
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-orange-100">
            <h2 className="text-xl font-black text-slate-950 uppercase italic flex items-center gap-3">📊 Live Inventory Status</h2>
            <div className="flex items-center gap-2 bg-orange-50 p-2 px-4 rounded-full text-xs font-bold text-orange-700 border border-orange-100">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Real-time Sync
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.id} className={`p-6 rounded-3xl border-2 transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center ${item.quantity < 10 ? 'bg-red-50 border-red-100 text-red-700 shadow-lg shadow-red-950/5' : 'bg-[#FFF8F5] border-orange-100 text-orange-800'}`}>
                  {item.quantity < 10 && <AlertTriangle size={16} className="mb-3 animate-bounce text-red-500" />}
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1.5 line-clamp-1">{item.itemName}</p>
                  <p className="text-2xl font-black tracking-tight">{item.quantity} <span className="text-[11px] uppercase font-bold opacity-70">{item.unit}</span></p>
                  {item.quantity < 10 && <p className="text-[9px] font-bold text-red-500 mt-1 uppercase">Low Stock</p>}
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-300 italic font-bold bg-slate-50 rounded-3xl border border-slate-100">No inventory data available in real-time.</div>
            )}
          </div>
        </section>

      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" />}
    </div>
  );
}