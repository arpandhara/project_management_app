import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useClerk, useAuth, OrganizationSwitcher , useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  CheckSquare,
  Plus,
  ChevronDown,
  LogOut,
  Mail
} from "lucide-react";
import api from "../../services/api";

function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { orgId } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const fetchSidebarProjects = async () => {
    try {
      const response = await api.get("/projects", {
        params: { orgId: orgId || "" } 
      });
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      }else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Sidebar project fetch error:", error);
    }
  };

  useEffect(() => {
    // 1. Fetch on initial load
    fetchSidebarProjects();

    // 2. Listen for the 'projectUpdate' signal
    window.addEventListener("projectUpdate", fetchSidebarProjects);

    // 3. Cleanup listener when component unmounts
    return () => {
      window.removeEventListener("projectUpdate", fetchSidebarProjects);
    };
  }, [orgId]);

  const inviteCount = user?.emailAddresses?.reduce((acc, email) => {
    return acc + (email.invitations?.length || 0);
  }, 0) || 0;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    // Conditionally add Team item
    ...(orgId ? [{ icon: Users, label: "Team", path: "/team" }] : []),
    { icon: Mail, label: "Invitations", path: "/invitations", badge: inviteCount },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];
  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen left-0 top-0">
      {/* Company Name / WorkSpace Section */}
      <div className="w-full p-4 border-b border-neutral-800 flex justify-center">
        <OrganizationSwitcher
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full flex items-center justify-between p-2 rounded-md hover:bg-neutral-800 transition-colors border border-neutral-800 bg-neutral-900",
              organizationPreviewTextContainer: "ml-2 text-white",
              organizationPreviewText: "font-medium text-sm text-white",
              organizationSwitcherTriggerIcon: "text-neutral-400",
              organizationSwitcherPopoverCard: "bg-neutral-900 border border-neutral-800",
              organizationSwitcherPopoverActionButton: "text-white hover:bg-neutral-800 hover:text-white", // "Manage organization" text
              organizationSwitcherPopoverActionButtonIcon: "text-white", // "Manage organization" icon
              userPreviewTextContainer: "ml-2 text-white",
              userPreviewText: "font-medium text-sm text-white",
              userPreviewSecondaryText: "text-neutral-400",
            },
            variables: {
              colorText: "white", // Forces internal text to white
              colorTextSecondary: "#a3a3a3", // Muted text color
              colorBackground: "#171717", // Dropdown background
              colorInputBackground: "#171717",
              colorInputText: "white"
            }
          }}
        />
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
            <items.icon size={18} />
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
          {/* Clicking Plus takes you to the Projects page where you can create one */}
          <Plus
            size={14}
            className="text-neutral-500 cursor-pointer hover:text-white transition-colors"
            onClick={() => navigate("/projects")}
          />
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[200px] scrollbar-hide">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project._id || project.id}
                onClick={() =>
                  navigate(`/projects/${project._id || project.id}`)
                }
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-400 hover:text-white cursor-pointer rounded hover:bg-neutral-800/50 transition-colors group"
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    project.status === "ACTIVE"
                      ? "bg-green-500"
                      : "bg-neutral-600"
                  }`}
                ></span>
                <span className="truncate">{project.title}</span>
              </div>
            ))
          ) : (
            <div className="px-2 text-xs text-neutral-600 italic">
              No projects found
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
