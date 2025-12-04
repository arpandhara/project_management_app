import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Check, X, AlertTriangle, UserMinus, Trash2 } from "lucide-react";
import api from "../../services/api";

const Notifications = () => {
  const { orgId, isLoaded } = useAuth();
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
    if (!window.confirm("Are you sure you want to approve this action?")) return;

    try {
      let endpoint = "";
      if (req.type === "DEMOTE_ADMIN") endpoint = `/admin-actions/demote/approve/${req._id}`;
      if (req.type === "DELETE_ORG") endpoint = `/admin-actions/delete-org/approve/${req._id}`;

      await api.post(endpoint);
      alert("Action approved successfully.");
      
      if (req.type === "DELETE_ORG") {
        window.location.href = "/"; // Redirect home if org is gone
      } else {
        fetchRequests(); // Refresh list
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to approve.");
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
                <div className={`p-3 rounded-lg ${req.type === 'DELETE_ORG' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {req.type === 'DELETE_ORG' ? <Trash2 size={20} /> : <UserMinus size={20} />}
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {req.type === 'DELETE_ORG' ? "Organization Deletion Request" : "Admin Demotion Request"}
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">
                    Requested by <span className="text-white font-medium">{req.requesterUserId === user.id ? "You" : "Another Admin"}</span>
                    {req.targetUserId && <span> • Target: {req.targetUserId}</span>}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {req.requesterUserId !== user.id ? (
                <button
                  onClick={() => handleApprove(req)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Check size={16} /> Approve
                </button>
              ) : (
                <span className="text-xs bg-neutral-800 text-neutral-500 px-3 py-1 rounded-full">
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