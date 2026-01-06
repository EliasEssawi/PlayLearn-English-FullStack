import { MenuItem, SidebarAction } from "../../Types/Section";

interface SidebarProps {
  menuItems: MenuItem[];
  activeSection: string;
  onSelect: (section: string) => void;
  title: string;
  secondaryMenu?: MenuItem[];
  bottomAction?: SidebarAction;
}


export default function Sidebar({ menuItems, title, secondaryMenu, bottomAction, onSelect, activeSection}: SidebarProps) {
  return (
    <aside className="w-72 bg-[#1A7822] text-white flex flex-col shrink-0">
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          {title} <span>🚀</span>
        </h2>       
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onSelect(item.name)}
            className={`flex w-full items-center gap-4 px-4 py-3 rounded-xl transition
              ${
                activeSection === item.name
                  ? "bg-white text-[#1A7822] font-bold"
                  : "hover:bg-white/20"
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}

        <div className="my-4 border-t border-white/20" />
        
        
        {secondaryMenu && (
          secondaryMenu.map((item) => (
            <button
              key={item.name}
              onClick={() => onSelect(item.name)}
              className={`flex w-full items-center gap-4 px-4 py-3 rounded-xl transition
                ${
                  activeSection === item.name
                    ? "bg-white text-[#1A7822] font-bold"
                    : "hover:bg-white/20 text-white"
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </button>
        )))}

      </nav>
       {bottomAction && (
        <div className="p-6 bg-black/10 border-t border-white/10">
          <button
            onClick={() => onSelect(bottomAction.section)}
            className="hover:scale-105 w-full flex justify-center items-center gap-2 bg-white-400 text-white-900 font-bold py-3 rounded-xl hover:bg-green-300 transition"
          >
            <span className="text-xl">{bottomAction.icon}</span>
            {bottomAction.label}
          </button>
        </div>
      )}
    </aside>
  );
}
