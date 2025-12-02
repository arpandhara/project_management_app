import React from "react";
import Modal from "../common/Modal";
import { Calendar } from "lucide-react";

const NewTaskModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form className="space-y-4">
        
        {/* Title */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Title</label>
          <input
            type="text"
            placeholder="Task title"
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Description</label>
          <textarea
            placeholder="Describe the task"
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors resize-none"
          />
        </div>

        {/* Row 1: Type & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Type</label>
            <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
              <option>Task</option>
              <option>Bug</option>
              <option>Feature</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Priority</label>
            <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: Assignee & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Assignee</label>
            <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
              <option>Unassigned</option>
              <option>Oliver Watts</option>
              <option>Alex Smith</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-300">Status</label>
            <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600">
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-300">Due Date</label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-600 transition-colors [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
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
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;