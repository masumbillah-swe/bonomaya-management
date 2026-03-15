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
      
      <div className="w-full max-w-md bg-gray-800 rounded-3xl shadow-xl p-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonomaya</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">Smart Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-3 rounded-xl bg-gray-700 text-white outline-none border ${
                error ? "border-red-500" : "border-gray-600"
              } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold mb-1 uppercase">Password</label>
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
            className="w-full p-3 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-wide hover:bg-blue-500 active:scale-95 transition"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-[9px] mt-6 uppercase tracking-wide">
          Developed by Masum Billah Maverick
        </p>
      </div>
    </div>
  );
}