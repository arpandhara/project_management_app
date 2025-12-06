import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Save, Trash2, ArrowLeft, ShieldAlert } from "lucide-react";
import api from "../../services/api";

const ProjectSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { orgRole } = useAuth();

  const [project, setProject] = useState({ title: "", description: "" });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.publicMetadata?.role === "admin" || orgRole === "org:admin";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, memRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/members`)
        ]);
        setProject(projRes.data);
        setMembers(memRes.data);
      } catch (error) {
        navigate(`/projects/${id}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}/settings`, {
        title: project.title,
        description: project.description
      });
      alert("Settings updated!");
    } catch (error) {
      alert("Failed to update settings");
    }
  };

  const handleRemoveMember = async (userId) => {
    if(!window.confirm("Remove this member?")) return;
    try {
      await api.delete(`/projects/${id}/members`, { data: { userId } });
      setMembers(prev => prev.filter(m => m.clerkId !== userId));
    } catch (error) {
      alert("Failed to remove member.");
    }
  };

  const handleDeleteProject = async () => {
    if(!window.confirm("CRITICAL: Delete this project?")) return;
    const confirmName = prompt(`Type "${project.title}" to confirm:`);
    if(confirmName !== project.title) return alert("Name did not match.");

    try {
      await api.delete(`/projects/${id}`);
      navigate("/projects");
    } catch (error) {
      alert("Failed to delete project.");
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-red-400">Access Denied</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/projects/${id}`)} className="text-neutral-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Project Settings</h1>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold border-b border-neutral-800 pb-2 mb-4">General</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Name</label>
            <input type="text" value={project.title} onChange={(e) => setProject({...project, title: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Description</label>
            <textarea rows={3} value={project.description} onChange={(e) => setProject({...project, description: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 ml-auto"><Save size={16} /> Save</button>
        </form>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold border-b border-neutral-800 pb-2 mb-4">Members</h2>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member._id} className="flex justify-between items-center p-3 bg-neutral-950 rounded-lg border border-neutral-800">
              <div className="flex items-center gap-3">
                <img src={member.photo} className="w-8 h-8 rounded-full" alt="" />
                <div>
                  <p className="text-sm font-medium text-white">{member.firstName} {member.lastName}</p>
                  <p className="text-xs text-neutral-500">{member.email}</p>
                </div>
              </div>
              {member.clerkId !== user.id && (
                <button onClick={() => handleRemoveMember(member.clerkId)} className="text-neutral-500 hover:text-red-500 p-2"><Trash2 size={16} /></button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2"><ShieldAlert size={20} /> Danger Zone</h2>
          <p className="text-xs text-neutral-400 mt-1">Delete this project permanently.</p>
        </div>
        <button onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Trash2 size={16} /> Delete</button>
      </div>
    </div>
  );
};

export default ProjectSettings;