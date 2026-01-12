import { useState } from "react"
import AnswerButton from "./AnswerButton"
import ResultBar from "./ResultBar"

type FillBlankGameProps = {
  title?: string
  question: string
  correctAnswer: string
  options: string[]
  onContinue?: (isCorrect: boolean) => void
}

export default function FillBlankGame({
  title = "Fill in the blank",
  question,
  correctAnswer,
  options,
  onContinue,
}: FillBlankGameProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)

  const isCorrect = selected === correctAnswer

  const handleAnswer = (option: string) => {
    if (selected) return
    setSelected(option)
    setShowResult(true)
  }

  // replace blank with answer after selection
  const renderedQuestion = question.replace(
    "______",
    selected === correctAnswer ? correctAnswer : "______"
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {/* Question */}
      <p className="text-gray-300 text-lg whitespace-pre-line">
        {renderedQuestion.split("______").map((part, i, arr) => (
            <span key={i}>
                {part}
                {i < arr.length - 1 && (
                <span className="text-lime-400 font-bold">______</span>
                )}
            </span>
        ))}
      </p>

      {/* Answers */}
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
            />
          )
        })}
      </div>

      {/* Result Bar */}
      {showResult && (
        <ResultBar
          correct={isCorrect}
          onContinue={() => onContinue?.(isCorrect)}
        />
      )}
    </div>
  )
}
