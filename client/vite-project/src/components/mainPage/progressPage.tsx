import { useSearchParams } from "react-router-dom";
import Progrees from "./Progress"; // <-- change path to where Progress.tsx is

export default function ProgressPage() {
  const [params] = useSearchParams();

  const email = params.get("email") || "";
  const profileName = params.get("profileName") || "";

  if (!email || !profileName) return <div>Missing email or profile</div>;

  return (
    <Progrees
      email={email}
      profileName={profileName}
      onSelectSection={(s) => console.log("Selected:", s)}
    />
  );
}
