import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { DevBanner } from './DevBanner.jsx';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-violet-950/20">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onMenu={() => setMobileOpen(true)} />
        <DevBanner />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
