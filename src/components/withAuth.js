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
          router.push("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userRole = userDoc.data()?.role?.toLowerCase();

        if (userRole !== allowedRole.toLowerCase()) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }, [router]);

    if (loading) return (
      <div className="h-screen flex items-center justify-center bg-[#0A0A0A]">
        <h1 className="text-white font-black italic text-2xl animate-pulse tracking-tighter uppercase">Bonomaya Security...</h1>
      </div>
    );

    return <Component {...props} />;
  };
}
