"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { Menu, X, LayoutDashboard, Package, Users, BarChart3, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // States
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
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

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: empName, role: empRole, status: "Active", createdAt: serverTimestamp()
      });
      setEmpName("");
      alert(empName + " যোগ হয়েছে!");
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inventory"), {
        itemName, quantity: Number(quantity), unit, createdAt: serverTimestamp()
      });
      setItemName(""); setQuantity("");
      alert(itemName + " স্টক আপডেট হয়েছে!");
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative overflow-x-hidden">
      
      {/* --- Mobile Top Bar (তোর আগের অরেঞ্জ থিম) --- */}
      <div className="md:hidden bg-orange-700 p-4 flex justify-between items-center text-white sticky top-0 z-[100] shadow-md">
        <h1 className="text-xl font-bold italic">Bonomaya</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white/10 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* --- Sidebar (Notch safe and Full Height) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[110] w-64 bg-orange-700 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 flex flex-col h-screen shadow-2xl md:shadow-none
      `}>
        {/* Mobile Close Button (Top Right) */}
        <div className="md:hidden absolute top-8 right-6">
            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white/10 rounded-full text-white">
                <X size={24} />
            </button>
        </div>

        {/* Sidebar Header - pt-20 for mobile notch safety */}
        <div className="p-6 pt-20 md:pt-6 text-2xl font-bold border-b border-orange-600 italic">
          Bonomaya
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button className="w-full text-left p-3 rounded bg-orange-800 flex items-center gap-3 font-bold"><LayoutDashboard size={18}/> Dashboard</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><Package size={18}/> Inventory</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><Users size={18}/> Employees</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><BarChart3 size={18}/> Reports</button>
        </nav>

        <button onClick={handleLogout} className="p-5 bg-orange-900 hover:bg-red-700 transition font-bold flex items-center justify-center gap-2 border-t border-orange-600">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto pb-20">
        
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 md:static z-30">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 uppercase tracking-tight">Admin Control</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium hidden sm:block text-sm italic">Masum Billah</span>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-orange-200 shadow-sm">M</div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6 mt-4">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Active Staff</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">{employees.length} জন</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Low Stock</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {inventory.filter(i => i.quantity < 10).length} টি আইটেম
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500 sm:col-span-2 md:col-span-1">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">System Status</h3>
              <p className="text-2xl font-bold text-green-600 mt-1 uppercase italic animate-pulse">Live Now</p>
            </div>
          </div>

          {/* Forms Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h2 className="text-md font-bold mb-5 text-gray-700 border-b pb-2 uppercase text-sm">নতুন এমপ্লয়ী যোগ করুন</h2>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <input 
                  type="text" placeholder="পুরো নাম" value={empName}
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-bold"
                  onChange={(e) => setEmpName(e.target.value)} required
                />
                <select 
                  className="w-full border p-3 rounded-xl outline-none bg-white text-gray-700 font-medium"
                  value={empRole} onChange={(e) => setEmpRole(e.target.value)}
                >
                  <option value="chef">Chef (শেফ)</option>
                  <option value="manager">Manager (ম্যানেজার)</option>
                  <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
                </select>
                <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-orange-700 transition shadow-lg">
                  {loading ? "Saving..." : "Add Member"}
                </button>
              </form>
            </section>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h2 className="text-md font-bold mb-5 text-gray-700 border-b pb-2 uppercase text-sm">নতুন স্টক আপডেট করুন</h2>
              <form onSubmit={handleAddInventory} className="space-y-4">
                <input 
                  type="text" placeholder="আইটেমের নাম" value={itemName}
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-bold"
                  onChange={(e) => setItemName(e.target.value)} required
                />
                <div className="flex gap-4">
                  <input 
                    type="number" placeholder="Qty" value={quantity}
                    className="flex-1 border p-3 rounded-xl outline-none font-bold"
                    onChange={(e) => setQuantity(e.target.value)} required
                  />
                  <select className="w-28 border p-3 rounded-xl outline-none" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="kg">KG</option>
                    <option value="pcs">Pcs</option>
                    <option value="liter">Liter</option>
                  </select>
                </div>
                <button disabled={loading} className="w-full bg-orange-700 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-orange-800 transition">
                  Update Stock
                </button>
              </form>
            </section>
          </div>

          {/* Activity Section */}
          <section className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b font-bold text-gray-700 bg-gray-50 flex justify-between items-center text-sm italic">
              সাম্প্রতিক স্টক স্ট্যাটাস
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {inventory.map((item) => (
                <div key={item.id} className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                  <p className="text-[9px] uppercase font-black text-gray-400">{item.itemName}</p>
                  <p className="text-lg font-bold text-orange-700">{item.quantity} {item.unit}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[105] md:hidden transition-opacity"
        />
      )}
    </div>
  );
}