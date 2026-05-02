import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../../context/SidebarContext';

export default function AppLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen flex relative">
      {/* Ambient Background Gradients for Glass Depth */}
      <div className="ambient-blob-primary" />
      <div className="ambient-blob-secondary" />
      <Sidebar />
      <div
        className="flex-1 flex flex-col relative z-10 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 280 }}
      >
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
