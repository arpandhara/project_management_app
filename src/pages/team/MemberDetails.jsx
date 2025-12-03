import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrganization, useUser } from "@clerk/clerk-react";
import { Shield, Trash2, Briefcase, CheckSquare, AlertTriangle } from "lucide-react";
import api from "../../services/api";

const MemberDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // 👇 FIX: Configure hook to actually fetch memberships
  const { organization, memberships, isLoaded } = useOrganization({
    memberships: {
      pageSize: 50,
      keepPreviousData: true,
    },
  });
  
  const { user: currentUser } = useUser();
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Find the specific member from Clerk list
  const member = memberships?.data?.find(m => m.publicUserData.userId === userId);
  const isMe = userId === currentUser?.id;
  
  // Check if *I* am an admin
  const iAmAdmin = memberships?.data?.find(m => m.publicUserData.userId === currentUser?.id)?.role === "org:admin";
  const targetIsAdmin = member?.role === "org:admin";

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if we have valid data
      if (!userId || !organization || !member) return;
      
      try {
        // Fetch Projects this user is in
        const resProjects = await api.get("/projects", { params: { orgId: organization.id, userId } });
        setProjects(resProjects.data);

        // Fetch Tasks assigned to this user
        const resTasks = await api.get(`/tasks/user/${userId}`);
        setTasks(resTasks.data);

        // Fetch pending admin requests (only if I am admin)
        if (iAmAdmin) {
          const resRequests = await api.get("/admin-actions/pending");
          setPendingRequests(resRequests.data);
        }
      } catch (err) {
        console.error("Data load failed", err);
      }
    };
    
    if (isLoaded) {
        fetchData();
    }
  }, [userId, organization, iAmAdmin, isLoaded, member]);

  // Actions
  const handleKick = async () => {
    if(!window.confirm("Remove this user from organization?")) return;
    try {
      await member.destroy();
      alert("User removed.");
      navigate("/team");
    } catch(e) { alert("Failed to remove user"); }
  };

  const handleDemoteRequest = async () => {
    try {
      await api.post("/admin-actions/demote/request", { targetUserId: userId });
      alert("Demotion requested! Waiting for another admin to approve.");
      window.location.reload();
    } catch(e) { alert(e.response?.data?.message || "Failed to request"); }
  };

  const handleApproveDemotion = async (requestId) => {
    try {
      await api.post(`/admin-actions/demote/approve/${requestId}`);
      alert("Demotion approved.");
      window.location.reload();
    } catch(e) { alert(e.response?.data?.message || "Failed to approve"); }
  };

  // 👇 FIX: Better Loading State Handling
  if (!isLoaded) return <div className="p-8 text-neutral-400">Loading member data...</div>;
  if (!member) return <div className="p-8 text-red-400">Member not found in this organization.</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={member.publicUserData.imageUrl} className="w-16 h-16 rounded-full bg-neutral-800" alt="Profile" />
          <div>
            <h1 className="text-2xl font-bold text-white">{member.publicUserData.firstName} {member.publicUserData.lastName}</h1>
            <p className="text-neutral-400">{member.publicUserData.identifier}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded font-bold uppercase ${targetIsAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
              {targetIsAdmin ? "Admin" : "Member"}
            </span>
          </div>
        </div>

        {iAmAdmin && !isMe && (
          <div className="flex flex-col gap-2">
            {targetIsAdmin ? (
              <button onClick={handleDemoteRequest} className="bg-orange-600/10 text-orange-500 hover:bg-orange-600/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Request Demotion
              </button>
            ) : (
              <button onClick={handleKick} className="bg-red-600/10 text-red-500 hover:bg-red-600/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Trash2 size={16} /> Remove from Org
              </button>
            )}
          </div>
        )}
      </div>

      {/* ⚠️ Pending Requests Alert (For Admins) */}
      {iAmAdmin && pendingRequests.some(r => r.targetUserId === userId) && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-blue-500" />
            <div>
              <h3 className="text-white font-medium">Pending Demotion Request</h3>
              <p className="text-sm text-neutral-400">Another admin has requested to demote this user.</p>
            </div>
          </div>
          {/* Only show Approve if I am NOT the requester */}
          {pendingRequests.find(r => r.targetUserId === userId).requesterUserId !== currentUser.id && (
             <button 
               onClick={() => handleApproveDemotion(pendingRequests.find(r => r.targetUserId === userId)._id)}
               className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
             >
               Approve Demotion
             </button>
          )}
        </div>
      )}

      {/* Projects & Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Briefcase size={18} /> Involved Projects</h2>
          {projects.length > 0 ? (
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p._id} className="p-3 bg-neutral-950 rounded border border-neutral-800 text-sm hover:border-neutral-700 cursor-pointer" onClick={() => navigate(`/projects/${p._id}`)}>
                  {p.title}
                </div>
              ))}
            </div>
          ) : <p className="text-neutral-500 text-sm">No projects yet.</p>}
        </div>

        {/* Tasks */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckSquare size={18} /> Assigned Tasks</h2>
          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t._id} className="p-3 bg-neutral-950 rounded border border-neutral-800 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white">{t.title}</span>
                    <span className="text-xs bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">{t.status}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">in {t.projectId?.title || "Unknown Project"}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-neutral-500 text-sm">No active tasks.</p>}
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;