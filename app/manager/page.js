"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export default function ManagerDashboard() {
  const router = useRouter();
  const [inventory, setInventory] = useState([]); 
  const [purchases, setPurchases] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Form States (Aligned with image requirement)
  const [form, setForm] = useState({ 
    itemName: "", quantity: "", unit: "KG", totalPrice: "", supplierName: "", supplierNumber: "", remarks: "" 
  });

  useEffect(() => {
    onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (s) => setInventory(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    onSnapshot(query(collection(db, "purchases"), orderBy("createdAt", "desc")), (s) => setPurchases(s.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const perUnitPrice = (form.totalPrice && form.quantity) ? (Number(form.totalPrice) / Number(form.quantity)).toFixed(2) : 0;

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const docId = form.itemName.toLowerCase().trim();
    try {
      await addDoc(collection(db, "purchases"), { ...form, itemName: docId, perUnitPrice: Number(perUnitPrice), createdAt: serverTimestamp(), date: new Date().toLocaleDateString('bn-BD') });
      const invRef = doc(db, "inventory", docId);
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) {
        await updateDoc(invRef, { quantity: increment(Number(form.quantity)), lastUpdated: serverTimestamp() });
      } else {
        await setDoc(invRef, { itemName: docId, quantity: Number(form.quantity), unit: form.unit, lastUpdated: serverTimestamp() });
      }
      alert("স্টক আপডেট হয়েছে!");
      setForm({ itemName: "", quantity: "", unit: "KG", totalPrice: "", supplierName: "", supplierNumber: "", remarks: "" });
    } catch (error) { alert(error.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-800">
      
      {/* Sidebar - Matching the new UI */}
      <aside className="w-64 bg-[#C83E0D] text-white flex flex-col shadow-2xl">
        <div className="p-8 text-2xl font-black italic tracking-tighter">Bonomaya</div>
        <nav className="flex-1 px-4 space-y-2">
          <button className="w-full text-left p-4 rounded-xl bg-white/10 font-bold">Dashboard</button>
          <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 font-bold opacity-70">Inventory</button>
          <button className="w-full text-left p-4 rounded-xl hover:bg-white/5 font-bold opacity-70">Reports</button>
        </nav>
        <button onClick={() => auth.signOut().then(() => router.push("/login"))} className="m-6 p-4 bg-black/20 rounded-xl font-bold uppercase text-[10px] tracking-widest text-center">Logout</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-10 space-y-8 scrollbar-hide">
        <header className="flex justify-between items-center">
          <h1 className="text-xl font-black uppercase text-slate-800">Bonomaya Manager</h1>
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-slate-500 italic">Moshiur Bhai</span>
             <div className="w-10 h-10 bg-[#FF5C12] text-white rounded-full flex items-center justify-center font-black">M</div>
          </div>
        </header>

        {/* Top Stats Cards - Exactly like your new UI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border-l-8 border-[#FF5C12] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">এই মাসের কেনাকাটা</p>
            <p className="text-2xl font-black">৳ {purchases.reduce((a, c) => a + Number(c.totalPrice), 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border-l-8 border-[#3474F5] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">লো স্টক এলার্ট</p>
            <p className="text-2xl font-black text-red-600">{inventory.filter(i => i.quantity < 10).length} টি আইটেম কম ⚠️</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border-l-8 border-[#28C76F] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">অপারেশন</p>
            <p className="text-2xl font-black italic tracking-tighter">LIVE NOW</p>
          </div>
        </div>

        {/* Form and Real-time Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form Card - Matching UI Style */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-md font-black mb-6 text-[#3474F5] uppercase border-b pb-4 italic">নতুন স্টক আপডেট করুন</h2>
            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <input type="text" placeholder="আইটেমের নাম (যেমন: ময়দা)" value={form.itemName} onChange={(e) => setForm({...form, itemName: e.target.value})} className="w-full bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#3474F5]" required />
              <div className="flex gap-4">
                <input type="number" placeholder="পরিমাণ" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="flex-1 bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-sm" required />
                <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="w-24 bg-[#F8F9FA] border p-4 rounded-2xl font-black text-xs">
                  <option value="KG">KG</option><option value="LTR">LTR</option><option value="PCS">PCS</option>
                </select>
              </div>
              <input type="number" placeholder="মোট দাম (৳)" value={form.totalPrice} onChange={(e) => setForm({...form, totalPrice: e.target.value})} className="w-full bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-sm text-[#3474F5]" required />
              
              <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase">Per Unit Price</p>
                <p className="text-lg font-black text-[#3474F5]">৳ {perUnitPrice} / {form.unit}</p>
              </div>

              <input type="text" placeholder="সাপ্লায়ার নাম" value={form.supplierName} onChange={(e) => setForm({...form, supplierName: e.target.value})} className="w-full bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-xs" />
              <input type="text" placeholder="কন্টাক্ট নাম্বার" value={form.supplierNumber} onChange={(e) => setForm({...form, supplierNumber: e.target.value})} className="w-full bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-xs" />
              <textarea placeholder="রিমার্কস..." value={form.remarks} onChange={(e) => setForm({...form, remarks: e.target.value})} className="w-full bg-[#F8F9FA] border p-4 rounded-2xl font-bold text-xs h-20 resize-none"></textarea>
              
              <button disabled={loading} className="w-full bg-[#3474F5] text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition hover:bg-blue-700 active:scale-95">
                UPDATE STOCK
              </button>
            </form>
          </section>

          {/* Right Section: Live Status Cards */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h2 className="text-md font-black mb-6 text-slate-800 uppercase italic">📊 ইনভেন্টরি স্ট্যাটাস (Live)</h2>
            <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {inventory.map(item => (
                <div key={item.id} className={`p-6 rounded-[1.5rem] text-center border-2 transition-all ${item.quantity < 10 ? 'bg-red-50 border-red-200' : 'bg-[#FFF8F0] border-[#FFD9B3]'}`}>
                  <p className={`text-[10px] font-black uppercase mb-1 ${item.quantity < 10 ? 'text-red-500' : 'text-orange-500'}`}>{item.itemName}</p>
                  <p className="text-2xl font-black text-slate-800">{item.quantity} <span className="text-[10px] uppercase font-bold">{item.unit}</span></p>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        <p className="text-center text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase italic">Bonomaya Logistics Dashboard v2.0</p>
      </main>
    </div>
  );
}