import { ChevronFirst, ChevronLast, MoreVertical } from 'lucide-react';
import { ReactNode, useContext, useState, createContext } from 'react';
import logo_icon from '../assets/logo.png';
import { useAuth } from '@/components/AuthContext'; // Import useAuth


// Interface for SidebarProps
interface SidebarProps {
  children?: ReactNode;
}

// Initialize SidebarContext with a default value
const SidebarContext = createContext({ expanded: true });

export function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
   const { user } = useAuth(); // Get user details from AuthContext
  

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src={logo_icon}
            className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}
            alt=""
          />
          <button
            onClick={() => setExpanded(curr => !curr)}
            className="p-1.5 rounded-lg bg-gray-500 hover:bg-gray-400"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* Provide expanded state through the context */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>

        {/* User avatar */}
        <div className="border-t flex p-3">
          <img
            src="https://ui-avatars.com/api/?background=0D8ABC&color=fff"
            alt=""
            className="w-10 h-10 rounded-md"
          />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${
              expanded ? "w-52 ml-3" : "w-0"
            }`}
          >
            <div className="leading-4">
              <h4 className="font-semibold text-gray-500">{user?.fullname || "John Doe"}</h4>
              <span className="text-xs text-gray-600">{user?.email || "johndoe@email.com"}</span>
            </div>
            <MoreVertical size={20} />
          </div>
        </div>
      </nav>
    </aside>
  );
}

// Interface for SidebarItemProps
interface SidebarItemProps {
  icon?: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, text, active, alert, onClick }: SidebarItemProps) {
  // Consume expanded state from SidebarContext
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      onClick={onClick} // Add onClick handler to the list item
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active ? 'bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800' : 'hover:bg-indigo-400 text-gray-600'}
      `}
    >
      {icon}
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
            absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-0 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
          `}
        >
          {text}
        </div>
      )}
    </li>
  );
}
