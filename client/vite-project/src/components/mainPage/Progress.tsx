import { useEffect, useState } from "react";
import axios from "axios";
import ProgressCard from "./ProgressCard";
import RecentAchievement from "./RecentAchievement";

interface ProgreesProps {
  onSelectSection: (section: string) => void;
  email: string;
  profileName: string;
}

type Card = { title: string; level: number; progress: number; icon: string; url: string };

export default function Progrees({ onSelectSection, email, profileName }: ProgreesProps) {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

    axios
      .get(`${API_BASE}/profiles/${encodeURIComponent(email)}/${encodeURIComponent(profileName)}/progress`, {
        withCredentials: true,
      })
      .then((res) => setCards(res.data.cards || []))
      .catch((err) => console.error(err));
  }, [email, profileName]);

  return (
    <div>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {cards.map((card) => (
          <ProgressCard
            key={`${card.title}-${card.level}`}
            {...card}
            onClick={() => onSelectSection(`${card.title}|${card.level}`)}
          />
        ))}
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>

        <RecentAchievement
          icon="🏆"
          title="7 Day Streak!"
          description="You practiced every day this week."
          color="blue-100"
        />
        <div className="mt-4">
          <RecentAchievement icon="🔥" title="Word Master" description="You learned 50 new words." color="blue-100" />
        </div>
      </section>
    </div>
  );
}
