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
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // রোল অনুযায়ী রিডাইরেক্ট লজিক
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "Admin") router.push("/admin");
        else if (role === "Manager") router.push("/manager");
        else if (role === "Chef") router.push("/chef");
        else if (role === "Salesman") router.push("/salesman");
      } else {
        alert("User role not found!");
      }
    } catch (error) {
      alert("Invalid Email or Password!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[450px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Top Branding Section */}
        <div className="bg-[#C83E0D] p-12 text-center text-white">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">Bonomaya</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">Smart Management System</p>
        </div>

        {/* Form Section */}
        <div className="p-10 md:p-12 space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-slate-800 italic">Welcome Back</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Login to your portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="masum@bonomaya.com" 
                className="w-full bg-[#F8F9FA] border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#3474F5] transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-4 tracking-widest">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-[#F8F9FA] border border-slate-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-[#3474F5] transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#3474F5] text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-4"
            >
              {loading ? "Authenticating..." : "Sign In to Portal"}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-slate-50">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
              Developed by Masum Billah (DIU SE)
            </p>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-[#FF5C12]/5 rounded-full blur-3xl -z-10"></div>
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-[#3474F5]/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}