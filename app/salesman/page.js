"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, where, doc, updateDoc, increment, deleteDoc, orderBy } from "firebase/firestore";
import { 
  Menu, X, LayoutDashboard, ShoppingCart, CheckSquare, Trash2, LogOut, 
  Store, PlusCircle, ArrowRightCircle, History, AlertTriangle, CheckCircle2
} from "lucide-react";

export default function SalesmanDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("receive"); 
  const [pendingProductions, setPendingProductions] = useState([]); 
  const [readyToSell, setReadyToSell] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ১. শেফের পাঠানো পেন্ডিং মাল (যা সেলসম্যান একসেপ্ট করবে)
    const qPending = query(collection(db, "productions"), where("status", "==", "pending"));
    const unsubPending = onSnapshot(qPending, (s) => setPendingProductions(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // ২. বিক্রির জন্য তৈরি মাল (যা অলরেডি একসেপ্ট করা হয়েছে)
    const qReady = query(collection(db, "ready_stock"), orderBy("itemName", "asc"));
    const unsubReady = onSnapshot(qReady, (s) => setReadyToSell(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubPending(); unsubReady(); };
  }, []);

  // শেফের মাল একসেপ্ট করা এবং রেডি স্টকে যোগ করা
  const acceptProduction = async (prod) => {
    try {
      const stockRef = doc(db, "ready_stock", prod.itemName.toLowerCase());
      // চেক করা হচ্ছে স্টকে আগে থেকেই আছে কি না
      const readyRef = collection(db, "ready_stock");
      
      await updateDoc(doc(db, "productions", prod.id), { status: "accepted" });
      
      // রেডি স্টকে যোগ বা আপডেট
      await addDoc(collection(db, "ready_stock_logs"), { 
        itemName: prod.itemName, quantity: prod.quantity, type: "receive", date: new Date().toLocaleDateString('en-GB') 
      });

      // এখানে লজিক্যালি ready_stock কালেকশনে আইটেমটি আপডেট হবে
      alert(`${prod.itemName} সফলভাবে রিসিভ করা হয়েছে!`);
    } catch (e) { alert(e.message); }
  };

  // বিক্রি এন্ট্রি দেওয়া (স্টক থেকে মাইনাস হবে)
  const handleSale = async (item, saleQty) => {
    if (!saleQty || saleQty <= 0) return;
    try {
      await addDoc(collection(db, "sales"), {
        itemName: item.itemName,
        quantity: Number(saleQty),
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString('en-GB')
      });
      alert("বিক্রি এন্ট্রি সফল!");
    } catch (e) { alert(e.message); }
  };

  // দিন শেষে ওয়েস্টেজ পাঠানো
  const handleWastage = async (item, wasteQty) => {
    if (!wasteQty || wasteQty <= 0) return;
    try {
      await addDoc(collection(db, "wastage"), {
        itemName: item.itemName,
        quantity: Number(wasteQty),
        reason: "Daily Leftover",
        date: new Date().toLocaleDateString('en-GB'),
        createdAt: serverTimestamp()
      });
      alert("ওয়েস্টেজ হিসেবে সেভ করা হয়েছে!");
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col lg:flex-row text-slate-900 font-sans tracking-tight">
      
      {/* মোবাইল বার */}
      <div className="lg:hidden bg-[#1A1A1A] p-4 flex justify-between items-center sticky top-0 z-[120]">
        <h1 className="text-white font-bold italic">Bonomaya Sales</h1>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white"><Menu size={28} /></button>
      </div>

      {/* সাইডবার */}
      <aside className={`fixed inset-y-0 left-0 z-[130] w-72 lg:w-64 bg-[#1A1A1A] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-8 text-center border-b border-white/5">
          <div className="bg-blue-600 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg"><Store size={24} /></div>
          <h2 className="text-lg font-bold italic uppercase">সেলসম্যান প্যানেল</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">বুনোমায়া আউটলেট</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveSection("receive"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'receive' ? 'bg-blue-600' : 'hover:bg-white/5 opacity-70'}`}><CheckSquare size={20} /> মাল রিসিভ করুন</button>
          <button onClick={() => {setActiveSection("sales"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'sales' ? 'bg-blue-600' : 'hover:bg-white/5 opacity-70'}`}><ShoppingCart size={20} /> বিক্রি এন্ট্রি</button>
          <button onClick={() => {setActiveSection("wastage"); setSidebarOpen(false);}} className={`w-full text-left p-3 rounded-xl flex gap-3 transition-all ${activeSection === 'wastage' ? 'bg-blue-600' : 'hover:bg-white/5 opacity-70'}`}><Trash2 size={20} /> ওয়েস্টেজ / লস</button>
        </nav>
        <button onClick={() => auth.signOut().then(() => router.push("/login"))} className="p-4 bg-red-900/20 text-red-400 hover:bg-red-900 hover:text-white flex gap-2 justify-center mt-auto border-t border-white/5 transition-all font-black uppercase text-[10px]"><LogOut size={18} /> লগআউট</button>
      </aside>

      {/* মেইন কন্টেন্ট */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto h-screen w-full font-sans font-bold uppercase tracking-tighter">
        
        {/* ১. শেফ থেকে মাল রিসিভ করার সেকশন */}
        {activeSection === "receive" && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center">
               <div>
                  <h2 className="text-2xl font-black text-slate-800 italic uppercase">কিচেন থেকে আসা মাল</h2>
                  <p className="text-slate-400 text-xs font-bold mt-1">শেফ যা পাঠিয়েছেন তা গুনে একসেপ্ট করুন</p>
               </div>
               <div className="bg-blue-50 px-6 py-2 rounded-full text-blue-600 text-xs font-black">পেন্ডিং: {pendingProductions.length} টি</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProductions.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed text-slate-300">এখনও কোনো মাল আসেনি</div>
              ) : (
                pendingProductions.map(prod => (
                  <div key={prod.id} className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-blue-50 hover:border-blue-200 transition-all group">
                    <h3 className="text-lg font-black text-slate-800 mb-1">{prod.itemName}</h3>
                    <p className="text-3xl font-black text-blue-600 mb-4">{prod.quantity} <span className="text-sm">পিস</span></p>
                    <button 
                      onClick={() => acceptProduction(prod)}
                      className="w-full bg-blue-600 text-white py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      <CheckCircle2 size={18}/> রিসিভ কনফার্ম
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ২. বিক্রি এন্ট্রি সেকশন */}
        {activeSection === "sales" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-[#1A1A1A] text-white p-8 rounded-[2.5rem] shadow-2xl">
                <h2 className="text-xl font-bold italic mb-6 text-blue-400 flex items-center gap-2"><PlusCircle /> আজকের সেলস এন্ট্রি</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* এটি ডাইনামিক হবে আপনার ready_stock ডাটাবেস অনুযায়ী */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-3xl">
                     <p className="text-xs text-slate-400 mb-1 uppercase">চিকেন প্যাটি</p>
                     <div className="flex gap-2">
                        <input type="number" placeholder="qty" className="w-full bg-white/10 border-0 rounded-xl p-2 text-white" />
                        <button className="bg-blue-600 p-2 rounded-xl"><ArrowRightCircle /></button>
                     </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* ৩. ওয়েস্টেজ সেকশন */}
        {activeSection === "wastage" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                <h2 className="text-xl font-black text-red-700 italic uppercase flex items-center gap-2"><AlertTriangle /> ওয়েস্টেজ / লস এন্ট্রি</h2>
                <p className="text-red-400 text-xs mt-1">দিন শেষে বেঁচে যাওয়া বা নষ্ট হওয়া মাল এখানে লিখুন</p>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-800 text-white">
                    <tr><th className="p-5">আইটেম</th><th className="p-5 text-center">পরিমাণ</th><th className="p-5 text-right">অ্যাকশন</th></tr>
                  </thead>
                  <tbody>
                    {/* এখানে আপনার বিক্রির জন্য থাকা মালের লিস্ট আসবে */}
                    <tr className="border-b">
                       <td className="p-5">উদাহরণ আইটেম</td>
                       <td className="p-5 text-center">৫ পিস</td>
                       <td className="p-5 text-right"><button className="text-red-500 hover:underline">নষ্ট হয়েছে</button></td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] font-bold text-slate-300 tracking-[0.4em] uppercase mt-12 italic">Bonomaya Sales Terminal v3.2</p>
      </main>
    </div>
  );
}