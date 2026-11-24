"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogIn,
  LogOut,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type CheckInStatus =
  | "loading"
  | "checked_in"
  | "checked_out"
  | "already_completed"
  | "needs_login"
  | "expired"
  | "error";

export default function CheckInPage() {
  const [status, setStatus] = useState<CheckInStatus>("loading");
  const [message, setMessage] = useState("Verifying your membership...");
  const [memberName, setMemberName] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    async function processCheckIn() {
      try {
        // 1. Check if the member is logged in
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setStatus("needs_login");
          setMessage("Log in once on this browser to enable 1-tap camera check-ins.");
          return;
        }

        // 2. Look up member profile by user_id first, then fallback to email
        let member = null;

        const { data: byUserId } = await supabase
          .from("members")
          .select("id, name, status")
          .eq("user_id", user.id)
          .limit(1);

        if (byUserId && byUserId.length > 0) {
          member = byUserId[0];
        } else if (user.email) {
          const { data: byEmail } = await supabase
            .from("members")
            .select("id, name, status")
            .eq("email", user.email)
            .limit(1);

          if (byEmail && byEmail.length > 0) {
            member = byEmail[0];
          }
        }

        if (!member) {
          setStatus("error");
          setMessage("Member profile not found. Please contact the front desk.");
          return;
        }

        setMemberName(member.name);

        if (member.status && member.status.toUpperCase() !== "ACTIVE") {
          setStatus("expired");
          setMessage("Your membership is currently inactive or expired. Please renew at the desk or in your portal.");
          return;
        }

        // 3. Mark Check-In (or Check-Out if already checked in today)
        const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
        const nowFormatted = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const { error: insertError } = await supabase
          .from("attendance")
          .insert([{ member_id: member.id, date: today }]);

        if (insertError) {
          // 23505 = Unique violation (already checked in today)
          if (insertError.code === "23505") {
            const { data: updated, error: updateError } = await supabase
              .from("attendance")
              .update({ check_out_time: new Date().toISOString() })
              .eq("member_id", member.id)
              .eq("date", today)
              .is("check_out_time", null)
              .select();

            if (updateError) throw updateError;

            if (updated && updated.length > 0) {
              setTimestamp(nowFormatted);
              setStatus("checked_out");
              setMessage("Checked out! Great session today.");
            } else {
              setStatus("already_completed");
              setMessage("You've already completed today's check-in and check-out.");
            }
            return;
          }

          throw insertError;
        }

        // Fresh check-in succeeded
        setTimestamp(nowFormatted);
        setStatus("checked_in");
        setMessage("Checked in! Crush your workout today.");
      } catch (err: any) {
        console.error("Check-in error:", err);
        setStatus("error");
        setMessage(err?.message || "Something went wrong. Please try again.");
      }
    }

    processCheckIn();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-[#e50100] animate-spin mx-auto" />
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Checking In...
            </h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
          </>
        )}

        {status === "checked_in" && (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Checked In!
              </h1>
              {memberName && (
                <p className="text-sm font-black text-[#e50100] uppercase tracking-wider mt-1">
                  {memberName}
                </p>
              )}
              {timestamp && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {timestamp}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/member" className="block">
              <button className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Open Member Portal
              </button>
            </Link>
          </>
        )}

        {status === "checked_out" && (
          <>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-11 h-11" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Checked Out!
              </h1>
              {memberName && (
                <p className="text-sm font-black text-[#e50100] uppercase tracking-wider mt-1">
                  {memberName}
                </p>
              )}
              {timestamp && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {timestamp}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/member" className="block">
              <button className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Open Member Portal
              </button>
            </Link>
          </>
        )}

        {status === "already_completed" && (
          <>
            <div className="w-20 h-20 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Session Done
              </h1>
              {memberName && (
                <p className="text-sm font-black text-[#e50100] uppercase tracking-wider mt-1">
                  {memberName}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/member" className="block">
              <button className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                Open Member Portal
              </button>
            </Link>
          </>
        )}

        {status === "needs_login" && (
          <>
            <div className="w-20 h-20 bg-red-100 text-[#e50100] rounded-full flex items-center justify-center mx-auto">
              <LogIn className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Login Required
            </h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/login?redirect=/checkin" className="block">
              <button className="w-full bg-[#e50100] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                Log In to Check In
              </button>
            </Link>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Plan Inactive
              </h1>
              {memberName && (
                <p className="text-sm font-black text-gray-600 uppercase tracking-wider mt-1">
                  {memberName}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <Link href="/member" className="block">
              <button className="w-full bg-[#e50100] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">
                Renew Membership
              </button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Check-In Failed
            </h1>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}