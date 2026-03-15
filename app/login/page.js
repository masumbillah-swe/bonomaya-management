"use client";
import { useState, useEffect } from "react";
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

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Particles (desktop only)
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    if (!isMobile) {
      const p = Array.from({ length: 30 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
      }));
      setParticles(p);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans px-4 relative overflow-hidden">

      {/* Particles only for desktop */}
      {!isMobile && particles.map((particle, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            delay: particle.delay 
          }}
          style={{
            position: "absolute",
            top: `${particle.y}%`,
            left: `${particle.x}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            filter: "blur(2px)",
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={!isMobile ? { scale: 1.03, boxShadow: "0 15px 40px rgba(59,130,246,0.6)" } : {}}
        className={`w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md relative z-10
          ${isMobile ? "px-8 py-16" : "px-6 sm:px-10 py-12 sm:py-16"}`}
      >
        {/* Branding */}
        <div className={`text-center ${isMobile ? "mb-12" : "mb-10"}`}>
          <h1 className={`font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ${isMobile ? "text-4xl" : "text-5xl sm:text-6xl"}`}>
            Bonomaya
          </h1>
          <p className={`text-gray-300 uppercase tracking-wider font-semibold mt-2 ${isMobile ? "text-base" : "text-lg sm:text-xl"}`}>
            Smart Management System
          </p>
        </div>

        {/* Welcome Message */}
        <div className={`text-center ${isMobile ? "mb-10" : "mb-8"}`}>
          <h2 className={`font-extrabold tracking-wide uppercase bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent ${isMobile ? "text-lg" : "text-2xl sm:text-3xl"}`}>
            Welcome
          </h2>
          <p className={`text-gray-300 ${isMobile ? "text-base" : "text-sm sm:text-base"} tracking-wide mt-1`}>
            Login to your Smart Portal
          </p>
          <div className="border-t border-gray-600 mt-4 w-16 mx-auto"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-5 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your corporate email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-5 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-5 rounded-xl font-semibold uppercase tracking-wide text-white transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-[length:200%_200%] hover:animate-gradient-xy hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[10px] sm:text-[11px] mt-6 uppercase tracking-wide font-medium hover:text-gray-200 transition-colors">
          Developed by <span className="font-bold text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Masum Billah Maverick</span>
        </p>
      </motion.div>

      <style jsx>{`
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
    </div>
  );
}