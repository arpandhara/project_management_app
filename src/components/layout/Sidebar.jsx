import React from "react";
import { NavLink } from "react-router-dom";
import {useClerk} from "@clerk/clerk-react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  CheckSquare,
  Plus,
  ChevronDown,
  LogOut
} from "lucide-react";
function Sidebar() {

  const {signOut} = useClerk();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen left-0 top-0">
      {/* Company Name / WorkSpace Section */}
      <div className="w-full p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-200 w-10 h-10 rounded-md overflow-hidden">
            <img
              className="h-full w-full object-cover object-center"
              src="https://i.pinimg.com/1200x/e5/5e/8a/e55e8af0607d1e57122667ab40a1dd1a.jpg"
              alt=""
            />
          </div>
          <div className="w-[70%]">
            <h2 className="text-sm font-bold">Netfilx</h2>
            <p className="text-xs text-neutral-500">2 workspaces</p>
          </div>
          <div>
            <ChevronDown className="w-5 h-5 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((items) => (
          <NavLink
            key={items.path}
            to={items.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white font-medium"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              }`
            }
          >
            <items.icon size={18}/>
            {items.label}
          </NavLink>
        ))}

        {/* My Task Section */}
        <div className="pt-6">
          <div className="px-3 mb-2 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <CheckSquare size={18} />
              <span className="text-sm font-medium">My Tasks</span>
            </div>
            <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded-full">
              3
            </span>
          </div>
        </div>
      </nav>

      <div className="px-4 pb-2">
         <button 
            onClick={() => signOut()}
            className="w-full flex items-centergap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-neutral-800/50 hover:text-red-300 transition-colors cursor-pointer"
         >
            <LogOut size={18} className="mr-3" />
            Logout
         </button>
      </div>

      <div className="px-4 py-6 border-t border-neutral-800">
        <div className="flex items-center justify-between mb-3 px-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Projects
          </span>
          <Plus size={14} className="text-neutral-500 cursor-pointer hover:text-white" />
        </div>
        <div className="space-y-1">
          {["Kubernetes Migration", "Auto Regression Suite"].map((project, i) => (
            <div key={i} className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white cursor-pointer rounded hover:bg-neutral-800/50">
              <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
              <span className="truncate">{project}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
