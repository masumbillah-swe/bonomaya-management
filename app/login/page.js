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

      {/* Compact Login Card */}
      <div className={`w-full max-w-xs rounded-2xl shadow-lg bg-gray-900/90 backdrop-blur-sm border border-gray-800
        ${isMobile ? "px-4 py-8" : "px-6 py-10"}`}>

        {/* Branding */}
        <div className="text-center mb-4">
          <h1 className={`font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 text-3xl sm:text-4xl`}>
            Bonomaya
          </h1>
          <p className="text-gray-400 uppercase tracking-wide mt-1 text-xs sm:text-sm font-semibold">
            Smart Management System
          </p>
        </div>

        {/* Welcome Box */}
        <div className="text-center mb-4 border border-gray-700 rounded-lg py-2 px-3 bg-gray-800 shadow-sm">
          <h2 className="font-bold text-gray-100 text-lg sm:text-xl tracking-wide uppercase">
            Welcome
          </h2>
          <p className="text-gray-400 mt-1 text-xs sm:text-sm">
            Login to your Smart Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-3 rounded-lg bg-gray-800 text-gray-100 outline-none border ${
                error ? "border-red-500" : "border-gray-700"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-400`}
              placeholder="Enter your corporate email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-semibold mb-1 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-3 rounded-lg bg-gray-800 text-gray-100 outline-none border ${
                error ? "border-red-500" : "border-gray-700"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition placeholder-gray-400`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg font-semibold uppercase tracking-wide text-white bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 active:scale-95 transition-all"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-[9px] sm:text-[10px] mt-3 uppercase tracking-wide font-medium">
          Developed by Masum Billah Maverick
        </p>
      </div>

    </div>
  );
}