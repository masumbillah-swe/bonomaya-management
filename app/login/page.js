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
  const [errorShake, setErrorShake] = useState(false);
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
      // Trigger shake animation
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
      alert("Invalid Email or Password!");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 overflow-hidden flex items-center justify-center font-sans">

      {/* Animated Background Particles */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-white/10 blur-3xl top-20 left-10"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-white/10 blur-2xl bottom-10 right-20"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Login Form */}
      <motion.div
        className="relative w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl p-10 z-10"
        animate={errorShake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold italic text-white tracking-tight">Bonomaya</h1>
          <p className="text-xs uppercase text-white/80 tracking-widest mt-1">Smart Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/40 backdrop-blur-sm rounded-2xl px-5 pt-5 pb-3 text-sm font-semibold text-gray-800 outline-none border border-white/30 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              placeholder="Email Address"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/40 backdrop-blur-sm rounded-2xl px-5 pt-5 pb-3 text-sm font-semibold text-gray-800 outline-none border border-white/30 focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              placeholder="Password"
            />
          </div>

          {/* Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-3xl font-extrabold uppercase tracking-widest text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            )}
            {loading ? "Authenticating..." : "Sign In"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/50 text-[9px] mt-6 uppercase tracking-wide italic">
          Developed by Masum Billah (DIU SE)
        </p>
      </motion.div>
    </div>
  );
}