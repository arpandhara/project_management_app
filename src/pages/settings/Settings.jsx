import React, { useState } from 'react';
import { UserProfile } from '@clerk/clerk-react';
import { Building2, User, Upload, Trash2 } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-neutral-400 mt-1">Manage your account and workspace preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800 flex gap-6 text-sm">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <User size={16} />
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
            activeTab === 'workspace'
              ? 'border-blue-600 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Building2 size={16} />
          Workspace
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'profile' ? (
          <div className="w-full">
            <UserProfile 
              appearance={{
                variables: {
                  colorPrimary: '#2563eb',
                  colorBackground: '#171717',
                  colorText: 'white',
                  colorInputBackground: '#0a0a0a',
                  colorInputText: 'white',
                },
                elements: {
                  card: 'bg-neutral-900 border border-neutral-800 shadow-none w-full max-w-4xl',
                  navbar: 'border-r border-neutral-800',
                  navbarButton: 'text-neutral-400 hover:text-white',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-neutral-400',
                  pageScrollBox: 'bg-neutral-900',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-500',
                }
              }} 
            />
          </div>
        ) : (
          <div className="max-w-2xl space-y-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">General Information</h2>
              
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-300">Workspace Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center overflow-hidden">
                    <span className="text-2xl font-bold text-neutral-600">N</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-neutral-700 transition-colors flex items-center gap-2">
                        <Upload size={16} />
                        Upload Logo
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                      <button className="text-neutral-400 hover:text-red-400 text-sm font-medium transition-colors px-2">Remove</button>
                    </div>
                    <p className="text-xs text-neutral-500">Recommended size: 256x256px. Max file size: 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Workspace Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Workspace Name</label>
                <input type="text" defaultValue="Netflix" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-600 transition-colors" />
              </div>

              <div className="pt-4 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;