import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, LayoutList, Calendar as CalendarIcon, 
  BarChart2, Settings, User, Zap, CheckCircle2, Clock, 
  Users, UserPlus
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react"; // Import useAuth
import NewTaskModal from "../../components/specific/NewTaskModal";
import api from "../../services/api";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { orgRole } = useAuth(); // Get Org Role
  
  // State
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  // 👇 PERMISSION CHECK: Admin if Personal Admin OR Org Admin
  const isAdmin = user?.publicMetadata?.role === "admin" || orgRole === "org:admin";

  const fetchData = async () => {
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);
      const memRes = await api.get(`/projects/${id}/members`);
      setMembers(memRes.data);
      const tasksRes = await api.get(`/tasks/project/${id}`);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error fetching project data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    try {
      await api.put(`/projects/${id}/members`, { email: newMemberEmail });
      alert("Member added successfully!");
      setNewMemberEmail("");
      const memRes = await api.get(`/projects/${id}/members`);
      setMembers(memRes.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleTaskCreated = () => {
    fetchData(); 
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading project details...</div>;
  if (!project) return <div className="p-8 text-neutral-400">Project not found</div>;

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/projects")} className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded font-medium">
                {project.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
        
        {/* 👇 HIDE BUTTON IF NOT ADMIN */}
        {isAdmin && (
          <button 
            onClick={() => setIsTaskModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectStat label="Total Tasks" value={tasks.length} icon={Zap} />
        <ProjectStat label="Completed" value={tasks.filter(t => t.status === 'Done').length} icon={CheckCircle2} color="text-green-500" />
        <ProjectStat label="In Progress" value={tasks.filter(t => t.status === 'In Progress').length} icon={Clock} color="text-orange-500" />
        <ProjectStat label="Team Members" value={members.length} icon={User} color="text-blue-500" />
      </div>

      {/* Team Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Users size={18} /> Project Team
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex -space-x-2 overflow-hidden">
            {members.map((mem) => (
              <img 
                key={mem._id || mem.clerkId}
                src={mem.photo} 
                alt={mem.firstName}
                title={`${mem.firstName} ${mem.lastName}`}
                className="inline-block h-10 w-10 rounded-full ring-2 ring-neutral-900 bg-neutral-800 object-cover"
              />
            ))}
            {members.length === 0 && <span className="text-sm text-neutral-500">No members yet</span>}
          </div>

          {isAdmin && (
            <form onSubmit={handleAddMember} className="flex gap-2 ml-auto">
              <input 
                type="email" 
                placeholder="Add member by email..." 
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white w-64 focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <UserPlus size={16} /> Add
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 flex gap-6 text-sm">
        <TabButton active icon={LayoutList} label="Tasks" />
        <TabButton icon={CalendarIcon} label="Calendar" />
        <TabButton icon={BarChart2} label="Analytics" />
        <TabButton icon={Settings} label="Settings" />
      </div>

      {/* Filter & List */}
      <div className="flex flex-wrap gap-3 py-2">
        <FilterDropdown label="All Statuses" />
        <FilterDropdown label="All Types" />
        <FilterDropdown label="All Priorities" />
        <FilterDropdown label="All Assignees" />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1 text-right">Due Date</div>
        </div>

        <div>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task._id} className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors items-center text-sm last:border-0">
                <div className="col-span-5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.type === 'OTHER' ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                  <span className="font-medium text-white">{task.title}</span>
                </div>
                <div className="col-span-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase text-neutral-400 border border-neutral-800 bg-neutral-800/50 px-2 py-0.5 rounded w-fit">
                    {task.type === 'TASK' ? <CheckCircle2 size={12}/> : <LayoutList size={12}/>}
                    {task.type}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${task.priority === 'HIGH' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="col-span-1 text-neutral-300">{task.status}</div>
                <div className="col-span-2 flex items-center gap-2">
                  {(() => {
                    const assignee = members.find(m => m.clerkId === task.assigneeId);
                    return assignee ? (
                      <>
                        <img src={assignee.photo} className="w-6 h-6 rounded-full" alt="Assignee" />
                        <span className="text-neutral-300 truncate">{assignee.firstName}</span>
                      </>
                    ) : (<span className="text-neutral-500 text-xs">Unassigned</span>);
                  })()}
                </div>
                <div className="col-span-1 text-right text-neutral-400 text-xs">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                </div>
              </div>
            ))
          ) : <div className="p-8 text-center text-neutral-500">No tasks created yet.</div>}
        </div>
      </div>

      <NewTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        projectId={id} 
        projectMembers={members} 
        onTaskCreated={handleTaskCreated} 
      />
    </div>
  );
};

const ProjectStat = ({ label, value, icon: Icon, color = "text-white" }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-neutral-400 text-xs mb-1">{label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
    <Icon className={`${color} opacity-80`} size={20} />
  </div>
);

const TabButton = ({ icon: Icon, label, active }) => (
  <button className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${active ? "border-blue-600 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"}`}>
    <Icon size={16} />
    {label}
  </button>
);

const FilterDropdown = ({ label }) => (
  <button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
    {label} <span className="text-neutral-500">▼</span>
  </button>
);

export default ProjectDetails;