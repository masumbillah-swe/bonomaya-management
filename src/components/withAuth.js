"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function withAuth(Component, allowedRole) {
  return function ProtectedRoute(props) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // ১. লগইন না থাকলে রিডাইরেক্ট
          router.replace("/login"); 
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          
          if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            
            // ২. বড় হাত বা ছোট হাত যাই হোক, চেক করবে
            if (userRole?.toLowerCase() === allowedRole.toLowerCase()) {
              setLoading(false);
            } else {
              console.warn("Role mismatch! Current:", userRole, "Required:", allowedRole);
              router.replace("/login");
            }
          } else {
            console.error("User document not found in Firestore!");
            router.replace("/login");
          }
        } catch (error) {
          console.error("Auth error:", error);
          router.replace("/login");
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (loading) return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0A] fixed inset-0 z-[999]">
        <h1 className="text-white font-black italic text-2xl animate-pulse tracking-tighter uppercase font-sans">
          Bonomaya Security...
        </h1>
      </div>
    );

    return <Component {...props} />;
  };
}