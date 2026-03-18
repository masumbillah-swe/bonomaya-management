"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { 
  Menu, X, LayoutDashboard, UtensilsCrossed, PackageSearch, LogOut, 
  ChefHat, PlusCircle, CheckCircle2, History, Search, ArrowDownCircle
} from "lucide-react";

import withAuth from "../../components/withAuth";
function ChefDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard"); 
  const [inventory, setInventory] = useState([]); 
  const [productions, setProductions] = useState([]); 
  const [loading, setLoading] = useState(false);

  // States for Raw Materials Issue
  const [rawForm, setRawForm] = useState({ itemName: "", quantity: "" });
  const [showRawSuggestions, setShowRawSuggestions] = useState(false);

  // States for Production Entry
  const [prodForm, setProdForm] = useState({ itemName: "", quantity: "" });

  useEffect(() => {
    // ইনভেন্টরি ডাটা (কাঁচামাল দেখার জন্য)
    onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    // প্রোডাকশন ডাটা (শেফের নিজের কাজের ইতিহাস)
    onSnapshot(query(collection(db, "productions"), orderBy("createdAt", "desc")), (s) => setProductions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  // ১. ইনভেন্টরি থেকে কাঁচামাল নেওয়ার ফাংশন
  const handleRawIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    const docId = rawForm.itemName.toLowerCase().trim();
    const invRef = doc(db, "inventory", docId);
    
    try {
      const invSnap = await getDoc(invRef);
      if (!invSnap.exists()) {
        alert("এই কাঁচামালটি ইনভেন্টরিতে নেই!");
      } else if (invSnap.data().quantity < Number(rawForm.quantity)) {
        alert("স্টকে পর্যাপ্ত মাল নেই!");
      } else {
        await updateDoc(invRef, { quantity: increment(-Number(rawForm.quantity)) });
        alert("ইনভেন্টরি থেকে মাল সংগ্রহ সফল!");
        setRawForm({ itemName: "", quantity: "" });
      }
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  // ২. প্রোডাকশন (তৈরি মাল) এন্ট্রি দেওয়া (সেলসম্যানের কাছে যাবে)
  const handleProductionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "productions"), {
        itemName: prodForm.itemName.toLowerCase(),
        quantity: Number(prodForm.quantity),
        status: "pending", // সেলসম্যান একসেপ্ট করার আগ পর্যন্ত পেন্ডিং
        chefName: auth.currentUser?.email || "Chef",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-GB')
      });
      alert("প্রোডাকশন এন্ট্রি সেলসম্যানের কাছে পাঠানো হয়েছে!");
      setProdForm({ itemName: "", quantity: "" });
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col lg:flex-row text-slate-900 font-sans tracking-tight">
      
      {/* মোবাইল বার */}
      <div className="lg:hidden bg-[#1A1A1A] p-4 flex justify-between items-center sticky top-0 z-[120]">
        <h1 className="text-white font-bold italic">Bonomaya Kitchen</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white"><Menu size={28} /></button>
      </div>

      {/* সাইডবার */}
      <aside className={`fixed inset-y-0 left-0 z-[130] w-72 lg:w-64 bg-[#1A1A1A] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 text-center border-b border-white/5">
          <div className="bg-orange-600 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg"><ChefHat size={24} /></div>
          <h2 className="text-lg font-bold italic tracking-tighter uppercase">শেফ টার্মিনাল</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">বনমায়া কিচেন</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveSection("dashboard"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'dashboard' ? 'bg-orange-600' : 'hover:bg-white/5 opacity-70'}`}><LayoutDashboard size={20} /> ড্যাশবোর্ড</button>
          <button onClick={() => {setActiveSection("issue"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'issue' ? 'bg-orange-600' : 'hover:bg-white/5 opacity-70'}`}><PackageSearch size={20} /> কাঁচামাল সংগ্রহ</button>
          <button onClick={() => {setActiveSection("production"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'production' ? 'bg-orange-600' : 'hover:bg-white/5 opacity-70'}`}><UtensilsCrossed size={20} /> প্রোডাকশন এন্ট্রি</button>
        </nav>
        <button onClick={() => auth.signOut().then(() => router.push("/login"))} className="p-4 bg-red-900/20 text-red-400 hover:bg-red-900 hover:text-white flex gap-2 justify-center mt-auto border-t border-white/5 transition-all"><LogOut size={18} /> লগআউট</button>
      </aside>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto h-screen w-full">
        
        {/* ড্যাশবোর্ড ওভারভিউ */}
        {activeSection === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">রান্নাঘর আপডেট</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">আজকের কাজের সংক্ষিপ্ত বিবরণ</p>
                </div>
                <UtensilsCrossed size={48} className="text-orange-100 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border-l-8 border-orange-500">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">আজকের প্রোডাকশন</h3>
                    <p className="text-2xl font-black">{productions.filter(p => p.date === new Date().toLocaleDateString('en-GB')).length} টি আইটেম</p>
                </div>
                <div className="bg-[#1A1A1A] text-white p-6 rounded-3xl">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-2">পেন্ডিং একসেপ্টেন্স</h3>
                    <p className="text-2xl font-black text-orange-500">{productions.filter(p => p.status === "pending").length} টি</p>
                </div>
            </div>
          </div>
        )}

        {/* কাঁচামাল সংগ্রহ (Raw Materials Issue) */}
        {activeSection === "issue" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2"><ArrowDownCircle className="text-red-500" /> ইনভেন্টরি থেকে মাল সংগ্রহ</h2>
                <form onSubmit={handleRawIssue} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="relative">
                      <input 
                        type="text" placeholder="কাঁচামালের নাম..." 
                        value={rawForm.itemName} 
                        onFocus={() => setShowRawSuggestions(true)}
                        onChange={(e) => setRawForm({...rawForm, itemName: e.target.value})}
                        className="w-full bg-slate-50 border p-4 rounded-2xl font-bold text-sm outline-none focus:border-orange-500" required 
                      />
                      {showRawSuggestions && rawForm.itemName && (
                        <div className="absolute z-50 w-full bg-white border mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto font-bold uppercase text-xs">
                          {inventory.filter(i => i.itemName.toLowerCase().includes(rawForm.itemName.toLowerCase())).map(item => (
                            <div key={item.id} className="p-3 hover:bg-orange-50 cursor-pointer border-b last:border-0" onClick={() => {setRawForm({itemName: item.itemName, quantity: ""}); setShowRawSuggestions(false);}}>
                              {item.itemName} (স্টক: {item.quantity} {item.unit})
                            </div>
                          ))}
                        </div>
                      )}
                   </div>
                   <input type="number" placeholder="পরিমাণ..." value={rawForm.quantity} onChange={(e) => setRawForm({...rawForm, quantity: e.target.value})} className="bg-slate-50 border p-4 rounded-2xl font-bold text-sm outline-none focus:border-orange-500" required />
                   <button disabled={loading} className="bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100">সংগ্রহ করুন</button>
                </form>
             </div>
          </div>
        )}

        {/* প্রোডাকশন এন্ট্রি (তৈরি মাল) */}
        {activeSection === "production" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-4 font-bold uppercase tracking-tighter">
             <section>
                <div className="bg-[#1A1A1A] text-white p-8 rounded-[2.5rem] shadow-2xl">
                    <h2 className="text-xl font-bold italic mb-6 text-orange-500 flex items-center gap-2"><PlusCircle /> নতুন তৈরি মালের এন্ট্রি</h2>
                    <form onSubmit={handleProductionSubmit} className="space-y-4">
                        <input type="text" placeholder="আইটেম: যেমন- প্যাটি, বার্গার" value={prodForm.itemName} onChange={(e) => setProdForm({...prodForm, itemName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm text-white outline-none focus:border-orange-500" required />
                        <input type="number" placeholder="কত পিস তৈরি হয়েছে?" value={prodForm.quantity} onChange={(e) => setProdForm({...prodForm, quantity: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold text-sm text-white outline-none" required />
                        <button disabled={loading} className="w-full bg-orange-600 py-4 rounded-2xl font-black uppercase shadow-xl hover:bg-orange-500 transition-all">সেলসম্যানকে পাঠান</button>
                    </form>
                </div>
             </section>

             <section>
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b flex items-center gap-2 font-black italic"><History size={20} /> আজকের প্রোডাকশন লিস্ট</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-800 text-white font-black uppercase">
                                <tr><th className="p-4">আইটেম</th><th className="p-4">পরিমাণ</th><th className="p-4">অবস্থা</th></tr>
                            </thead>
                            <tbody>
                                {productions.slice(0, 10).map(p => (
                                    <tr key={p.id} className="border-b hover:bg-orange-50/20 transition-all uppercase">
                                        <td className="p-4 font-black">{p.itemName}</td>
                                        <td className="p-4 font-bold">{p.quantity} পিস</td>
                                        <td className="p-4 text-center">
                                            {p.status === "pending" ? 
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[9px] font-black">Pending</span> : 
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[9px] font-black italic flex items-center gap-1"><CheckCircle2 size={10}/> Accepted</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </section>
          </div>
        )}
        
        <p className="text-center text-[10px] font-bold text-slate-300 tracking-[0.4em] uppercase mt-12 italic">Bonomaya Kitchen Terminal v3.1</p>
      </main>
    </div>
  );
}
export default withAuth(AdminDashboard, "Chef");