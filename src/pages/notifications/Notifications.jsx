import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Check, X, AlertTriangle, UserMinus, Trash2 } from "lucide-react";
import api from "../../services/api";

const Notifications = () => {
  const { orgId } = useAuth();
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/admin-actions/pending", {
        params: { orgId }
      });
      setRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchRequests();
  }, [orgId]);

  const handleApprove = async (req) => {
    const actionName = req.type === "DELETE_ORG" ? "delete this organization" : "approve this action";
    if (!window.confirm(`Are you sure you want to ${actionName}?`)) return;

    try {
      let endpoint = "";
      if (req.type === "DEMOTE_ADMIN") endpoint = `/admin-actions/demote/approve/${req._id}`;
      if (req.type === "DELETE_ORG") endpoint = `/admin-actions/delete-org/approve/${req._id}`;

      await api.post(endpoint);
      alert("Action approved successfully.");
      
      if (req.type === "DELETE_ORG") {
        window.location.href = "/"; 
      } else {
        fetchRequests(); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve.");
    }
  };

  const handleDeny = async (req) => {
    if (!window.confirm("Are you sure you want to deny this request?")) return;
    try {
      await api.post(`/admin-actions/reject/${req._id}`);
      alert("Request denied and removed.");
      fetchRequests(); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to deny.");
    }
  };

  if (loading) return <div className="p-8 text-neutral-400">Loading notifications...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Admin Notifications</h1>
        <p className="text-neutral-400 mt-1">Pending approvals for sensitive actions.</p>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500">
          No pending notifications.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon based on Type */}
                <div className={`p-3 rounded-lg ${req.type === 'DELETE_ORG' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {req.type === 'DELETE_ORG' ? <Trash2 size={20} /> : <UserMinus size={20} />}
                </div>
                
                <div>
                  <h3 className="font-semibold text-white">
                    {req.type === 'DELETE_ORG' ? "Organization Deletion Request" : "Admin Demotion Request"}
                  </h3>
                  
                  {/* 👇 UPDATED: Show Real Names */}
                  <p className="text-sm text-neutral-400 mt-1">
                    Requested by <span className="text-white font-medium">
                      {req.requesterUserId === user.id ? "You" : req.requesterName}
                    </span>
                    {req.targetName && (
                      <span> • Target: <span className="text-white font-medium">{req.targetName}</span></span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {req.requesterUserId !== user.id ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(req)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleDeny(req)}
                    className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <X size={16} /> Deny
                  </button>
                </div>
              ) : (
                <span className="text-xs bg-neutral-800 text-neutral-500 px-3 py-1 rounded-full border border-neutral-700">
                  Waiting for approval
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;