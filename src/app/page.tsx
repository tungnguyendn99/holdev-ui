import Image from 'next/image';
import Sidebar from '../components/desktop/Sidebar/Sidebar';
import Topbar from '../components/desktop/Topbar/Topbar';
import './page.scss';

export default function Home() {
  return (
    <div className="app flex justify-center text-xl items-top">
      Welcome to The Journey of Discipline
    </div>
  );
}
