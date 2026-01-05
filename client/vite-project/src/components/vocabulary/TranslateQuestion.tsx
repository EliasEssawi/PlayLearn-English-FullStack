import React from "react";

type Question = {
  word: string;
  options: string[];
};

type Props = {
  question: Question;
  onAnswer: (answer: string) => void;
};

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
