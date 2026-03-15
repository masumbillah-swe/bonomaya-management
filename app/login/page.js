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
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden font-sans">
      
      {/* Animated Background Shapes */}
      <div className="absolute w-96 h-96 bg-[#FF5C12]/20 rounded-full blur-3xl animate-pulse-slow -bottom-40 -left-40"></div>
      <div className="absolute w-96 h-96 bg-[#3474F5]/20 rounded-full blur-3xl animate-pulse-slow -top-40 -right-40"></div>
      <div className="absolute w-80 h-80 bg-pink-300/10 rounded-full blur-2xl animate-spin-slow top-20 left-10"></div>
      <div className="absolute w-80 h-80 bg-green-300/10 rounded-full blur-2xl animate-spin-slow-reverse bottom-10 right-20"></div>

      {/* Glassmorphism Form */}
      <div className="relative w-full max-w-md bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden z-10">
        
        {/* Branding */}
        <div className="bg-[#C83E0D]/90 p-12 text-center text-white">
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
            
            {/* Email */}
            <div className="relative">
              <input 
                type="email"
                placeholder="masum@bonomaya.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl px-5 pt-5 pb-3 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <label className="absolute left-5 top-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide pointer-events-none transition-all duration-300">
                Email Address
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl px-5 pt-5 pb-3 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <label className="absolute left-5 top-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide pointer-events-none transition-all duration-300">
                Password
              </label>
            </div>

            {/* Button */}
            <button 
              disabled={loading}
              className="w-full py-4 rounded-3xl font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:scale-105 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : null}
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-white/30">
            <p className="text-[9px] text-gray-300 uppercase tracking-wide italic">
              Developed by Masum Billah (DIU SE)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}