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
    <div className="flex flex-col justify-center items-center min-h-screen p-4 bg-[#FFF8F0] relative overflow-hidden font-sans">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FFE8D6] to-[#FFF8F0] animate-pulse-slow -z-10"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#D9480F]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#D9480F]/10 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-md bg-white shadow-xl rounded-3xl p-8 sm:p-10 z-10"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#D9480F] tracking-tight">Bonomaya</h1>
          <p className="text-xs uppercase text-gray-700 tracking-widest mt-1">Smart Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div className="relative w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer w-full p-3 rounded-xl bg-[#FFF8F0] text-gray-900 outline-none border border-[#FFE8D6] focus:ring-2 focus:ring-[#D9480F] transition-all"
            />
            <label className="absolute left-3 top-3 text-gray-400 text-xs peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[#D9480F] peer-focus:text-xs transition-all">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative w-full">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full p-3 rounded-xl bg-[#FFF8F0] text-gray-900 outline-none border border-[#FFE8D6] focus:ring-2 focus:ring-[#D9480F] transition-all"
            />
            <label className="absolute left-3 top-3 text-gray-400 text-xs peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-[#D9480F] peer-focus:text-xs transition-all">
              Password
            </label>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(217,72,15,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full p-4 rounded-2xl bg-[#D9480F] text-white font-bold uppercase tracking-wide shadow-md relative overflow-hidden"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </motion.button>

          {/* Forgot Password */}
          <p className="text-center text-gray-500 text-xs mt-2 cursor-pointer hover:text-[#D9480F] transition-colors">
            Forgot Password?
          </p>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[10px] mt-6 tracking-wide">
          Developed by Masum Billah Maverick
        </p>
      </motion.div>
    </div>
  );
}