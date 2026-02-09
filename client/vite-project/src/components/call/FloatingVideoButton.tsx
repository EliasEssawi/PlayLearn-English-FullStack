import { useCall } from "./CallProvider";

type Props = {
  darkMode: boolean;
};

export default function FloatingVideoButton({ darkMode }: Props) {
  const { openCallModal } = useCall();

  const bubbleBg = darkMode ? "#1e293b" : "#86e07f";
  const bubbleShadow = darkMode
    ? "0 10px 30px rgba(0,0,0,0.35)"
    : "0 10px 30px rgba(15,23,42,0.18)";

  return (
    <button
      type="button"
      title="Video Call"
      onClick={openCallModal}
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        width: 60,
        height: 60,
        borderRadius: 999,
        border: "none",
        background: bubbleBg,
        color: darkMode ? "#f8fafc" : "#0f172a",
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: bubbleShadow,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
      }}
    >
      🎥
    </button>
  );
}
