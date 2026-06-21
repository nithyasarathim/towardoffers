"use client";

import { motion } from "framer-motion";
import { Target, BookOpen, TrendingUp, Sparkles } from "lucide-react";

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
];

const actions = [
  { icon: Target, title: "Pick a subtopic", description: "Select a subtopic from the sidebar to start practicing" },
  { icon: BookOpen, title: "Learn algorithms", description: "Study the algorithm patterns for each topic" },
  { icon: TrendingUp, title: "Track progress", description: "Mark problems as complete to track your journey" },
  { icon: Sparkles, title: "Stay consistent", description: "Daily practice leads to mastery" },
];

export default function EmptyState({ suggestedSubtopics, onSelectSubtopic }) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <motion.div
      className="empty-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="empty-state-content">
        <div className="quote-section">
          <div className="quote-icon">
            <Sparkles size={32} />
          </div>
          <blockquote className="quote">
            "{randomQuote.text}"
          </blockquote>
          <cite className="quote-author">— {randomQuote.author}</cite>
        </div>

        {suggestedSubtopics && suggestedSubtopics.length > 0 && (
          <div className="suggestions-section">
            <h3>Suggested for you</h3>
            <div className="suggestion-grid">
              {suggestedSubtopics.map((subtopic, index) => (
                <button
                  key={subtopic.id}
                  type="button"
                  className="suggestion-card"
                  onClick={() => onSelectSubtopic && onSelectSubtopic(subtopic.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="suggestion-icon">
                    <Target size={20} />
                  </div>
                  <div className="suggestion-content">
                    <h4>{subtopic.name}</h4>
                    <p>{subtopic.problemCount} problems</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="actions-section">
          <h3>How to get started</h3>
          <div className="actions-grid">
            {actions.map((action, index) => (
              <div key={index} className="action-card">
                <div className="action-icon">
                  <action.icon size={24} />
                </div>
                <div className="action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
