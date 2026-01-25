import { useState } from "react"
import AnswerButton from "./AnswerButton"
import ResultBar from "./ResultBar"

// Props for the Fill-in-the-Blank game component
type FillBlankGameProps = {
  title?: string
  question: string
  correctAnswer: string
  options: string[]
  onContinue?: (isCorrect: boolean) => void
  darkMode: boolean 
}

export default function FillBlankGame({
  title = "Fill in the blank",
  question,
  correctAnswer,
  options,
  onContinue,
  darkMode,
}: FillBlankGameProps) {
  // Selected answer and result visibility
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Whether the selected answer is correct
  const isCorrect = selected === correctAnswer

  // Handles answer selection (only once per question)
  const handleAnswer = (option: string) => {
    if (selected) return
    setSelected(option)
    setShowResult(true)
  }

  // Replaces the blank with the correct answer only if the user answered correctly
  const renderedQuestion = question.replace(
    "______",
    selected === correctAnswer ? correctAnswer : "______"
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 
        className="text-2xl font-bold transition-colors duration-300"
        style={{ color: darkMode ? "#ffffff" : "#0f172a" }} 
      >
        {title}
      </h2>

      {/* Question */}
      <div 
        className="text-lg whitespace-pre-line transition-colors duration-300"
        style={{ color: darkMode ? "#d1d5db" : "#374151" }} 
      >
        {renderedQuestion.split("______").map((part, i, arr) => (
            <span key={i}>
                {part}
                {i < arr.length - 1 && (
                <span className="text-lime-400 font-bold">______</span>
                )}
            </span>
        ))}
      </div>

      {/* Answers Options*/}
      <div className="space-y-4">
        {options.map((opt, i) => {
          let state: "idle" | "correct" | "wrong" | "disabled" = "idle"

          if (selected) {
            if (opt === correctAnswer) state = "correct"
            else if (opt === selected) state = "wrong"
            else state = "disabled"
          }

          return (
            <AnswerButton
              key={opt}
              index={i + 1}
              text={opt}
              state={state}
              onClick={() => handleAnswer(opt)}
              darkMode={darkMode} 
            />
          )
        })}
      </div>

      {/* Continue button + Result FeedBack*/}
      {showResult && (
        <ResultBar
          correct={isCorrect}
          onContinue={() => {
            setSelected(null)       // reset selection for next question
            setShowResult(false)    // hide result
            onContinue?.(isCorrect) // notify parent
          }}
        />
      )}
    </div>
  )
}