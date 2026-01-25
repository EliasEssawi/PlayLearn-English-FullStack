import { useState } from "react"
import AnswerButton from "./AnswerButton"
import ResultBar from "./ResultBar"

type ListeningGameProps = {
  title?: string
  textToRead: string
  correctAnswer: string
  options: string[]
  onContinue?: (isCorrect: boolean) => void
  darkMode: boolean
}

export default function ListeningGame({
  title = "Listen and choose",
  textToRead,
  correctAnswer,
  options,
  onContinue,
  darkMode,
}: ListeningGameProps) {
  const [selected, setSelected] = useState<string | null>(null)// Tracks chosen option
  const [showResult, setShowResult] = useState(false)// Controls ResultBar visibility
  const [isSpeaking, setIsSpeaking] = useState(false)// Indicates if TTS is currently playing

  const isCorrect = selected === correctAnswer// True if user picked the right answer

  const speak = () => {
    // Guard: browser must support Text-to-Speech API
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.")
      return
    }

    // Stop any previous speech before starting a new one
    window.speechSynthesis.cancel()

    // Create TTS utterance from the provided text
    const utterance = new SpeechSynthesisUtterance(textToRead)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.pitch = 1

    // Update UI state while speaking
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)

    // Start speaking
    window.speechSynthesis.speak(utterance)
  }

  const handleAnswer = (option: string) => {
    // Prevent changing answer after the first selection
    if (selected) return
    setSelected(option)
    setShowResult(true)

    // Stop audio after user answers (so it doesn't keep playing)
    window.speechSynthesis.cancel()
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 
        className="text-2xl font-bold transition-colors duration-300"
        style={{ color: darkMode ? "#ffffff" : "#0f172a" }}
      >
        {title}
      </h2>

      {/* Listen button */}
      <button
        onClick={speak}
        className="
          w-full flex items-center justify-center gap-3
          py-4 rounded-xl font-bold text-lg
          transition-all duration-150 select-none
          border-2
        "
        style={{
          backgroundColor: darkMode ? "#1f2d33" : "#ec407a",
          borderColor: darkMode ? "#2f3f46" : "#ec407a",
          color: darkMode ? "#ffffff" : "#0f172a",
          boxShadow: darkMode 
            ? "0 6px 0 #162227" 
            : "0 6px 0 #ec407a"
        }}
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
              darkMode={darkMode}// Pass theme down to the option button
            />
          )
        })}
      </div>

      {/* Continue button + Result */}
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