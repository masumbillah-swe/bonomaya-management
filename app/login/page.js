"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

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
        throw new Error("User role not found!");
      }
    } catch (err) {
      alert("Invalid Email or Password!");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen font-sans overflow-hidden">

      {/* LEFT SIDE (Desktop only) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-[#D9480F] to-[#FF6B3F] text-white p-12 relative overflow-hidden">
        
        {/* --- PREMIUM CIRCULAR ANIMATIONS --- */}
        
        {/* 1. Main Rotating Glass Orb (Top Left) */}
        <motion.div 
          animate={{ 
            rotate: 360,
            y: [0, 20, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[550px] h-[550px] border border-white/10 rounded-full -top-24 -left-24 flex items-center justify-center pointer-events-none"
        >
          <div className="w-[450px] h-[450px] bg-white/5 rounded-full backdrop-blur-[2px]" />
        </motion.div>

        {/* 2. Pulsing Shadow Orb (Bottom Right) */}
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-96 h-96 bg-black/20 rounded-full bottom-[-50px] right-[-50px] blur-3xl pointer-events-none"
        />

        {/* 3. Small Floating Bubble (Center Right) */}
        <motion.div 
          animate={{ 
            y: [0, -60, 0],
            x: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 bg-white/10 rounded-full top-1/3 right-10 backdrop-blur-md border border-white/20 pointer-events-none"
        />

        {/* 4. Large Faint Ring */}
        <motion.div 
           animate={{ opacity: [0.1, 0.2, 0.1] }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute w-[800px] h-[800px] border-[0.5px] border-white/5 rounded-full -bottom-1/4 -left-1/4 pointer-events-none"
        />

        {/* CONTENT LAYER */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-md"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Bonomaya
          </h1>
          <p className="uppercase tracking-widest text-sm opacity-80 mb-6 font-medium">
            Smart Management System
          </p>

          <p className="text-lg leading-relaxed opacity-90">
            Streamline operations, manage your team, and monitor business performance 
            through a centralized and intelligent platform designed for modern enterprises.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#FFF8F0] p-6 relative">

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-10 border border-orange-50/50"
        >

          {/* Mobile Branding */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-[#D9480F]">
              Bonomaya
            </h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">
              SMART MANAGEMENT SYSTEM
            </p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#D9480F]/10 focus:border-[#D9480F] outline-none transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-500">PASSWORD</label>
               
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 rounded-xl border border-gray-200 focus:ring-4 focus:ring-[#D9480F]/10 focus:border-[#D9480F] outline-none transition-all duration-200"
              />
            </div>

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, backgroundColor: "#BF3F0D" }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 rounded-xl bg-[#D9480F] text-white font-bold tracking-wide shadow-lg shadow-orange-200 flex justify-center items-center transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Authenticating...
                </div>
              ) : "Sign In →"}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-400 text-[10px] tracking-widest uppercase">
              Developed by Masum Billah Maverick
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}