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



      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {

        const role = userDoc.data().role;

        router.push(`/${role.toLowerCase()}`);

      } else {

        alert("User role not assigned!");

      }

    } catch (error) {

      alert("Invalid Credentials!");

    }

    setLoading(false);

  };



  return (

    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans selection:bg-[#FF5C12] selection:text-white">

      

      {/* Main Glass Card */}

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] overflow-hidden border border-white">

        

        {/* Left Side: Branding & Experience */}

        <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-[#E84A0F] to-[#C83E0D] text-white relative overflow-hidden">

          <div className="relative z-10">

            <h1 className="text-5xl font-black italic tracking-tighter mb-4">Bonomaya.</h1>

            <div className="h-1 w-12 bg-white rounded-full"></div>

            <p className="mt-8 text-lg font-medium leading-relaxed opacity-90">

              Smart logistics for the modern <br /> bakery experience.

            </p>

          </div>

          

          <div className="relative z-10">

            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">

              © 2026 Bonomaya Group

            </p>

          </div>



          {/* Decorative Circles */}

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="absolute top-20 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

        </div>



        {/* Right Side: Simple Login Form */}

        <div className="p-10 md:p-20 flex flex-col justify-center bg-white">

          <div className="mb-12">

            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Portal Access</h2>

            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest italic">Management Login</p>

          </div>



          <form onSubmit={handleLogin} className="space-y-6">

            <div className="group">

              <input 

                type="email" 

                placeholder="Email Address" 

                className="w-full bg-[#f8f9fa] border-2 border-transparent p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:bg-white focus:border-[#3474F5] focus:shadow-[0_10px_40px_rgba(52,116,245,0.1)] transition-all duration-300"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

              />

            </div>



            <div className="group">

              <input 

                type="password" 

                placeholder="Password" 

                className="w-full bg-[#f8f9fa] border-2 border-transparent p-5 rounded-[1.5rem] font-bold text-sm outline-none focus:bg-white focus:border-[#3474F5] focus:shadow-[0_10px_40px_rgba(52,116,245,0.1)] transition-all duration-300"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                required

              />

            </div>



            <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">

                <label className="flex items-center gap-2 cursor-pointer">

                    <input type="checkbox" className="accent-[#3474F5] w-4 h-4 rounded" /> Remember

                </label>

                <a href="#" className="hover:text-[#3474F5] transition-colors">Forgot Password?</a>

            </div>



            <button 

              disabled={loading}

              className="w-full bg-[#1e293b] text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 hover:bg-[#3474F5] hover:shadow-[#3474F5]/30 active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3"

            >

              {loading ? "Verifying..." : "Authorized Entry"}

            </button>

          </form>



          <div className="mt-16 text-center">

            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">

              Security by Bonomaya Shield

            </span>

          </div>

        </div>

      </div>



      {/* Modern Background Blur */}

      <div className="fixed -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[120px]"></div>

    </div>

  );

}