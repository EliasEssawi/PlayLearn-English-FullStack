import { useState } from "react"
import AnswerButton from "./AnswerButton"
import ResultBar from "./ResultBar"

type ListeningGameProps = {
  title?: string
  textToRead: string
  correctAnswer: string
  options: string[]
  onContinue?: (isCorrect: boolean) => void
}

export default function ListeningGame({
  title = "Listen and choose",
  textToRead,
  correctAnswer,
  options,
  onContinue,
}: ListeningGameProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isCorrect = selected === correctAnswer

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.")
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleAnswer = (option: string) => {
    if (selected) return
    setSelected(option)
    setShowResult(true)
    window.speechSynthesis.cancel()
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {/* Listen button */}
      <button
        onClick={speak}
        className="
          w-full flex items-center justify-center gap-3
          py-4 rounded-xl font-bold text-lg
          bg-[#1f2d33] border-2 border-[#2f3f46]
          shadow-[0_6px_0_#162227]
          hover:-translate-y-0.5 hover:shadow-[0_8px_0_#162227]
          active:translate-y-0 active:shadow-[0_4px_0_#162227]
          text-white
        "
      >
        {isSpeaking ? "🔊 Playing..." : "🔊 Listen"}
      </button>

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

      {/* Result */}
      {showResult && (
        <ResultBar
          correct={isCorrect}
          onContinue={() => onContinue?.(isCorrect)}
        />
      )}
    </div>
  )
}
