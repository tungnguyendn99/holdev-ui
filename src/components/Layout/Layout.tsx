'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../desktop/Sidebar/Sidebar';
import Topbar from '../desktop/Topbar/Topbar';
import { usePathname } from 'next/navigation';
import { useWindowResize } from '../../common/func';
import LayoutMobile from '../mobile/LayoutMobile';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { LoadingOverlay } from '../LoadingOverLay';
import { hideLoading, showLoading } from '../../store/slices/user.slice';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noLayoutRoutes = ['/login', '/signup'];
  const hideLayout = noLayoutRoutes.includes(pathname);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false); // ✅ tránh mismatch
  //   const [isMobile, setIsMobile] = useState(false);
  const isMobile = useWindowResize(576);

  const loading = useAppSelector((state) => state.user.loading);
  console.log('loading', loading);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(showLoading());
    setMounted(true);
  }, []);

  // ✅ chỉ chạy khi đã mount
  useEffect(() => {
    if (!mounted) return;
    dispatch(hideLoading());

    // const checkMobile = () => {
    //   setIsMobile(window.innerWidth < 576);
    // };
    // checkMobile();
    // window.addEventListener('resize', checkMobile);
    // return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  if (!mounted) {
    // ✅ SSR và CSR đều ra layout giống nhau => tránh hydration mismatch
    return <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>;
  }

  if (isMobile) {
    return (
      <>
        <LoadingOverlay show={loading} fullscreen />
        <LayoutMobile children={children} />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <LoadingOverlay show={loading} fullscreen />
      {hideLayout ? (
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">{children}</main>
      ) : (
        <>
          <Sidebar isCollapsed={isCollapsed} />
          <div className="main flex flex-col flex-1 h-full w-[84%]">
            <Topbar onToggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
