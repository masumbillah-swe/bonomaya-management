"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 font-sans px-4">

      {/* Login Card */}
      <div
        className={`w-full max-w-md rounded-3xl border border-gray-700 shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-md
          ${isMobile ? "px-6 py-12" : "px-6 sm:px-8 py-12"}`}
      >
        {/* Branding */}
        <div className={`text-center ${isMobile ? "mb-8" : "mb-8"}`}>
          <h1 className={`font-extrabold tracking-wide bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ${isMobile ? "text-4xl" : "text-5xl sm:text-6xl"}`}>
            Bonomaya
          </h1>
          <p className={`text-gray-300 uppercase tracking-wider font-semibold mt-2 ${isMobile ? "text-base" : "text-lg sm:text-xl"}`}>
            Smart Management System
          </p>
        </div>

        {/* Boxed Welcome Message */}
        <div className={`text-center mb-6 border border-gray-600 rounded-xl p-4 bg-gray-800`}>
          <h2 className={`font-extrabold tracking-wide uppercase bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent ${isMobile ? "text-lg" : "text-2xl sm:text-3xl"}`}>
            Welcome
          </h2>
          <p className={`text-gray-300 ${isMobile ? "text-base" : "text-sm sm:text-base"} mt-1`}>
            Login to your Smart Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-4 rounded-xl bg-gray-700 text-white outline-none border ${
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
              className={`w-full p-4 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 rounded-xl font-semibold uppercase tracking-wide text-white transition-all duration-300 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 active:scale-95 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[10px] sm:text-[11px] mt-5 uppercase tracking-wide font-medium hover:text-gray-200 transition-colors">
          Developed by <span className="font-bold text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Masum Billah Maverick</span>
        </p>
      </div>

    </div>
  );
}