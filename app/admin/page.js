"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { Menu, X, LayoutDashboard, Users, Package, LogOut, ClipboardList, AlertTriangle, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  
  // State Management
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [employees, setEmployees] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [inventory, setInventory] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // রিয়েল-টাইমে ডেটা লোড করা
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
      
      {/* --- Mobile Header (Top Bar) --- */}
      <div className="lg:hidden bg-[#1A1C1E] p-5 flex justify-between items-center text-white sticky top-0 z-50 shadow-xl border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">B</div>
            <h1 className="text-xl font-extrabold tracking-tighter italic">Bonomaya</h1>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
          <Menu size={22} />
        </button>
      </div>

      {/* --- Sidebar (Premium Dark) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-[#1A1C1E] text-white transform transition-transform duration-500 ease-[cubic-bezier(0.87, 0, 0.13, 1)]
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0 shadow-2xl flex flex-col border-r border-white/5
      `}>
        {/* Mobile Close Button Inside Sidebar */}
        <div className="lg:hidden absolute top-6 right-6">
            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white/5 rounded-full border border-white/10 text-white/70">
                <X size={20} />
            </button>
        </div>

        {/* Sidebar Header with Notch Safety for Mobile */}
        <div className="p-10 pt-20 lg:pt-12 border-b border-white/5 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-orange-950/30">B</div>
          <div>
            <p className="text-2xl font-black tracking-tighter text-white italic">Bonomaya</p>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em] mt-1">Admin Portal</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-3 font-bold text-sm overflow-y-auto">
          <button className="w-full text-left p-4 rounded-2xl bg-orange-600 text-white flex items-center gap-4 shadow-lg shadow-orange-950/20"><LayoutDashboard size={20}/> Dashboard</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><Package size={20}/> Inventory</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><Users size={20}/> Employees</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-white/5 flex items-center gap-4 opacity-60 transition"><ClipboardList size={20}/> Reports</button>
        </nav>

        {/* Logout Section */}
        <div className="p-8 border-t border-white/5">
            <button onClick={handleLogout} className="w-full p-4 bg-red-950/30 hover:bg-red-950/50 text-red-300 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center flex items-center justify-center gap-2 transition border border-red-900/50">
                <LogOut size={16} /> Logout System
            </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 h-screen overflow-y-auto p-5 lg:p-12 space-y-8 pb-20">
        
        {/* Desktop Header Overlay */}
        <header className="hidden lg:flex justify-between items-center mb-10 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-950 italic">Dashboard Overview</h1>
            <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-wider">Welcome back, Masum Billah (DIU SE)</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 pr-8 rounded-full shadow-sm border border-slate-100">
             <div className="w-12 h-12 bg-[#1A1C1E] rounded-full flex items-center justify-center text-white font-black text-xl border-4 border-slate-100 shadow-md">M</div>
             <div>
                <span className="text-sm font-black text-slate-900 italic">Masum Billah</span>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Super Admin</p>
             </div>
          </div>
        </header>

        {/* Stats Cards (Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Active Team</h3>
                <Users size={20} className="text-orange-400"/>
            </div>
            <p className="text-4xl font-black tracking-tight">{employees.length} <span className="text-xs font-bold italic opacity-40 uppercase">Persons</span></p>
            <p className="text-xs text-green-600 font-bold mt-2 uppercase tracking-tighter">● Online Status</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Stock Warnings</h3>
                <AlertTriangle size={20} className="text-red-400"/>
            </div>
            <p className={`text-4xl font-black ${inventory.filter(i => i.quantity < 10).length > 0 ? 'text-red-600' : ''}`}>
              {inventory.filter(i => i.quantity < 10).length} <span className="text-xs font-bold italic opacity-40 uppercase">Low Stock</span>
            </p>
            <p className="text-xs text-slate-500 font-bold mt-2 uppercase">Action required</p>
          </div>

          <div className="bg-[#1A1C1E] p-8 rounded-[2.5rem] shadow-xl text-white sm:col-span-2 xl:col-span-1 hover:shadow-orange-950/20 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-orange-400 text-[11px] font-black uppercase tracking-widest">Operational</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-950/50"></div>
            </div>
            <p className="text-4xl font-black text-white italic uppercase tracking-tighter">Bonomaya LIVE</p>
            <p className="text-xs text-slate-400 font-medium mt-2">Cloud-sync enabled</p>
          </div>
        </div>

        {/* Input Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-10">
          {/* Employee Add Section */}
          <section className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <PlusCircle size={22} className="text-orange-500"/> Team Management
            </h2>
            <form onSubmit={handleAddEmployee} className="space-y-5">
              <input type="text" placeholder="Full Name" value={empName} onChange={(e) => setEmpName(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold transition text-sm" />
              <select value={empRole} onChange={(e) => setEmpRole(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm text-slate-700 appearance-none">
                <option value="chef">Chef (শেফ)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
              </select>
              <button disabled={loading} className="w-full bg-[#1A1C1E] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg text-xs disabled:opacity-50">Hire & Add Member</button>
            </form>
          </section>

          {/* Inventory Add Section */}
          <section className="bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 uppercase italic flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <Package size={22} className="text-blue-500"/> Stock Control
            </h2>
            <form onSubmit={handleAddInventory} className="space-y-5">
              <input type="text" placeholder="Item Name (e.g. Sugar)" value={itemName} onChange={(e) => setItemName(e.target.value)} required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold transition text-sm" />
              <div className="flex gap-4">
                <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm" />
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-28 lg:w-36 bg-slate-50 border border-slate-100 p-5 rounded-2xl outline-none font-bold text-sm text-slate-700">
                  <option value="kg">KG</option>
                  <option value="liter">Liter</option>
                  <option value="pcs">Pcs</option>
                </select>
              </div>
              <button disabled={loading} className="w-full bg-[#25282C] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg text-xs disabled:opacity-50">Confirm & Update Stock</button>
            </form>
          </section>
        </div>

        {/* Live Inventory Status (Premium Grid) */}
        <section className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-sm border border-orange-100 mt-10 mb-10">
          <div className="flex justify-between items-center mb-10 pb-4 border-b border-orange-100">
            <h2 className="text-xl font-black text-slate-950 uppercase italic">📊 Stock Live Feed</h2>
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 p-2 px-4 rounded-full text-[10px] font-black text-orange-700 border border-orange-100 uppercase italic">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                Cloud Update Enabled
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5">
            {inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.id} className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center ${item.quantity < 10 ? 'bg-red-50 border-red-100 text-red-700 shadow-xl shadow-red-950/5' : 'bg-[#FFF8F5] border-orange-100 text-orange-800'}`}>
                  {item.quantity < 10 && <AlertTriangle size={16} className="mb-3 animate-bounce text-red-500" />}
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-70 mb-1.5 line-clamp-1 italic">{item.itemName}</p>
                  <p className="text-2xl font-black tracking-tight">{item.quantity} <span className="text-[11px] uppercase font-bold opacity-70">{item.unit}</span></p>
                  {item.quantity < 10 && <p className="text-[9px] font-black text-red-500 mt-1 uppercase tracking-tighter">Low Supply!</p>}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-300 italic font-black text-sm uppercase">Waiting for data sync...</div>
            )}
          </div>
        </section>

      </main>

      {/* Sidebar Mobile Overlay Overlay */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden" />}
    </div>
  );
}