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

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 font-sans px-4">

      {/* Login Card */}
      <div className={`w-full max-w-md rounded-3xl shadow-2xl bg-gray-900/90 backdrop-blur-sm border border-gray-800
        ${isMobile ? "px-6 py-12" : "px-8 py-14"}`}>
        
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className={`font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 text-4xl sm:text-5xl`}>
            Bonomaya
          </h1>
          <p className="text-gray-400 uppercase tracking-wide mt-1 text-sm sm:text-base font-semibold">
            Smart Management System
          </p>
        </div>

        {/* Welcome Box */}
        <div className="text-center mb-6 border border-gray-700 rounded-xl py-4 px-6 bg-gray-800 shadow-md">
          <h2 className="font-bold text-gray-100 text-xl sm:text-2xl tracking-wide uppercase">
            Welcome
          </h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
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
              className={`w-full p-4 rounded-xl bg-gray-800 text-gray-100 outline-none border ${
                error ? "border-red-500" : "border-gray-700"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-400`}
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
              className={`w-full p-4 rounded-xl bg-gray-800 text-gray-100 outline-none border ${
                error ? "border-red-500" : "border-gray-700"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-400`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 rounded-xl font-semibold uppercase tracking-wide text-white bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 active:scale-95 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-[10px] sm:text-[11px] mt-5 uppercase tracking-wide font-medium">
          Developed by <span className="font-bold text-blue-400 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Masum Billah Maverick</span>
        </p>
      </div>

    </div>
  );
}