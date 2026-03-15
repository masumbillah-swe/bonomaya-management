"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { 
  Menu, X, LayoutDashboard, Users, Package, LogOut, 
  Plus, TrendingUp, AlertCircle, CheckCircle2, Trash2 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Form States
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");

  // Real-time Data Sync
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
      await addDoc(collection(db, "users"), { 
        name: empName, 
        role: empRole, 
        status: "Active", 
        createdAt: serverTimestamp() 
      });
      setEmpName("");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const addInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inventory"), { 
        itemName: itemName, 
        quantity: Number(quantity), 
        unit: unit, 
        createdAt: serverTimestamp() 
      });
      setItemName(""); setQuantity("");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const deleteItem = async (col, id) => {
    if(confirm("Are you sure you want to delete this?")) {
        await deleteDoc(doc(db, col, id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex font-sans text-slate-900">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#111C44] text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static shadow-2xl flex flex-col
      `}>
        <div className="p-8 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-500/30">B</div>
          <span className="text-xl font-bold tracking-tight italic text-white">Bonomaya Admin</span>
        </div>

        <nav className="p-6 space-y-2 flex-1">
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/30">
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all">
            <Package size={20}/> Inventory
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all">
            <Users size={20}/> Employees
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-slate-400 hover:bg-white/5 transition-all">
            <TrendingUp size={20}/> Reports
          </button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-8">
        
        {/* Header bar */}
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl shadow-sm text-slate-600"><Menu/></button>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-black text-[#1B254B] italic">Dashboard Overview</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cloud Sync Active</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-100">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-black border-2 border-white shadow-md">M</div>
            <div className="text-xs">
              <p className="font-black text-[#1B254B] italic">Masum Billah</p>
              <p className="text-blue-500 font-bold uppercase tracking-tighter">DIU Student</p>
            </div>
          </div>
        </header>

        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Users size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Staff</p>
                <p className="text-2xl font-black text-[#1B254B]">{employees.length}</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex items-center gap-4">
             <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500"><AlertCircle size={24}/></div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock</p>
                <p className="text-2xl font-black text-red-600">{inventory.filter(i => i.quantity < 10).length}</p>
             </div>
          </div>
          <div className="bg-[#111C44] p-6 rounded-[32px] shadow-xl flex items-center gap-4 text-white">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                <CheckCircle2 size={24} className="text-green-400"/>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-[#111C44]"></div>
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Operation</p>
                <p className="text-2xl font-black italic tracking-tighter">LIVE NOW</p>
             </div>
          </div>
        </div>

        {/* Forms Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Employee Section */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-[#1B254B] mb-6 uppercase italic flex items-center gap-2">
                <Plus size={20} className="text-blue-500"/> New Member
            </h2>
            <form onSubmit={addEmployee} className="space-y-4">
              <input type="text" placeholder="Full Name" required value={empName} onChange={e => setEmpName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500/20 border border-slate-100 font-bold text-sm" />
              <select value={empRole} onChange={e => setEmpRole(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 font-bold text-sm text-slate-600">
                <option value="chef">Chef (শেফ)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
              </select>
              <button disabled={loading} className="w-full bg-[#111C44] text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all text-xs disabled:opacity-50">Hire Member</button>
            </form>
          </section>

          {/* Inventory Section */}
          <section className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h2 className="text-lg font-black text-[#1B254B] mb-6 uppercase italic flex items-center gap-2">
                <Package size={20} className="text-indigo-500"/> Update Stock
            </h2>
            <form onSubmit={addInventory} className="space-y-4">
              <input type="text" placeholder="Item Name" required value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 ring-indigo-500/20 border border-slate-100 font-bold text-sm" />
              <div className="flex gap-4">
                <input type="number" placeholder="Qty" required value={quantity} onChange={e => setQuantity(e.target.value)} className="flex-1 bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 font-bold text-sm" />
                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-28 bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 font-bold text-sm text-slate-600">
                  <option value="kg">KG</option>
                  <option value="pcs">Pcs</option>
                  <option value="liter">Liter</option>
                </select>
              </div>
              <button disabled={loading} className="w-full bg-[#111C44] text-white p-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all text-xs disabled:opacity-50">Refill Stock</button>
            </form>
          </section>
        </div>

        {/* Inventory Status (Live Grid) */}
        <section className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-lg font-black text-[#1B254B] uppercase italic">Real-time Stock Feed</h2>
             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total {inventory.length} Items</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {inventory.map(item => (
              <div key={item.id} className="group relative p-6 rounded-3xl bg-[#F8FAFF] border border-slate-100 hover:border-blue-200 transition-all flex flex-col items-center">
                <button onClick={() => deleteItem("inventory", item.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={14}/>
                </button>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 line-clamp-1">{item.itemName}</p>
                <p className={`text-2xl font-black ${item.quantity < 10 ? 'text-red-600' : 'text-[#1B254B]'}`}>
                  {item.quantity} <span className="text-[10px] opacity-40 font-bold">{item.unit}</span>
                </p>
                {item.quantity < 10 && (
                  <div className="mt-3 w-full bg-red-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-1/3 animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}