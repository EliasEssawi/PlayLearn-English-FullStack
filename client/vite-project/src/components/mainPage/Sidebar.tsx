import { MenuItem, SidebarAction } from "../../Types/Section";

interface SidebarProps {
  menuItems: MenuItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  title: string;
  secondaryMenu?: MenuItem[];
  bottomAction?: SidebarAction;
  darkMode: boolean;

  // ✅ NEW (for mobile drawer)
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({
  menuItems,
  title,
  secondaryMenu,
  bottomAction,
  onSelect,
  activeSection,
  darkMode,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const handleSelect = (name: string) => {
    onSelect(name);
    onMobileClose?.(); // ✅ close drawer after choosing
  };

  const content = (
    <aside
      className={`
        w-72 h-full flex flex-col shrink-0
        ${darkMode ? "bg-black text-white" : "bg-[#1A7822] text-white"}
      `}
    >
      {/* TITLE */}
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          {title} <span>🚀</span>
        </h2>
      </div>

      {/* MAIN MENU */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeSection === item.name;

          return (
            <button
              key={item.name}
              onClick={() => handleSelect(item.name)}
              className={`
                flex w-full items-center gap-4 px-4 py-3 rounded-xl transition
                ${
                  isActive
                    ? darkMode
                      ? "bg-white text-black font-bold"
                      : "bg-white text-[#1A7822] font-bold"
                    : darkMode
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-white/20 text-white"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}

        <div className="my-4 border-t border-white/20" />

        {/* SECONDARY MENU */}
        {secondaryMenu?.map((item) => {
          const isActive = activeSection === item.name;

          return (
            <button
              key={item.name}
              onClick={() => handleSelect(item.name)}
              className={`
                flex w-full items-center gap-4 px-4 py-3 rounded-xl transition
                ${
                  isActive
                    ? darkMode
                      ? "bg-white text-black font-bold"
                      : "bg-white text-[#1A7822] font-bold"
                    : darkMode
                    ? "hover:bg-white/10 text-white"
                    : "hover:bg-white/20 text-white"
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* BOTTOM ACTION */}
      {bottomAction && (
        <div
          className={`
            p-6 border-t
            ${darkMode ? "border-white/20 bg-black" : "border-white/10 bg-black/10"}
          `}
        >
          <button
            onClick={() => handleSelect(bottomAction.section)}
            className="hover:scale-105 w-full flex justify-center items-center gap-2 bg-white-400 text-white-900 font-bold py-3 rounded-xl hover:bg-green-300 transition"
          >
            <span className="text-xl">{bottomAction.icon}</span>
            {bottomAction.label}
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <>
      {/* ✅ Desktop sidebar only */}
      <div className="hidden md:block h-full">{content}</div>

      {/* ✅ Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* backdrop */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-72 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
