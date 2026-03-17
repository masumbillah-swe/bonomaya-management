"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { 
  Menu, X, LayoutDashboard, Package, FileText, LogOut, TrendingUp, Truck, 
  Calendar, ShoppingBag, AlertTriangle, Users, Activity, BarChart3, ArrowUpRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from "recharts";

// দারোয়ানকে নিয়ে আসা হলো
import withAuth from "@/components/withAuth";

function AdminDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const [inventory, setInventory] = useState([]); 
  const [purchases, setPurchases] = useState([]); 
  const [productions, setProductions] = useState([]);
  const [sales, setSales] = useState([]);
  const [wastage, setWastage] = useState([]);

  useEffect(() => {
    // সব ডাটা একসাথে স্ট্রিম করা হচ্ছে
    onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "purchases"), orderBy("createdAt", "desc")), (s) => setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "productions"), orderBy("createdAt", "desc"), limit(20)), (s) => setProductions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), (s) => setSales(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "wastage"), orderBy("createdAt", "desc")), (s) => setWastage(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const totalExpense = purchases.reduce((a, c) => a + Number(c.totalPrice || 0), 0);
  const totalWastage = wastage.length;

  const exportMasterReport = () => {
    const ws = XLSX.utils.json_to_sheet(purchases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master_Report");
    XLSX.writeFile(wb, "Bonomaya_Full_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col lg:flex-row text-slate-900 font-sans tracking-tight">
      
      {/* মোবাইল বার */}
      <div className="lg:hidden bg-[#1A1A1A] p-4 flex justify-between items-center sticky top-0 z-[120] shadow-md">
        <h1 className="text-white font-bold italic tracking-tighter uppercase">Bonomaya Admin</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white p-1">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* সাইডবার */}
      <aside className={`fixed inset-y-0 left-0 z-[130] w-72 lg:w-64 bg-[#1A1A1A] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 text-center border-b border-white/5">
          <div className="bg-red-600 w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-2 shadow-lg italic">A</div>
          <h2 className="text-lg font-bold italic tracking-tighter uppercase">এডমিন প্যানেল</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">বনমায়া কন্ট্রোল</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 font-sans">
          <button onClick={() => {setActiveSection("dashboard"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'dashboard' ? 'bg-red-600' : 'hover:bg-white/5 opacity-70'}`}><LayoutDashboard size={20} /> ড্যাশবোর্ড</button>
          <button onClick={() => {setActiveSection("audit"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'audit' ? 'bg-red-600' : 'hover:bg-white/5 opacity-70'}`}><Activity size={20} /> লাইভ অডিট</button>
          <button onClick={() => {setActiveSection("inventory"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'inventory' ? 'bg-red-600' : 'hover:bg-white/5 opacity-70'}`}><Package size={20} /> স্টক লেজার</button>
          <button onClick={() => {setActiveSection("reports"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'reports' ? 'bg-red-600' : 'hover:bg-white/5 opacity-70'}`}><FileText size={20} /> মাস্টার রিপোর্ট</button>
        </nav>
        <button onClick={() => auth.signOut().then(() => router.push("/login"))} className="p-4 bg-red-900/20 text-red-400 hover:bg-red-900 hover:text-white flex gap-2 justify-center mt-auto border-t border-white/5 transition-all font-black uppercase text-[10px]"><LogOut size={18} /> লগআউট</button>
      </aside>

      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-[125] lg:hidden backdrop-blur-sm" />}

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto h-screen w-full font-sans font-bold uppercase tracking-tighter">
        
        {/* ড্যাশবোর্ড ওভারভিউ */}
        {activeSection === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">সিস্টেম কন্ট্রোল</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1">বনমায়ার সকল কার্যক্রমের সারসংক্ষেপ</p>
                </div>
                <div className="flex gap-2">
                   <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px]">সিস্টেম অনলাইন</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-500">
                    <p className="text-[10px] text-slate-400 mb-1">মোট কেনাকাটা</p>
                    <p className="text-2xl font-black text-slate-800">৳{totalExpense.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-orange-500">
                    <p className="text-[10px] text-slate-400 mb-1">প্রোডাকশন আইটেম</p>
                    <p className="text-2xl font-black text-slate-800">{productions.length} টি</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-red-500">
                    <p className="text-[10px] text-slate-400 mb-1">ওয়েস্টেজ (লস)</p>
                    <p className="text-2xl font-black text-red-600">{totalWastage} এন্ট্রি</p>
                </div>
                <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl shadow-lg border-b-4 border-red-600">
                    <p className="text-[10px] text-gray-400 mb-1">এক্টিভ ইউজার</p>
                    <p className="text-2xl font-black text-red-500 flex items-center gap-2"><Users size={20}/> ৩ জন</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border h-[400px]">
                    <h3 className="text-sm mb-6 flex items-center gap-2"><BarChart3 size={18} /> প্রোডাকশন বনাম সেলস</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={productions.slice(0, 7)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="itemName" hide />
                            <Tooltip />
                            <Bar dataKey="quantity" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border h-[400px]">
                    <h3 className="text-sm mb-6 flex items-center gap-2"><ArrowUpRight size={18} /> এক্সপেন্স ট্রেন্ড</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={purchases.slice(0, 10).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="totalPrice" stroke="#EF4444" strokeWidth={3} dot={{fill: '#EF4444'}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}

        {/* অডিট সেকশন */}
        {activeSection === "audit" && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
                    <div className="p-6 bg-orange-50 border-b font-black italic text-orange-700">কিচেন অ্যাক্টিভিটি (শেফ)</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs uppercase">
                            <thead><tr className="bg-slate-100"><th className="p-4">আইটেম</th><th className="p-4">পরিমাণ</th><th className="p-4">অবস্থা</th></tr></thead>
                            <tbody>
                                {productions.map(p => (
                                    <tr key={p.id} className="border-b">
                                        <td className="p-4 font-black">{p.itemName}</td>
                                        <td className="p-4">{p.quantity} পিস</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-[9px] ${p.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
                    <div className="p-6 bg-red-50 border-b font-black italic text-red-700">লস ও ওয়েস্টেজ অডিট</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs uppercase">
                            <thead><tr className="bg-slate-100"><th className="p-4">আইটেম</th><th className="p-4 text-center">পরিমাণ</th><th className="p-4">কারণ</th></tr></thead>
                            <tbody>
                                {wastage.map(w => (
                                    <tr key={w.id} className="border-b">
                                        <td className="p-4 font-black">{w.itemName}</td>
                                        <td className="p-4 text-center text-red-600">{w.quantity} পিস</td>
                                        <td className="p-4 text-slate-400 font-medium">{w.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
             </div>
          </div>
        )}

        {/* ইনভেন্টরি সেকশন */}
        {activeSection === "inventory" && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden">
                <div className="p-7 bg-slate-900 text-white flex justify-between items-center font-sans font-bold">
                    <h2 className="text-xl font-black italic uppercase">মাস্টার ইনভেন্টরি অডিট</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs uppercase font-bold">
                        <thead className="bg-slate-100 text-slate-500">
                            <tr><th className="p-5">আইটেম</th><th className="p-5 text-center">বর্তমান স্টক</th><th className="p-5 text-right">মোট খরচ</th><th className="p-5 text-center">অবস্থা</th></tr>
                        </thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id} className="border-b hover:bg-slate-50 transition-all">
                                    <td className="p-5 font-black text-slate-800">{item.itemName}</td>
                                    <td className="p-5 text-center">{item.quantity} {item.unit}</td>
                                    <td className="p-5 text-right font-black text-blue-600">৳{item.totalInvestment?.toLocaleString()}</td>
                                    <td className="p-5 text-center">
                                        {item.quantity < 10 ? <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px]">স্টক কম</span> : <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px]">পর্যাপ্ত</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* রিপোর্ট সেকশন */}
        {activeSection === "reports" && (
            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-center text-white border-4 border-red-600/20">
                <FileText size={60} className="mx-auto mb-6 text-red-500" />
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">মাস্টার ডাটা এক্সপোর্ট</h2>
                <p className="text-gray-400 mt-2 font-sans mb-10 lowercase font-bold">সকল ট্রানজাকশন এবং ইনভেন্টরি হিস্ট্রি ডাউনলোড করুন</p>
                <button onClick={exportMasterReport} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Download Data (.xlsx)</button>
            </div>
        )}

        <p className="text-center text-[10px] font-bold text-slate-300 tracking-[0.4em] uppercase mt-12 italic font-sans font-bold">Bonomaya Admin Command v4.0</p>
      </main>
    </div>
  );
}

// দারোয়ানকে দিয়ে পেজটি লক করে এক্সপোর্ট করা হলো
export default withAuth(AdminDashboard, "Admin");