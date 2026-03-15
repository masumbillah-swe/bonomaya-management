"use client";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  
  // State for Employee Form
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("chef");
  const [loading, setLoading] = useState(false);

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Add Employee to Firestore
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // সরাসরি Firestore-এর 'users' কালেকশনে তথ্য সেভ হবে
      await addDoc(collection(db, "users"), {
        name: empName,
        role: empRole,
        email: `${empName.toLowerCase().replace(/\s/g, "")}@bonomaya.com`,
        status: "Active",
        createdAt: serverTimestamp()
      });
      
      alert(empName + " কে বনোমায়ার সিস্টেমে সফলভাবে যোগ করা হয়েছে!");
      setEmpName(""); // ইনপুট ক্লিয়ার করা
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Mobile-এ লুকানো থাকবে */}
      <div className="w-64 bg-orange-700 text-white hidden md:flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-orange-600">Bonomaya</div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left p-3 rounded bg-orange-800">Dashboard</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600">Inventory</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600">Employees</button>
          <button className="w-full text-left p-3 rounded hover:bg-orange-600">Sales Report</button>
        </nav>
        <button onClick={handleLogout} className="p-4 bg-orange-900 hover:bg-red-700 transition font-bold text-center">
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Admin Control Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium">Masum Billah (Admin)</span>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
          </div>
        </header>

        {/* Top Cards Stats */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase">Raw Materials</h3>
            <p className="text-2xl font-bold text-gray-800 italic">Tracking Live...</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase">Today's Production</h3>
            <p className="text-2xl font-bold text-gray-800">150+ Pcs</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <h3 className="text-gray-400 text-xs font-bold uppercase">Status</h3>
            <p className="text-2xl font-bold text-gray-800">Live Operation</p>
          </div>
        </main>

        {/* New Employee Add Form Section */}
        <section className="px-6 pb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">নতুন এমপ্লয়ী যোগ করুন (Employee Entry)</h2>
            <form onSubmit={handleAddEmployee} className="flex flex-wrap gap-4">
              <input 
                type="text" 
                placeholder="এমপ্লয়ীর নাম" 
                className="border p-2 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                required
              />
              <select 
                className="border p-2 rounded-lg outline-none bg-white text-gray-700"
                value={empRole}
                onChange={(e) => setEmpRole(e.target.value)}
              >
                <option value="chef">Chef (শেফ)</option>
                <option value="manager">Manager (ম্যানেজার)</option>
                <option value="salesman">Salesman (বিক্রয়কর্মী)</option>
              </select>
              <button 
                type="submit"
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition disabled:bg-gray-400"
              >
                {loading ? "Adding..." : "Add to System"}
              </button>
            </form>
          </div>
        </section>

        {/* Placeholder for Data Table */}
        <section className="px-6">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="p-4 border-b font-bold text-gray-700 bg-gray-50 flex justify-between items-center">
              <span>সাম্প্রতিক কার্যক্রম (Recent Activity)</span>
              <button className="text-orange-600 text-sm hover:underline">View All</button>
            </div>
            <div className="p-10 text-center text-gray-400 italic">
              ডেটাবেস থেকে তথ্য লোড করার জন্য পরবর্তী ফিচার অপেক্ষা করছে...
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}