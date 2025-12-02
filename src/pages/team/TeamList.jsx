import React, { useState } from "react";
import { Search, UserPlus, Users, Activity, Shield } from "lucide-react";
import InviteMemberModal from "../../components/specific/InviteMemberModal";

const TeamList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Data matching your screenshot
  const members = [
    { id: 1, name: "Oliver Watts", email: "oliverwatts@example.com", role: "ADMIN", color: "bg-green-600" },
    { id: 2, name: "Alex Smith", email: "alexsmith@example.com", role: "ADMIN", color: "bg-blue-600" },
    { id: 3, name: "John Warrel", email: "johnwarrel@example.com", role: "ADMIN", color: "bg-red-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-neutral-400 mt-1">Manage team members and their contributions</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TeamStat label="Total Members" value="3" icon={Users} color="text-blue-500" bg="bg-blue-500/10" />
        <TeamStat label="Active Projects" value="2" icon={Activity} color="text-green-500" bg="bg-green-500/10" />
        <TeamStat label="Total Tasks" value="6" icon={Shield} color="text-purple-500" bg="bg-purple-500/10" />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
        <input
          type="text"
          placeholder="Search team members..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-600 text-white placeholder-neutral-500"
        />
      </div>

      {/* Team Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
          <div className="col-span-4">Name</div>
          <div className="col-span-5">Email</div>
          <div className="col-span-3 text-right">Role</div>
        </div>

        {/* Table Body */}
        <div>
          {members.map((member) => (
            <div 
              key={member.id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors items-center text-sm last:border-0"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${member.color}`}>
                  {member.name.charAt(0)}
                </div>
                <span className="font-medium text-white">{member.name}</span>
              </div>
              <div className="col-span-5 text-neutral-400">
                {member.email}
              </div>
              <div className="col-span-3 text-right">
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded font-bold">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Render Modal */}
      <InviteMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

// Reusable Stat Card Component for Team Page
const TeamStat = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex justify-between items-center">
    <div>
      <p className="text-neutral-400 text-sm">{label}</p>
      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={color} size={24} />
    </div>
  </div>
);

export default TeamList;