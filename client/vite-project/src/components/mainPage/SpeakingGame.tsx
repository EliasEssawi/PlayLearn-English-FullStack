import { useEffect, useRef, useState } from "react"
import ResultBar from "./ResultBar"

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

type SpeakingGameProps = {
  title?: string
  answer: string
  lang?: string
  onContinue?: (isCorrect: boolean, spokenText: string) => void
  darkMode: boolean // הוספת הפרופ
}

export default function SpeakingGame({
  title = "Speak the sentence",
  answer,
  lang = "en-US",
  onContinue,
  darkMode, // קבלת הפרופ
}: SpeakingGameProps) {
  const recognitionRef = useRef<any>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [spokenText, setSpokenText] = useState("")
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onstart = () => setIsRecording(true)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSpokenText(transcript)
      setShowResult(true)
    }

    recognition.onend = () => setIsRecording(false)

    recognitionRef.current = recognition
  }, [lang])

  const startRecording = () => {
    setSpokenText("")
    setShowResult(false)
    recognitionRef.current?.start()
  }

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\w\s]/g, "").trim()

  const isCorrect = normalize(spokenText) === normalize(answer)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Title */}
      <h2 
        className="text-2xl font-bold transition-colors duration-300"
        style={{ color: darkMode ? "#ffffff" : "#0f172a" }}
      >
        {title}
      </h2>

      {/* Answer to speak (המלבן המציג את המשפט) */}
      <div 
        className="border-2 rounded-xl p-5 text-lg font-semibold transition-colors duration-300"
        style={{
          backgroundColor: darkMode ? "#1f2d33" : "#86e07f",
          borderColor: darkMode ? "#2f3f46" : "#6bc465",
          color: darkMode ? "#ffffff" : "#0f172a"
        }}
      >
        {answer}
      </div>

      {/* Record button (כפתור ההקלטה) */}
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="
          w-full flex items-center justify-center gap-3
          py-4 rounded-xl font-bold text-lg
          transition-all duration-150
          disabled:opacity-60
          border-2
        "
        style={{
          backgroundColor: darkMode ? "#1f2d33" : "#86e07f",
          borderColor: darkMode ? "#2f3f46" : "#6bc465",
          color: darkMode ? "#ffffff" : "#0f172a",
          boxShadow: darkMode 
            ? "0 6px 0 #162227" 
            : "0 6px 0 #58a352"
        }}
      >
        {isRecording ? "🎙️ Listening..." : "🎤 Tap to speak"}
      </button>

      {/* Transcription */}
      {spokenText && (
        <div style={{ color: darkMode ? "#d1d5db" : "#475569" }}>
          <span className="font-semibold">You said:</span>{" "}
          <span className={isCorrect ? "text-lime-400" : "text-red-400"}>
            {spokenText}
          </span>
        </div>
      )}

      {/* Result Bar */}
      {showResult && (
        <ResultBar
          correct={isCorrect}
          onContinue={() => onContinue?.(isCorrect, spokenText)}
        />
      )}
    </div>
  )
}