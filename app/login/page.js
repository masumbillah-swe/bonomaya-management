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
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
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
      setError(true);
      alert("Invalid Email or Password!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans px-4">
      {/* Animated Login Card with Hover Glow */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(59,130,246,0.5)" }} // subtle glow on hover
        className="w-full max-w-md bg-gray-800 rounded-3xl shadow-2xl p-10 border border-gray-700 transition-all duration-300"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white tracking-wide">Bonomaya</h1>
          <p className="text-sm text-gray-400 uppercase tracking-wider mt-1">Smart Management System</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-medium text-gray-100 tracking-wide">Welcome!</h2>
          <p className="text-gray-300 text-sm">Login to your Smart Portal</p>
          <div className="border-t border-gray-600 mt-4"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-3 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your corporate email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl bg-blue-600 text-white font-semibold uppercase tracking-wide hover:bg-blue-500 hover:shadow-lg active:scale-95 transition-all duration-300"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-[9px] mt-6 uppercase tracking-wide">
          Developed by Masum Billah Maverick
        </p>
      </motion.div>
    </div>
  );
}