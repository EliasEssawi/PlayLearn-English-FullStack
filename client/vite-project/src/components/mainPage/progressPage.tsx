import { useSearchParams } from "react-router-dom";
import Progress from "./Progress";
// PROGRESS PAGE

export default function ProgressPage() {
  const [params] = useSearchParams();  // Read query parameters from the URL
  // Extract email and profile name from query string
  const email = params.get("email") || "";
  const profileName = params.get("profileName") || "";
  // Guard: required parameters are missing

  if (!email || !profileName) return <div>Missing email or profile</div>;
  // Render Progress component with validated parameters

  return <Progress email={email} profileName={profileName} />;
}
