import Image from 'next/image';
import Sidebar from '../components/desktop/Sidebar/Sidebar';
import Topbar from '../components/desktop/Topbar/Topbar';
import './page.scss';
import DailyQuote from '../components/DailyQuote';

export default function Home() {
  return (
    <div className="app text-xl flex flex-col items-center">
      <h1 className="mt-2 mb-2">Welcome to The Journey of Discipline</h1>
      <DailyQuote />
    </div>
  );
}
