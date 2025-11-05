'use client';
declare const localStorage: Storage;
import React, { useEffect, useState } from 'react';
import './Topbar.scss';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, Dropdown, MenuProps, Tag } from 'antd';
import { ChevronDown, ChevronUp, LogOut, Menu, Settings, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import { useTheme } from 'next-themes';

const Topbar = ({ onToggleSidebar }: any) => {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user') || '';
    const user = storedUser ? JSON.parse(storedUser) : {};

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
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
    checkAuthentication();
  };

  const menuItems = (
    <div className="w-64 rounded-xl shadow-lg bg-white p-3">
      {/* Thông tin user */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100">
        <Tag color="green" style={{ fontSize: '18px' }}>
          DEMO
        </Tag>
      </div>

      {/* Các action */}
      <div className="flex flex-col mt-2">
        <button
          // onClick={() => router.push('/profile')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
        >
          <User /> View profile
        </button>

        <button
          // onClick={() => router.push('/settings')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition cursor-pointer"
        >
          <Settings /> Account settings
        </button>

        <hr className="my-2 border-gray-100" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
        >
          <LogOut /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <header
      className={`topbar ${theme === 'dark' && 'topbar-dark'} ${theme === 'light' && 'topbar-light'}`}
    >
      <div className="flex gap-1.5 items-center">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer transition"
        >
          <Menu size={22} />
        </button>
        <h2>The Journey of Discipline</h2>
      </div>
      <div className="actions">
        <input type="text" placeholder="Search..." />
        <div className="user">
          {/* <img
            src="https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-6/568362169_122168092466450616_8160251649592974543_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=pLdJ2ihqBxoQ7kNvwEKX4Fq&_nc_oc=AdmxgaGbB3Ws7oL_Cj0D19LiX2tUa0jJ7M98bX-s9u0aN9eQ_TLPdT8ZUsOKvyVsdss&_nc_zt=23&_nc_ht=scontent.fhan4-6.fna&_nc_gid=eH1VVEA5VYB_-Jtypd97Og&oh=00_Afd0V03EdyCadnWPoeDk-P1w3vA-stM4ll8zBQrq4OyvEQ&oe=690A54ED"
            alt="User Avatar"
          />
          <span>{username}</span> */}
          <ThemeToggle />
          <Dropdown
            popupRender={() => menuItems}
            placement="bottomRight"
            trigger={['click']}
            onOpenChange={(visible) => setOpen(visible)}
            open={open}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar
                size="large"
                src="https://scontent.fhan4-6.fna.fbcdn.net/v/t39.30808-6/568362169_122168092466450616_8160251649592974543_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=127cfc&_nc_ohc=pLdJ2ihqBxoQ7kNvwEKX4Fq&_nc_oc=AdmxgaGbB3Ws7oL_Cj0D19LiX2tUa0jJ7M98bX-s9u0aN9eQ_TLPdT8ZUsOKvyVsdss&_nc_zt=23&_nc_ht=scontent.fhan4-6.fna&_nc_gid=eH1VVEA5VYB_-Jtypd97Og&oh=00_Afd0V03EdyCadnWPoeDk-P1w3vA-stM4ll8zBQrq4OyvEQ&oe=690A54ED" // ảnh trong public
                icon={<User />}
              />
              <span className="font-medium">{username}</span>
              <Tag color="#539dac" style={{ fontSize: '16px' }}>
                DEMO
              </Tag>
              {open ? (
                <ChevronUp className="text-gray-500 text-xs transition-all" />
              ) : (
                <ChevronDown className="text-gray-500   text-xs transition-all" />
              )}
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
