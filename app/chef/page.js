"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, increment, getDoc, setDoc } from "firebase/firestore";

export default function ChefDashboard() {
  const router = useRouter();
  
  // States
  const [rawMaterials, setRawMaterials] = useState([]); // কিচেন সেলফ (কাঁচামাল)
  const [finishedGoods, setFinishedGoods] = useState([]); // তৈরি করা খাবার (স্টোর)
  const [productions, setProductions] = useState([]); // আজকের রিপোর্ট
  
  const [prodName, setProdName] = useState("");
  const [prodQty, setProdQty] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ১. কিচেন সেলফ (Raw Materials) লোড
    const unsubRaw = onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => 
      setRawMaterials(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // ২. ফিনিশড গুডস (তৈরি খাবার) লোড
    const unsubGoods = onSnapshot(query(collection(db, "finished_goods"), orderBy("itemName", "asc")), (s) => 
      setFinishedGoods(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // ৩. আজকের প্রোডাকশন রিপোর্ট
    const unsubReport = onSnapshot(query(collection(db, "productions"), orderBy("createdAt", "desc")), (s) => 
      setProductions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubRaw(); unsubGoods(); unsubReport(); };
  }, []);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  // কিচেন সেলফ থেকে মাল নেওয়া (Deduction)
  const useRawMaterial = async (id, name, currentQty) => {
    const amount = prompt(`${name} কতটুকু রান্নায় নিচ্ছেন?`);
    if (amount && Number(amount) <= currentQty) {
      await updateDoc(doc(db, "inventory", id), {
        quantity: increment(-Number(amount)),
        lastUpdated: serverTimestamp()
      });
    } else if (Number(amount) > currentQty) { alert("সেলফে পর্যাপ্ত মাল নেই!"); }
  };

  // খাবার তৈরি করে স্টোরে পাঠানো (Production)
  const handleCompleteProduction = async (e) => {
    e.preventDefault();
    setLoading(true);
    const docId = prodName.toLowerCase().trim();

    try {
      // ১. প্রোডাকশন লগ সেভ
      await addDoc(collection(db, "productions"), {
        itemName: prodName,
        quantity: Number(prodQty),
        createdAt: serverTimestamp()
      });

      // ২. ফিনিশড গুডস স্টোরে মাল অ্যাড করা
      const goodsRef = doc(db, "finished_goods", docId);
      const goodsSnap = await getDoc(goodsRef);

      if (goodsSnap.exists()) {
        await updateDoc(goodsRef, {
          quantity: increment(Number(prodQty)),
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(goodsRef, {
          itemName: prodName,
          quantity: Number(prodQty),
          lastUpdated: serverTimestamp()
        });
      }

      alert("খাবারটি বিক্রির জন্য স্টোরে পাঠানো হয়েছে!");
      setProdName(""); setProdQty("");
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] flex flex-col md:flex-row font-sans">
      {/* Chef Sidebar */}
      <div className="w-full md:w-64 bg-orange-700 text-white flex flex-col shadow-2xl">
        <div className="p-8 text-2xl font-black italic border-b border-orange-800 text-center tracking-tighter">Bonomaya Kitchen</div>
        <nav className="flex-1 p-5 space-y-4 font-bold text-sm">
          <button className="w-full text-left p-4 rounded-2xl bg-orange-800 shadow-lg italic">👨‍🍳 Cooking Area</button>
          <button className="w-full text-left p-4 rounded-2xl hover:bg-orange-600 transition-all opacity-60">Inventory Request</button>
        </nav>
        <button onClick={handleLogout} className="m-5 p-4 bg-black/20 hover:bg-red-700 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Logout</button>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b p-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-black text-orange-700 uppercase italic">Chef Console</h1>
          <div className="text-xs font-bold text-gray-400 italic">Today: {new Date().toLocaleDateString('bn-BD')}</div>
        </header>

        <main className="p-6 overflow-y-auto space-y-8 pb-20 scrollbar-hide">
          
          {/* Section 1: Kitchen Shelf (Raw Materials) */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-orange-50">
            <h2 className="text-sm font-black text-gray-800 mb-6 uppercase tracking-[0.2em] italic">📦 কিচেন সেলফ (Raw Stock - Click to Use)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {rawMaterials.map((item) => (
                <div key={item.id} onClick={() => useRawMaterial(item.id, item.itemName, item.quantity)} 
                     className="bg-[#FFF9E6] p-5 rounded-[2rem] border-2 border-transparent hover:border-orange-400 cursor-pointer transition-all hover:scale-105 text-center">
                  <p className="text-[9px] uppercase font-black text-orange-400 mb-1 truncate">{item.itemName}</p>
                  <p className="text-xl font-black text-gray-800">{item.quantity} <span className="text-[10px] uppercase">{item.unit}</span></p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 2: Production Form */}
            <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-orange-50 h-fit">
              <h2 className="text-md font-black mb-6 text-gray-800 border-b pb-4 uppercase italic">🍲 খাবার তৈরি সম্পন্ন করুন (Production)</h2>
              <form onSubmit={handleCompleteProduction} className="space-y-4">
                <input type="text" placeholder="খাবারের নাম (যেমন: চিকেন বান)" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-orange-500 bg-slate-50 font-bold text-sm" required />
                <input type="number" placeholder="কত পিস তৈরি হলো?" value={prodQty} onChange={(e) => setProdQty(e.target.value)} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-orange-500 bg-slate-50 font-bold text-sm" required />
                <button disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-700 transition shadow-xl shadow-orange-100">
                  {loading ? "Processing..." : "Move to Store"}
                </button>
              </form>
            </section>

            {/* Section 3: Finished Goods Store (Current Inventory for Sale) */}
            <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-green-50">
              <h2 className="text-md font-black mb-6 text-green-700 border-b pb-4 uppercase italic">🥐 ফিনিশড গুডস স্টোর (Stock for Sale)</h2>
              <div className="grid grid-cols-2 gap-4">
                {finishedGoods.map((good) => (
                  <div key={good.id} className="bg-green-50 p-5 rounded-[2rem] border-2 border-green-100 text-center">
                    <p className="text-[9px] uppercase font-black text-green-500 mb-1">{good.itemName}</p>
                    <p className="text-2xl font-black text-green-800">{good.quantity} <span className="text-xs">PCS</span></p>
                    <p className="text-[8px] font-bold text-green-400 mt-1">Ready for Customer</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Section 4: Daily Report Table */}
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b font-black text-slate-800 bg-slate-50 text-[10px] uppercase tracking-widest italic">আজকের প্রোডাকশন লগ (Report)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black">
                  <tr><th className="p-4">সময়</th><th className="p-4">আইটেম</th><th className="p-4">পরিমাণ</th><th className="p-4">অবস্থা</th></tr>
                </thead>
                <tbody className="text-slate-600 font-bold">
                  {productions.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-orange-50 transition-all text-xs">
                      <td className="p-4 text-slate-400">{p.createdAt?.toDate().toLocaleTimeString('bn-BD')}</td>
                      <td className="p-4 text-orange-700 uppercase font-black">{p.itemName}</td>
                      <td className="p-4">{p.quantity} Pcs</td>
                      <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[8px] font-black uppercase">Stored</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}