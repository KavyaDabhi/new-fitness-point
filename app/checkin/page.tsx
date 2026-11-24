"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Loader2, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CheckInPage() {
  const [status, setStatus] = useState<"loading" | "success" | "already_checked_in" | "needs_login" | "error">("loading");
  const [message, setMessage] = useState("Verifying your membership...");
  const [memberName, setMemberName] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function processCheckIn() {
      try {
        // 1. Check if the member is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setStatus("needs_login");
          setMessage("Please log in once to enable 1-tap camera check-ins.");
          return;
        }

        // 2. Find their member profile using their email
        const { data: member, error: memberError } = await supabase
          .from("members")
          .select("id, name, status")
          .eq("email", user.email)
          .single();

        if (memberError || !member) {
          setStatus("error");
          setMessage("Member profile not found. Please contact the front desk.");
          return;
        }

        setMemberName(member.name);

        if (member.status !== "ACTIVE") {
          setStatus("error");
          setMessage("Your membership is currently expired. Please renew at the desk.");
          return;
        }

        // 3. Check if already checked in today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: existing } = await supabase
          .from("attendance")
          .select("id")
          .eq("member_id", member.id)
          .gte("created_at", todayStart.toISOString())
          .limit(1);

        if (existing && existing.length > 0) {
          setStatus("already_checked_in");
          setMessage("You're already checked in for today. Have a great workout!");
          return;
        }

        // 4. Mark attendance
        const { error: insertError } = await supabase.from("attendance").insert([
          {
            member_id: member.id,
            member_name: member.name,
            method: "QR_CAMERA",
          },
        ]);

        if (insertError) throw insertError;

        setStatus("success");
        setMessage("Attendance marked! Crush your workout today.");
      } catch (err: any) {
        console.error("Check-in error:", err);
        setStatus("error");
        setMessage(err.message || "Something went wrong. Please try again.");
      }
    }

    processCheckIn();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-logo animate-spin mx-auto" />
            <h1 className="text-xl font-black text-gray-900 uppercase">Checking In...</h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
          </>
        )}

        {(status === "success" || status === "already_checked_in") && (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase">
                {status === "success" ? "Checked In!" : "Already Checked In"}
              </h1>
              {memberName && (
                <p className="text-sm font-black text-logo uppercase tracking-wider mt-1">
                  {memberName}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/member" className="block">
              <button className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Go to Member Portal
              </button>
            </Link>
          </>
        )}

        {status === "needs_login" && (
          <>
            <div className="w-20 h-20 bg-logo/10 text-logo rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase">Login Required</h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/login?redirect=/checkin" className="block">
              <button className="w-full bg-logo text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                Log In to Check In
              </button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase">Check-In Failed</h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}