import React from "react";
// Represents a translation question
type Question = {
  word: string;
  options: string[];
};
// Component props definition
type Props = {
  question: Question;
  onAnswer: (answer: string) => void;
};
// Component that renders a translation question with selectable options

const TranslateQuestion: React.FC<Props> = ({ question, onAnswer }) => {
  return (
    <>
      <div className="translate-title">
        Translate: <span>{question.word}</span>
      </div>

      <div className="translate-options">
        {question.options.map((option) => (
          <button
            key={option}
            className="translate-option"
            onClick={() => onAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
};

export default TranslateQuestion;
