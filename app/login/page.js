"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const role = userDoc.data().role?.toLowerCase();
        if (role === "admin") router.push("/admin");
        else if (role === "manager") router.push("/manager");
        else if (role === "chef") router.push("/chef");
        else if (role === "salesman") router.push("/salesman");
        else router.push("/dashboard");
      } else {
        throw new Error("User role not assigned!");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen font-sans overflow-hidden bg-[#0F0F0F]">

      {/* --- LEFT SIDE: DESKTOP ONLY --- */}
      <div className="hidden md:flex flex-col justify-center w-1/2 p-20 relative overflow-hidden bg-[#0A0A0A] border-r border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D9480F]/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-sm font-black tracking-[0.8em] text-[#D9480F] uppercase mb-4 italic">Bonomaya</h1>
            <h2 className="text-7xl font-black text-white leading-[0.9] tracking-tighter italic uppercase">
              Smart <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D9480F] to-[#FF8C61]">Management</span> <br />
              System
            </h2>
            <div className="w-20 h-1 bg-[#D9480F] my-10 rounded-full"></div>
            <p className="text-slate-400 text-lg max-w-sm font-medium leading-relaxed font-sans">
              Experience a centralized operations ecosystem designed for modern food enterprises.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-24">
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Bonomaya Group</span>
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: MOBILE & DESKTOP --- */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#FDFCF0] p-6 relative">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white shadow-[0_40px_80px_rgba(0,0,0,0.06)] rounded-[2.5rem] md:rounded-[3rem] p-8 lg:p-14 border border-orange-50"
        >
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            {/* মোবাইল ভিউতে আইকন বাদ দিয়ে টেক্সট */}
            <div className="md:hidden mb-6">
                <h1 className="text-sm font-black tracking-[0.5em] text-[#D9480F] uppercase italic">
                    Bonomaya
                </h1>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">
              Smart <span className="text-[#D9480F]">Management</span> System
            </h2>
            <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-[0.3em] ml-1 font-sans">
              Secure Portal Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest font-sans">Identity Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#D9480F] transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@bonomaya.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] border-2 border-slate-50 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-[#D9480F] focus:bg-white transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest font-sans">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#D9480F] transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] border-2 border-slate-50 p-4 pl-12 pr-12 rounded-2xl font-bold text-sm outline-none focus:border-[#D9480F] focus:bg-white transition-all font-sans"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#D9480F] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-2xl bg-[#1A1A1A] text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl flex justify-center items-center gap-3 hover:bg-[#D9480F] transition-all duration-400 font-sans"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Launch System <ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-300 text-[8px] font-black uppercase tracking-[0.6em] font-sans">Developed by Masum Billah Maverick</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}