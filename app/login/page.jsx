import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const errorMessages = {
  oauth_state: "Google sign-in expired. Please try again.",
  google_env: "Google credentials are missing in .env.",
  google_token: "Google could not create a token. Check your redirect URL and credentials.",
  google_user: "Google sign-in worked, but the profile could not be loaded.",
};

export const metadata = {
  title: "Sign in - TowardsOffer",
};

export default function LoginPage({ searchParams }) {
  const error = searchParams?.error ? errorMessages[searchParams.error] || "Sign-in failed. Please try again." : "";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} />
          Back to sheet
        </Link>

        <div className="auth-icon">
          <CheckCircle2 size={34} strokeWidth={2.5} />
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to TowardsOffer</h1>
        <p className="auth-copy">Use Google to keep access simple, fast, and consistent. No password maze today.</p>

        {error && <div className="auth-error">{error}</div>}

        <a className="google-button" href="/api/auth/google">
          <span aria-hidden="true">G</span>
          Sign in with Google
        </a>
      </section>
    </main>
  );
}
