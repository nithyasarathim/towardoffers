"use client";

export default function SubtopicSelector({ currentTopic, topicData, openSubtopic, onOpenSubtopic, sanitizeId }) {
  return (
    <select
      value={openSubtopic || ""}
      onChange={(event) => onOpenSubtopic(currentTopic, event.target.value)}
      aria-label="Select subtopic"
      className="mobile-selector"
    >
      <option value="">Select subtopic</option>
      {Object.entries(topicData).map(([subtopicName, subtopic], subtopicIndex) => {
        const subtopicId = `subtopic-${sanitizeId(currentTopic)}-${subtopicIndex}`;
        return (
          <option value={subtopicId} key={subtopicId}>
            {subtopicName} ({subtopic.problems.length})
          </option>
        );
      })}
    </select>
  );
}
