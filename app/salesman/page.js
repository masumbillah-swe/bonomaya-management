"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, updateDoc, increment } from "firebase/firestore";

export default function SalesmanDashboard() {
  const router = useRouter();
  
  // States
  const [finishedGoods, setFinishedGoods] = useState([]); // বিক্রির জন্য তৈরি মাল
  const [salesHistory, setSalesHistory] = useState([]); // আজকের বিক্রির তালিকা
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ১. বিক্রির জন্য স্টোরে যা আছে (Finished Goods) লোড করা
    const unsubGoods = onSnapshot(query(collection(db, "finished_goods"), orderBy("itemName", "asc")), (s) => 
      setFinishedGoods(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    // ২. আজকের বিক্রির রিপোর্ট লোড করা
    const unsubSales = onSnapshot(query(collection(db, "transactions"), orderBy("createdAt", "desc")), (s) => {
        const allTrans = s.docs.map(d => ({ id: d.id, ...d.data() }));
        setSalesHistory(allTrans.filter(t => t.type === "sale"));
    });
    
    return () => { unsubGoods(); unsubSales(); };
  }, []);

  const handleLogout = async () => { await signOut(auth); router.push("/login"); };

  // বিক্রি সম্পন্ন করার ফাংশন (Smart Sale Logic)
  const handleSale = async (id, name, currentQty) => {
    const saleQty = prompt(`${name} কয়টি বিক্রি হলো?`);
    const price = prompt(`মোট বিক্রয়মূল্য (৳) কত?`);

    if (saleQty && price && Number(saleQty) <= currentQty) {
      setLoading(true);
      try {
        // ১. ট্রানজাকশন লেজারে বিক্রি সেভ করা
        await addDoc(collection(db, "transactions"), {
          type: "sale",
          itemName: name,
          quantity: Number(saleQty),
          amount: Number(price),
          seller: "Salesman",
          createdAt: serverTimestamp()
        });

        // ২. ফিনিশড গুডস স্টোর থেকে মাল কমিয়ে দেওয়া
        await updateDoc(doc(db, "finished_goods", id), {
          quantity: increment(-Number(saleQty)),
          lastUpdated: serverTimestamp()
        });

        alert("বিক্রি সফলভাবে রেকর্ড করা হয়েছে!");
      } catch (e) { alert(e.message); }
      setLoading(false);
    } else if (Number(saleQty) > currentQty) {
      alert("দুঃখিত! স্টকে পর্যাপ্ত মাল নেই।");
    }
  };

  const totalTodaySale = salesHistory.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-green-800 text-white flex flex-col shadow-xl">
        <div className="p-8 text-2xl font-black italic border-b border-green-700 text-center uppercase tracking-tighter">Bonomaya Sales</div>
        <nav className="flex-1 p-5 space-y-4 font-bold text-sm">
          <button className="w-full text-left p-4 rounded-2xl bg-green-900 shadow-lg italic">🛒 Counter POS</button>
          <div className="bg-green-900/50 p-4 rounded-2xl border border-green-400/30 text-center">
            <p className="text-[10px] uppercase opacity-70">Today's Cash</p>
            <p className="text-xl font-black text-white italic">৳ {totalTodaySale}</p>
          </div>
        </nav>
        <button onClick={handleLogout} className="m-5 p-4 bg-black/20 hover:bg-red-700 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">Logout</button>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b p-6 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-black text-green-800 uppercase italic">Counter Dashboard</h1>
          <div className="text-xs font-bold text-gray-400">Sales Status: <span className="text-green-600 animate-pulse">Online ●</span></div>
        </header>

        <main className="p-6 overflow-y-auto space-y-8 pb-20 scrollbar-hide">
          
          {/* Section 1: Product Shelf for Sale */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-green-100">
            <h2 className="text-sm font-black text-gray-800 mb-6 uppercase tracking-[0.2em] italic">🛍️ বিক্রির জন্য পণ্য (Click to Sell)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {finishedGoods.map((item) => (
                <div key={item.id} onClick={() => handleSale(item.id, item.itemName, item.quantity)} 
                     className="bg-green-50/50 p-6 rounded-[2.5rem] border-2 border-transparent hover:border-green-500 cursor-pointer transition-all hover:scale-105 shadow-sm text-center">
                  <p className="text-[10px] uppercase font-black text-green-600 mb-1 truncate">{item.itemName}</p>
                  <p className="text-2xl font-black text-gray-800">{item.quantity} <span className="text-xs">PCS</span></p>
                  <button className="mt-3 text-[9px] font-black uppercase bg-green-600 text-white px-4 py-1 rounded-full">Sell Now</button>
                </div>
              ))}
              {finishedGoods.length === 0 && <p className="col-span-full text-center text-gray-400 italic">স্টোরে কোনো মাল নেই। শেফকে মাল পাঠাতে বলুন।</p>}
            </div>
          </section>

          {/* Section 2: Recent Sales Ledger */}
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b font-black text-slate-800 bg-slate-50 text-[10px] uppercase tracking-widest italic">সাম্প্রতিক বিক্রয় তালিকা (Recent Sales)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black">
                  <tr><th className="p-4">সময়</th><th className="p-4">পণ্য</th><th className="p-4">পরিমাণ</th><th className="p-4">মূল্য (৳)</th></tr>
                </thead>
                <tbody className="text-slate-600 font-bold">
                  {salesHistory.slice(0, 10).map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-green-50 transition-all text-xs">
                      <td className="p-4 text-slate-400 font-normal">{sale.createdAt?.toDate().toLocaleTimeString('bn-BD')}</td>
                      <td className="p-4 text-green-800 uppercase font-black">{sale.itemName}</td>
                      <td className="p-4">{sale.quantity} Pcs</td>
                      <td className="p-4 font-black">৳{sale.amount}</td>
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