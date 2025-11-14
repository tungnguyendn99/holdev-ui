import {
  X,
  Home,
  BarChart2,
  Settings,
  ChartCandlestick,
  Spade,
  ListTodo,
  Wallet,
  User,
  NotebookPen,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MobileSidebar({ onClose }: { onClose: () => void }) {
  const modules = [
    // { name: "Tổng quan", path: "/dashboard" },
    { id: 'trade', name: 'Trading', path: '/trading', icon: <ChartCandlestick /> },
    { id: 'poker', name: 'Poker', path: '/poker', icon: <Spade /> },
    { id: 'english', name: 'English', path: '/english', icon: <NotebookPen /> },
    { id: 'todo', name: 'To Do List', path: '/to-do', icon: <ListTodo /> },
    { id: 'expense', name: 'Expense Management', path: '/expense', icon: <Wallet /> },
    { id: 'user', name: 'User', path: '/user', icon: <User /> },
    // { name: "Người dùng", path: "/dashboard/users" },
  ];

  const pathname = usePathname();
  const router = useRouter();

  const { theme } = useTheme();

  const [features, setFeatures] = useState<any>([]);
  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || '';
    const user = storedUser ? JSON.parse(storedUser) : {};
    console.log('user0', user);

    if (user.features) {
      setFeatures(user.features);
    } else {
      setFeatures([]);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

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
          .map((menu) => (
            <Link
              key={menu.name}
              href={menu.path}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors"
              onClick={onClose}
            >
              {menu.icon}
              <span>{menu.name}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
}
