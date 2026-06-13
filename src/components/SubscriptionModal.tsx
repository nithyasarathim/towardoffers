import React from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
  minimumUnlockLpa?: number;
};

export default function SubscriptionModal({
  visible,
  onClose,
  onSubscribe,
  minimumUnlockLpa = 6,
}: Props) {
  if (!visible) return null;
  return (
    <div className="sub-modal-backdrop" onClick={onClose}>
      <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Subscribe to view</h3>
        <p>Problems above {minimumUnlockLpa} LPA are locked for free users.</p>
        <div className="sub-modal-actions">
          <button onClick={onSubscribe} className="sub-btn primary">
            Subscribe
          </button>
          <button onClick={onClose} className="sub-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
