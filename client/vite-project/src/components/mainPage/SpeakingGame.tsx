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
}

export default function SpeakingGame({
  title = "Speak the sentence",
  answer,
  lang = "en-US",
  onContinue,
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
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {/* Answer to speak */}
      <div className="bg-[#1f2d33] border-2 border-[#2f3f46] rounded-xl p-5 text-white text-lg font-semibold">
        {answer}
      </div>

      {/* Record button */}
      <button
        onClick={startRecording}
        disabled={isRecording}
        className="
          w-full flex items-center justify-center gap-3
          py-4 rounded-xl font-bold text-lg
          bg-[#1f2d33] border-2 border-[#2f3f46]
          shadow-[0_6px_0_#162227]
          hover:-translate-y-0.5 hover:shadow-[0_8px_0_#162227]
          active:translate-y-0 active:shadow-[0_4px_0_#162227]
          disabled:opacity-60
          text-white
        "
      >
        {isRecording ? "🎙️ Listening..." : "🎤 Tap to speak"}
      </button>

      {/* Transcription */}
      {spokenText && (
        <div className="text-gray-300">
          <span className="font-semibold">You said:</span>{" "}
          <span className={isCorrect ? "text-lime-400" : "text-red-400"}>
            {spokenText}
          </span>
        </div>
      )}

      {/* Result */}
      {showResult && (
        <ResultBar
          correct={isCorrect}
          onContinue={() => onContinue?.(isCorrect, spokenText)}
        />
      )}
    </div>
  )
}
