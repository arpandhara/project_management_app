import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Link as LinkIcon, 
  Github, FileText, AlertCircle, X, Trash2, 
  Users, Check, ChevronDown , UserPlus
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../../services/api";

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { orgRole } = useAuth();

  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]); // Store member details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Link Input State
  const [newLink, setNewLink] = useState({ name: "", url: "", type: "DOC" });
  
  // Assignee Dropdown State
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const assigneeRef = useRef(null);
  const inviteRef = useRef(null);

  const isAdmin = user?.publicMetadata?.role === "admin" || orgRole === "org:admin";
  const isAssignee = task?.assignees?.includes(user?.id);

  // Click outside to close assignee dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
        setIsAssigneeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Task
        const taskRes = await api.get(`/tasks/${taskId}`);
        setTask(taskRes.data);

        if (taskRes.data.projectId) {
          const pid = taskRes.data.projectId._id || taskRes.data.projectId;
          const memRes = await api.get(`/projects/${pid}/members`);
          setProjectMembers(memRes.data);
        }

      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId]);

  const handleUpdate = async (field, value) => {
    try {
      // Optimistic update
      const updatedTask = { ...task, [field]: value };
      setTask(updatedTask);
      await api.put(`/tasks/${taskId}`, { [field]: value });
    } catch (err) {
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task? This cannot be undone.")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      navigate(-1); // Go back to project board
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const toggleAssignee = async (memberId) => {
    let newAssignees = [...(task.assignees || [])];
    if (newAssignees.includes(memberId)) {
      newAssignees = newAssignees.filter(id => id !== memberId);
    } else {
      newAssignees.push(memberId);
    }
    await handleUpdate("assignees", newAssignees);
  };

  const handleInvite = async (memberId) => {
    try {
      await api.post(`/tasks/${taskId}/invite`, { targetUserId: memberId });
      alert("Invitation sent!");
      setIsInviteOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send invite");
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.name || !newLink.url) return;

    const updatedAttachments = [...(task.attachments || []), newLink];
    await handleUpdate("attachments", updatedAttachments);
    setNewLink({ name: "", url: "", type: "DOC" });
  };

  const removeLink = async (index) => {
    if (!window.confirm("Remove this link?")) return;
    const updatedAttachments = task.attachments.filter((_, i) => i !== index);
    await handleUpdate("attachments", updatedAttachments);
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading task...</div>;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-4">
        <AlertCircle size={48} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
      <p className="text-neutral-400 max-w-md">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-6 text-blue-400 hover:text-blue-300">Go Back</button>
    </div>
  );

  const unassignedMembers = projectMembers.filter(
    m => !task.assignees.includes(m.clerkId)
  );

  return (
    <div className="space-y-6 h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-neutral-400 hover:text-white flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        
        {/* Delete Button (Admin Only) */}
        {isAdmin && (
          <button 
            onClick={handleDeleteTask}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Delete Task
          </button>
        )}
      </div>

      {/* Header Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex-1 space-y-6 w-full">
            
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 uppercase font-bold">Task Title</label>
              {isAdmin ? (
                <input 
                  type="text" 
                  value={task.title}
                  onChange={(e) => setTask({...task, title: e.target.value})}
                  onBlur={(e) => handleUpdate("title", e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none border-b border-neutral-800 focus:border-blue-600 transition-colors pb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{task.title}</h1>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 uppercase font-bold">Description</label>
              {isAdmin ? (
                <textarea 
                  value={task.description}
                  onChange={(e) => setTask({...task, description: e.target.value})}
                  onBlur={(e) => handleUpdate("description", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-300 focus:outline-none focus:border-blue-600 min-h-[100px] resize-y"
                />
              ) : (
                <p className="text-neutral-300 bg-neutral-950 p-4 rounded-lg border border-neutral-800 whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              )}
            </div>
          </div>

          {/* Right Sidebar Controls */}
          <div className="w-full md:w-80 space-y-6">
            
            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold">Status</label>
              <select 
                value={task.status}
                onChange={(e) => handleUpdate("status", e.target.value)}
                className={`w-full p-2.5 rounded-lg border font-medium outline-none appearance-none cursor-pointer ${
                  task.status === 'Done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                  task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                  'bg-neutral-800 text-neutral-300 border-neutral-700'
                }`}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Assignees (Updated Logic) */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <Users size={14} /> Assignees
              </label>
              
              <div className="relative" ref={assigneeRef}>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                  className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-left flex justify-between items-center transition-colors ${isAdmin ? "hover:border-neutral-700 cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    {task.assignees && task.assignees.length > 0 ? (
                      task.assignees.map((id) => {
                        const mem = projectMembers.find(m => m.clerkId === id);
                        if (!mem) return null;
                        return (
                          <img 
                            key={id} 
                            src={mem.photo} 
                            title={`${mem.firstName} ${mem.lastName}`}
                            className="w-6 h-6 rounded-full ring-2 ring-neutral-900" 
                          />
                        )
                      })
                    ) : (
                      <span className="text-sm text-neutral-500">Unassigned</span>
                    )}
                  </div>
                  {isAdmin && <ChevronDown size={14} className="text-neutral-500" />}
                </button>

                {/* Dropdown for Admins */}
                {isAssigneeOpen && isAdmin && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                    {projectMembers.map((member) => (
                      <div
                        key={member.clerkId}
                        onClick={() => toggleAssignee(member.clerkId)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.assignees.includes(member.clerkId) 
                            ? "bg-blue-600 border-blue-600" 
                            : "border-neutral-600"
                        }`}>
                          {task.assignees.includes(member.clerkId) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <img src={member.photo} className="w-6 h-6 rounded-full" />
                          <span className="text-sm text-neutral-300">{member.firstName} {member.lastName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {isAssignee && (
              <div className="pt-4 border-t border-neutral-800">
                <label className="text-xs text-neutral-500 uppercase font-bold mb-2 block">Need Help?</label>
                <div className="relative" ref={inviteRef}>
                  <button 
                    onClick={() => setIsInviteOpen(!isInviteOpen)}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
                  >
                    <UserPlus size={16} /> Invite Member
                  </button>

                  {isInviteOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                      {unassignedMembers.length > 0 ? (
                        unassignedMembers.map(m => (
                          <div 
                            key={m.clerkId} 
                            onClick={() => handleInvite(m.clerkId)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                             <img src={m.photo} className="w-6 h-6 rounded-full" />
                             <span className="text-sm text-neutral-300">{m.firstName} {m.lastName}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-neutral-500">Everyone is already assigned!</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Only Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-neutral-500 font-bold">Due Date</label>
                {isAdmin ? (
                  <input 
                    type="date" 
                    value={task.dueDate ? task.dueDate.split('T')[0] : ""}
                    onChange={(e) => handleUpdate("dueDate", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                    <Calendar size={14} />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-500 font-bold">Priority</label>
                {isAdmin ? (
                  <select 
                    value={task.priority}
                    onChange={(e) => handleUpdate("priority", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                ) : (
                  <div className={`text-sm px-2 py-2 rounded-lg border border-transparent font-medium text-center ${
                    task.priority === 'HIGH' ? 'text-orange-400 bg-orange-400/10' : 'text-blue-400 bg-blue-400/10'
                  }`}>
                    {task.priority}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <LinkIcon size={20} /> Attachments & Links
        </h2>

        <div className="space-y-3 mb-6">
          {task.attachments && task.attachments.length > 0 ? (
            task.attachments.map((link, idx) => (
              <div key={idx} className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  {link.type === 'GITHUB' ? <Github size={20} className="text-white" /> : <FileText size={20} className="text-blue-400" />}
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate text-sm font-medium">
                    {link.name}
                  </a>
                </div>
                <button onClick={() => removeLink(idx)} className="text-neutral-500 hover:text-red-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-sm italic">No attachments yet.</p>
          )}
        </div>

        <div className="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
          <h3 className="text-sm font-medium text-white mb-3">Add New Resource</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              placeholder="Display Name" 
              value={newLink.name}
              onChange={(e) => setNewLink({...newLink, name: e.target.value})}
              className="col-span-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
            />
            <input 
              placeholder="URL (https://...)" 
              value={newLink.url}
              onChange={(e) => setNewLink({...newLink, url: e.target.value})}
              className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
            />
            <div className="flex gap-2">
              <select 
                value={newLink.type}
                onChange={(e) => setNewLink({...newLink, type: e.target.value})}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-2 text-sm text-white focus:outline-none"
              >
                <option value="DOC">Doc</option>
                <option value="GITHUB">GitHub</option>
                <option value="LINK">Link</option>
              </select>
              <button 
                onClick={handleAddLink}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg text-sm font-medium transition-colors flex-1"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;