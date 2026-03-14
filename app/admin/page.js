"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  
  // State Management
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [employees, setEmployees] = useState([]);
  
  // Inventory States
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [inventory, setInventory] = useState([]); 
  
  const [loading, setLoading] = useState(false);

  // ১. রিয়েল-টাইমে ডেটা নিয়ে আসা (Users & Inventory)
  useEffect(() => {
    // এমপ্লয়ী লিস্ট লোড করা
    const qUsers = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // ইনভেন্টরি লিস্ট লোড করা
    const qInv = query(collection(db, "inventory"), orderBy("itemName", "asc"));
    const unsubInv = onSnapshot(qInv, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return () => { unsubUsers(); unsubInv(); };
  }, []);

  // ২. লগআউট ফাংশন
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // ৩. নতুন এমপ্লয়ী অ্যাড করা
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: empName,
        role: empRole,
        status: "Active",
        createdAt: serverTimestamp()
      });
      alert(empName + " যোগ হয়েছে!");
      setEmpName("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ৪. নতুন ইনভেন্টরি আইটেম অ্যাড করা
  const handleAddInventory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inventory"), {
        itemName: itemName,
        quantity: Number(quantity), // সংখ্যা হিসেবে সেভ হবে
        unit: unit,
        createdAt: serverTimestamp()
      });
      alert(itemName + " স্টকে যোগ হয়েছে!");
      setItemName("");
      setQuantity("");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-orange-700 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-orange-600 italic font-serif text-center md:text-left">
          Bonomaya
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left p-3 rounded bg-orange-800 font-bold">Dashboard</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 transition">Inventory</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 transition">Employees</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600 transition">Reports</button>
        </nav>
        <button onClick={handleLogout} className="p-4 bg-orange-900 hover:bg-red-700 transition font-bold text-center">
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight uppercase">Bonomaya Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-600 font-medium hidden sm:block italic uppercase">Masum Billah</span>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-orange-200 shadow-md">M</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 overflow-y-auto h-screen">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">টিম মেম্বার</h3>
              <p className="text-2xl font-black text-gray-800">{employees.length} জন সক্রিয়</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">লো স্টক এলার্ট</h3>
              <p className="text-2xl font-black text-red-600 italic">
                {inventory.filter(i => i.quantity < 10).length} টি আইটেম কম
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
              <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">অপারেশন</h3>
              <p className="text-2xl font-black text-gray-800 italic uppercase">Live Now</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Employee Form */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6 text-gray-700 border-b pb-3">নতুন এমপ্লয়ী যোগ করুন</h2>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <input 
                  type="text" placeholder="পুরো নাম" value={empName}
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50 text-gray-700"
                  onChange={(e) => setEmpName(e.target.value)} required
                />
                <select 
                  className="w-full border p-3 rounded-xl outline-none bg-white text-gray-700 font-medium"
                  value={empRole} onChange={(e) => setEmpRole(e.target.value)}
                >
                  <option value="chef">Chef (শেফ)</option>
                  <option value="manager">Manager (ম্যানেজার)</option>
                  <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
                </select>
                <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-orange-700 transition active:scale-95 shadow-lg shadow-orange-100">
                  Add Member
                </button>
              </form>
            </section>

            {/* Inventory Form */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
              <h2 className="text-lg font-bold mb-6 text-blue-700 border-b pb-3">নতুন স্টক আপডেট করুন</h2>
              <form onSubmit={handleAddInventory} className="space-y-4">
                <input 
                  type="text" placeholder="আইটেমের নাম (যেমন: ময়দা)" value={itemName}
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
                  onChange={(e) => setItemName(e.target.value)} required
                />
                <div className="flex gap-4">
                  <input 
                    type="number" placeholder="পরিমাণ" value={quantity}
                    className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
                    onChange={(e) => setQuantity(e.target.value)} required
                  />
                  <select 
                    className="w-32 border p-3 rounded-xl outline-none bg-white text-gray-700"
                    value={unit} onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="kg">KG</option>
                    <option value="liter">Liter</option>
                    <option value="pcs">Pcs</option>
                    <option value="gm">Gram</option>
                  </select>
                </div>
                <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-100">
                  Update Stock
                </button>
              </form>
            </section>
          </div>

          {/* Bottom List Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team List */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b font-bold text-gray-700 bg-gray-50">সক্রিয় টিম মেম্বার</div>
              <div className="max-h-60 overflow-y-auto scrollbar-hide">
                <table className="w-full text-left">
                  <tbody className="text-gray-600">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-orange-50 transition">
                        <td className="p-4 font-bold text-gray-800">{emp.name}</td>
                        <td className="p-4 text-xs italic uppercase text-gray-400 font-bold">{emp.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Inventory Status Grid */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200">
              <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                📊 ইনভেন্টরি স্ট্যাটাস (Live)
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {inventory.length > 0 ? (
                  inventory.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border-2 text-center transition-all hover:scale-105 ${item.quantity < 10 ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                      <p className={`text-[10px] uppercase font-black tracking-widest ${item.quantity < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                        {item.itemName} {item.quantity < 10 && '⚠️'}
                      </p>
                      <p className={`text-xl font-black ${item.quantity < 10 ? 'text-red-700' : 'text-orange-700'}`}>
                        {item.quantity} <span className="text-xs font-bold uppercase">{item.unit}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-6 text-center text-gray-400 italic">স্টক খালি! নতুন কিছু অ্যাড কর।</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}