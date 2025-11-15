'use client';
import { Avatar } from 'antd';
import { X, LogOut, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';

export default function UserDrawer({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const userInfo = useAppSelector((state) => state.user.userInfo);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    console.log('token', token);

    const storedUser = localStorage.getItem('user') || '';
    const user = storedUser ? JSON.parse(storedUser) : {};
    console.log('user0', user);

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      onClose();
      router.push('/login');
    }
    if (user.username) {
      setUsername(user.username);
    } else {
      setUsername('');
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onClose();
    checkAuthentication();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold">User Info</h2>
        <button onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        <div
          className="flex gap-2 items-center"
          onClick={() => {
            router.push('/user');
            onClose();
          }}
        >
          <Avatar size="large" src={userInfo.avatar} icon={<User />} />
          <p className="font-semibold text-base">{userInfo.username}</p>
          {/* <p className="text-sm text-muted-foreground">tungnguyen@example.com</p> */}
        </div>

        <button
          onClick={handleLogout}
          className="btn-theme flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-2 rounded-md transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
