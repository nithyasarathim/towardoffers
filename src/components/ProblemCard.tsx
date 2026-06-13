import React, { useState } from "react";
import SubscriptionModal from "./SubscriptionModal";
import "./subscription.css";

type Problem = {
  id: string | number;
  name: string;
  lpa: number; // numeric LPA value, e.g. 6, 8.5
  // ...existing code...
};

type User = {
  id?: string | number;
  // subscriptionMaxLPA: number indicates highest LPA unlocked by subscription.
  // If absent (free tier) the default is treated as 6.
  subscriptionMaxLPA?: number;
  // ...existing code...
};

type Props = {
  problem: Problem;
  user?: User | null;
  // ...existing code...
};

export default function ProblemCard({ problem, user }: Props) {
  const defaultFreeMax = 6;
  const userMax = user?.subscriptionMaxLPA ?? defaultFreeMax;
  const locked = problem.lpa > userMax;
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="problem-card">
      <div
        className={`problem-name ${locked ? "blurred" : ""}`}
        onClick={() => {
          if (locked) setShowModal(true);
        }}
        title={
          locked
            ? `Subscribe to view problems above ${userMax} LPA`
            : problem.name
        }
        aria-hidden={locked}
      >
        {problem.name}
      </div>

      {/* ...existing code... (other problem card UI like difficulty, tags, etc.) */}

      <SubscriptionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubscribe={() => {
          // Minimal hook: navigate to subscription page or call parent handler.
          // Replace with app navigation or callback integration.
          window.location.href = "/subscribe";
        }}
        minimumUnlockLpa={userMax}
      />
    </div>
  );
}
