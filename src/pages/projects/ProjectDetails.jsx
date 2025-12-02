import React , {useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  LayoutList, 
  Calendar as CalendarIcon, 
  BarChart2, 
  Settings,
  User,
  Zap,
  CheckCircle2,
  Clock
} from "lucide-react";
import NewTaskModal from "../../components/specific/NewTaskModal";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Mock Tasks Data
  const tasks = [
    { id: 1, title: "Security Audit", type: "OTHER", priority: "MEDIUM", status: "To Do", assignee: "Oliver Watts", dueDate: "10 December" },
    { id: 2, title: "Set Up EKS Cluster", type: "TASK", priority: "HIGH", status: "To Do", assignee: "Alex Smith", dueDate: "15 December" },
    { id: 3, title: "Implement CI/CD with GitHub Actions", type: "TASK", priority: "MEDIUM", status: "To Do", assignee: "John Warrel", dueDate: "31 October" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/projects")} className="text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Kubernetes Migration</h1>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded font-medium">ACTIVE</span>
            </div>
          </div>
        </div>
        <button onClick={()=>setIsTaskModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Project Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProjectStat label="Total Tasks" value="3" icon={Zap} />
        <ProjectStat label="Completed" value="0" icon={CheckCircle2} color="text-green-500" />
        <ProjectStat label="In Progress" value="3" icon={Clock} color="text-orange-500" />
        <ProjectStat label="Team Members" value="3" icon={User} color="text-blue-500" />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-neutral-800 flex gap-6 text-sm">
        <TabButton active icon={LayoutList} label="Tasks" />
        <TabButton icon={CalendarIcon} label="Calendar" />
        <TabButton icon={BarChart2} label="Analytics" />
        <TabButton icon={Settings} label="Settings" />
      </div>

      {/* Task Filters */}
      <div className="flex flex-wrap gap-3 py-2">
        <FilterDropdown label="All Statuses" />
        <FilterDropdown label="All Types" />
        <FilterDropdown label="All Priorities" />
        <FilterDropdown label="All Assignees" />
      </div>

      {/* Tasks Table/List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
          <div className="col-span-5">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1 text-right">Due Date</div>
        </div>

        {/* Table Body */}
        <div>
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="grid grid-cols-12 gap-4 p-4 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors items-center text-sm last:border-0"
            >
              {/* Title */}
              <div className="col-span-5 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${task.type === 'OTHER' ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                <span className="font-medium text-white">{task.title}</span>
              </div>

              {/* Type */}
              <div className="col-span-2">
                <span className="flex items-center gap-1.5 text-xs font-medium uppercase text-orange-400 border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 rounded w-fit">
                  {task.type === 'TASK' ? <CheckCircle2 size={12}/> : <LayoutList size={12}/>}
                  {task.type}
                </span>
              </div>

              {/* Priority */}
              <div className="col-span-1">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  task.priority === 'HIGH' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {task.priority}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-1 text-neutral-300">
                {task.status}
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  task.assignee.startsWith('O') ? 'bg-green-600' : 
                  task.assignee.startsWith('A') ? 'bg-blue-600' : 'bg-red-600'
                }`}>
                  {task.assignee.charAt(0)}
                </div>
                <span className="text-neutral-300">{task.assignee}</span>
              </div>

              {/* Due Date */}
              <div className="col-span-1 text-right text-neutral-400 text-xs">
                {task.dueDate}
              </div>
            </div>
          ))}
        </div>
      </div>
      <NewTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  );
};

// Reusable Components for this page
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
  <button className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
    active ? "border-blue-600 text-white" : "border-transparent text-neutral-400 hover:text-neutral-200"
  }`}>
    <Icon size={16} />
    {label}
  </button>
);

const FilterDropdown = ({ label }) => (
  <button className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
    {label}
    <span className="text-neutral-500">▼</span>
  </button>
);

export default ProjectDetails;