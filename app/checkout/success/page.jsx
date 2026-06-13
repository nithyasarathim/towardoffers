"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";

const ACCESS_KEY = "towardsoffer_access_tier";

export default function CheckoutSuccessPage() {
  const plan = useMemo(() => {
    if (typeof window === "undefined") return "pro";
    return new URLSearchParams(window.location.search).get("plan") || "pro";
  }, []);

  useEffect(() => {
    localStorage.setItem(ACCESS_KEY, plan);
  }, [plan]);

  return (
    <main className="auth-page">
      <section className="auth-card success-card">
        <div className="auth-icon success">
          <CheckCircle2 size={34} />
        </div>
        <p className="eyebrow">Payment successful</p>
        <h1>Your access is unlocked</h1>
        <p className="auth-copy">Your browser is now set to the {plan} plan. Head back and keep cooking through the sheet.</p>
        <Link className="google-button" href="/">
          Continue to dashboard
        </Link>
      </section>
    </main>
  );
}
