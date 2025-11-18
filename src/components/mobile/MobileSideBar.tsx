import { X, ChartCandlestick, Spade, ListTodo, User, NotebookPen } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const modules = [
    { id: 'trade', name: 'Trading', path: '/trading', icon: <ChartCandlestick /> },
    { id: 'poker', name: 'Poker', path: '/poker', icon: <Spade /> },
    { id: 'english', name: 'English', path: '/english', icon: <NotebookPen /> },
    { id: 'todo', name: 'To Do List', path: '/to-do', icon: <ListTodo /> },
    { id: 'user', name: 'User', path: '/user', icon: <User /> },
  ];

  const pathname = usePathname();
  const { theme } = useTheme();
  const [features, setFeatures] = useState<any>([]);

  const checkAuthentication = () => {
    const storedUser = localStorage.getItem('user') || '';
    const user = storedUser ? JSON.parse(storedUser) : {};
    setFeatures(user.features || []);
  };

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-3">
        {modules
          .filter((item) => features.includes(item.id))
          .map((menu) => {
            const active = isActive(menu.path);

            return (
              <Link
                key={menu.name}
                href={menu.path}
                className={clsx(
                  'flex items-center gap-3 p-2 rounded-md transition-colors',
                  'hover:bg-accent',
                  active &&
                    (theme === 'dark'
                      ? 'bg-accent text-accent-foreground font-semibold'
                      : 'bg-gray-200 text-gray-900 font-semibold'),
                )}
                onClick={onClose}
              >
                {menu.icon}
                <span>{menu.name}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
