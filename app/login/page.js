"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "Admin") router.push("/admin");
        else if (role === "Manager") router.push("/manager");
        else if (role === "Chef") router.push("/chef");
        else if (role === "Salesman") router.push("/salesman");
      } else {
        alert("User role not found!");
      }
    } catch (error) {
      alert("Invalid Email or Password!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 z-10">
        
        {/* Branding Section */}
        <div className="bg-[#C83E0D] p-12 text-center text-white">
          <h1 className="text-4xl font-extrabold italic tracking-tight mb-1">Bonomaya</h1>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Smart Management System</p>
        </div>

        {/* Form Section */}
        <div className="p-10 space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold uppercase text-gray-800 italic">Welcome Back</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Login to your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-3">Email Address</label>
              <input 
                type="email" 
                placeholder="masum@bonomaya.com" 
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide ml-3">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-2xl font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-3xl font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all mt-4"
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide italic">
              Developed by Masum Billah (DIU SE)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}