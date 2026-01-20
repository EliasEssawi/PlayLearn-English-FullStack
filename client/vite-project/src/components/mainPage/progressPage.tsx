import { useSearchParams } from "react-router-dom";
import Progress from "./Progress";

export default function ProgressPage() {
  const [params] = useSearchParams();

  const email = params.get("email") || "";
  const profileName = params.get("profileName") || "";

  if (!email || !profileName) return <div>Missing email or profile</div>;

  return <Progress email={email} profileName={profileName} />;
}
