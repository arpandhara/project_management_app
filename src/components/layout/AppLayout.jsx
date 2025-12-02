import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-neutral-950 text-white">
      <Sidebar />
      <main className="flex-1  p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
