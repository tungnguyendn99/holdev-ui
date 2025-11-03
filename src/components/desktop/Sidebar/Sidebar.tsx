'use client';
import React, { useEffect, useState } from 'react';
import './Sidebar.scss';
import Link from 'next/link';
import cx from 'classnames';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChartCandlestick, ListTodo, Spade, User, Wallet } from 'lucide-react';
import { Tooltip } from 'antd';

const modules = [
  // { name: "Tổng quan", path: "/dashboard" },
  { id: 'trade', name: 'Trading', path: '/trading', icon: <ChartCandlestick /> },
  { id: 'poker', name: 'Poker', path: '/poker', icon: <Spade /> },
  { id: 'todo', name: 'To Do List', path: '/to-do', icon: <ListTodo /> },
  { id: 'expense', name: 'Expense Management', path: '/expense', icon: <Wallet /> },
  { id: 'user', name: 'User', path: '/user', icon: <User /> },
  // { name: "Người dùng", path: "/dashboard/users" },
];

const Sidebar = ({ isCollapsed }: { isCollapsed: boolean }) => {
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

  const [mounted, setMounted] = useState(false); // ✅ thêm flag mount

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside
        className={cx(
          'sidebar',
          'overflow-hidden transition-[width] duration-500 ease-in-out',
          isCollapsed ? 'w-24' : 'w-56',
        )}
      />
    );
  }

  return (
    <aside
      className={cx(
        `sidebar ${theme === 'dark' && 'sidebar-dark'}`,
        'overflow-hidden transition-[width] duration-500 ease-in-out',
        isCollapsed ? 'w-24' : 'w-56',
      )}
    >
      <h2
        className="logo"
        onClick={() => router.push('/')}
        style={{ display: 'flex', gap: '5px', alignItems: 'center' }}
      >
        <img
          src="/146e2842-fd5a-4cd2-92f3-338f3c7f3aeb.png"
          alt="User Avatar"
          width={isCollapsed ? 48 : 36}
        />
        {!isCollapsed && <p>Dashboard</p>}
      </h2>
      <ul className="menu">
        {modules
          .filter((item) => features.includes(item.id))
          .map((mod, i) => (
            <Link key={mod.path} href={mod.path} className={cx(isCollapsed && 'justify-center')}>
              <li key={i} className={cx(pathname === mod.path && 'active', 'flex gap-2')}>
                {isCollapsed ? (
                  <Tooltip title={mod.name} color={'#108ee9'}>
                    {mod.icon}
                  </Tooltip>
                ) : (
                  <>
                    {mod.icon} <p className="text-[14px]">{!isCollapsed && mod.name}</p>
                  </>
                )}
              </li>
            </Link>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
