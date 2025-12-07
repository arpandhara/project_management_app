import React from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Check, X, Mail } from "lucide-react";
import PageTransition from "../../components/common/PageTransition";

const Invitations = () => {
  const { user } = useUser();
  const { client } = useClerk();

  // 👇 FIX 1: Safely handle cases where 'invitations' is undefined
  const invitations =
    user?.emailAddresses?.flatMap((email) => email.invitations || []) || [];

  const handleAccept = async (invitation) => {
    try {
      await invitation.accept();
      alert("Invitation accepted! You are now a member.");
      window.location.reload();
    } catch (error) {
      console.error("Error accepting invite:", error);
      alert("Failed to accept invitation.");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Pending Invitations</h1>
          <p className="text-neutral-400 mt-1">
            Manage your organization invites
          </p>
        </div>

        {invitations.length > 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 border-b border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    {/* 👇 FIX 2: Added optional chaining (?.) to prevent crashes */}
                    <h3 className="font-medium text-white">
                      {inv?.publicOrganizationData?.name ||
                        "Unknown Organization"}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Invited as{" "}
                      <span className="uppercase font-bold text-xs">
                        {inv?.role === "org:admin" ? "Admin" : "Member"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(inv)}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Check size={14} /> Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500">
            No pending invitations found.
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Invitations;
