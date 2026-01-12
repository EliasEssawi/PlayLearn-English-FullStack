import React, { useState } from "react";

type QuestionCardProps = {
  question: string;
  options: string[];
  correctAnswer: string;
  onAnswer?: (isCorrect: boolean) => void;
};

const QuestionCardWithOptions: React.FC<QuestionCardProps> = ({
  question,
  options,
  correctAnswer,
  onAnswer,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleClick = (option: string) => {
    if (!isAnswered) {
      setSelected(option);
      setIsAnswered(true);
      onAnswer && onAnswer(option === correctAnswer);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-white text-lg font-semibold mb-4">{question}</h2>
      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(option)}
            className={`py-2 px-4 rounded-lg text-white font-medium transition-all
              ${
                isAnswered
                  ? option === correctAnswer
                    ? "bg-green-500"
                    : option === selected
                    ? "bg-red-500"
                    : "bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCardWithOptions;
