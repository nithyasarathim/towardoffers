"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  CreditCard,
  IndianRupee,
  Link2Off,
  LockKeyhole,
  Moon,
  Star,
  Sun,
  X,
} from "lucide-react";

const lpaLabel = { "4-8 LPA": "4-8", "8-12 LPA": "8-12", "12-18 LPA": "12-18" };
const lpaClass = { "4-8 LPA": "lpa-entry", "8-12 LPA": "lpa-mid", "12-18 LPA": "lpa-senior" };
const priorityClass = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low",
};
const diffClass = {
  Easy: "diff-easy",
  Medium: "diff-medium",
  Hard: "diff-hard",
};
const filterOptions = {
  difficulty: ["Easy", "Medium", "Hard"],
  priority: ["High", "Medium", "Low"],
  lpa: ["4-8 LPA", "8-12 LPA", "12-18 LPA"],
};
const lpaFilterLabel = { "4-8 LPA": "4-8", "8-12 LPA": "8-12", "12-18 LPA": "12-18" };
const STORAGE_KEY = "towardsoffer_dsa_v2";
const ACCESS_KEY = "towardsoffer_access_tier";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    caption: "Only <6 LPA problem names",
    benefits: [
      "Entry-level problem names",
      "No hints or solutions",
      "No algorithm notes",
    ],
  },
  {
    id: "starter",
    name: "Tier 2",
    price: 49,
    caption: "All names + algorithms",
    benefits: [
      "All problem names",
      "Know the Algorithm sections",
      "Still keeps deep content locked",
    ],
  },
  {
    id: "pro",
    name: "Tier 3",
    price: 199,
    caption: "Full sheet access",
    benefits: [
      "All problem names",
      "Tags, hints, mistakes",
      "Practice links and full details",
    ],
  },
];

function sanitizeId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, "_");
}

function loadStoredState() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function loadAccessTier() {
  if (typeof window === "undefined") return "free";
  return localStorage.getItem(ACCESS_KEY) || "free";
}

function getAccessPlan(tier) {
  return plans.find((plan) => plan.id === tier) || plans[0];
}

function getTopicAccessTier(topic, accessTier) {
  return topic === "Arrays" ? "pro" : accessTier;
}

function canViewProblemName(problem, accessTier) {
  return accessTier !== "free" || problem.lpa_zone === "4-8 LPA";
}

function getTotalProblems(topicData) {
  if (!topicData) return 0;
  return Object.values(topicData).reduce(
    (sum, subtopic) => sum + subtopic.problems.length,
    0,
  );
}

function getProgressMessage(progress) {
  if (progress >= 100)
    return `${progress}% ready! Nailed it.`;

  if (progress >= 90)
    return `${progress}% ready! Final push.`;

  if (progress >= 80)
    return `${progress}% ready! Almost there.`;

  if (progress >= 60)
    return `${progress}% ready! Stay consistent.`;

  if (progress >= 40)
    return `${progress}% ready! Doing great.`;

  if (progress >= 20)
    return `${progress}% ready! Keep moving.`;

  return `${progress}% ready! Start strong.`;
};

function getCompletedProblems(topicData, state) {
  if (!topicData || !state) return 0;
  
  return Object.values(topicData).reduce(
    (sum, subtopic) => {
      if (!subtopic || !subtopic.problems || !Array.isArray(subtopic.problems)) return sum;
      return sum + subtopic.problems.filter((problem) => state[problem.id]).length;
    },
    0,
  );
}

function buildProblemIndex(data) {
  const index = {};
  Object.keys(data).forEach((topic) => {
    Object.keys(data[topic]).forEach((subtopic, subtopicIndex) => {
      const subtopicId = `subtopic-${sanitizeId(topic)}-${subtopicIndex}`;
      data[topic][subtopic].problems.forEach((problem, problemIndex) => {
        index[problem.id] = {
          topic,
          subtopic,
          subtopicId,
          problemDomId: `problem-${subtopicId}-${problemIndex}`,
        };
      });
    });
  });
  return index;
}

function ProgressDonut({ completed, total }) {
  const safeTotal = total || 0;
  const percent = safeTotal ? Math.round((completed / safeTotal) * 100) : 0;
  const background = `conic-gradient(var(--brand) ${percent * 3.6}deg, #e9edf3 0deg)`;

  return (
    <div className="donut-card" aria-label={`you ${percent}%`}>
      <div className="donut-chart" style={{ background }}>
        <div>
          <strong>
            {completed}/{safeTotal}
          </strong>
        </div>
      </div>
    </div>
  );
}

function Pill({ className = "", children, ...props }) {
  return (
    <span className={`pill ${className}`} {...props}>
      {children}
    </span>
  );
}

function StarBadge({ type, value }) {
  const countByValue = { Low: 1, Easy: 1, Medium: 2, High: 3, Hard: 3 };
  const className =
    type === "priority" ? priorityClass[value] : diffClass[value];
  const label = `${type === "priority" ? "Priority" : "Difficulty"} ${value}`;

  return (
    <span
      className={`star-badge ${className}`}
      title={label}
      aria-label={label}
    >
      {Array.from({ length: countByValue[value] || 1 }).map((_, index) => (
        <Star
          size={12}
          fill="currentColor"
          strokeWidth={2.4}
          key={`${value}-${index}`}
        />
      ))}
    </span>
  );
}

function FilterGroup({ title, options, selected, labels, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="filter-group">
      <button
        type="button"
        className="filter-button"
        onClick={() => setOpen((s) => !s)}
      >
        <span>{title}</span>
        <ChevronDown size={14} className={open ? "rotated" : ""} />
      </button>

      {open && (
        <div className="filter-dropdown" role="menu">
          {options.map((option) => (
            <label className="filter-check" key={option}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
              />
              <span>{labels?.[option] || option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [topics, setTopics] = useState([]);
  const [loadedTopicData, setLoadedTopicData] = useState({});
  const [loadError, setLoadError] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [openSubtopic, setOpenSubtopic] = useState(null);
  const [openProblem, setOpenProblem] = useState(null);
  const [openLearningAid, setOpenLearningAid] = useState({});
  const [progressState, setProgressState] = useState({});
  const [accessTier, setAccessTier] = useState("free");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentTargetTier, setPaymentTargetTier] = useState("pro");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const [filters, setFilters] = useState({
    difficulty: filterOptions.difficulty,
    priority: filterOptions.priority,
    lpa: filterOptions.lpa,
  });

  useEffect(() => {
    setProgressState(loadStoredState());
    setAccessTier(loadAccessTier());
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }

    // Load topics list
    fetch("/api/topics")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setTopics(data);
        if (data.length > 0) {
          setCurrentTopic(data[0]);
          // Load first topic's data
          loadTopicData(data[0]);
        }
      })
      .catch((error) => setLoadError(error.message));

    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  const problemIndex = useMemo(
    () => (loadedTopicData ? buildProblemIndex(loadedTopicData) : {}),
    [loadedTopicData],
  );
  const currentTopicData = currentTopic ? loadedTopicData[currentTopic] : null;
  const totalProblems = currentTopicData ? getTotalProblems(currentTopicData) : 0;
  const completedProblems = currentTopicData
    ? getCompletedProblems(currentTopicData, progressState)
    : 0;
  const progress = totalProblems
    ? Math.round((completedProblems / totalProblems) * 100)
    : 0;
  const selectedAccessPlan = getAccessPlan(accessTier);
  const topicAccessTier = getTopicAccessTier(currentTopic, accessTier);
  const isPreviewTopic = currentTopic === "Arrays";
  const hasAlgorithmAccess =
    topicAccessTier === "starter" || topicAccessTier === "pro";
  const hasFullAccess = topicAccessTier === "pro";

  function selectTopic(topic) {
    setCurrentTopic(topic);
    setOpenSubtopic(null);
    setOpenProblem(null);
    setOpenLearningAid({});
    
    // Load topic data if not already loaded
    if (!loadedTopicData[topic]) {
      loadTopicData(topic);
    }
  }

  function loadTopicData(topic) {
    fetch(`/api/topics/${encodeURIComponent(topic)}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setLoadedTopicData(prev => ({
          ...prev,
          [topic]: data
        }));
      })
      .catch((error) => setLoadError(error.message));
  }

  function toggleSubtopic(subtopicId) {
    setOpenSubtopic((current) => (current === subtopicId ? null : subtopicId));
    setOpenProblem(null);
  }

  function openAndScrollSubtopic(topic, subtopicId) {
    if (!subtopicId) return;

    if (topic !== currentTopic) {
      setCurrentTopic(topic);
    }

    setOpenSubtopic(subtopicId);
    setOpenProblem(null);

    window.setTimeout(() => {
      const element = document.getElementById(subtopicId);
      const section = element?.closest(".section-card");
      (section || element)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  function toggleProblem(problemId) {
    setOpenProblem((current) => (current === problemId ? null : problemId));
  }

  function toggleLearningAid(learningAidId) {
    setOpenLearningAid((current) => ({
      ...current,
      [learningAidId]: !current[learningAidId],
    }));
  }

  function toggleCheckbox(problemId) {
    const nextState = {
      ...progressState,
      [problemId]: !progressState[problemId],
    };
    setProgressState(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }

  function toggleFilter(category, value) {
    setFilters((current) => {
      const selected = current[category];
      const nextSelected = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [category]: nextSelected };
    });
    setOpenProblem(null);
  }

  function matchesFilters(problem) {
    return (
      filters.difficulty.includes(problem.difficulty) &&
      filters.priority.includes(problem.priority) &&
      filters.lpa.includes(problem.lpa_zone)
    );
  }

  function openSubscriptionPopup(targetTier = "pro") {
    setPaymentTargetTier(targetTier);
    setPaymentOpen(true);
  }

  function updateAccessTier(nextTier) {
    setAccessTier(nextTier);
    localStorage.setItem(ACCESS_KEY, nextTier);
    setOpenProblem(null);
    setOpenLearningAid({});
  }

  function findProblemName(problemId) {
    const ref = problemIndex[problemId];
    if (!ref || !loadedTopicData) return problemId;
    return (
      loadedTopicData[ref.topic][ref.subtopic].problems.find(
        (problem) => problem.id === problemId,
      )?.name || problemId
    );
  }

  function navigateToProblem(problemId) {
    const ref = problemIndex[problemId];
    if (!ref) return;

    if (ref.topic !== currentTopic) {
      setCurrentTopic(ref.topic);
    }

    setOpenSubtopic(ref.subtopicId);
    setOpenProblem(ref.problemDomId);

    window.setTimeout(() => {
      document
        .getElementById(`wrap-${problemId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  if (loadError) {
    return (
      <main className="center-pane">
        <div className="error-panel">
          Failed to load problem data: {loadError}
          <br />
          Please check your connection and try again.
        </div>
      </main>
    );
  }

  if (!topics.length || !currentTopicData) {
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
            </div>
          </div>
        </header>
        <div className="layout">
          <aside className="topic-sidebar col-span-2">
            <div className="sidebar-title shimmer shimmer-header"></div>
            <nav className="topic-nav">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="shimmer shimmer-item shimmer-sidebar-item"></div>
              ))}
            </nav>
          </aside>
          <main className="main-pane col-span-6">
            <div className="mobile-selectors">
              <div className="shimmer shimmer-item shimmer-header"></div>
              <div className="shimmer shimmer-item shimmer-header"></div>
            </div>
            <div className="subtopic-nav">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer shimmer-item shimmer-subtopic-item"></div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
            {user ? (
              <div className="user-chip" title={user.email}>
                {user.picture ? (
                  <img src={user.picture} alt="" />
                ) : (
                  <span>{user.name?.charAt(0) || "U"}</span>
                )}
                {user.name || user.email}
              </div>
            ) : (
              <a className="login-link" href="/login">
                Sign in
              </a>
            )}
            <div className={`access-chip access-${accessTier}`}>
              {selectedAccessPlan.name}
            </div>
            {user && (
              <button
                className="upgrade-button"
                type="button"
                onClick={() => openSubscriptionPopup(accessTier)}
              >
                <CreditCard size={16} />
                Subscriptions
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="topic-sidebar col-span-2">
          <div className="sidebar-title">Topics</div>
          <nav className="topic-nav" aria-label="Topics">
            {topics.map((topic) => {
              const topicProgress = getCompletedProblems(
                loadedTopicData[topic],
                progressState,
              );
              const topicTotal = getTotalProblems(loadedTopicData[topic]);
              const progressPercent = topicTotal > 0 ? Math.round((topicProgress / topicTotal) * 100) : 0;
              const isComplete = progressPercent === 100;

              return (
                <button
                  type="button"
                  className={`sidebar-item ${topic === currentTopic ? "active" : ""}`}
                  onClick={() => selectTopic(topic)}
                  key={topic}
                >
                  <span>{topic}</span>
                  <svg className="topic-progress-circle" width="20" height="20" viewBox="0 0 20 20">
                    {isComplete ? (
                      <>
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="var(--brand)"
                        />
                        <path
                          d="M6 10 L9 13 L14 7"
                          stroke="white"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <>
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="none"
                          stroke="rgba(37, 99, 235, 0.2)"
                          strokeWidth="2"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          fill="none"
                          stroke="var(--brand)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 8}
                          strokeDashoffset={2 * Math.PI * 8 - (progressPercent / 100) * 2 * Math.PI * 8}
                          transform="rotate(-90 10 10)"
                        />
                      </>
                    )}
                  </svg>
                </button>
              );
            })}
          </nav>
        </aside>

        <aside className="subtopic-sidebar col-span-2">
          <div className="sidebar-title">
            <span>Subtopics</span>
            <small>{currentTopic}</small>
          </div>
          <AnimatePresence mode="wait">
            <motion.nav
              className="subtopic-nav"
              aria-label={`${currentTopic} subtopics`}
              key={currentTopic}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {Object.keys(currentTopicData).map((subtopicName, subtopicIndex) => {
                const subtopic = currentTopicData[subtopicName];
                const subtopicId = `subtopic-${sanitizeId(currentTopic)}-${subtopicIndex}`;

                return (
                  <motion.button
                    type="button"
                    className={`subtopic-item ${openSubtopic === subtopicId ? "active" : ""}`}
                    key={subtopicId}
                    onClick={() =>
                      openAndScrollSubtopic(currentTopic, subtopicId)
                    }
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                  >
                    <span>{subtopicName}</span>
                    <strong>{subtopic.problems.length}</strong>
                  </motion.button>
                );
              })}
            </motion.nav>
          </AnimatePresence>
        </aside>

        <motion.main
          className="main-pane col-span-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="mobile-selectors">
            <select
              value={currentTopic}
              onChange={(event) => selectTopic(event.target.value)}
              aria-label="Select topic"
            >
              {topics.map((topic) => (
                <option value={topic} key={topic}>
                  {topic}
                </option>
              ))}
            </select>

            <select
              value={openSubtopic || ""}
              onChange={(event) =>
                openAndScrollSubtopic(currentTopic, event.target.value)
              }
              aria-label="Select subtopic"
            >
              <option value="">Select subtopic</option>
              {Object.keys(currentTopicData).map((subtopicName, subtopicIndex) => {
                const subtopicId = `subtopic-${sanitizeId(currentTopic)}-${subtopicIndex}`;
                return (
                  <option value={subtopicId} key={subtopicId}>
                    {subtopicName} ({currentTopicData[subtopicName].problems.length})
                  </option>
                );
              })}
            </select>
          </div>

          <motion.section className="subtopic-list" layout>
            {Object.keys(currentTopicData).map((subtopicName, subtopicIndex) => {
              const subtopic = currentTopicData[subtopicName];
              const subtopicId = `subtopic-${sanitizeId(currentTopic)}-${subtopicIndex}`;
              const completed = getCompletedProblems(
                { [subtopicName]: subtopic },
                progressState,
              );
              const learningAidId = `learn-${subtopicId}`;
              const isSubtopicOpen = openSubtopic === subtopicId;

              // Only show if this is the selected subtopic or if no subtopic is selected
              if (openSubtopic && openSubtopic !== subtopicId) {
                return null;
              }

              // Always show accordion content when subtopic is selected from sidebar
              const shouldShowContent = openSubtopic ? true : isSubtopicOpen;

              return (
                <motion.article
                  className="section-card"
                  key={subtopicId}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.22,
                    delay: Math.min(subtopicIndex * 0.025, 0.16),
                  }}
                >
                  <button
                    className="subtopic-header"
                    type="button"
                    onClick={() => toggleSubtopic(subtopicId)}
                  >
                    <span className="icon-button">
                      <ChevronRight
                        className={isSubtopicOpen ? "rotated" : ""}
                        size={18}
                      />
                    </span>
                    <span className="subtopic-heading">
                      <h3>{subtopicName}</h3>
                      <p>
                        {completed}/{subtopic.problems.length} completed
                      </p>
                    </span>
                    <Pill className="neutral-pill">
                      {subtopic.problems.length} problems
                    </Pill>
                  </button>

                  <div
                    className={`accordion-content ${shouldShowContent ? "open" : ""}`}
                    id={subtopicId}
                  >
                    {subtopic.learningAid && hasAlgorithmAccess && (
                      <div className="learning-aid">
                        <button
                          type="button"
                          className="learning-header"
                          onClick={() => toggleLearningAid(learningAidId)}
                        >
                          <span className="soft-icon">
                            <ChevronRight
                              className={
                                openLearningAid[learningAidId] ? "rotated" : ""
                              }
                              size={17}
                            />
                          </span>
                          <h4>
                            Know the Algorithm - {subtopic.learningAid.title}
                          </h4>
                        </button>
                        <div
                          className={`accordion-content ${openLearningAid[learningAidId] ? "open" : ""}`}
                        >
                          <div className="learning-body">
                            <pre className="code-block">
                              {subtopic.learningAid.code}
                            </pre>
                            <p>{subtopic.learningAid.explanation}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {subtopic.learningAid && !hasAlgorithmAccess && (
                      <div
                        className="learning-aid locked-learning"
                        onClick={() => openSubscriptionPopup("starter")}
                      >
                        <div className="locked-preview">
                          <div className="blurred-preview">
                            <button type="button" className="learning-header">
                              <span className="soft-icon">
                                <ChevronRight size={17} />
                              </span>
                              <h4>
                                Know the Algorithm -{" "}
                                {subtopic.learningAid.title}
                              </h4>
                            </button>
                            <div className="learning-body">
                              <pre className="code-block">
                                {subtopic.learningAid.code}
                              </pre>
                              <p>{subtopic.learningAid.explanation}</p>
                            </div>
                          </div>
                          <button className="premium-overlay" type="button">
                            <LockKeyhole size={17} />
                            Unlock algorithm in Tier 2
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="problem-table-wrap">
                      <table className="problem-table">
                        <thead>
                          <tr>
                            <th scope="col">Status</th>
                            <th scope="col">LPA</th>
                            <th scope="col">Problem</th>
                            <th scope="col">Priority</th>
                            <th scope="col">Difficulty</th>
                            <th scope="col">Interview Freq</th>
                            <th scope="col">Practice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subtopic.problems.map((problem, problemIndex) => {
                            const problemId = `problem-${subtopicId}-${problemIndex}`;
                            const isProblemOpen = openProblem === problemId;
                            const isChecked = Boolean(
                              progressState[problem.id],
                            );
                            const canSeeName = canViewProblemName(
                              problem,
                              topicAccessTier,
                            );
                            const canTrackProblem = hasFullAccess;
                            const rowLocked = !canSeeName;
                            const detailLocked = !hasFullAccess;

                            return (
                              <tr
                                className={`problem-row ${isChecked ? "completed" : ""} ${rowLocked || detailLocked ? "premium-row" : ""}`}
                                id={`wrap-${problem.id}`}
                              >
                                <td data-label="Status">
                                  <div className="problem-controls">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={!canTrackProblem}
                                      onChange={() =>
                                        toggleCheckbox(problem.id)
                                      }
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        if (!canTrackProblem)
                                          openSubscriptionPopup("pro");
                                      }}
                                      aria-label={`Mark ${problem.name} as completed`}
                                    />
                                  </div>
                                </td>
                                <td data-label="LPA">
                                  <span
                                    className={
                                      rowLocked ? "blurred-inline" : ""
                                    }
                                  >
                                    <Pill
                                      className={`compact-pill ${lpaClass[problem.lpa_zone]}`}
                                    >
                                      {lpaLabel[problem.lpa_zone].replace(
                                        " LPA",
                                        "",
                                      )}
                                    </Pill>
                                  </span>
                                </td>
                                <td data-label="Problem">
                                  <a
                                    className={`problem-name ${rowLocked ? "premium-blur" : ""}`}
                                    href={`/problem/${problem.id}`}
                                    onClick={(event) => {
                                      if (rowLocked || detailLocked) {
                                        event.preventDefault();
                                        openSubscriptionPopup(
                                          rowLocked ? "starter" : "pro",
                                        );
                                      }
                                    }}
                                  >
                                    {problem.name}
                                  </a>
                                </td>
                                  <td data-label="Priority">
                                    {hasFullAccess ? (
                                      <StarBadge
                                        type="priority"
                                        value={problem.priority}
                                      />
                                    ) : (
                                      <Pill
                                        className="compact-pill locked-pill"
                                        title={
                                          rowLocked
                                            ? "Name locked"
                                            : "Details locked"
                                        }
                                      >
                                        <LockKeyhole size={12} />
                                      </Pill>
                                    )}
                                  </td>
                                  <td data-label="Difficulty">
                                    {hasFullAccess ? (
                                      <StarBadge
                                        type="difficulty"
                                        value={problem.difficulty}
                                      />
                                    ) : (
                                      <span className="muted-table-text">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td data-label="Interview Freq">
                                    {hasFullAccess ? (
                                      <span className="freq-badge">
                                        {problem.interview_frequency}
                                      </span>
                                    ) : (
                                      <span className="muted-table-text">
                                        —
                                      </span>
                                    )}
                                  </td>
                                  <td data-label="Practice">
                                    {hasFullAccess && problem.practice_link ? (
                                      <a
                                        className="practice-link icon-action"
                                        href={problem.practice_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Open practice problem"
                                        aria-label={`Open ${problem.name} practice problem`}
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        <Code2 size={15} />
                                      </a>
                                    ) : hasFullAccess ? (
                                      <span
                                        className="practice-disabled icon-action"
                                        title="No practice link"
                                        aria-label="No practice link"
                                      >
                                        <Link2Off size={15} />
                                      </span>
                                    ) : (
                                      <button
                                        className="practice-disabled locked-action compact-action icon-action"
                                        type="button"
                                        title={
                                          rowLocked
                                            ? "Name locked"
                                            : "Details locked"
                                        }
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          openSubscriptionPopup(
                                            rowLocked ? "starter" : "pro",
                                          );
                                        }}
                                      >
                                        <LockKeyhole size={14} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.section>
        </motion.main>
      </div>

      {paymentOpen && (
        <PaymentModal
          currentTier={accessTier}
          initialTier={paymentTargetTier}
          onClose={() => setPaymentOpen(false)}
          onActivate={(tier) => updateAccessTier(tier)}
        />
      )}
    </div>
  );
}

function LockedPanel({ title, message, onUpgrade }) {
  return (
    <div className="locked-panel">
      <div>
        <LockKeyhole size={18} />
      </div>
      <span>
        <h4>{title}</h4>
        <p>{message}</p>
      </span>
      <button type="button" onClick={onUpgrade}>
        Upgrade
      </button>
    </div>
  );
}

function ProblemContent({ content, findProblemName, navigateToProblem }) {
  return (
    <div className="problem-content">
      {content.tags?.length > 0 && (
        <div className="tag-list">
          {content.tags.map((tag) => (
            <span className="tag-chip" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {content.problem_description && (
        <div className="content-panel info">
          <h4>Problem Description</h4>
          <p>{content.problem_description}</p>
        </div>
      )}

      {content.approach_comparison && (
        <div className="content-panel">
          <h4>Approach Comparison</h4>
          <div className="comparison-wrap">
            <table>
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Time Complexity</th>
                  <th>Space Complexity</th>
                </tr>
              </thead>
              <tbody>
                {content.approach_comparison.approaches.map(
                  (approach, index) => (
                    <tr key={`${approach}-${index}`}>
                      <td>{approach}</td>
                      <td>
                        {content.approach_comparison.time_complexity[index] ||
                          "-"}
                      </td>
                      <td>
                        {content.approach_comparison.space_complexity[index] ||
                          "-"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {content.hints?.length > 0 && (
        <div className="content-panel warning">
          <h4>Hints</h4>
          <div className="hint-list">
            {content.hints.map((hint, index) => (
              <details key={`${hint}-${index}`}>
                <summary>Hint {index + 1}</summary>
                <p>{hint}</p>
              </details>
            ))}
          </div>
        </div>
      )}

      {content.common_mistakes?.length > 0 && (
        <div className="content-panel danger">
          <h4>Common Mistakes</h4>
          <ul>
            {content.common_mistakes.map((mistake, index) => (
              <li key={`${mistake}-${index}`}>
                <span />
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.follow_up_questions?.length > 0 && (
        <div className="content-panel">
          <h4>Follow-up Questions</h4>
          <div className="followup-list">
            {content.follow_up_questions.map((problemId) => (
              <button
                className="followup-chip"
                type="button"
                onClick={() => navigateToProblem(problemId)}
                key={problemId}
              >
                <ArrowRight size={14} />
                {findProblemName(problemId)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentModal({ currentTier, initialTier, onActivate, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState(
    initialTier || currentTier || "pro",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const plan = plans.find((item) => item.id === selectedPlan) || plans[0];
  const total = plan.price;

  async function submitPayment(event) {
    event.preventDefault();
    setCheckoutError("");
    setIsProcessing(true);

    if (plan.price === 0) {
      setIsProcessing(false);
      onActivate(plan.id);
      setIsComplete(true);
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });
      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start Stripe checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message);
      setIsProcessing(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Payment checkout"
    >
      <div className="payment-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Checkout</p>
            <h2>Upgrade TowardsOffer</h2>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Close payment modal"
          >
            <X size={18} />
          </button>
        </div>

        {isComplete ? (
          <div className="success-state">
            <div className="success-icon">
              <CheckCircle2 size={34} />
            </div>
            <h3>Payment interface complete</h3>
            <p>
              Your free access is active in this browser. Paid plans are handled
              securely through Stripe Checkout.
            </p>
            <button className="primary-button" type="button" onClick={onClose}>
              Continue Learning
            </button>
          </div>
        ) : (
          <form className="checkout-grid" onSubmit={submitPayment}>
            <section className="checkout-main">
              <div className="plans-grid">
                {plans.map((item) => (
                  <button
                    type="button"
                    className={`plan-card ${selectedPlan === item.id ? "selected" : ""}`}
                    onClick={() => setSelectedPlan(item.id)}
                    key={item.id}
                  >
                    <span>{item.name}</span>
                    <strong>
                      {item.price === 0 ? (
                        "Free"
                      ) : (
                        <>
                          <IndianRupee size={16} />
                          {item.price.toLocaleString("en-IN")}
                        </>
                      )}
                    </strong>
                    <p>{item.caption}</p>
                  </button>
                ))}
              </div>

              {plan.price > 0 && (
                <div className="stripe-note">
                  <LockKeyhole size={18} />
                  <div>
                    <strong>Secure Stripe Checkout</strong>
                    <p>
                      You will be redirected to Stripe to complete payment. No
                      card details are stored here.
                    </p>
                  </div>
                </div>
              )}

              {plan.price === 0 && (
                <div className="free-access-note">
                  <CheckCircle2 size={18} />
                  Free tier shows only <strong>&lt;6 LPA</strong> problem names.
                </div>
              )}

              {checkoutError && (
                <div className="checkout-error">{checkoutError}</div>
              )}
            </section>

            <aside className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>{plan.name} plan</span>
                <strong>
                  {plan.price === 0
                    ? "Free"
                    : `Rs. ${plan.price.toLocaleString("en-IN")}`}
                </strong>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>
                  {total === 0
                    ? "Free"
                    : `Rs. ${total.toLocaleString("en-IN")}`}
                </strong>
              </div>

              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>
                    <CheckCircle2 size={15} />
                    {benefit}
                  </li>
                ))}
              </ul>

              <button
                className="primary-button"
                type="submit"
                disabled={isProcessing}
              >
                {plan.price > 0 ? (
                  <LockKeyhole size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isProcessing
                  ? "Redirecting..."
                  : total === 0
                    ? "Activate Free"
                    : `Pay with Stripe - Rs. ${total.toLocaleString("en-IN")}`}
              </button>
              <p className="secure-note">
                Stripe test mode works with test keys and test price IDs from
                your .env.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
