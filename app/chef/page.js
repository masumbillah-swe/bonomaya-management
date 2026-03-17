"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { motion } from "framer-motion";
import { Menu, X, UtensilsCrossed, Package, LogOut, ClipboardList, ChefHat, ChevronRight } from "lucide-react";

export default function ChefDashboard() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // States
  const [rawMaterials, setRawMaterials] = useState([]); // কিচেন ইনভেন্টরি
  const [productions, setProductions] = useState([]); // প্রোডাকশন হিস্ট্রি
  
  const [prodName, setProdName] = useState("");
  const [prodQty, setProdQty] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ১. কিচেন সেলফ (Raw Materials) - ডাইনামিক রিড
    const unsubRaw = onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => 
      setRawMaterials(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // ২. আজকের প্রোডাকশন রিপোর্ট (পেন্ডিং এবং একসেপ্টেড সব)
    const unsubReport = onSnapshot(query(collection(db, "production"), orderBy("createdAt", "desc")), (s) => 
      setProductions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubRaw(); unsubReport(); };
  }, []);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  // কিচেন সেলফ থেকে মাল কমানো (Cooking use)
  const useRawMaterial = async (id, name, currentQty) => {
    const amount = prompt(`${name} কতটুকু রান্নায় নিচ্ছেন?`);
    if (amount && Number(amount) <= currentQty) {
      await updateDoc(doc(db, "inventory", id), {
        quantity: increment(-Number(amount)),
        lastUpdated: serverTimestamp()
      });
    } else if (Number(amount) > currentQty) { alert("সেলফে পর্যাপ্ত মাল নেই!"); }
  };

  // খাবার তৈরি করে সেলসম্যানের কাছে পাঠানো (Pending Status)
  const handleProductionEntry = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // সেলসম্যানের কাছে 'Pending' অবস্থায় ডেটা পাঠানো হচ্ছে
      await addDoc(collection(db, "production"), {
        itemName: prodName,
        quantity: Number(prodQty),
        unit: "Pcs",
        status: "Pending", // এটা সেলসম্যানের কাছে ভেসে উঠবে
        chefName: "Chef Masum", 
        createdAt: serverTimestamp()
      });

      alert("প্রোডাকশন এন্ট্রি হয়েছে! সেলসম্যান একসেপ্ট করলে স্টক আপডেট হবে।");
      setProdName(""); setProdQty("");
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex font-sans text-gray-800">
      
      {/* SIDEBAR (Orange Gradient) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#D9480F] to-[#FF6B3F] text-white transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static flex flex-col shadow-2xl
      `}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30">
            <ChefHat size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight italic">Chef Console</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">Kitchen Unit</p>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/10 font-bold transition-all border border-white/5 shadow-lg">
            <span className="flex items-center gap-4"><UtensilsCrossed size={20}/> Cooking Area</span>
            <ChevronRight size={16} />
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 font-semibold transition-all opacity-80">
            <ClipboardList size={20}/> Daily Report
          </button>
        </nav>

        <div className="p-6">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 font-bold text-xs">
            <LogOut size={18}/> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md p-5 flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[#D9480F]"><Menu/></button>
          <h2 className="text-xl font-bold text-gray-700 hidden md:block uppercase tracking-tighter">Kitchen Management</h2>
          <div className="w-9 h-9 bg-orange-100 text-[#D9480F] rounded-full flex items-center justify-center font-black">C</div>
        </header>

        <main className="p-4 md:p-10 space-y-8 pb-24">
          
          {/* Section 1: Kitchen Self (Inventory Use) */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-[#D9480F] uppercase tracking-[0.2em]">📦 কিচেন সেলফ (Raw Materials)</h3>
               <span className="text-[10px] text-gray-400 font-bold italic underline cursor-help">Click an item to use it in cooking</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {rawMaterials.map((item) => (
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  key={item.id} 
                  onClick={() => useRawMaterial(item.id, item.itemName, item.quantity)} 
                  className="bg-[#FFF8F0] p-5 rounded-3xl border border-orange-50 hover:border-orange-200 cursor-pointer text-center group"
                >
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{item.itemName}</p>
                  <p className="text-xl font-black text-gray-800">{item.quantity} <span className="text-[10px] opacity-40 uppercase">{item.unit}</span></p>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 2: Production Form (Same style as Login Box) */}
            <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 h-fit">
              <h3 className="text-sm font-black text-[#D9480F] uppercase tracking-[0.2em] mb-8 border-b pb-4">Create Production Batch</h3>
              <form onSubmit={handleProductionEntry} className="space-y-6">
                <input type="text" placeholder="আইটেমের নাম (যেমন: চিকেন রোল)" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#D9480F]/40 outline-none font-semibold text-sm transition-all" required />
                <input type="number" placeholder="পরিমাণ (Pcs)" value={prodQty} onChange={(e) => setProdQty(e.target.value)} className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#D9480F]/40 outline-none font-semibold text-sm transition-all" required />
                <button disabled={loading} className="w-full p-4 bg-[#D9480F] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-orange-950/20 text-xs">
                  {loading ? "Syncing..." : "Send to Salesroom"}
                </button>
              </form>
            </section>

            {/* Section 3: Today's Log (Split View List) */}
            <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 border-b pb-4">Today's Production Log</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {productions.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-black text-gray-800 text-sm uppercase">{p.itemName}</p>
                      <p className="text-[10px] font-bold text-gray-400 italic">{p.createdAt?.toDate().toLocaleTimeString('bn-BD')}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-black text-[#D9480F]">{p.quantity} <span className="text-[10px] uppercase font-bold">Pcs</span></p>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === "Pending" ? "bg-orange-100 text-orange-600 animate-pulse" : "bg-green-100 text-green-600"}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </main>

        <p className="text-center text-gray-400 text-[10px] pb-10 uppercase tracking-widest font-medium">
          Bonomaya Kitchen Automation • Maverick
        </p>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" />
      )}
    </div>
  );
}