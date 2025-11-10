'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from 'antd';
import MobileSidebar from './MobileSideBar';
import UserDrawer from './UserDrawer';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LayoutMobile({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutRoutes = ['/login', '/signup'];
  const hideLayout = noLayoutRoutes.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  if (hideLayout) {
    return <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex w-full flex-col transition-colors duration-300">
      {/* 🔝 Topbar */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-card shadow-sm">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <Menu size={24} />
          </button>
          <Link href={'/'} className="flex gap-2 items-center">
            <Home size={24} />
            <h2 className="font-bold">The Journey of Discipline</h2>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Theme */}
          <Switch
            checked={theme === 'dark'}
            onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            checkedChildren="🌙"
            unCheckedChildren="☀️"
          />

          {/* User Avatar */}
          <button
            onClick={() => setUserDrawerOpen(true)}
            className="p-1 rounded-full border border-border"
          >
            <User size={22} />
          </button>
        </div>
      </header>

      {/* 📄 Main Content */}
      <main className="flex-1 overflow-y-auto p-3">{children}</main>

      {/* 🧭 Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-card shadow-lg z-40"
            >
              <MobileSidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 backdrop-blur-3xl z-30"
            />
          </>
        )}
      </AnimatePresence>

      {/* 👤 User Drawer */}
      <AnimatePresence>
        {userDrawerOpen && (
          <>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-64 bg-card shadow-lg z-40"
            >
              <UserDrawer onClose={() => setUserDrawerOpen(false)} />
            </motion.div>
            <div
              onClick={() => setUserDrawerOpen(false)}
              className="fixed inset-0 backdrop-blur-3xl z-30"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
