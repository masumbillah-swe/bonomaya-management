"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { 
  Menu, X, LayoutDashboard, Package, FileText, LogOut, TrendingUp, Truck, 
  Calendar, PlusCircle, AlertTriangle, Check, Search, ShoppingBag, ArrowRight 
} from "lucide-react";
import * as XLSX from "xlsx";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie 
} from "recharts";

import withAuth from "../../components/withAuth";
function ManagerDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const [inventory, setInventory] = useState([]); 
  const [purchases, setPurchases] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({ 
    itemName: "", quantity: "", unit: "KG", totalPrice: "", supplierName: "", supplierNumber: "" 
  });

  useEffect(() => {
    onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "purchases"), orderBy("createdAt", "desc")), (s) => setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const exportToExcel = () => {
    const fileData = purchases.map(p => ({
      "তারিখ": p.date,
      "আইটেম": p.itemName.toUpperCase(),
      "পরিমাণ": `${p.quantity} ${p.unit}`,
      "মোট দাম (৳)": p.totalPrice,
      "ইউনিট রেট": p.perUnitPrice,
      "সাপ্লায়ার": p.supplierName || "N/A",
      "সাপ্লায়ার ফোন": p.supplierNumber || "N/A"
    }));
    const worksheet = XLSX.utils.json_to_sheet(fileData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase_Report");
    XLSX.writeFile(workbook, `Bonomaya_Report_${new Date().toLocaleDateString()}.xlsx`);
  };

  const perUnitPrice = (form.totalPrice && form.quantity) ? (Number(form.totalPrice) / Number(form.quantity)).toFixed(2) : 0;

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const docId = form.itemName.toLowerCase().trim();
    const today = new Date().toLocaleDateString('en-GB');
    try {
      await addDoc(collection(db, "purchases"), { 
        ...form, itemName: docId, perUnitPrice: Number(perUnitPrice), createdAt: serverTimestamp(), date: today 
      });
      const invRef = doc(db, "inventory", docId);
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) {
        await updateDoc(invRef, { quantity: increment(Number(form.quantity)), lastUpdated: today, totalInvestment: increment(Number(form.totalPrice)) });
      } else {
        await setDoc(invRef, { itemName: docId, quantity: Number(form.quantity), unit: form.unit, lastUpdated: today, totalInvestment: Number(form.totalPrice) });
      }
      alert("সফলভাবে স্টক আপডেট হয়েছে!");
      setForm({ itemName: "", quantity: "", unit: "KG", totalPrice: "", supplierName: "", supplierNumber: "" });
      setShowSuggestions(false);
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === "low") return matchesSearch && item.quantity > 0 && item.quantity < 10;
    if (filterStatus === "out") return matchesSearch && item.quantity <= 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col lg:flex-row text-slate-900 font-sans tracking-tight">
      
      {/* মোবাইল এর জন্য হ্যামবার্গার বার */}
      <div className="lg:hidden bg-[#1A1A1A] p-4 flex justify-between items-center sticky top-0 z-[120] shadow-md">
        <h1 className="text-white font-bold italic">Bonomaya</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white p-1">
          {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* সাইডবার - পুরোপুরি অরিজিনাল ডিজাইন */}
      <aside className={`fixed inset-y-0 left-0 z-[130] w-72 lg:w-64 bg-[#1A1A1A] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 text-center border-b border-white/5">
          <div className="bg-[#D9480F] w-12 h-12 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-2 shadow-lg italic">B</div>
          <h2 className="text-lg font-bold italic tracking-tighter uppercase font-sans">ম্যানেজার প্যানেল</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2 font-sans">বনমায়া</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 font-sans">
          <button onClick={() => { setActiveSection("dashboard"); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'dashboard' ? 'bg-[#D9480F]' : 'hover:bg-white/5 opacity-70'}`}><LayoutDashboard size={20} /> ড্যাশবোর্ড</button>
          <button onClick={() => { setActiveSection("inventory"); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'inventory' ? 'bg-[#D9480F]' : 'hover:bg-white/5 opacity-70'}`}><Package size={20} /> ইনভেন্টরি</button>
          <button onClick={() => { setActiveSection("reports"); setSidebarOpen(false); }} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'reports' ? 'bg-[#D9480F]' : 'hover:bg-white/5 opacity-70'}`}><FileText size={20} /> রিপোর্টস</button>
        </nav>
        <button onClick={() => auth.signOut().then(() => router.push("/login"))} className="p-4 bg-red-900/20 text-red-400 hover:bg-red-900 hover:text-white flex gap-2 justify-center mt-auto border-t border-white/5 transition-all"><LogOut size={18} /> লগআউট</button>
      </aside>

      {/* মোবাইল মেনু ব্যাকড্রপ */}
      {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-[125] lg:hidden backdrop-blur-sm" />}

      <main className="flex-1 p-4 lg:p-10 overflow-y-auto h-screen w-full">
        
        {activeSection === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-700 font-sans">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-center md:text-left font-sans">
                    <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">স্বাগতম, মাসুম ভাই!</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">আজকের বনমায়া লজিস্টিকস ওভারভিউ</p>
                </div>
                <div className="flex gap-3 font-sans w-full md:w-auto">
                    <button onClick={() => setActiveSection("inventory")} className="flex-1 md:flex-none bg-[#D9480F] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all">বাজার এন্ট্রি</button>
                    <button onClick={() => setActiveSection("reports")} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:scale-105 transition-all font-sans">রিপোর্ট দেখুন</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-[#D9480F]">
                    <div className="flex justify-between items-center mb-2 font-sans font-bold"><h3 className="text-xs font-bold text-gray-500 uppercase">মোট খরচ (মাস)</h3><TrendingUp size={16} className="text-[#D9480F]" /></div>
                    <p className="text-2xl font-black font-sans">৳ {purchases.filter(p => Number(p.date?.split('/')[1]) === (new Date().getMonth() + 1)).reduce((a, c) => a + Number(c.totalPrice), 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-blue-600 font-sans"><div className="flex justify-between items-center mb-2 font-sans font-bold"><h3 className="text-xs font-bold text-gray-500 uppercase font-sans">লো স্টক আইটেম</h3><AlertTriangle size={16} className="text-red-500 font-sans" /></div><p className="text-2xl font-black text-red-600 font-sans tracking-tighter">{inventory.filter(i => i.quantity < 10).length} টি</p></div>
                <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl font-sans"><h3 className="text-gray-400 text-xs font-bold uppercase font-sans font-bold">অপারেশন</h3><p className="text-xl font-bold text-green-500 animate-pulse font-sans">● LIVE NOW</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-sans h-[350px]"><h3 className="text-sm font-black text-slate-800 uppercase mb-6 flex items-center gap-2 font-sans font-bold"><TrendingUp size={18} className="text-blue-500 font-sans" /> কেনাকাটার খরচ</h3><ResponsiveContainer width="100%" height="90%"><BarChart data={purchases.slice(0, 7).reverse()}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="date" hide={true} /><YAxis fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} /><Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} /><Bar dataKey="totalPrice" fill="#3474F5" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 font-sans h-[350px]"><h3 className="text-sm font-black text-slate-800 uppercase mb-6 flex items-center gap-2 font-sans font-bold"><Package size={18} className="text-orange-500" /> স্টক ডিস্ট্রিবিউশন</h3><ResponsiveContainer width="100%" height="90%"><PieChart><Pie data={inventory.slice(0, 5)} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="quantity" nameKey="itemName">{inventory.map((entry, index) => (<Cell key={`cell-${index}`} fill={['#3474F5', '#FF5C12', '#28C76F', '#7367F0', '#FF9F43'][index % 5]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {activeSection === "inventory" && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 font-sans font-bold uppercase">
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 font-sans font-bold uppercase tracking-tighter">
                    <div className="flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-xl text-blue-600 font-sans font-bold tracking-tighter uppercase"><Package /></div><h2 className="text-xl font-black uppercase italic tracking-tighter">মাস্টার স্টক লেজার</h2></div>
                    <div className="flex flex-wrap gap-2">
                        <div className="relative flex-1 md:w-64 font-sans font-bold tracking-tighter uppercase"><Search className="absolute left-3 top-2.5 text-slate-400 font-sans" size={16} /><input type="text" placeholder="আইটেম খুঁজুন..." className="pl-10 pr-4 py-2 w-full bg-slate-50 border rounded-xl text-sm outline-none focus:border-blue-500 font-sans font-bold uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} /></div>
                        <select onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"><option value="all">সব</option><option value="low">কম</option><option value="out">নেই</option></select>
                    </div>
                </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-8">
              <section className="xl:w-2/3 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans font-bold tracking-tighter uppercase">
                      <thead>
                        <tr className="bg-slate-800 text-white text-[11px] uppercase font-black tracking-widest">
                          <th className="p-4 tracking-widest">সর্বশেষ আপডেট</th><th className="p-4 tracking-widest">আইটেম</th><th className="p-4 text-center tracking-widest font-bold tracking-tighter uppercase">বর্তমান স্টক</th><th className="p-4 tracking-widest font-sans font-bold tracking-tighter uppercase">মোট বিনিয়োগ</th><th className="p-4 text-center tracking-widest font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-bold font-sans font-bold tracking-tighter uppercase">অবস্থা</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredInventory.map(item => (
                          <tr key={item.id} className="border-b hover:bg-orange-50/30 transition-all font-medium">
                            <td className="p-4 text-slate-500 text-xs font-sans font-bold tracking-tighter uppercase">{item.lastUpdated || "N/A"}</td>
                            <td className="p-4 font-bold uppercase text-slate-800 tracking-tight">{item.itemName}</td>
                            <td className="p-4 text-center">
                                {/* whitespace-nowrap যোগ করা হয়েছে যাতে ইউনিট পরিমাণ এর নিচে না যায় */}
                                <span className={`px-3 py-1 rounded-full font-bold whitespace-nowrap ${item.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                  {item.quantity} {item.unit}
                                </span>
                            </td>
                            <td className="p-4 font-black text-blue-600 tracking-tighter">৳{item.totalInvestment?.toLocaleString() || 0}</td>
                            <td className="p-4 text-center">{item.quantity <= 0 ? <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Out</span> : item.quantity < 10 ? <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Low</span> : <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter font-bold">OK</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </section>
              <section className="xl:w-1/3">
                <div className="bg-[#1A1A1A] text-white p-7 rounded-[2.5rem] shadow-2xl sticky top-4 border border-white/5 font-sans font-bold tracking-tighter uppercase">
                  <h2 className="text-lg font-bold mb-6 text-orange-500 border-b border-white/5 pb-3 flex gap-2 items-center italic font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase"><PlusCircle size={20}/> বাজার আপডেট</h2>
                  <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                    <div className="relative"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-1">আইটেম নাম</label><input type="text" placeholder="নাম..." value={form.itemName} onFocus={() => setShowSuggestions(true)} onChange={(e) => {setForm({...form, itemName: e.target.value}); setShowSuggestions(true);}} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl font-bold text-sm text-white focus:border-blue-500 outline-none" required />{showSuggestions && form.itemName && (<div className="absolute z-[200] w-full bg-white text-slate-900 mt-1 rounded-xl shadow-2xl max-h-48 overflow-y-auto">{inventory.filter(i => i.itemName.toLowerCase().includes(form.itemName.toLowerCase())).map(item => (<div key={item.id} className="p-3 hover:bg-orange-50 cursor-pointer text-sm font-bold border-b border-slate-50 flex justify-between uppercase" onClick={() => {setForm({...form, itemName: item.itemName, unit: item.unit}); setShowSuggestions(false);}}><span>{item.itemName}</span><span className="text-[10px] bg-slate-100 px-2 rounded font-sans font-bold tracking-tighter uppercase">{item.unit}</span></div>))}<button type="button" onClick={() => setShowSuggestions(false)} className="w-full p-2 text-[10px] font-bold text-red-500 bg-red-50 uppercase tracking-widest font-sans font-bold tracking-tighter uppercase">বন্ধ করুন</button></div>)}</div>
                    <div className="flex gap-2"><div className="flex-1"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-1">পরিমাণ</label><input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl font-bold text-white text-sm" required /></div><div className="w-24"><label className="text-[10px] font-black text-slate-500 uppercase ml-1 block mb-1">ইউনিট</label><select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl font-bold text-xs text-white h-[50px] outline-none cursor-pointer"><option className="text-black" value="KG">KG</option><option className="text-black" value="LTR">LTR</option><option className="text-black" value="PCS">PCS</option></select></div></div>
                    <div><label className="text-[10px] font-black text-blue-400 uppercase ml-1 block mb-1">মোট দাম (৳)</label><input type="number" placeholder="0.00" value={form.totalPrice} onChange={(e) => setForm({...form, totalPrice: e.target.value})} className="w-full bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl font-black text-blue-400 text-lg outline-none font-sans font-bold tracking-tighter uppercase" required /></div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2 font-medium font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase"><input type="text" placeholder="সাপ্লায়ার নাম" value={form.supplierName} onChange={(e) => setForm({...form, supplierName: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-1 text-xs outline-none text-white font-sans font-bold tracking-tighter uppercase" /><input type="text" placeholder="সাপ্লায়ার ফোন" value={form.supplierNumber} onChange={(e) => setForm({...form, supplierNumber: e.target.value})} className="w-full bg-transparent p-1 text-xs outline-none text-white font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase" /></div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all font-black font-sans font-bold tracking-tighter uppercase font-black">{loading ? "সেভ হচ্ছে..." : "স্টক কনফার্ম করুন"}</button>
                  </form>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeSection === "reports" && (
          <div className="space-y-8 animate-in fade-in duration-500 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border-t-4 border-blue-500 font-bold"><ShoppingBag className="text-blue-500 mb-2" size={24} /><h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-sans font-bold tracking-tighter uppercase">মোট কেনাকাটা (মাস)</h3><p className="text-2xl font-black tracking-tighter font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">৳ {purchases.filter(p => Number(p.date?.split('/')[1]) === (new Date().getMonth() + 1)).reduce((a, c) => a + Number(c.totalPrice), 0).toLocaleString()}</p></div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-emerald-500 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase text-slate-800 font-bold"><Truck className="text-emerald-500 mb-2" size={24} /><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans font-bold tracking-tighter uppercase">ভাউচার</h3><p className="text-2xl font-black text-slate-800 tracking-tighter font-sans font-bold tracking-tighter uppercase">{purchases.length} টি</p></div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border-t-4 border-orange-500 font-sans font-bold tracking-tighter uppercase text-slate-800 font-bold"><Calendar className="text-orange-500 mb-2" size={24} /><h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans font-bold tracking-tighter uppercase">শেষ বাজার</h3><p className="text-xl font-black text-slate-800 tracking-tight tracking-tighter font-sans font-bold tracking-tighter uppercase">{purchases[0]?.date || 'N/A'}</p></div>
                <div className="bg-blue-600 p-6 rounded-3xl shadow-lg border-t-4 border-white/20 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase"><TrendingUp className="text-white/80 mb-2 font-sans font-bold tracking-tighter uppercase" size={24} /><h3 className="text-[10px] font-bold text-blue-100 uppercase tracking-widest font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">বাজেট</h3><p className="text-xl font-black italic tracking-tighter uppercase leading-none font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">Healthy</p></div>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">
                <div className="p-7 bg-slate-50 border-b flex justify-between items-center font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">
                    <div className="font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">
                        <h2 className="text-xl font-black text-slate-800 italic uppercase tracking-tighter font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">অডিট রিপোর্ট</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 font-sans font-bold tracking-tighter uppercase">ভাউচার লিস্ট এবং ট্রানজাকশন হিস্ট্রি</p>
                    </div>
                    <button onClick={exportToExcel} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-200 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">Export</button>
                </div>
                <div className="overflow-x-auto font-sans font-bold tracking-tighter uppercase">
                    <table className="w-full text-left font-sans font-bold uppercase tracking-tighter">
                        <thead>
                            <tr className="bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] font-sans font-bold tracking-tighter uppercase">
                                <th className="p-5 tracking-widest font-sans font-bold tracking-tighter uppercase">তারিখ</th><th className="p-5 tracking-widest font-sans font-bold tracking-tighter uppercase">আইটেম</th><th className="p-5 text-center tracking-widest font-sans font-bold tracking-tighter uppercase">পরিমাণ</th><th className="p-5 text-right tracking-widest font-sans font-bold tracking-tighter uppercase">মোট দাম</th><th className="p-5 text-center tracking-widest font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-bold tracking-tighter uppercase tracking-widest font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">দর</th><th className="p-5 font-sans font-bold tracking-tighter uppercase tracking-widest font-sans font-bold tracking-tighter uppercase">সাপ্লায়ার</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {purchases.map((p, idx) => (
                                <tr key={p.id} className={`border-b border-slate-50 hover:bg-orange-50/20 transition-all font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                    <td className="p-5 font-bold text-slate-400 text-xs font-sans font-bold tracking-tighter uppercase">{p.date}</td>
                                    <td className="p-5 font-sans font-bold tracking-tighter uppercase"><span className="font-black text-slate-800 uppercase tracking-tight">{p.itemName}</span></td>
                                    <td className="p-5 text-center font-bold text-slate-700 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">{p.quantity} {p.unit}</td>
                                    <td className="p-5 text-right font-black text-blue-600 text-md font-sans font-bold tracking-tighter uppercase">৳{p.totalPrice?.toLocaleString()}</td>
                                    <td className="p-5 text-center text-slate-400 font-bold italic font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">৳{p.perUnitPrice || 0}</td>
                                    <td className="p-5 font-sans font-bold tracking-tighter uppercase font-medium text-slate-600 font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">{p.supplierName || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}
        
        <p className="text-center text-[10px] font-bold text-slate-300 tracking-[0.4em] uppercase mt-12 italic font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase font-sans font-bold tracking-tighter uppercase">Bonomaya Smart Logistics Terminal</p>
      </main>
    </div>
  );
}
export default withAuth(ManagerDashboard, "manager");