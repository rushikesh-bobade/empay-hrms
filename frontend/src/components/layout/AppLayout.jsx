import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../../context/SidebarContext';

export default function AppLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen flex">
      <div className="mesh-gradient" />
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'ml-[68px]' : 'ml-64'}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
