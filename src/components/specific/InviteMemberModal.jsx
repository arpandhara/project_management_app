import React from "react";
import Modal from "../common/Modal";

const InviteMemberModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <div className="mb-6">
         <p className="text-sm text-neutral-400">Inviting to workspace: <span className="text-white font-medium">Cloud Ops Hub</span></p>
      </div>
      <form className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Email Address</label>
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Role</label>
          <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
            <option>Member</option>
            <option>Admin</option>
            <option>Viewer</option>
          </select>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Send Invitation
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteMemberModal;