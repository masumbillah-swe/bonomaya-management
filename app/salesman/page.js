"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, Package, LogOut, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SalesmanPage() {
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [productionList, setProductionList] = useState([]); // শেফের পাঠানো লিস্ট
  const [inventory, setInventory] = useState([]); // মেইন স্টক
  const [saleQty, setSaleQty] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  useEffect(() => {
    // ১. শেফ থেকে আসা পেন্ডিং প্রোডাকশন লিস্ট (Status: Pending)
    const qProd = query(collection(db, "production"), orderBy("createdAt", "desc"));
    const unsubProd = onSnapshot(qProd, (snap) => {
      setProductionList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // ২. মেইন ইনভেন্টরি
    const unsubInv = onSnapshot(query(collection(db, "inventory"), orderBy("itemName", "asc")), (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubProd(); unsubInv(); };
  }, []);

  // --- প্রোডাকশন একসেপ্ট করার লজিক ---
  const acceptProduction = async (prodId, itemName, qty) => {
    if(!confirm(`আপনি কি ${qty} টি ${itemName} বুঝে পেয়েছেন? একসেপ্ট করলে এটি স্টকে যোগ হবে।`)) return;
    
    setLoading(true);
    try {
      // ১. ইনভেন্টরিতে স্টক বাড়ানো (Increment)
      // নোট: এখানে itemName দিয়ে ইনভেন্টরি ডকুমেন্ট খুঁজে বের করতে হবে।
      const invItem = inventory.find(i => i.itemName === itemName);
      if (invItem) {
        await updateDoc(doc(db, "inventory", invItem.id), {
          quantity: increment(qty)
        });
      }

      // ২. প্রোডাকশন স্ট্যাটাস আপডেট করা
      await updateDoc(doc(db, "production", prodId), {
        status: "Accepted",
        acceptedAt: serverTimestamp(),
        acceptedBy: "Salesman" 
      });

      alert("স্টক আপডেট হয়েছে!");
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex font-sans text-gray-800">
      
      {/* SIDEBAR (Split Theme) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#D9480F] to-[#FF6B3F] text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static flex flex-col shadow-2xl`}>
        <div className="p-8 border-b border-white/10">
          <h1 className="text-3xl font-extrabold tracking-tight italic">Bonomaya</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">Sales & Stock Hub</p>
        </div>
        <nav className="flex-1 p-6 space-y-2 mt-4">
          <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/10 font-bold border border-white/5 shadow-lg"><ShoppingCart size={20}/> Sales Terminal</button>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 font-semibold opacity-80"><Package size={20}/> Inventory</button>
        </nav>
        <div className="p-6"><button onClick={handleLogout} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 font-bold text-xs">LOGOUT</button></div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md p-5 flex justify-between items-center sticky top-0 z-40 border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-[#D9480F]"><Menu/></button>
          <h2 className="text-xl font-bold text-gray-700 tracking-tighter">SALESMAN PANEL</h2>
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">S</div>
        </header>

        <main className="p-4 md:p-10 space-y-10">
          
          {/* ১. শেফ থেকে আসা পেন্ডিং আইটেম লিস্ট (Verification Section) */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-[#D9480F]" size={20}/>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Pending Production (Chef এন্ট্রি)</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {productionList.filter(p => p.status === "Pending").map((prod) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={prod.id} className="bg-white p-6 rounded-[2rem] border-2 border-orange-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">প্রস্তুত আইটেম</p>
                    <p className="text-2xl font-black text-gray-800">{prod.itemName}</p>
                    <p className="text-sm font-bold text-[#D9480F] mt-1">পরিমাণ: {prod.quantity} {prod.unit}</p>
                  </div>
                  <button 
                    onClick={() => acceptProduction(prod.id, prod.itemName, prod.quantity)}
                    disabled={loading}
                    className="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-100"
                  >
                    <CheckCircle size={18}/> Accept Stock
                  </button>
                </motion.div>
              ))}
              {productionList.filter(p => p.status === "Pending").length === 0 && (
                <div className="col-span-full py-10 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-300 text-gray-400 font-medium italic">
                  শেফ থেকে কোনো নতুন প্রোডাকশন পেন্ডিং নেই।
                </div>
              )}
            </div>
          </section>

          {/* ২. মেইন সেলস সেকশন (একসেপ্ট করার পর এখানে আসবে) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 italic">
               <h3 className="text-xs font-black text-[#D9480F] uppercase tracking-[0.2em] mb-8 border-b pb-4">Create Customer Bill</h3>
               {/* এখানে তোর আগের সেলস ফর্মটা থাকবে */}
               <form className="space-y-4">
                  <select className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Select Accepted Product...</option>
                    {inventory.map(item => <option key={item.id}>{item.itemName} (In Stock: {item.quantity})</option>)}
                  </select>
                  <input type="number" placeholder="Sale Qty" className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 font-bold outline-none" />
                  <button className="w-full p-4 bg-gray-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition shadow-lg">Confirm Sale</button>
               </form>
            </section>

            {/* ৩. লাইভ ইনভেন্টরি ফিড */}
            <section className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 border-b pb-4">Current Warehouse Stock</h3>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {inventory.map(item => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-2xl text-center border border-gray-100 hover:border-orange-200 transition-all">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{item.itemName}</p>
                      <p className={`text-xl font-black ${item.quantity < 10 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>{item.quantity}</p>
                    </div>
                  ))}
               </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}