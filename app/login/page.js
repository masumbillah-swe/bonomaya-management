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
    <div className="flex min-h-screen font-sans">

      {/* LEFT SIDE (Desktop only) */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-[#D9480F] to-[#FF6B3F] text-white p-12 relative overflow-hidden">
        
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-md"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Bonomaya
          </h1>
          <p className="uppercase tracking-widest text-sm opacity-80 mb-6">
            Smart Management System
          </p>

          <p className="text-lg leading-relaxed opacity-90">
            Streamline operations, manage your team, and monitor business performance 
            through a centralized and intelligent platform designed for modern enterprises.
          </p>
        </motion.div>

        {/* background glow */}
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
        <div className="absolute w-80 h-80 bg-black/10 rounded-full blur-3xl -bottom-20 -right-20"></div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#FFF8F0] p-6">

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8"
        >

          {/* Mobile Branding */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-2xl font-bold text-[#D9480F]">
              Bonomaya
            </h1>
            <p className="text-xs text-gray-500">
              Smart Management System
            </p>
          </div>

          {/* Header */}
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D9480F]/40 focus:border-[#D9480F] outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D9480F]/40 focus:border-[#D9480F] outline-none"
              />
            </div>

            {/* Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full p-3 rounded-lg bg-[#D9480F] text-white font-semibold tracking-wide shadow-md flex justify-center items-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-400 text-xs mt-6">
            Developed by Masum Billah Maverick
          </p>

        </motion.div>
      </div>
    </div>
  );
}