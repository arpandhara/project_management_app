import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  Github,
  FileText,
  AlertCircle,
  X,
  Trash2,
  Users,
  Check,
  ChevronDown,
  UserPlus,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../../services/api";
import { getSocket } from "../../services/socket";

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { orgRole } = useAuth();

  const [task, setTask] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newLink, setNewLink] = useState({ name: "", url: "", type: "DOC" });

  // Approval UI State
  const [approvalComment, setApprovalComment] = useState("");
  const [showApprovalBox, setShowApprovalBox] = useState(false);
  const [actionType, setActionType] = useState(null);

  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const assigneeRef = useRef(null);
  const inviteRef = useRef(null);

  const isAdmin =
    user?.publicMetadata?.role === "admin" || orgRole === "org:admin";
  const isAssignee = task?.assignees?.includes(user?.id);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
        setIsAssigneeOpen(false);
      }
      if (inviteRef.current && !inviteRef.current.contains(event.target)) {
        setIsInviteOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // ⚡ SOCKET Listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !task) return;

    const projectId = task.projectId._id || task.projectId;
    const room = `project_${projectId}`;

    socket.emit("join_project", room);

    const handleTaskUpdated = (updatedTask) => {
      if (updatedTask._id === taskId) {
        setTask(updatedTask);
      }
    };

    socket.on("task:updated", handleTaskUpdated);

    return () => {
      socket.off("task:updated", handleTaskUpdated);
    };
  }, [taskId, task?.projectId]);

  const handleUpdate = async (field, value) => {
    try {
      const updatedTask = { ...task, [field]: value };
      setTask(updatedTask);
      await api.put(`/tasks/${taskId}`, { [field]: value });
    } catch (err) {
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      navigate(-1);
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const toggleAssignee = async (memberId) => {
    let newAssignees = [...(task.assignees || [])];
    if (newAssignees.includes(memberId)) {
      newAssignees = newAssignees.filter((id) => id !== memberId);
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

  // 👇 UPDATED: Instant UI Update for Approvals
  const handleApprovalAction = async () => {
    if (!approvalComment) return alert("Please add a comment.");

    const newComment = {
      userId: user.id,
      userName: user.fullName || "Admin",
      text: approvalComment,
      type: actionType === "APPROVE" ? "APPROVAL" : "REJECTION",
      createdAt: new Date().toISOString(),
    };

    const updatedTask = {
      ...task,
      isApproved: actionType === "APPROVE",
      approvedAt: actionType === "APPROVE" ? new Date().toISOString() : null,
      status: actionType === "APPROVE" ? "Done" : "In Progress",
      comments: [...(task.comments || []), newComment],
    };

    setTask(updatedTask);
    setShowApprovalBox(false);
    setApprovalComment("");

    try {
      if (actionType === "APPROVE") {
        await api.put(`/tasks/${taskId}/approve`, {
          comment: approvalComment,
          adminName: user.fullName,
        });
      } else {
        await api.put(`/tasks/${taskId}/disapprove`, {
          comment: approvalComment,
          adminName: user.fullName,
        });
      }
    } catch (error) {
      console.error(error);
      alert("Action failed. Please refresh.");
    }
  };

  const getDaysLeft = () => {
    if (!task.approvedAt) return 15;
    const approvalDate = new Date(task.approvedAt);
    const expireDate = new Date(
      approvalDate.setDate(approvalDate.getDate() + 15)
    );
    const diffTime = Math.abs(expireDate - new Date());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading)
    return <div className="p-8 text-neutral-400">Loading task...</div>;

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-neutral-400 max-w-md">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 text-blue-400 hover:text-blue-300"
        >
          Go Back
        </button>
      </div>
    );

  const unassignedMembers = projectMembers.filter(
    (m) => !task.assignees?.includes(m.clerkId)
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-neutral-400 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
        {isAdmin && (
          <button
            onClick={handleDeleteTask}
            className="flex items-center gap-2 text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <Trash2 size={16} /> Delete Task
          </button>
        )}
      </div>

      {/* Approval Banner */}
      {task.isApproved && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <h3 className="text-green-500 font-bold">Approved</h3>
              <p className="text-green-400/70 text-sm">
                Task verified. Auto-deletion in{" "}
                <span className="font-bold text-white">
                  {getDaysLeft()} days
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Task Title
              </label>
              {isAdmin ? (
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  onBlur={(e) => handleUpdate("title", e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none border-b border-neutral-800 focus:border-blue-600 transition-colors pb-2"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white">{task.title}</h1>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Description
              </label>
              {isAdmin ? (
                <textarea
                  value={task.description}
                  onChange={(e) =>
                    setTask({ ...task, description: e.target.value })
                  }
                  onBlur={(e) => handleUpdate("description", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-300 focus:outline-none focus:border-blue-600 min-h-[120px] resize-y"
                />
              ) : (
                <div className="text-neutral-300 bg-neutral-950 p-4 rounded-lg border border-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {task.description || (
                    <span className="italic text-neutral-500">
                      No description.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Approval Box */}
          {isAdmin && task.status === "Done" && !task.isApproved && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-400" /> Admin Action
                Required
              </h3>
              <p className="text-neutral-400 text-sm mb-4">
                Task marked as Done. Review required.
              </p>

              {!showApprovalBox ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActionType("APPROVE");
                      setShowApprovalBox(true);
                    }}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <Check size={16} /> Approve Task
                  </button>
                  <button
                    onClick={() => {
                      setActionType("REJECT");
                      setShowApprovalBox(true);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <X size={16} /> Disapprove
                  </button>
                </div>
              ) : (
                <div className="space-y-3 bg-neutral-950 p-4 rounded-lg border border-neutral-800 animate-in fade-in zoom-in-95">
                  <p className="text-sm text-white font-medium">
                    {actionType === "APPROVE"
                      ? "Approve & Schedule Deletion"
                      : "Disapprove & Revert to In Progress"}
                  </p>
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:border-blue-600 outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowApprovalBox(false)}
                      className="text-neutral-400 text-sm hover:text-white px-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprovalAction}
                      className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${
                        actionType === "APPROVE"
                          ? "bg-green-600 hover:bg-green-500"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <LinkIcon size={20} /> Attachments
            </h2>
            <div className="space-y-3 mb-6">
              {task.attachments && task.attachments.length > 0 ? (
                task.attachments.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {link.type === "GITHUB" ? (
                        <Github size={20} className="text-white shrink-0" />
                      ) : (
                        <FileText
                          size={20}
                          className="text-blue-400 shrink-0"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-white truncate">
                          {link.name}
                        </span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-400 hover:underline truncate"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => removeLink(idx)}
                      className="text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm italic text-center py-4 border border-dashed border-neutral-800 rounded-lg">
                  No attachments.
                </p>
              )}
            </div>
            <div className="bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Name"
                    value={newLink.name}
                    onChange={(e) =>
                      setNewLink({ ...newLink, name: e.target.value })
                    }
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                  />
                  <input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) =>
                      setNewLink({ ...newLink, url: e.target.value })
                    }
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newLink.type}
                    onChange={(e) =>
                      setNewLink({ ...newLink, type: e.target.value })
                    }
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    <option value="DOC">Doc</option>
                    <option value="GITHUB">GitHub</option>
                    <option value="LINK">Link</option>
                  </select>
                  <button
                    onClick={handleAddLink}
                    disabled={!newLink.name || !newLink.url}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-lg text-sm font-medium transition-colors flex-1 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <MessageSquare size={18} /> Activity
            </h3>
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                task.comments
                  .slice()
                  .reverse()
                  .map((comment, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        comment.type === "APPROVAL"
                          ? "bg-green-500/5 border-green-500/20"
                          : comment.type === "REJECTION"
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-neutral-950 border-neutral-800"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-xs font-bold ${
                            comment.type === "APPROVAL"
                              ? "text-green-400"
                              : comment.type === "REJECTION"
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        >
                          {comment.userName || "User"}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-300">{comment.text}</p>
                    </div>
                  ))
              ) : (
                <div className="text-center text-neutral-600 text-sm py-4">
                  No activity yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleUpdate("status", e.target.value)}
                className="w-full p-2.5 rounded-lg border font-medium outline-none appearance-none cursor-pointer bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Priority
              </label>
              {isAdmin ? (
                <select
                  value={task.priority}
                  onChange={(e) => handleUpdate("priority", e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              ) : (
                <div className="text-sm px-3 py-2.5 rounded-lg border border-transparent font-medium text-center bg-neutral-800 text-neutral-300">
                  {task.priority} Priority
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold tracking-wider">
                Due Date
              </label>
              {isAdmin ? (
                <div className="relative">
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                    onChange={(e) => handleUpdate("dueDate", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-600 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <Calendar size={16} className="text-neutral-500" />
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </div>
              )}
            </div>

            <hr className="border-neutral-800" />

            <div className="space-y-2">
              <label className="text-xs text-neutral-500 uppercase font-bold flex items-center justify-between tracking-wider">
                <span>Assignees</span>
                <span className="bg-neutral-800 text-neutral-400 px-1.5 rounded text-[10px]">
                  {task.assignees?.length || 0}
                </span>
              </label>
              <div className="relative" ref={assigneeRef}>
                <button
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                  className={`w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-left flex justify-between items-center transition-colors ${
                    isAdmin ? "hover:border-neutral-700 cursor-pointer" : ""
                  }`}
                >
                  <div className="flex -space-x-2 overflow-hidden items-center h-6">
                    {task.assignees && task.assignees.length > 0 ? (
                      task.assignees.map((id) => {
                        const mem = projectMembers.find(
                          (m) => m.clerkId === id
                        );
                        if (!mem) return null;
                        return (
                          <img
                            key={id}
                            src={mem.photo}
                            title={`${mem.firstName} ${mem.lastName}`}
                            className="w-6 h-6 rounded-full ring-2 ring-neutral-900 bg-neutral-800 object-cover"
                          />
                        );
                      })
                    ) : (
                      <span className="text-sm text-neutral-500 italic">
                        Unassigned
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <ChevronDown size={14} className="text-neutral-500" />
                  )}
                </button>
                {isAssigneeOpen && isAdmin && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
                    {projectMembers.map((member) => (
                      <div
                        key={member.clerkId}
                        onClick={() => toggleAssignee(member.clerkId)}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-800 cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            task.assignees?.includes(member.clerkId)
                              ? "bg-blue-600 border-blue-600"
                              : "border-neutral-600"
                          }`}
                        >
                          {task.assignees?.includes(member.clerkId) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={member.photo}
                            className="w-6 h-6 rounded-full bg-neutral-800 object-cover"
                          />
                          <span className="text-sm text-neutral-300 truncate">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(isAssignee || isAdmin) && (
              <div className="pt-2">
                <div className="relative" ref={inviteRef}>
                  <button
                    onClick={() => setIsInviteOpen(!isInviteOpen)}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-neutral-700"
                  >
                    <UserPlus size={16} /> Request Help
                  </button>
                  {isInviteOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto p-1">
                      {unassignedMembers.length > 0 ? (
                        unassignedMembers.map((m) => (
                          <div
                            key={m.clerkId}
                            onClick={() => handleInvite(m.clerkId)}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-800 cursor-pointer transition-colors rounded-md"
                          >
                            <img
                              src={m.photo}
                              className="w-6 h-6 rounded-full bg-neutral-800 object-cover"
                            />
                            <span className="text-sm text-neutral-300">
                              {m.firstName} {m.lastName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-xs text-neutral-500 text-center">
                          Everyone is assigned!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
