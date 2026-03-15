"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Menu, X, LayoutDashboard, Package, Users, BarChart3, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: empName,
        role: empRole,
        email: `${empName.toLowerCase().replace(/\s/g, "")}@bonomaya.com`,
        status: "Active",
        createdAt: serverTimestamp()
      });
      alert(empName + " যোগ হয়েছে!");
      setEmpName("");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">
      
      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden bg-orange-700 p-4 flex justify-between items-center text-white sticky top-0 z-50 shadow-md">
        <h1 className="text-xl font-bold italic">Bonomaya</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 bg-white/10 rounded">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- Sidebar (Mobile & Desktop) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-orange-700 text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-none
      `}>
        <div className="p-6 text-2xl font-bold border-b border-orange-600 hidden md:block italic">Bonomaya</div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4 md:mt-0">
          <button className="w-full text-left p-3 rounded bg-orange-800 flex items-center gap-3"><LayoutDashboard size={18}/> Dashboard</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><Package size={18}/> Inventory</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><Users size={18}/> Employees</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 flex items-center gap-3 transition"><BarChart3 size={18}/> Sales Report</button>
        </nav>

        <button onClick={handleLogout} className="p-4 bg-orange-900 hover:bg-red-700 transition font-bold flex items-center justify-center gap-2">
          <LogOut size={18}/> Logout
        </button>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 md:static z-30">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Admin Control</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium hidden sm:block text-sm italic">Masum Billah</span>
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-orange-200">M</div>
          </div>
        </header>

        <main className="p-4 md:p-6 space-y-6">
          
          {/* Top Cards Stats - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Raw Materials</h3>
              <p className="text-xl font-bold text-gray-800 italic mt-1">Tracking Live...</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-green-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Production</h3>
              <p className="text-xl font-bold text-gray-800 mt-1">150+ Pcs</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-orange-500 sm:col-span-2 md:col-span-1">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Status</h3>
              <p className="text-xl font-bold text-gray-800 mt-1 uppercase italic text-green-600">Live Now</p>
            </div>
          </div>

          {/* New Employee Add Form Section */}
          <section>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
              <h2 className="text-md font-bold mb-5 text-gray-700 border-b pb-2 uppercase text-sm tracking-tight">নতুন এমপ্লয়ী যোগ করুন</h2>
              <form onSubmit={handleAddEmployee} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="পুরো নাম" 
                  className="border p-3 rounded-xl flex-1 outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 bg-gray-50 font-bold"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  required
                />
                <select 
                  className="border p-3 rounded-xl outline-none bg-white text-gray-700 font-medium sm:w-40"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                >
                  <option value="chef">Chef (শেফ)</option>
                  <option value="manager">Manager (ম্যানেজার)</option>
                  <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
                </select>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-orange-700 transition active:scale-95 shadow-lg shadow-orange-100 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Add Member"}
                </button>
              </form>
            </div>
          </section>

          {/* Activity Section */}
          <section className="pb-10">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b font-bold text-gray-700 bg-gray-50 flex justify-between items-center text-sm">
                <span>সাম্প্রতিক কার্যক্রম</span>
                <button className="text-orange-600 hover:underline">View All</button>
              </div>
              <div className="p-12 text-center text-gray-400 italic text-sm">
                Real-time ডেটা লোড করার লজিক এখানে আসবে...
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}
    </div>
  );
}