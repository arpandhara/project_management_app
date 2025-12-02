import React from "react";
import Modal from "../common/Modal";

const NewProjectModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form className="space-y-4">
        
        {/* Project Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Project Name</label>
          <input
            type="text"
            placeholder="e.g. Website Redesign"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Project Key (Identifier) */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Key</label>
          <input
            type="text"
            placeholder="e.g. WEB"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors uppercase"
          />
          <p className="text-xs text-neutral-500">Unique identifier for tasks (e.g. WEB-101)</p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Description</label>
          <textarea
            placeholder="What is this project about?"
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors resize-none"
          />
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
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewProjectModal;