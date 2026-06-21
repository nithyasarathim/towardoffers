"use client";

export default function TopicSelector({ currentTopic, topics, onSelectTopic }) {
  return (
    <select
      value={currentTopic}
      onChange={(event) => onSelectTopic(event.target.value)}
      aria-label="Select topic"
      className="mobile-selector"
    >
      {topics.map((topic) => (
        <option value={topic} key={topic}>
          {topic}
        </option>
      ))}
    </select>
  );
}
