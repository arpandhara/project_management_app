import React, { useState, useEffect } from "react";
import { Folder, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Import API helper
import { useAuth } from "@clerk/clerk-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orgId } = useAuth();

  // Fetch Projects on Mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/projects", {
          params: { orgId: orgId || "" },
        });
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [orgId]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, User</h1>
          <p className="text-neutral-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-neutral-700"
        >
          My Profile
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Projects"
          value={loading ? "-" : projects.length} // Dynamic Count
          sub="projects in Cloud Ops"
          icon={Folder}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          label="Completed"
          value="0"
          sub="of total projects"
          icon={CheckCircle}
          color="bg-green-500/10 text-green-500"
        />
        <StatCard
          label="My Tasks"
          value="3"
          sub="assigned to me"
          icon={Clock}
          color="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          label="Overdue"
          value="0"
          sub="needs attention"
          icon={AlertTriangle}
          color="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Project Overview (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold">Project Overview</h2>
            <button
              onClick={() => navigate("/projects")}
              className="text-xs text-neutral-400 hover:text-white"
            >
              View all →
            </button>
          </div>

          {/* DYNAMIC PROJECT LIST */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-neutral-500 text-sm">
                Loading projects...
              </div>
            ) : projects.length > 0 ? (
              projects.slice(0, 3).map(
                (
                  project // Show only first 3
                ) => (
                  <div
                    key={project._id || project.id}
                    onClick={() =>
                      navigate(`/projects/${project._id || project.id}`)
                    }
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-medium">
                        {project.status || "ACTIVE"}
                      </span>
                    </div>

                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Updated Meta Section */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 mt-4">
                      <div className="flex items-center gap-3">
                        {/* Priority */}
                        <span
                          className={`font-bold ${
                            project.priority === "HIGH"
                              ? "text-orange-400"
                              : "text-neutral-400"
                          }`}
                        >
                          {project.priority || "MEDIUM"}
                        </span>

                        {/* Date */}
                        <span>
                          • Created{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-3">
                      <div className="bg-blue-500 h-1.5 rounded-full w-[25%]"></div>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500">
                No projects yet. Create one to get started!
              </div>
            )}
          </div>
        </div>

        {/* Right: My Tasks & Overdue (Takes up 1 col) */}
        <div className="space-y-6">
          {/* My Tasks Widget */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">My Tasks</h3>
              <span className="bg-green-500/20 text-green-400 text-xs px-1.5 py-0.5 rounded">
                3
              </span>
            </div>
            <div className="space-y-3">
              <TaskItem title="Set Up EKS Cluster" priority="HIGH" />
              <TaskItem
                title="Migrate to Playwright"
                priority="HIGH"
                type="IMPROVEMENT"
              />
              <TaskItem
                title="Visual Snapshot Comp"
                priority="LOW"
                type="FEATURE"
              />
            </div>
          </div>

          {/* Overdue Widget */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm">Overdue</h3>
              <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded">
                0
              </span>
            </div>
            <div className="space-y-3 opacity-60">
              <p className="text-xs text-neutral-500 text-center py-2">
                No overdue tasks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-neutral-400 text-sm">{label}</p>
        <h2 className="text-3xl font-bold mt-2">{value}</h2>
        <p className="text-xs text-neutral-500 mt-1">{sub}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  </div>
);

const TaskItem = ({ title, priority, type = "TASK" }) => (
  <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer">
    <h4 className="text-sm font-medium mb-1">{title}</h4>
    <div className="flex gap-2 text-[10px] uppercase tracking-wider font-bold">
      <span className="text-neutral-500">{type}</span>
      <span
        className={priority === "HIGH" ? "text-orange-400" : "text-blue-400"}
      >
        {priority} Priority
      </span>
    </div>
  </div>
);

export default Dashboard;
