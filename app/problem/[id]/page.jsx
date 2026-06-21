"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Code2, CheckCircle2, Moon, Sun, CreditCard, X } from "lucide-react";

export default function ProblemPage({ params }) {
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [accessTier, setAccessTier] = useState("free");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const response = await fetch(`/api/problem/${params.id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        setProblem(data.problem);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProblem();
  }, [params.id]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedAccessTier = localStorage.getItem("towardsoffer_access_tier");
    if (storedAccessTier) {
      setAccessTier(storedAccessTier);
    }
  }, []);

  if (loading) {
    return (
      <div className={`shell ${theme}`}>
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand-area">
              <div className="brand-mark" aria-hidden="true">
                <CheckCircle2 size={18} strokeWidth={2.6} />
              </div>
              <div>
                <h1>TowardsOffer</h1>
                <p>Minimal DSA practice sheet</p>
              </div>
            </div>
            <div className="header-actions">
              <button
                className="theme-toggle"
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              <Link href="/" className="back-link">
                <ArrowLeft size={16} />
                Back to sheet
              </Link>
            </div>
          </div>
        </header>
        <motion.main className="main-content">
          <div className="problem-detail-container">
            <div className="shimmer shimmer-header" style={{ height: '60px', marginBottom: '1rem' }}></div>
            <div className="shimmer shimmer-item" style={{ height: '40px', marginBottom: '1rem' }}></div>
            <div className="shimmer shimmer-item" style={{ height: '40px', marginBottom: '1rem' }}></div>
            <div className="shimmer shimmer-item" style={{ height: '40px', marginBottom: '1rem' }}></div>
            <div className="shimmer shimmer-item" style={{ height: '200px', marginBottom: '1rem' }}></div>
            <div className="shimmer shimmer-item" style={{ height: '150px', marginBottom: '1rem' }}></div>
          </div>
        </motion.main>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className={`shell ${theme}`}>
        <div className="error-state">{error || "Problem not found"}</div>
      </div>
    );
  }

  const hasFullAccess = accessTier !== "free";

  return (
    <div className={`shell ${theme}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-area">
            <div className="brand-mark" aria-hidden="true">
              <CheckCircle2 size={18} strokeWidth={2.6} />
            </div>
            <div>
              <h1>TowardsOffer</h1>
              <p>Minimal DSA practice sheet</p>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link href="/" className="back-link">
              <ArrowLeft size={16} />
              Back to sheet
            </Link>
          </div>
        </div>
      </header>

      <motion.main className="main-content">
        <div className="problem-detail-container">
          <div className="problem-header">
            <h1>{problem.name}</h1>
            <div className="problem-meta">
              <span className={`priority-badge priority-${problem.priority.toLowerCase()}`}>
                {problem.priority}
              </span>
              <span className={`difficulty-badge diff-${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <span className="lpa-badge">{problem.lpa_zone}</span>
              <span className="freq-badge">{problem.interview_frequency}</span>
            </div>
            {problem.tags && problem.tags.length > 0 && (
              <div className="tag-list">
                {problem.tags.map((tag) => (
                  <span className="tag-chip" key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {problem.content?.problem_description && (
            <div className="content-panel">
              <h3>Problem Description</h3>
              <p>{problem.content.problem_description}</p>
            </div>
          )}

          {problem.content?.approach_comparison && (
            <div className="content-panel">
              <h3>Approach Comparison</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Approach</th>
                    <th>Time Complexity</th>
                    <th>Space Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {problem.content.approach_comparison.approaches.map((approach, index) => (
                    <tr key={index}>
                      <td>{approach}</td>
                      <td>{problem.content.approach_comparison.time_complexity[index]}</td>
                      <td>{problem.content.approach_comparison.space_complexity[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {problem.content?.hints && problem.content.hints.length > 0 && (
            <div className="content-panel">
              <h3>Hints</h3>
              <ul className="hint-list">
                {problem.content.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          {problem.content?.common_mistakes && problem.content.common_mistakes.length > 0 && (
            <div className="content-panel">
              <h3>Common Mistakes</h3>
              <ul className="mistake-list">
                {problem.content.common_mistakes.map((mistake, index) => (
                  <li key={index}>{mistake}</li>
                ))}
              </ul>
            </div>
          )}

          {problem.follow_ups && problem.follow_ups.length > 0 && (
            <div className="content-panel">
              <h3>Follow-up Problems</h3>
              <div className="followup-list">
                {problem.follow_ups.map((followupId) => (
                  <Link key={followupId} href="/" className="followup-link">
                    {followupId}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {problem.practice_link && (
            <div className="practice-section">
              <a
                href={problem.practice_link}
                target="_blank"
                rel="noopener noreferrer"
                className="practice-button"
              >
                <Code2 size={18} />
                Open Practice Problem
              </a>
            </div>
          )}
        </div>
      </motion.main>
    </div>
  );
}
