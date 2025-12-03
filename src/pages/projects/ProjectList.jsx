import React , {useState , useEffect} from "react";
import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NewProjectModal from "../../components/specific/NewProjectModal";
import api from "../../services/api";

const ProjectList = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // This call now automatically has the Clerk Token attached!
        const response = await api.get("/projects"); 
        setProjects(response.data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-neutral-400 mt-1">Manage and track your projects</p>
        </div>
        <button onClick={()=>setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-600 text-white placeholder-neutral-500"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
          <select className="bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-300 focus:outline-none cursor-pointer">
            <option>All Priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div 
            key={project.id} 
            onClick={() => navigate(`/projects/${project.id}`)}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
              </div>
              {/* Optional More Menu */}
              <button className="text-neutral-500 hover:text-white" onClick={(e) => e.stopPropagation()}>
                <MoreVertical size={18} />
              </button>
            </div>

            <p className="text-neutral-400 text-sm mb-6 line-clamp-2">
              {project.desc}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-medium">
                {project.status}
              </span>
              <span className={`text-xs font-bold uppercase ${project.priority === 'HIGH' ? 'text-blue-400' : 'text-neutral-400'}`}>
                {project.priority} Priority
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ProjectList;