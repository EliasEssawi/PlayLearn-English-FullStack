interface HeaderProps {
    title: String;  // Main page title
    subtitle: string; // Secondary descriptive text
    points: number;  // User's current points
    imgUrl: string; // URL of the user/profile avatar image
}

// Header component displaying page title, subtitle, user points, and avatar
export default function Header({ title, subtitle, points, imgUrl }: HeaderProps) {
  return (
    <header className="flex justify-between items-center border-b pb-6">
      {/* Title and subtitle section */}
      <div>
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>

      {/* Points badge and profile image */}
      <div className="flex items-center gap-6">
        <div className="bg-yellow-50 px-5 py-2 rounded-full border flex gap-2">
          <span className="font-bold text-yellow-600">⭐ {points}</span>
          <span className="text-xs font-bold text-yellow-600">POINTS</span>
        </div>
        <img
          src={imgUrl}
          className="w-14 h-14 rounded-full border-2 border-green-600"
        />
      </div>
    </header>
  );
}
