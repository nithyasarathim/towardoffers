"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">
          <CreditCard size={34} />
        </div>
        <p className="eyebrow">Checkout cancelled</p>
        <h1>No worries — payment was not completed</h1>
        <p className="auth-copy">You can reopen subscriptions whenever you are ready.</p>
        <Link className="google-button" href="/">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
